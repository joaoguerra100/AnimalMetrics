using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface ISanidadeRepository
    {
        Task<RegistroSanidade> AdicionarAsync(RegistroSanidade registro);
        Task<IEnumerable<RegistroSanidade>> ObterHistoricoPorLoteAsync(int loteId);
    }
}