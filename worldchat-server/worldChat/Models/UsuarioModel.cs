using System.ComponentModel.DataAnnotations;

namespace worldChat.Models
{
    public class UsuarioModel
    {
        [Key]
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Token { get; set; } = string.Empty;
    }
}
