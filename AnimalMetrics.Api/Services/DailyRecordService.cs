using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class DailyRecordService : IDailyRecordService
    {
        private readonly IDailyRecordRepository _repository;

        public DailyRecordService(IDailyRecordRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DailyRecord>> GetRecordsByAnimalAsync(int animalId)
        {
            return await _repository.GetByAnimalIdAsync(animalId);
        }

        public async Task<DailyRecord> CreateRecordAsync(CreateDailyRecordDto dto)
        {
            // Pega a data enviada ou a atual, zerando horas, minutos e segundos
            DateTime targetDate = dto.RecordDate.HasValue
                ? DateTime.SpecifyKind(dto.RecordDate.Value.Date, DateTimeKind.Utc)
                : DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

            var existingRecord = await _repository.GetByAnimalAndDateAsync(dto.AnimalId, targetDate);

            if (existingRecord != null)
            {
                existingRecord.FoodGiven = dto.FoodGiven;
                existingRecord.CurrentWeight = dto.CurrentWeight;

                return await _repository.UpdateAsync(existingRecord);
            }

            var record = new DailyRecord
            {
                AnimalId = dto.AnimalId,
                FoodGiven = dto.FoodGiven,
                CurrentWeight = dto.CurrentWeight,
                RecordDate = targetDate // Salva a meia-noite limpa em UTC
            };

            return await _repository.AddAsync(record);
        }
    }
}