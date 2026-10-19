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

    public async Task<DailyRecord?> GetByIdAsync(int id)
    {
        return await _context.DailyRecords.FindAsync(id);
    }

    public async Task<IEnumerable<DailyRecord>> GetByLoteIdAsync(int loteId)
    {
        return await _context.DailyRecords
                .Where(r => r.LoteId == loteId)
                .ToListAsync();
    }

    public async Task<DailyRecord?> GetByLoteAndDateAsync(int loteId, DateTime date)
    {
        return await _context.DailyRecords
                .FirstOrDefaultAsync(r => r.LoteId == loteId && r.RecordDate.Date == date.Date);
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