using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IMortalidadeService
    {
        Task<IEnumerable<RegistroMortalidade>> ObterHistoricoAsync(int loteId);
        Task<RegistroMortalidade> RegistrarPerdaAsync(RegistroMortalidade registro);
        Task<RegistroMortalidade> AtualizarPerdaAsync(int id, RegistroMortalidade mortalidadeAtualizada);
    }
}