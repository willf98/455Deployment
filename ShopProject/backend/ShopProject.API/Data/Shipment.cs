using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("shipments")]
    public class Shipment
    {
        [Key]
        [Column("shipment_id")]
        public int ShipmentId { get; set; }

        [Required]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("ship_datetime")]
        public DateTime? ShipDatetime { get; set; }

        [Required]
        [Column("carrier")]
        public string Carrier { get; set; } = string.Empty;

        [Required]
        [Column("shipping_method")]
        public string ShippingMethod { get; set; } = string.Empty;

        [Required]
        [Column("distance_band")]
        public string DistanceBand { get; set; } = string.Empty;

        [Required]
        [Column("promised_days")]
        public int PromisedDays { get; set; }

        [Required]
        [Column("actual_days")]
        public int ActualDays { get; set; }

        [Column("late_delivery")]
        public bool LateDelivery { get; set; } = false;
    }
}
