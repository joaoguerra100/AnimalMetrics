using AnimalMetrics.Api.Models;

namespace AnimalMetrics.Api.Repositories.Interface
{
    public interface IAnimalRepository
    {
        Task<IEnumerable<Animal>> GetAllAsync();
        Task<Animal?> GetByIdAsync(int id);
        Task<Animal> AddAsync(Animal animal);
        Task<Animal> UpdateAsync(Animal animal);
    }
}