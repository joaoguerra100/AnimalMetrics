using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MortalidadeController : ControllerBase
    {
        private readonly IMortalidadeService _service;

        public MortalidadeController(IMortalidadeService service)
        {
            _service = service;
        }

        [HttpGet("lote/{loteId}")]
        public async Task<IActionResult> ObterHistorico(int loteId)
        {
            return Ok(await _service.ObterHistoricoAsync(loteId));
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarBaixa([FromBody] RegistroMortalidade registro)
        {
            try
            {
                var novaBaixa = await _service.RegistrarPerdaAsync(registro);
                return Ok(novaBaixa);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarBaixa(int id, [FromBody] RegistroMortalidade registro)
        {
            try { return Ok(await _service.AtualizarPerdaAsync(id, registro)); }
            catch (KeyNotFoundException ex) { return NotFound(new { mensagem = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
        }
    }
}