using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class PesagemService : IPesagemService
    {
        private readonly IPesagemRepository _pesagemRepository;
        private readonly ILoteRepository _loteRepository;

        public PesagemService(IPesagemRepository pesagemRepository, ILoteRepository loteRepository)
        {
            _pesagemRepository = pesagemRepository;
            _loteRepository = loteRepository;
        }

        public async Task<Pesagem> RegistrarPesagemAsync(Pesagem pesagem)
        {
            var lote = await _loteRepository.ObterPorIdAsync(pesagem.LoteId);
            if (lote == null) throw new Exception("Lote não encontrado.");

            var tempoDeVida = pesagem.DataRegistro.Date - lote.DataChegada.Date;
            pesagem.IdadeAvesDias = tempoDeVida.Days;

            if(pesagem.IdadeAvesDias < 0)
                throw new Exception("A data da pesagem não pode ser anterior à data de chegada do lote.");

            return await _pesagemRepository.AdicionarAsync(pesagem);
        }

        public async Task<IEnumerable<Pesagem>> ObterHistoricoAsync(int loteId)
        {
            return await _pesagemRepository.ObterHistoricoPorLoteAsync(loteId);
        }
    }
}