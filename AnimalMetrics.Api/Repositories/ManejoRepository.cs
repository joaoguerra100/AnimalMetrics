using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class ManejoRepository : IManejoRepository
    {
        private readonly AppDbContext _context;

        public ManejoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RegistroManejo?> GetByIdAsync(int id)
        {
            return await _context.Manejos.FindAsync(id);
        }

        public async Task<RegistroManejo> AdicionarAsync(RegistroManejo manejo)
        {
            _context.Manejos.Add(manejo);
            await _context.SaveChangesAsync();
            return manejo;
        }

        public async Task<IEnumerable<RegistroManejo>> ObterHistoricoPorLoteAsync(int loteId)
        {
            return await _context.Manejos
                .Where(p => p.LoteId == loteId)
                .OrderBy(p => p.DataRegistro)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task UpdateAsync(RegistroManejo manejo)
        {
            _context.Manejos.Update(manejo);
            await _context.SaveChangesAsync();
        }
    }
}