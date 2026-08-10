using Microsoft.EntityFrameworkCore;
using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;

namespace AnimalMetrics.Api.Repositories;

public class DailyRecordRepository : IDailyRecordRepository
{
    private readonly AppDbContext _context;

    public DailyRecordRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DailyRecord>> GetByAnimalIdAsync(int animalId)
    {
        return await _context.DailyRecords
            .AsNoTracking()
            .Where(r => r.AnimalId == animalId)
            .OrderByDescending(r => r.RecordDate)
            .ToListAsync();
    }

    public async Task<DailyRecord?> GetByAnimalAndDateAsync(int animalId, DateTime date)
    {
        return await _context.DailyRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.AnimalId == animalId && 
                                      r.RecordDate.Year == date.Year &&
                                      r.RecordDate.Month == date.Month &&
                                      r.RecordDate.Day == date.Day);
    }

    public async Task<DailyRecord> AddAsync(DailyRecord record)
    {
        _context.DailyRecords.Add(record);
        await _context.SaveChangesAsync();
        return record;
    }

    public async Task<DailyRecord> UpdateAsync(DailyRecord record)
    {
        _context.DailyRecords.Update(record);
        await _context.SaveChangesAsync();
        return record;
    }
}