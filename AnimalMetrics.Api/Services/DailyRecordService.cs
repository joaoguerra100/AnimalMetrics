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
        private readonly ILoteRepository _loteRepository;
        private readonly AppDbContext _context;

        public DailyRecordService(IDailyRecordRepository repository, AppDbContext context, ILoteRepository loteRepository)
        {
            _repository = repository;
            _context = context;
            _loteRepository = loteRepository;
        }

        public async Task<IEnumerable<DailyRecord>> GetByLoteIdAsync(int loteId)
        {
            return await _repository.GetByLoteIdAsync(loteId);
        }

        public async Task<DailyRecord?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<DailyRecord> CreateRecordAsync(CreateDailyRecordDto dto)
        {
            // Pega a data enviada ou a atual, zerando horas, minutos e segundos
            DateTime targetDate = dto.RecordDate.HasValue
                ? DateTime.SpecifyKind(dto.RecordDate.Value.Date, DateTimeKind.Utc)
                : DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

            var existingRecord = await _repository.GetByLoteAndDateAsync(dto.LoteId, targetDate);

            if (existingRecord != null)
            {
                existingRecord.FoodGiven = dto.FoodGiven;
                // existingRecord.CurrentWeight = dto.CurrentWeight;

                return await _repository.UpdateAsync(existingRecord);
            }

            var record = new DailyRecord
            {
                LoteId = dto.LoteId,
                FoodGiven = dto.FoodGiven,
                WaterConsumed = dto.WaterConsumed,
                // CurrentWeight = dto.CurrentWeight,
                RecordDate = targetDate // Salva a meia-noite limpa em UTC
            };

            return await _repository.AddAsync(record);
        }

        public async Task<MonthlySummaryDto> GetMonthlySummaryByLoteAsync(int loteId, int month, int year)
        {
            // Busca os registros do mês/ano específicos usando o repositório atualizado
            var records = await _repository.GetByLoteIdAsync(loteId);

            var targetRecords = records
                .Where(r => r.RecordDate.Month == month && r.RecordDate.Year == year)
                .OrderBy(r => r.RecordDate)
                .ToList();

            // Busca o lote pelo repositório injetado para pegar o preço
            var lote = await _loteRepository.ObterPorIdAsync(loteId);
            decimal rationPriceKg = lote?.RationPrice ?? 0;

            // Calcula os totais
            decimal totalGrams = targetRecords.Sum(r => r.FoodGiven);
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

        public async Task UpdateAsync(DailyRecord record)
        {
            await _repository.UpdateAsync(record);
        }
    }
}