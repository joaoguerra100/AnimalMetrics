using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class AnimalService : IAnimalService
    {
        private readonly IAnimalRepository _repository;

        public AnimalService(IAnimalRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Animal>> GetAllAnimalsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Animal> CreateAnimalAsync(CreateAnimalDto dto)
        {
            var animal = new Animal
            {
                Name = dto.Name,
                Species = dto.Species,
                CreatedAt = DateTime.UtcNow
            };

            return await _repository.AddAsync(animal);
        }

        public async Task UpdateRationPriceAsync(int id, decimal price)
        {
            var animal = await _repository.GetByIdAsync(id);

            if(animal != null)
            {
                animal.RationPricePerKg = price;
                await _repository.UpdateAsync(animal);
            }
        }
    }
}