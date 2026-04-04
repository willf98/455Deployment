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

        [Column("fraud_probability")]
        public double? FraudProbability { get; set; }

        [Column("predicted_fraud")]
        public int? PredictedFraud { get; set; }

        [Column("prediction_timestamp")]
        public string? PredictionTimestamp { get; set; }
    }
}
