using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IDailyRecordRepository
    {
        Task<DailyRecord?> GetByIdAsync(int id);
        Task<IEnumerable<DailyRecord>> GetByLoteIdAsync(int loteId);
        Task<DailyRecord?> GetByLoteAndDateAsync(int loteId, DateTime date);
        Task<DailyRecord> AddAsync(DailyRecord record);
        Task<DailyRecord> UpdateAsync(DailyRecord record);
    }
}