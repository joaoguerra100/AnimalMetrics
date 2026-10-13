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

        public async Task<Lote> ObterLotePorIdAsync(int id)
        {
            var lote = await _repository.ObterPorIdAsync(id);
            return lote;
        }

        public async Task<Lote> CriarLotesAsync(Lote lote)
        {
            lote.QuantidadeAtual = lote.QuantidadeInicial;
            lote.Ativo = true;

            return await _repository.AdicionarAsync(lote);
        }

        public async Task AtualizarLoteAsync(int id, Lote loteAtualizado)
        {
            var lote = await _repository.ObterPorIdAsync(id);
            if (lote == null) throw new Exception("Lote não encontrado.");

            // Atualiza apenas os campos permitidos de alteração
            lote.Nome = loteAtualizado.Nome;
            lote.Linhagem = loteAtualizado.Linhagem;
            lote.Finalidade = loteAtualizado.Finalidade;
            lote.QuantidadeInicial = loteAtualizado.QuantidadeInicial;
            lote.Ativo = loteAtualizado.Ativo;

            await _repository.AtualizarAsync(lote);
        }

        public async Task UpdateRationPriceAsync(int loteId, decimal price)
        {
            var lote = await _repository.ObterPorIdAsync(loteId);

            if (lote == null)
            {
                throw new KeyNotFoundException("Lote não encontrado.");
            }

            lote.RationPrice = price;

            await _repository.AtualizarAsync(lote);
        }

        public async Task DeletarLoteAsync(int id)
        {
            var lote = await _repository.ObterPorIdAsync(id);
            if (lote == null) throw new Exception("Lote não encontrado.");

            await _repository.DeletarAsync(id);
        }
    }
}