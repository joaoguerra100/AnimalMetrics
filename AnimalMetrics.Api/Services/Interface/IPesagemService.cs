using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IPesagemService
    {
        Task<Pesagem> RegistrarPesagemAsync(Pesagem pesagem);
        Task<IEnumerable<Pesagem>> ObterHistoricoAsync(int loteId);
    }
}