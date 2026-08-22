using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class SanidadeService : ISanidadeService
    {
        private readonly ISanidadeRepository _sanidadeRepo;
        private readonly ILoteRepository _loteRepo;

        public SanidadeService(ISanidadeRepository sanidadeRepo, ILoteRepository loteRepo)
        {
            _sanidadeRepo = sanidadeRepo;
            _loteRepo = loteRepo;
        }

        public async Task<RegistroSanidade> RegistrarSanidadeAsync(RegistroSanidade registro)
        {
            var lote = await _loteRepo.ObterPorIdAsync(registro.LoteId);
            if (lote == null) throw new Exception("Lote não encontrado.");

            if (string.IsNullOrWhiteSpace(registro.NomeProduto))
                throw new Exception("O nome do produto é obrigatório.");

            return await _sanidadeRepo.AdicionarAsync(registro);
        }

        public async Task<IEnumerable<RegistroSanidade>> ObterHistoricoAsync(int loteId) =>
            await _sanidadeRepo.ObterHistoricoPorLoteAsync(loteId);
    }
}