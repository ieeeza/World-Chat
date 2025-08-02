using Microsoft.AspNetCore.Mvc;
using worldChat.Service.RedisServices;

namespace worldChat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RedisController(RedisChatService redisChatService) : ControllerBase
    {
        private readonly RedisChatService _redisChatService = redisChatService;

        [HttpGet("usuarios-online")]
        public async Task<IActionResult> ListarUsuariosOnline()
        {
            var usuariosOnline = await _redisChatService.ListarUsuariosOnline();
            return Ok(usuariosOnline);
        }

        [HttpPost("adicionar-usuario-online/{userId}")]
        public async Task<IActionResult> AdicionarUsuarioOnline(string userId)
        {
            await _redisChatService.AdicionarUsuarioOnline(userId);
            return NoContent();
        }

        [HttpPost("remover-usuario-online/{userId}")]
        public async Task<IActionResult> RemoverUsuarioOnline(string userId)
        {
            await _redisChatService.RemoverUsuarioOnline(userId);
            return NoContent();
        }

        [HttpGet("contador-mensagens/{userId}")]
        public async Task<IActionResult> ObterContadorMensagens(string userId)
        {
            var contador = await _redisChatService.ObterContadorMensagens(userId);
            return Ok(contador);
        }

        [HttpPost("deletar-usuarios")]
        public async Task<ActionResult> RemoverTodosUsuariosOnline()
        {
            await _redisChatService.RemoverTodosUsuariosOnline();
            return NoContent();
        }
    }
}
