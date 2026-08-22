using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class SanidadeRepository : ISanidadeRepository
    {
        private readonly AppDbContext _context;
        public SanidadeRepository(AppDbContext context) => _context = context;

        public async Task<RegistroSanidade> AdicionarAsync(RegistroSanidade registro)
        {
            _context.Sanidade.Add(registro);
            await _context.SaveChangesAsync();
            return registro;
        }

        public async Task<IEnumerable<RegistroSanidade>> ObterHistoricoPorLoteAsync(int loteId)
        {
            return await _context.Sanidade
                .Where(s => s.LoteId == loteId)
                .OrderByDescending(s => s.DataAplicacao) // Ordena do mais recente para o mais antigo
                .AsNoTracking()
                .ToListAsync();
        }
    }
}