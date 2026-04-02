using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

namespace ShopProject.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly ShopDbContext _context;

        public WarehouseController(ShopDbContext context)
        {
            _context = context;
        }

        [HttpGet("PriorityQueue")]
        public async Task<IActionResult> PriorityQueue()
        {
            try
            {
                var hasPredictions = await _context.OrderPredictions.AnyAsync();
                if (!hasPredictions)
                    return Ok(new List<object>());

                var results = await (
                    from o in _context.Orders
                    join c in _context.Customers on o.CustomerId equals c.CustomerId
                    join p in _context.OrderPredictions on o.OrderId equals p.OrderId
                    join s in _context.Shipments on o.OrderId equals s.OrderId into shipGroup
                    from sg in shipGroup.DefaultIfEmpty()
                    where sg == null
                    orderby p.LateDeliveryProbability descending, o.OrderDatetime ascending
                    select new
                    {
                        o.OrderId,
                        o.OrderDatetime,
                        o.OrderTotal,
                        c.CustomerId,
                        CustomerName = c.FullName,
                        p.LateDeliveryProbability,
                        p.PredictedLateDelivery,
                        p.PredictionTimestamp
                    }
                ).Take(50).ToListAsync();

                return Ok(results);
            }
            catch
            {
                return Ok(new List<object>());
            }
        }

        [HttpGet("Customer/{customerId}/Predictions")]
        public async Task<IActionResult> CustomerPredictions(int customerId)
        {
            try
            {
                var hasPredictions = await _context.OrderPredictions.AnyAsync();
                if (!hasPredictions)
                    return Ok(new List<object>());

                var results = await (
                    from o in _context.Orders
                    join p in _context.OrderPredictions on o.OrderId equals p.OrderId
                    join s in _context.Shipments on o.OrderId equals s.OrderId into shipGroup
                    from sg in shipGroup.DefaultIfEmpty()
                    where o.CustomerId == customerId && sg == null
                    orderby p.LateDeliveryProbability descending
                    select new
                    {
                        o.OrderId,
                        o.OrderDatetime,
                        o.OrderTotal,
                        p.LateDeliveryProbability,
                        p.PredictedLateDelivery,
                        p.PredictionTimestamp
                    }
                ).ToListAsync();

                return Ok(results);
            }
            catch
            {
                return Ok(new List<object>());
            }
        }
    }
}
