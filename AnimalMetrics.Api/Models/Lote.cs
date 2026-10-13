namespace AnimalMetrics.Api.Models
{
    public class Lote
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public DateTime DataChegada { get; set; }
        public int QuantidadeInicial { get; set; }
        public int QuantidadeAtual { get; set; }
        public string Linhagem { get; set; }
        public string Finalidade { get; set; }
        public bool Ativo { get; set; } = true;
        public decimal RationPrice { get; set; }
    }
}