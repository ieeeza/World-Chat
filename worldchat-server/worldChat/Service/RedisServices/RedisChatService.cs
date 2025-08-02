using StackExchange.Redis;

namespace worldChat.Service.RedisServices
{
    public class RedisChatService(IConnectionMultiplexer redis)
    {

        private readonly IDatabase _database = redis.GetDatabase();

        public async Task AdicionarUsuarioOnline(string userId)
        {
            await _database.SetAddAsync("usuariosOnline", userId);
        }

        public async Task RemoverUsuarioOnline(string userId)
        {
            await _database.SetRemoveAsync("usuariosOnline", userId);
        }

        public async Task<string[]> ListarUsuariosOnline()
        {
            var usuarios = await _database.SetMembersAsync("usuariosOnline");
            return [.. usuarios.Select(u => u.ToString())];
        }

        public async Task RemoverTodosUsuariosOnline()
        {
            await _database.KeyDeleteAsync("usuariosOnline");
        }
    }
}
