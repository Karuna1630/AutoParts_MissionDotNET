using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("Customers")]
public class Customer
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal CreditBalance { get; set; } = 0;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
