using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace AnimalMetrics.Api.Models
{
    public class RegistroMortalidade
    {
        public int Id { get; set; }
        public int LoteId { get; set; }
        public DateTime DatRegistro { get; set; } = DateTime.Now;
        public int QuantidadeAves { get; set; }
        public string Causa { get; set; } // Ex: "Calor", "Doença", "Desconhecida"

        [ValidateNever]
        [JsonIgnore]
        public Lote? Lote { get; set; }
    }
}