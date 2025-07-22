namespace worldChat.Models
{
    public class ServiceResponse<T>
    {
        public T? Dados { get; set; }
        public string Mensagem { get; set; } = string.Empty;
        public bool Sucesso { get; set; } = true;
        public DateTime HoraResposta { get; set; } = DateTime.Now.ToLocalTime();
    }
}
