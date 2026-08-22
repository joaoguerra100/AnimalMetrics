using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface INutricaoRepository
    {
        Task<RegistroNutricao> AdicionarAsync(RegistroNutricao registro);
        Task<IEnumerable<RegistroNutricao>> ObterHistoricoPorLoteAsync(int loteId);
    }
}