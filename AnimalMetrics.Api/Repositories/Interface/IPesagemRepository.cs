using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IPesagemRepository
    {
        Task<Pesagem> AdicionarAsync(Pesagem pesagem);
        Task<IEnumerable<Pesagem>> ObterHistoricoPorLoteAsync(int loteId);
    }
}