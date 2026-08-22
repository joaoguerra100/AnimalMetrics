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
    }
}