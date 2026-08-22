using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface ISanidadeService
    {
        Task<RegistroSanidade> RegistrarSanidadeAsync(RegistroSanidade registro);
        Task<IEnumerable<RegistroSanidade>> ObterHistoricoAsync(int loteId);
    }
}