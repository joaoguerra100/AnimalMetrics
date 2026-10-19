using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IDailyRecordService
    {
        Task<DailyRecord?> GetByIdAsync(int id);
        Task<IEnumerable<DailyRecord>> GetByLoteIdAsync(int loteId);
        Task<MonthlySummaryDto> GetMonthlySummaryByLoteAsync(int loteId, int month, int year);
        Task<DailyRecord> CreateRecordAsync(CreateDailyRecordDto dto);
        Task UpdateAsync(DailyRecord record);
    }
}