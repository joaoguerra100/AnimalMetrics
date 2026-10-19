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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDailyRecord(int id, [FromBody] DailyRecord registroAtualizado)
        {
            try 
            { 
                var registroExistente = await _service.GetByIdAsync(id); // Precisa ter esse método no service/repo
                if (registroExistente == null) return NotFound("Registro não encontrado.");

                registroExistente.FoodGiven = registroAtualizado.FoodGiven;
                registroExistente.WaterConsumed = registroAtualizado.WaterConsumed;
                registroExistente.RecordDate = registroAtualizado.RecordDate;

                await _service.UpdateAsync(registroExistente); // Precisa ter esse método no repo
                return Ok(registroExistente); 
            }
            catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
        }
    }
}