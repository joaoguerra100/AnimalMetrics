namespace AnimalMetrics.Api.Models.DTOs
{
    public class MonthlySummaryDto
    {
        public decimal TotalFoodGrams { get; set; }
        public decimal TotalCost { get; set; }
        public decimal RationPricePerKg { get; set; }

        public IEnumerable<DailyConsumptionDto> DailyLabels { get; set; } = new List<DailyConsumptionDto>();
    }

}

public class DailyConsumptionDto
{
    public string Day { get; set; }
    public Decimal FoodGrams { get; set; }
}