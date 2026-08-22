namespace AnimalMetrics.Api.Models
{
    public class RegistroNutricao
    {
        public int Id { get; set; }
        public int LoteId { get; set; }
        public DateTime DataRegistro { get; set; } = DateTime.Now;
        public decimal RacaoGramas { get; set; }
        public decimal AguaLitros { get; set; }
        public Lote Lote { get; set; }
    }
}