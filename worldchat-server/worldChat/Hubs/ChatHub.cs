using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using worldChat.Service.RedisServices;

namespace worldChat.Hubs
{
    [Authorize]
    public class ChatHub(RedisChatService redisChatService) : Hub
    {
        private readonly RedisChatService _redisChatService = redisChatService;

        public async Task OnSendMessage(string message)
        {
            var username = Context.User?.Identity?.Name ?? "";

            if (string.IsNullOrEmpty(username))
            {
                throw new InvalidOperationException("Não foi possível obter o nome do usuário autenticado para a conexão SignalR.");
            }

            await _redisChatService.IncrementarContadorMensagem(username);
            await Clients.All.SendAsync("ReceiveMessage", username, message);
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.User?.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                throw new InvalidOperationException("Não foi possível obter o nome do usuário autenticado para a conexão SignalR.");
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
                throw new InvalidOperationException("Não foi possível obter o nome do usuário autenticado para a conexão SignalR.");
            }

            await _redisChatService.RemoverUsuarioOnline(username);

            await Clients.All.SendAsync("UserDisconnected", username);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
