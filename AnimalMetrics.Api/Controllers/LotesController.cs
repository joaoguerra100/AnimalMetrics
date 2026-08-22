using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LotesController : ControllerBase
    {
        private readonly ILoteService _service;

        public LotesController(ILoteService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> ObterTodos()
        {
            var lotes = await _service.ObterTodosLotesAsync();
            return Ok(lotes);
        }

        [HttpPost]
        public async Task<IActionResult> CriarLote([FromBody] Lote lote)
        {
            var novoLote = await _service.CriarLotesAsync(lote);

            return CreatedAtAction(nameof(ObterTodos), new { id = novoLote.Id }, novoLote);
        }
    }
}