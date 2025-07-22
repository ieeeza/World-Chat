using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using worldChat.DataContext;
using worldChat.Dtos;
using worldChat.Models;
using worldChat.Service.TokenServices;

namespace worldChat.Service.UsuarioService
{
    public class UsuarioService(ApplicationDbContext context, TokenService tokenService) : IUsuarioInterface
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<ServiceResponse<UsuarioModel>> CreateUsuarioAsync(UsuarioModel usuario)
        {
            var serviceResponse = new ServiceResponse<UsuarioModel>();

            try
            {
                if (usuario == null)
                {
                    serviceResponse.Sucesso = false;
                    serviceResponse.Mensagem = "Usuário não pode ser nulo.";
                    return serviceResponse;
                }

                var usuarioExistente = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Username == usuario.Username);

                if (usuarioExistente != null)
                {
                    serviceResponse.Sucesso = false;
                    serviceResponse.Mensagem = "Usuário já existe.";
                    return serviceResponse;
                }

                usuario.Password = BCrypt.Net.BCrypt.HashPassword(usuario.Password);

                _context.Add(usuario);
                await _context.SaveChangesAsync();

                serviceResponse.Mensagem = "Usuário criado com sucesso.";
            }
            catch (Exception ex)
            {
                serviceResponse.Sucesso = false;
                serviceResponse.Mensagem = $"Erro ao criar usuário: {ex.Message}";
            }

            return serviceResponse;
        }
        public async Task<ServiceResponse<UsuarioLoginRequest>> GetUsuarioByCredentialsAsync([FromBody] UsuarioLoginRequest usuarioLoginRequest)
        {
            var serviceResponse = new ServiceResponse<UsuarioLoginRequest>();
            try
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(x => x.Username == usuarioLoginRequest.Username);

                if (usuario == null || !BCrypt.Net.BCrypt.Verify(usuarioLoginRequest.Password, usuario.Password))
                {
                    serviceResponse.Sucesso = false;
                    serviceResponse.Mensagem = "Usuário não encontrado.";
                    return serviceResponse;
                }

                var token = tokenService.GerarToken(usuario);

                serviceResponse.Dados = new UsuarioLoginRequest
                {
                    Username = usuario.Username,
                    Password = token
                };
            }
            catch (Exception ex)
            {
                serviceResponse.Sucesso = false;
                serviceResponse.Mensagem = $"Erro ao buscar usuário: {ex.Message}";
            }
            return serviceResponse;
        }
    }
}
