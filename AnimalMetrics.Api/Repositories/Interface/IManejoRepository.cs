using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IManejoRepository
    {
         Task<RegistroManejo?> GetByIdAsync(int id);
        Task<IEnumerable<RegistroManejo>> ObterHistoricoPorLoteAsync(int loteId);
        Task<RegistroManejo> AdicionarAsync(RegistroManejo manejo);
        Task UpdateAsync(RegistroManejo manejo);
    }
}