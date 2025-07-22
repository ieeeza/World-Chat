using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using worldChat.Service.RedisServices;

namespace worldChat.Hubs
{
    [Authorize]
    public class ChatHub(RedisChatService redisChatService) : Hub
    {
        private readonly RedisChatService _redisChatService = redisChatService;

        public async Task SendMessage(string message)
        {
            var username = Context.User?.Identity?.Name ?? "Anonymous";
            await _redisChatService.IncrementarContadorMensagem(username);
            await Clients.All.SendAsync("ReceiveMessage", username, message);
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.User?.Identity?.Name ?? "Anonymous";
            var connectionId = Context.ConnectionId;

            await _redisChatService.AdicionarUsuarioOnline(username);
            await Clients.Caller.SendAsync("ReceiveConnectionId", connectionId);
            await Clients.All.SendAsync("UserConnected", username);
            await base.OnConnectedAsync();
        }
    }
}
