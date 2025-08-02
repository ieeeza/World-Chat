using worldChat.Dtos;
using worldChat.Models;

namespace worldChat.Service.UsuarioService
{
    public interface IUsuarioInterface
    {
        public Task<ServiceResponse<UsuarioModel>> CreateUsuarioAsync(UsuarioModel usuario);
        public Task<ServiceResponse<UsuarioLoginRequest>> GetUsuarioByCredentialsAsync(UsuarioLoginRequest usuarioLoginRequest);
    }
}
