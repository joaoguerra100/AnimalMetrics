using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IManejoService
    {
        Task<IEnumerable<RegistroManejo>> ObterHistoricoAsync(int loteId);
        Task<RegistroManejo> RegistrarManejoAsync(RegistroManejo manejo);
        Task<RegistroManejo> AtualizarManejoAsync(int id, RegistroManejo manejoAtualizado);
    }
}