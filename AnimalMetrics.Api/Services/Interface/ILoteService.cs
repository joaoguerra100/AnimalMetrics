using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface ILoteService
    {
        Task<IEnumerable<Lote>> ObterTodosLotesAsync();
        Task<Lote> ObterLotePorIdAsync(int id);
        Task<Lote> CriarLotesAsync(Lote lote);
        Task AtualizarLoteAsync(int id, Lote loteAtualizado);
        Task UpdateRationPriceAsync(int loteId, decimal price);
        Task DeletarLoteAsync(int id);
    }
}