using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class NutricaoService : INutricaoService
    {
        private readonly INutricaoRepository _nutricaoRepo;
        private readonly ILoteRepository _loteRepo;

        public NutricaoService(INutricaoRepository nutricaoRepo, ILoteRepository loteRepo)
        {
            _nutricaoRepo = nutricaoRepo;
            _loteRepo = loteRepo;
        }

        public async Task<RegistroNutricao> RegistrarConsumoAsync(RegistroNutricao registro)
        {
            var lote = await _loteRepo.ObterPorIdAsync(registro.LoteId);
            if (lote == null) throw new Exception("Lote não encontrado.");
            if (registro.DataRegistro > DateTime.Now) throw new Exception("Data inválida.");

            return await _nutricaoRepo.AdicionarAsync(registro);
        }

        public async Task<IEnumerable<RegistroNutricao>> ObterHistoricoAsync(int loteId) =>
            await _nutricaoRepo.ObterHistoricoPorLoteAsync(loteId);
    }
}