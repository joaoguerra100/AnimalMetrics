using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManejoController : ControllerBase
    {
        private readonly IManejoService _service;

        public ManejoController(IManejoService service)
        {
            _service = service;
        }

        [HttpGet("lote/{loteId}")]
        public async Task<IActionResult> ObterHistorico(int loteId)
        {
            return Ok(await _service.ObterHistoricoAsync(loteId));
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarManejo([FromBody] RegistroManejo registro)
        {
            try { return Ok(await _service.RegistrarManejoAsync(registro)); }
            catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarManejo(int id, [FromBody] RegistroManejo registro)
        {
            try { return Ok(await _service.AtualizarManejoAsync(id, registro)); }
            catch (KeyNotFoundException ex) { return NotFound(new { mensagem = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
        }
    }
}