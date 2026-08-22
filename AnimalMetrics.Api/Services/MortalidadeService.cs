using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class MortalidadeService : IMortalidadeService
    {
        private readonly IMortalidadeRepository _mortalidadeRepository;
        private readonly ILoteRepository _loteRepository;

        public MortalidadeService(IMortalidadeRepository mortalidadeRepository, ILoteRepository loteRepository)
        {
            _mortalidadeRepository = mortalidadeRepository;
            _loteRepository = loteRepository;
        }

        public async Task<RegistroMortalidade> RegistrarPerdaAsync(RegistroMortalidade registro)
        {
            var lote = await _loteRepository.ObterPorIdAsync(registro.LoteId);

            if(lote == null) throw new Exception("Lote não encontrado.");

            lote.QuantidadeAtual -= registro.QuantidadeAves;

            await _loteRepository.AtualizarAsync(lote);
            return await _mortalidadeRepository.AdicionarAsync(registro);
        }
    }
}