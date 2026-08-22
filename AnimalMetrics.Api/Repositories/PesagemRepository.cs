using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class PesagemRepository : IPesagemRepository
    {
        private readonly AppDbContext _context;

        public PesagemRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Pesagem> AdicionarAsync(Pesagem pesagem)
        {
            _context.Pesagens.Add(pesagem);
            await _context.SaveChangesAsync();
            return pesagem;
        }

        public async Task<IEnumerable<Pesagem>> ObterHistoricoPorLoteAsync(int loteId)
        {
            return await _context.Pesagens
                .Where(p => p.LoteId == loteId)
                .OrderBy(p => p.DataRegistro)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}