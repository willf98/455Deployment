using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("order_predictions")]
    public class OrderPrediction
    {
        [Key]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("late_delivery_probability")]
        public double? LateDeliveryProbability { get; set; }

        [Column("predicted_late_delivery")]
        public int? PredictedLateDelivery { get; set; }

        [Column("prediction_timestamp")]
        public string? PredictionTimestamp { get; set; }
    }
}
