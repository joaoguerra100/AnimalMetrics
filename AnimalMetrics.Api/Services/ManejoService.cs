using AnimalMetrics.Api.Models;
using AnimalMetrics.Api.Repositories.Interface;
using AnimalMetrics.Api.Services.Interface;

namespace AnimalMetrics.Api.Services
{
    public class ManejoService : IManejoService
    {
        private readonly IManejoRepository _manejoRepository;
        private readonly ILoteRepository _loteRepository;

        public ManejoService(IManejoRepository manejoRepository, ILoteRepository loteRepository)
        {
            _manejoRepository = manejoRepository;
            _loteRepository = loteRepository;
        }

        public async Task<RegistroManejo> RegistrarManejoAsync(RegistroManejo manejo)
        {
            var lote = await _loteRepository.ObterPorIdAsync(manejo.LoteId);
            if (lote == null) throw new Exception("Lote não encontrado.");

            // Mantivemos a validação de data, mas adaptamos a mensagem e removemos o IdadeAvesDias
            if (manejo.DataRegistro.Date < lote.DataChegada.Date)
                throw new Exception("A data do manejo não pode ser anterior à data de chegada do lote.");

            return await _manejoRepository.AdicionarAsync(manejo);
        }

        public async Task<IEnumerable<RegistroManejo>> ObterHistoricoAsync(int loteId)
        {
            return await _manejoRepository.ObterHistoricoPorLoteAsync(loteId);
        }

        public async Task<RegistroManejo> AtualizarManejoAsync(int id, RegistroManejo manejoAtualizado)
        {
            // 1. Busca o registro original no banco
            var manejoExistente = await _manejoRepository.GetByIdAsync(id);

            if (manejoExistente == null)
            {
                throw new KeyNotFoundException("Registro de manejo não encontrado.");
            }

            // 2. Atualiza apenas os dados permitidos do Checklist
            manejoExistente.DataRegistro = manejoAtualizado.DataRegistro;
            manejoExistente.LimpezaRealizada = manejoAtualizado.LimpezaRealizada;
            manejoExistente.EquipamentosInspecionados = manejoAtualizado.EquipamentosInspecionados;
            manejoExistente.EstruturaOk = manejoAtualizado.EstruturaOk;
            manejoExistente.CondicoesClimaticasOk = manejoAtualizado.CondicoesClimaticasOk;
            manejoExistente.Observacoes = manejoAtualizado.Observacoes;

            // 3. Salva no banco
            await _manejoRepository.UpdateAsync(manejoExistente);

            return manejoExistente;
        }
    }
}