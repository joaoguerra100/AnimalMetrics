using AnimalMetrics.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options){}

        public DbSet<Animal> Animals => Set<Animal>();
        public DbSet<DailyRecord> DailyRecords => Set<DailyRecord>();
    }
}