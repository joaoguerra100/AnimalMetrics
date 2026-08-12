using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Models.DTOs;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DailyRecordsController : ControllerBase
    {
        private readonly IDailyRecordService _service;

        public DailyRecordsController(IDailyRecordService service)
        {
            _service = service;
        }

        [HttpGet("animal/{animalId}")]
        public async Task<ActionResult<IEnumerable<DailyRecord>>> GetRecordsByAnimal(int animalId)
        {
            return Ok(await _service.GetRecordsByAnimalAsync(animalId));
        }

        [HttpGet("animal/{animalId}/monthly-summary")]
        public async Task<ActionResult<MonthlySummaryDto>> GetMontlySummary(int animalId, [FromQuery]int month, [FromQuery] int year)
        {
            var summary = await _service.GetMonthlySummaryAsync(animalId, month, year);
            return Ok(summary);
        }

        [HttpPost]
        public async Task<ActionResult<DailyRecord>> PostDailyRecord([FromBody] CreateDailyRecordDto dto)
        {
            var createdRecord = await _service.CreateRecordAsync(dto);
            return CreatedAtAction(nameof(GetRecordsByAnimal), new { animalId = createdRecord.AnimalId }, createdRecord);
        }
    }
}