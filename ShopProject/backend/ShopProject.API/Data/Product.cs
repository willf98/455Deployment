using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("products")]
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("sku")]
        public string Sku { get; set; } = string.Empty;

        [Required]
        [Column("product_name")]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Column("price")]
        public double Price { get; set; }

        [Required]
        [Column("cost")]
        public double Cost { get; set; }

        [Column("is_active")]
        public int IsActive { get; set; } = 1;
    }
}
