namespace AnimalMetrics.Api.Models.DTOs
{
    public class CreateDailyRecordDto
    {
        public int AnimalId { get; set; }
        public decimal FoodGiven { get; set; }
        public decimal CurrentWeight { get; set; }
        public DateTime? RecordDate { get; set; }
    }
}