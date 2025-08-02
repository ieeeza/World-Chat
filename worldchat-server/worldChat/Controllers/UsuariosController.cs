using Microsoft.AspNetCore.Mvc;
using worldChat.Dtos;
using worldChat.Models;
using worldChat.Service.UsuarioService;

namespace worldChat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController(IUsuarioInterface usuarioInterface) : ControllerBase
    {
        private readonly IUsuarioInterface _usuarioInterface = usuarioInterface;

        [HttpPost("login")]
        public async Task<ActionResult<ServiceResponse<UsuarioLoginRequest>>> GetUsuarioByCredentialsAsync(UsuarioLoginRequest usuarioLoginRequest)
        {
            return Ok(await _usuarioInterface.GetUsuarioByCredentialsAsync(usuarioLoginRequest));
        }

        [HttpPost("register")]
        public async Task<ActionResult<ServiceResponse<UsuarioModel>>> CreateUsuarioAsync(UsuarioModel usuario)
        {
            return Ok(await _usuarioInterface.CreateUsuarioAsync(usuario));
        }
    }
}
