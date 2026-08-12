using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Services
{
    public class DailyRecordService : IDailyRecordService
    {
        private readonly IDailyRecordRepository _repository;
        private readonly AppDbContext _context;

        public DailyRecordService(IDailyRecordRepository repository, AppDbContext context)
        {
            _repository = repository;
            _context = context;
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

        public async Task<MonthlySummaryDto> GetMonthlySummaryAsync(int animalId, int month, int year)
        {
            // Busca os registros do mês/ano específicos usando AsNoTracking para performance
            var records = await _repository.GetByAnimalIdAsync(animalId);
            var targetRecords = records
                .Where(r => r.RecordDate.Month == month && r.RecordDate.Year == year)
                .OrderBy(r => r.RecordDate)
                .ToList();

            // Busca o animal para saber o preço da ração (usando AsNoTracking)
            var animal = await _context.Animals.AsNoTracking().FirstOrDefaultAsync(a => a.Id == animalId);
            decimal rationPriceKg = animal?.RationPricePerKg ?? 0;

            // Calcula os totais
            decimal totalGrams = targetRecords.Sum(r => r.FoodGiven);
            // Fórmula: (Gramas totais / 1000) = Kg totais * Preço do Kg
            decimal totalCost = (totalGrams / 1000m) * rationPriceKg;

            // Monta a lista dia a dia para o gráfico
            var dailyData = targetRecords.Select(r => new DailyConsumptionDto
            {
                Day = r.RecordDate.Day.ToString(),
                FoodGrams = r.FoodGiven
            });

            return new MonthlySummaryDto
            {
                TotalFoodGrams = totalGrams,
                TotalCost = totalCost,
                RationPricePerKg = rationPriceKg,
                DailyLabels = dailyData
            };
        }
    }
}