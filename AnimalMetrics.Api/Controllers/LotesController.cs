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

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var lote = await _service.ObterLotePorIdAsync(id);

            if (lote == null)
            {
                return NotFound(new { mensagem = "Lote não encontrado." });
            }

            return Ok(lote);
        }

        [HttpPost]
        public async Task<IActionResult> CriarLote([FromBody] Lote lote)
        {
            var novoLote = await _service.CriarLotesAsync(lote);

            return CreatedAtAction(nameof(ObterTodos), new { id = novoLote.Id }, novoLote);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Lote lote)
        {
            try
            {
                await _service.AtualizarLoteAsync(id, lote);
                return NoContent(); // HTTP 204 Sucesso sem retorno de corpo
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}/ration-price")]
        public async Task<IActionResult> UpdateRationPrice(int id, [FromBody] decimal price)
        {
            try
            {
                await _service.UpdateRationPriceAsync(id, price);
                return NoContent(); // 204 Sucesso
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno ao atualizar o preço da ração." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(int id)
        {
            try
            {
                await _service.DeletarLoteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}