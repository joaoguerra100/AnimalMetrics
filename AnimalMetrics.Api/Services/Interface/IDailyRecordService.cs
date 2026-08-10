using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IDailyRecordService
    {
        Task<IEnumerable<DailyRecord>> GetRecordsByAnimalAsync(int animalId);
        Task<DailyRecord> CreateRecordAsync(CreateDailyRecordDto dto);
    }
}