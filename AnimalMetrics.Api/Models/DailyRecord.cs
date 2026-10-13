namespace AnimalMetrics.Api.Models
{
    public class DailyRecord
    {
        public int Id { get; set; }
        public decimal FoodGiven { get; set; }
        public decimal CurrentWeight { get; set; }
        public DateTime RecordDate { get; set; } = DateTime.UtcNow;

        public int LoteId { get; set; }
        public Lote Lote { get; set; }
    }
}