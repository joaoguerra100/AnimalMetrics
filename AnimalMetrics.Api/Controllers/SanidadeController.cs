using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SanidadeController : ControllerBase
    {
        private readonly ISanidadeService _sanidadeService;
        public SanidadeController(ISanidadeService sanidadeService) => _sanidadeService = sanidadeService;

        [HttpGet("lote/{loteId}")]
        public async Task<IActionResult> ObterHistorico(int loteId) => Ok(await _sanidadeService.ObterHistoricoAsync(loteId));

        [HttpPost]
        public async Task<IActionResult> RegistrarSanidade([FromBody] RegistroSanidade registro)
        {
            try { return Ok(await _sanidadeService.RegistrarSanidadeAsync(registro)); }
            catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
        }
    }
}