namespace AnimalMetrics.Api.Models
{
    public class RegistroSanidade
    {
        public int Id { get; set; }
        public int LoteId { get; set; }
        public DateTime DataAplicacao { get; set; } = DateTime.Now;
        public string Tipo { get; set; } // Ex: "Vacina", "Medicamento", "Vitamina"
        public string NomeProduto { get; set; } // Ex: "NewCastle", "Amoxicilina"
        public string Dosagem { get; set; } // Ex: "10ml/L", "Gota Ocular"

        public Lote Lote { get; set; }
    }
}