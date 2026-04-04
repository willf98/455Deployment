using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

namespace ShopProject.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ScoringController : ControllerBase
    {
        private readonly ShopDbContext _context;

        public ScoringController(ShopDbContext context)
        {
            _context = context;
        }

        [HttpPost("Run")]
        public async Task<IActionResult> Run()
        {
            try
            {
                // Load unshipped orders that have not yet been scored
                var unscored = await (
                    from o in _context.Orders
                    join c in _context.Customers on o.CustomerId equals c.CustomerId
                    join s in _context.Shipments on o.OrderId equals s.OrderId into shipGroup
                    from sg in shipGroup.DefaultIfEmpty()
                    join p in _context.OrderPredictions on o.OrderId equals p.OrderId into predGroup
                    from pg in predGroup.DefaultIfEmpty()
                    where sg == null && pg == null
                    select new
                    {
                        o.OrderId,
                        o.PaymentMethod,
                        o.IpCountry,
                        o.PromoUsed,
                        o.OrderTotal,
                        o.BillingZip,
                        o.ShippingZip,
                        o.DeviceType,
                        c.LoyaltyTier
                    }
                ).ToListAsync();

                if (unscored.Count == 0)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "No unscored unshipped orders found.",
                        timestamp = DateTime.UtcNow.ToString("o")
                    });
                }

                var now = DateTime.UtcNow;
                var predictions = new List<OrderPrediction>();

                foreach (var order in unscored)
                {
                    double score = -2.8; // intercept — calibrated for ~6% base fraud rate

                    // Payment method risk
                    if (order.PaymentMethod == "crypto") score += 1.8;
                    else if (order.PaymentMethod == "gift_card") score += 1.2;
                    else if (order.PaymentMethod == "bank_transfer") score += 0.4;

                    // Foreign IP
                    if (order.IpCountry != "US") score += 1.4;

                    // Promo used
                    if (order.PromoUsed) score += 0.6;

                    // High value order
                    if (order.OrderTotal > 300) score += 0.8;
                    else if (order.OrderTotal > 150) score += 0.4;

                    // Billing/shipping zip mismatch
                    if (!string.IsNullOrEmpty(order.BillingZip) &&
                        !string.IsNullOrEmpty(order.ShippingZip) &&
                        order.BillingZip != order.ShippingZip)
                        score += 0.5;

                    // Mobile device slight risk
                    if (order.DeviceType == "mobile") score += 0.2;

                    // Lower loyalty tier slight risk
                    if (order.LoyaltyTier == "none" || string.IsNullOrEmpty(order.LoyaltyTier))
                        score += 0.3;

                    double fraudProb = 1.0 / (1.0 + Math.Exp(-score));

                    predictions.Add(new OrderPrediction
                    {
                        OrderId = order.OrderId,
                        FraudProbability = fraudProb,
                        PredictedFraud = fraudProb >= 0.30,
                        PredictionTimestamp = now
                    });
                }

                _context.OrderPredictions.AddRange(predictions);
                await _context.SaveChangesAsync();

                int flagged = predictions.Count(p => p.PredictedFraud == true);
                return Ok(new
                {
                    success = true,
                    message = $"Scored {predictions.Count} orders — {flagged} flagged as potentially fraudulent.",
                    timestamp = now.ToString("o")
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = $"Scoring error: {ex.Message}",
                    timestamp = DateTime.UtcNow.ToString("o")
                });
            }
        }
    }
}
