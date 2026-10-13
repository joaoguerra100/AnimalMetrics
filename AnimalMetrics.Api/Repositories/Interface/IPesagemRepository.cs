using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IPesagemRepository
    {
        Task<Pesagem?> GetByIdAsync(int id);
        Task<IEnumerable<Pesagem>> ObterHistoricoPorLoteAsync(int loteId);
        Task<Pesagem> AdicionarAsync(Pesagem pesagem);
        Task UpdateAsync(Pesagem pesagem);
    }
}