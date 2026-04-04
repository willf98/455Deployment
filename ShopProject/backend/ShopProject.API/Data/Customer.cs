using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("customers")]
    public class Customer
    {
        [Key]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("gender")]
        public string? Gender { get; set; }

        [Column("birthdate")]
        public DateOnly? Birthdate { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("state")]
        public string? State { get; set; }

        [Column("zip_code")]
        public string? ZipCode { get; set; }

        [Column("customer_segment")]
        public string? CustomerSegment { get; set; }

        [Column("loyalty_tier")]
        public string? LoyaltyTier { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
