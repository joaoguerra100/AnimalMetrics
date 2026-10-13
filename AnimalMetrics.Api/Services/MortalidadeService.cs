using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class MortalidadeService : IMortalidadeService
    {
        private readonly IMortalidadeRepository _mortalidadeRepository;
        private readonly ILoteRepository _loteRepository;

        public MortalidadeService(IMortalidadeRepository mortalidadeRepository, ILoteRepository loteRepository)
        {
            _mortalidadeRepository = mortalidadeRepository;
            _loteRepository = loteRepository;
        }

        public async Task<RegistroMortalidade> RegistrarPerdaAsync(RegistroMortalidade registro)
        {
            var lote = await _loteRepository.ObterPorIdAsync(registro.LoteId);

            if (lote == null) throw new Exception("Lote não encontrado.");

            lote.QuantidadeAtual -= registro.QuantidadeAves;

            await _loteRepository.AtualizarAsync(lote);
            return await _mortalidadeRepository.AdicionarAsync(registro);
        }

        public async Task<IEnumerable<RegistroMortalidade>> ObterHistoricoAsync(int loteId)
        {
            return await _mortalidadeRepository.ObterHistoricoPorLoteAsync(loteId);
        }

        public async Task<RegistroMortalidade> AtualizarPerdaAsync(int id, RegistroMortalidade mortalidadeAtualizada)
        {
            // 1. Busca o registro original no banco
            var mortalidadeExistente = await _mortalidadeRepository.GetByIdAsync(id);

            if (mortalidadeExistente == null)
            {
                throw new KeyNotFoundException("Registro de mortalidade não encontrado.");
            }

            // 2. Atualiza apenas os dados permitidos
            mortalidadeExistente.DatRegistro = mortalidadeAtualizada.DatRegistro; // Mantive DatRegistro sem 'a' como no seu modelo
            mortalidadeExistente.QuantidadeAves = mortalidadeAtualizada.QuantidadeAves;
            mortalidadeExistente.Causa = mortalidadeAtualizada.Causa;

            // 3. Salva no banco (chamando o repositório, e não a própria entidade)
            await _mortalidadeRepository.UpdateAsync(mortalidadeExistente);

            // 4. Retorna o registro atualizado para o Controller
            return mortalidadeExistente;
        }
    }
}