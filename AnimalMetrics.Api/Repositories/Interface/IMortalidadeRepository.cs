using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IMortalidadeRepository
    {
        Task<RegistroMortalidade?> GetByIdAsync(int id);
        Task<IEnumerable<RegistroMortalidade>> ObterHistoricoPorLoteAsync(int loteId);
        Task<RegistroMortalidade> AdicionarAsync(RegistroMortalidade registro);
        Task UpdateAsync(RegistroMortalidade mortalidade);
    }
}