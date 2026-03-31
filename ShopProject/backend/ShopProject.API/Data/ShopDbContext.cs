using Microsoft.EntityFrameworkCore;

namespace ShopProject.API.Data
{
    public class ShopDbContext : DbContext
    {
        public ShopDbContext(DbContextOptions<ShopDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<OrderPrediction> OrderPredictions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>().ToTable("customers");
            modelBuilder.Entity<Product>().ToTable("products");
            modelBuilder.Entity<Order>().ToTable("orders");
            modelBuilder.Entity<OrderItem>().ToTable("order_items");
            modelBuilder.Entity<Shipment>().ToTable("shipments");
            modelBuilder.Entity<OrderPrediction>().ToTable("order_predictions");
        }
    }
}
