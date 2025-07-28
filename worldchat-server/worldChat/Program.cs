using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using worldChat.Authentication;
using worldChat.DataContext;
using worldChat.Hubs;
using worldChat.Service.RedisServices;
using worldChat.Service.TokenServices;
using worldChat.Service.UsuarioService;

var builder = WebApplication.CreateBuilder(args);

var JwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

if (JwtSettings == null || string.IsNullOrEmpty(JwtSettings.SecretKey))
{
    throw new InvalidOperationException("JwtSettings or SecretKey is not configured properly.");
}

builder.Services.AddJwtAuthentication(JwtSettings.SecretKey);

var redisConnectionString = Environment.GetEnvironmentVariable("redisConnectionString");

if (string.IsNullOrEmpty(redisConnectionString))
{
    throw new InvalidOperationException("Redis connection string is not configured properly.");
}

//var redis = builder.Configuration.GetConnectionString("redis");
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var configuration = ConfigurationOptions.Parse(redisConnectionString, true);
    return ConnectionMultiplexer.Connect(configuration);
});

//var conec = builder.Configuration.GetConnectionString("DefaultConnection");
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://localhost:3000", "https://world-chat-4fb6.vercel.app")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddScoped<IUsuarioInterface, UsuarioService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddSingleton<RedisChatService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
app.Urls.Add($"http://*:{port}");

app.MapControllers();
app.MapHub<ChatHub>("/chats")
    .RequireAuthorization();

await app.RunAsync();
