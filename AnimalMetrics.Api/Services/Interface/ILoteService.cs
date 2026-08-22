using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface ILoteService
    {
        Task<IEnumerable<Lote>> ObterTodosLotesAsync();
        Task<Lote> CriarLotesAsync(Lote lote);
    }
}