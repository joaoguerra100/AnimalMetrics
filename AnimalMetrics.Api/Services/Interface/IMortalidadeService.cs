using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IMortalidadeService
    {
        Task<RegistroMortalidade> RegistrarPerdaAsync(RegistroMortalidade registro);
    }
}