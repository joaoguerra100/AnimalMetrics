using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace AnimalMetrics.Api.Models
{
    public class Pesagem
    {
        public int Id { get; set; }
        public int LoteId { get; set; }
        public DateTime DataRegistro { get; set; } = DateTime.Now;
        public decimal PesoMedioGramas { get; set; }
        public int IdadeAvesDias { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public Lote? Lote { get; set; }
    }
}