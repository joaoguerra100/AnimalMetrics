using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class MortalidadeRepository : IMortalidadeRepository
    {
        private readonly AppDbContext _context;

        public MortalidadeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RegistroMortalidade?> GetByIdAsync(int id)
        {
            return await _context.Mortalidades.FindAsync(id);
        }

        public async Task<IEnumerable<RegistroMortalidade>> ObterHistoricoPorLoteAsync(int loteId)
        {
            return await _context.Mortalidades
                .Where(p => p.LoteId == loteId)
                .OrderBy(p => p.DatRegistro)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<RegistroMortalidade> AdicionarAsync(RegistroMortalidade registro)
        {
            _context.Mortalidades.Add(registro);
            await _context.SaveChangesAsync();
            return registro;
        }

        public async Task UpdateAsync(RegistroMortalidade mortalidade)
        {
            _context.Mortalidades.Update(mortalidade);
            await _context.SaveChangesAsync();
        }
    }
}