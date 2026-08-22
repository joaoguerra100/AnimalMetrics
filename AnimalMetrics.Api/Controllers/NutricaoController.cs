using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace AnimalMetrics.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NutricaoController : ControllerBase
    {
        private readonly INutricaoService _nutricaoService;
        public NutricaoController(INutricaoService nutricaoService) => _nutricaoService = nutricaoService;

        [HttpGet("lote/{loteId}")]
        public async Task<IActionResult> ObterHistorico(int loteId) => Ok(await _nutricaoService.ObterHistoricoAsync(loteId));

        [HttpPost]
        public async Task<IActionResult> RegistrarConsumo([FromBody] RegistroNutricao registro)
        {
            try { return Ok(await _nutricaoService.RegistrarConsumoAsync(registro)); }
            catch (Exception ex) { return BadRequest(new { mensagem = ex.Message }); }
        }
    }
}