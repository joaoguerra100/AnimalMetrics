using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IDailyRecordRepository
    {
        Task<IEnumerable<DailyRecord>> GetByAnimalIdAsync(int animalId);
        Task<DailyRecord?> GetByAnimalAndDateAsync(int animalId, DateTime date);
        Task<DailyRecord> AddAsync(DailyRecord record);
        Task<DailyRecord> UpdateAsync(DailyRecord record);
    }
}