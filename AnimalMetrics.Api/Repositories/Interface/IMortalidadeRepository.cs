using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IMortalidadeRepository
    {
        Task<RegistroMortalidade> AdicionarAsync(RegistroMortalidade registro);
    }
}