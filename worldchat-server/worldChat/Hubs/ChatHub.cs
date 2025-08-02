using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using worldChat.Service.RedisServices;

namespace worldChat.Hubs
{
    [Authorize]
    public class ChatHub(RedisChatService redisChatService, ILogger<ChatHub> logger) : Hub
    {
        private readonly RedisChatService _redisChatService = redisChatService;
        private readonly ILogger<ChatHub> _logger = logger;

        public async Task SendMessage(string message)
        {
            var username = Context.User?.Identity?.Name ?? "";

            if (string.IsNullOrEmpty(username))
            {
                _logger.LogWarning("Não foi possível obter o nome do usuário autenticado para a conexão SignalR.");
                return;
            }

            await _redisChatService.IncrementarContadorMensagem(username);
            await Clients.All.SendAsync("ReceiveMessage", username, message);
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.User?.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                _logger.LogWarning("Conexão de usuário sem nome de usuário associado.");
                return;
            }

            var connectionId = Context.ConnectionId;

            await _redisChatService.AdicionarUsuarioOnline(username);
            await Clients.Caller.SendAsync("ReceiveConnectionId", connectionId);
            await Clients.All.SendAsync("UserConnected", username);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context?.User?.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                _logger.LogWarning("Desconexão de usuário sem nome de usuário associado.");
                return;
            }

            try
            {
                await _redisChatService.RemoverUsuarioOnline(username);
                await Clients.All.SendAsync("UserDisconnected", username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover usuário online.");
            }

            await base.OnDisconnectedAsync(exception);
        }

    }
}
