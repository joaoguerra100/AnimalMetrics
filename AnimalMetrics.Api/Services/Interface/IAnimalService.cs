using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;

namespace AnimalMetrics.Api.Services.Interface
{
    public interface IAnimalService
    {
        Task<IEnumerable<Animal>> GetAllAnimalsAsync();
        Task<Animal> CreateAnimalAsync(CreateAnimalDto dto);
    }
}