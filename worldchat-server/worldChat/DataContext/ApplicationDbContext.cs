using Microsoft.EntityFrameworkCore;
using worldChat.Models;

namespace worldChat.DataContext
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public required DbSet<UsuarioModel> Usuarios { get; set; }
    }
}
