using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IDailyRecordService
    {
        Task<IEnumerable<DailyRecord>> GetByLoteIdAsync(int loteId);
        Task<DailyRecord> CreateRecordAsync(CreateDailyRecordDto dto);
        Task<MonthlySummaryDto> GetMonthlySummaryByLoteAsync(int loteId, int month, int year);

    }
}