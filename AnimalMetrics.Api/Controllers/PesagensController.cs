using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PesagensController : ControllerBase
    {
        private readonly IPesagemService _service;

        public PesagensController(IPesagemService service)
        {
            _service = service;
        }

        [HttpGet("lote/{loteId}")]
        public async Task<IActionResult> ObterHistorico(int loteId)
        {
            var historico = await _service.ObterHistoricoAsync(loteId);
            return Ok(historico);
        }

        [HttpPost]
    public async Task<IActionResult> RegistrarPesagem([FromBody] Pesagem pesagem)
    {
        try
        {
            var novaPesagem = await _service.RegistrarPesagemAsync(pesagem);
            return Ok(novaPesagem);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
    }
}