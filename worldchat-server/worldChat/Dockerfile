# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia o csproj e restaura dependências
COPY *.csproj ./
RUN dotnet restore

# Copia tudo e publica em Release
COPY . ./
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copia os arquivos publicados do build
COPY --from=build /app/out ./

# Expõe a porta 80
EXPOSE 80

# Define a URL para usar a porta dinâmica do Render
ENV ASPNETCORE_URLS=http://+:80

# Comando para iniciar a aplicação
ENTRYPOINT ["dotnet", "worldChat.dll"]
