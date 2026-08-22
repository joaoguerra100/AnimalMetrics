using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class LoteService : ILoteService
    {
        private readonly ILoteRepository _repository;

        public LoteService(ILoteRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Lote>> ObterTodosLotesAsync()
        {
            return await _repository.ObterTodosAsync();
        }

        public async Task<Lote> CriarLotesAsync(Lote lote)
        {
            lote.QuantidadeAtual = lote.QuantidadeInicial;
            lote.Ativo = true;

            return await _repository.AdicionarAsync(lote);
        }
    }
}