namespace AnimalMetrics.Api.Models
{
    public class Pesagem
    {
        public int Id { get; set; }
        public int LoteId { get; set; }
        public DateTime DataRegistro { get; set; } = DateTime.Now;
        public decimal PesoMedioGramas { get; set; }
        public int IdadeAvesDias { get; set; }
        public Lote Lote { get; set; }
    }
}