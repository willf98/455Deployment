using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

namespace ShopProject.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ShopDbContext _context;

        public ProductsController(ShopDbContext context)
        {
            _context = context;
        }

        [HttpGet("Active")]
        public async Task<IActionResult> GetActive()
        {
            var products = await _context.Products
                .Where(p => p.IsActive == true)
                .Select(p => new
                {
                    p.ProductId,
                    p.ProductName,
                    p.Category,
                    p.Price
                })
                .ToListAsync();

            return Ok(products);
        }
    }
}
