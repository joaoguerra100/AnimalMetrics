using AnimalMetrics.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalMetrics.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options){}

        public DbSet<Animal> Animals => Set<Animal>();
        public DbSet<DailyRecord> DailyRecords => Set<DailyRecord>();
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<RegistroMortalidade> Mortalidades { get; set; }
        public DbSet<Pesagem> Pesagens { get; set; }
        public DbSet<RegistroSanidade> Sanidade { get; set; }
        public DbSet<RegistroManejo> Manejos { get; set; }
    }
}