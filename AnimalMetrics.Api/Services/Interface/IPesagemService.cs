using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IPesagemService
    {
        Task<IEnumerable<Pesagem>> ObterHistoricoAsync(int loteId);
        Task<Pesagem> RegistrarPesagemAsync(Pesagem pesagem);
        Task<Pesagem> AtualizarPesagemAsync(int id, Pesagem pesagemAtualizada);
    }
}