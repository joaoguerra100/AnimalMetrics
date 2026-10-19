using AnimalMetrics.Api.Data;
using AnimalMetrics.Api.Repositories;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Reposutiruis
builder.Services.AddScoped<IAnimalRepository, AnimalRepository>();
builder.Services.AddScoped<IDailyRecordRepository, DailyRecordRepository>();
builder.Services.AddScoped<ILoteRepository, LoteRepository>();
builder.Services.AddScoped<IMortalidadeRepository, MortalidadeRepository>();
builder.Services.AddScoped<IPesagemRepository, PesagemRepository>();
builder.Services.AddScoped<ISanidadeRepository, SanidadeRepository>();
builder.Services.AddScoped<IManejoRepository, ManejoRepository>();

// Services
builder.Services.AddScoped<IAnimalService, AnimalService>();
builder.Services.AddScoped<IDailyRecordService, DailyRecordService>();
builder.Services.AddScoped<ILoteService, LoteService>();
builder.Services.AddScoped<IMortalidadeService, MortalidadeService>();
builder.Services.AddScoped<IPesagemService, PesagemService>();
builder.Services.AddScoped<ISanidadeService, SanidadeService>();
builder.Services.AddScoped<ISanidadeService, SanidadeService>();
builder.Services.AddScoped<IManejoService, ManejoService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();