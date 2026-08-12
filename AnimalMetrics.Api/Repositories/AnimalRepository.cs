using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Repositories
{
    public class AnimalRepository : IAnimalRepository
    {
        private readonly AppDbContext _context;

        public AnimalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Animal>> GetAllAsync()
        {
            return await _context.Animals.ToListAsync();
        }

        public async Task<Animal?> GetByIdAsync(int id)
        {
            return await _context.Animals.FindAsync(id);
        }

        public async Task<Animal> AddAsync(Animal animal)
        {
            _context.Animals.Add(animal);
            await _context.SaveChangesAsync();
            return animal;
        }

        public async Task<Animal> UpdateAsync(Animal animal)
        {
            _context.Entry(animal).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return animal;
        }
    }
}