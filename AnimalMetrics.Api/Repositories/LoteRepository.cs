using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class LoteRepository : ILoteRepository
    {
        private readonly AppDbContext _context;

        public LoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Lote>> ObterTodosAsync()
        {
            return await _context.Lotes.AsNoTracking().ToListAsync();
        }

        public async Task<Lote?> ObterPorIdAsync(int id)
        {
            return await _context.Lotes.FindAsync(id);
        }

        public async Task<Lote> AdicionarAsync(Lote lote)
        {
            _context.Lotes.Add(lote);
            await _context.SaveChangesAsync();
            return lote;
        }

        public async Task AtualizarAsync(Lote lote)
        {
            _context.Lotes.Update(lote);
            await _context.SaveChangesAsync();
        }
    }
}