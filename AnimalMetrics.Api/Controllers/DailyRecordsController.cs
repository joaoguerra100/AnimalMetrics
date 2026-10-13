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

        [HttpGet("lote/{loteId}")]
        public async Task<IActionResult> GetByLote(int loteId)
        {
            var records = await _service.GetByLoteIdAsync(loteId);
            return Ok(records);
        }

        [HttpGet("lote/{loteId}/monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary(int loteId, [FromQuery] int month, [FromQuery] int year)
        {
            var summary = await _service.GetMonthlySummaryByLoteAsync(loteId, month, year);
            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> PostDailyRecord([FromBody] CreateDailyRecordDto dto)
        {
            var created = await _service.CreateRecordAsync(dto);
            return CreatedAtAction(nameof(GetByLote), new { loteId = created.LoteId }, created);
        }
    }
}