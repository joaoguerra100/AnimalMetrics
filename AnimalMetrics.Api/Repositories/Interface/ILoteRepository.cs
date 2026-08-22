using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface ILoteRepository
    {
        Task<IEnumerable<Lote>> ObterTodosAsync();
        Task<Lote?> ObterPorIdAsync(int id);
        Task<Lote> AdicionarAsync(Lote lote);
        Task AtualizarAsync(Lote lote);
    }
}