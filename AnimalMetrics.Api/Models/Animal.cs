namespace AnimalMetrics.Api.Models
{
    public class Animal
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal RationPricePerKg { get; set; }
        public ICollection<DailyRecord> DailyRecords { get; set; } = new List<DailyRecord>();
    }
}