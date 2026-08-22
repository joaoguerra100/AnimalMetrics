using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;

namespace AnimalMetrics.Api.Repositories
{
    public class MortalidadeRepository : IMortalidadeRepository
    {
        private readonly AppDbContext _context;

        public MortalidadeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RegistroMortalidade> AdicionarAsync(RegistroMortalidade registro)
        {
            _context.Mortalidades.Add(registro);
            await _context.SaveChangesAsync();
            return registro;
        }
    }
}