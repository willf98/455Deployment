using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        [Column("order_item_id")]
        public int OrderItemId { get; set; }

        [Required]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Required]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [Required]
        [Column("unit_price")]
        public double UnitPrice { get; set; }

        [Required]
        [Column("line_total")]
        public double LineTotal { get; set; }
    }
}
