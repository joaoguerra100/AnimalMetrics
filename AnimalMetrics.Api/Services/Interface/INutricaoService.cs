using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface INutricaoService
    {
        Task<RegistroNutricao> RegistrarConsumoAsync(RegistroNutricao registro);
        Task<IEnumerable<RegistroNutricao>> ObterHistoricoAsync(int loteId);
    }
}