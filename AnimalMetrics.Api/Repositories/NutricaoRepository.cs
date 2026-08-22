using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class NutricaoRepository : INutricaoRepository
    {
        private readonly AppDbContext _context;
        public NutricaoRepository(AppDbContext context) => _context = context;

        public async Task<RegistroNutricao> AdicionarAsync(RegistroNutricao registro)
        {
            _context.Nutricao.Add(registro);
            await _context.SaveChangesAsync();
            return registro;
        }

        public async Task<IEnumerable<RegistroNutricao>> ObterHistoricoPorLoteAsync(int loteId)
        {
            return await _context.Nutricao
                .Where(n => n.LoteId == loteId)
                .OrderBy(n => n.DataRegistro)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}