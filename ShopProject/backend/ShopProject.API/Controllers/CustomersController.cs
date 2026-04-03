using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

namespace ShopProject.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ShopDbContext _context;

        public CustomersController(ShopDbContext context)
        {
            _context = context;
        }

        [HttpGet("Search")]
        public async Task<IActionResult> Search([FromQuery] string? query)
        {
            IQueryable<Customer> q = _context.Customers;

            if (!string.IsNullOrWhiteSpace(query))
                q = q.Where(c => c.FullName.Contains(query) || c.Email.Contains(query));

            var results = await q
                .OrderBy(c => c.FullName)
                .Take(20)
                .Select(c => new
                {
                    c.CustomerId,
                    c.FullName,
                    c.Email,
                    c.City,
                    c.State,
                    c.LoyaltyTier
                })
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("{customerId}/Dashboard")]
        public async Task<IActionResult> Dashboard(int customerId)
        {
            var customer = await _context.Customers
                .Where(c => c.CustomerId == customerId)
                .Select(c => new
                {
                    c.CustomerId,
                    c.FullName,
                    c.Email,
                    c.City,
                    c.State,
                    c.LoyaltyTier
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound();

            var orders = await _context.Orders
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();

            var totalOrders = orders.Count;
            var totalSpend = orders.Sum(o => o.OrderTotal);

            var shipmentOrderIds = await _context.Shipments
                .Select(s => s.OrderId)
                .ToListAsync();

            var recentOrders = orders
                .OrderByDescending(o => o.OrderDatetime)
                .Take(5)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDatetime,
                    o.OrderTotal,
                    IsShipped = shipmentOrderIds.Contains(o.OrderId)
                })
                .ToList();

            return Ok(new
            {
                Customer = customer,
                TotalOrders = totalOrders,
                TotalSpend = totalSpend,
                RecentOrders = recentOrders
            });
        }
    }
}
