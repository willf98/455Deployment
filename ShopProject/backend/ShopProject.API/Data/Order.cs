using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("orders")]
    public class Order
    {
        [Key]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Required]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [Column("order_datetime")]
        public string OrderDatetime { get; set; } = string.Empty;

        [Column("billing_zip")]
        public string? BillingZip { get; set; }

        [Column("shipping_zip")]
        public string? ShippingZip { get; set; }

        [Column("shipping_state")]
        public string? ShippingState { get; set; }

        [Required]
        [Column("payment_method")]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [Column("device_type")]
        public string DeviceType { get; set; } = string.Empty;

        [Required]
        [Column("ip_country")]
        public string IpCountry { get; set; } = string.Empty;

        [Column("promo_used")]
        public int PromoUsed { get; set; } = 0;

        [Column("promo_code")]
        public string? PromoCode { get; set; }

        [Required]
        [Column("order_subtotal")]
        public double OrderSubtotal { get; set; }

        [Required]
        [Column("shipping_fee")]
        public double ShippingFee { get; set; }

        [Required]
        [Column("tax_amount")]
        public double TaxAmount { get; set; }

        [Required]
        [Column("order_total")]
        public double OrderTotal { get; set; }

        [Required]
        [Column("risk_score")]
        public double RiskScore { get; set; }

        [Column("is_fraud")]
        public int IsFraud { get; set; } = 0;
    }
}
