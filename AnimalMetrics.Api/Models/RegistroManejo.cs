using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace AnimalMetrics.Api.Models
{
    public class RegistroManejo
    {
        public int Id { get; set; }
        public int LoteId { get; set; }
        public DateTime DataRegistro { get; set; } = DateTime.Now;
        
        // Checklist Diário
        public bool LimpezaRealizada { get; set; }
        public bool EquipamentosInspecionados { get; set; } // Comedouros e Bebedouros
        public bool EstruturaOk { get; set; } // Telas, cortinas, telhado
        public bool CondicoesClimaticasOk { get; set; } // Temperatura e Ventilação
        
        // Observações gerais (ex: "Bebedouro 3 estava vazando, realizei a troca")
        public string? Observacoes { get; set; } 

        [ValidateNever]
        [JsonIgnore]
        public Lote? Lote { get; set; }
    }
}