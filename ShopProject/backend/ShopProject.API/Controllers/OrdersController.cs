using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

namespace ShopProject.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ShopDbContext _context;

        public OrdersController(ShopDbContext context)
        {
            _context = context;
        }

        [HttpGet("Customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var shipmentOrderIds = await _context.Shipments
                .Select(s => s.OrderId)
                .ToListAsync();

            var orders = await _context.Orders
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDatetime)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDatetime,
                    o.OrderTotal,
                    IsShipped = shipmentOrderIds.Contains(o.OrderId)
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{orderId}/Items")]
        public async Task<IActionResult> GetItems(int orderId)
        {
            var order = await _context.Orders
                .Where(o => o.OrderId == orderId)
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound();

            var items = await (
                from oi in _context.OrderItems
                join p in _context.Products on oi.ProductId equals p.ProductId
                where oi.OrderId == orderId
                select new
                {
                    p.ProductName,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.LineTotal
                }
            ).ToListAsync();

            return Ok(new
            {
                OrderId = order.OrderId,
                OrderDatetime = order.OrderDatetime,
                OrderTotal = order.OrderTotal,
                PaymentMethod = order.PaymentMethod,
                Items = items
            });
        }

        [HttpPost("Place")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            if (request.Items == null || request.Items.Count == 0)
                return BadRequest(new { message = "Order must have at least one item." });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var productIds = request.Items.Select(i => i.ProductId).ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId))
                    .ToDictionaryAsync(p => p.ProductId);

                double subtotal = 0;
                var orderItems = new List<OrderItem>();

                foreach (var item in request.Items)
                {
                    if (!products.TryGetValue(item.ProductId, out var product))
                        return BadRequest(new { message = $"Product {item.ProductId} not found." });

                    double lineTotal = item.Quantity * product.Price;
                    subtotal += lineTotal;

                    orderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        LineTotal = lineTotal
                    });
                }

                double shippingFee = 9.99;
                double taxAmount = subtotal * 0.08;
                double orderTotal = subtotal + shippingFee + taxAmount;

                var order = new Order
                {
                    CustomerId = request.CustomerId,
                    OrderDatetime = DateTime.UtcNow,
                    PaymentMethod = request.PaymentMethod,
                    DeviceType = "web",
                    IpCountry = "US",
                    OrderSubtotal = subtotal,
                    ShippingFee = shippingFee,
                    TaxAmount = taxAmount,
                    OrderTotal = orderTotal,
                    RiskScore = 0.0,
                    IsFraud = false,
                    PromoUsed = false
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var item in orderItems)
                {
                    item.OrderId = order.OrderId;
                }

                _context.OrderItems.AddRange(orderItems);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { success = true, orderId = order.OrderId });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class PlaceOrderRequest
    {
        public int CustomerId { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderItemRequest> Items { get; set; } = new();
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
