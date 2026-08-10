using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimalsController : ControllerBase
    {
        private readonly IAnimalService _service;

        public AnimalsController(IAnimalService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Animal>>> GetAnimals()
        {
            return Ok(await _service.GetAllAnimalsAsync());
        }

        [HttpPost]
        public async Task<ActionResult<Animal>> PostAnimal([FromBody] CreateAnimalDto dto)
        {
            var createdAnimal = await _service.CreateAnimalAsync(dto);
            return CreatedAtAction(nameof(GetAnimals), new { id = createdAnimal.Id }, createdAnimal);
        }
    }
}