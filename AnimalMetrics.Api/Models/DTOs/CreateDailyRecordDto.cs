namespace AnimalMetrics.Api.Models.DTOs
{
    public class CreateDailyRecordDto
    {
        public int? Id { get; set; }
        public int LoteId { get; set; }
        public decimal FoodGiven { get; set; }
        public decimal CurrentWeight { get; set; }
        public DateTime? RecordDate { get; set; }
    }
}