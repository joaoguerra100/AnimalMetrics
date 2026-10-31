# Estágio de Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o arquivo de projeto e restaura as dependências
COPY ["AnimalMetrics.Api.csproj", "./"]
RUN dotnet restore "AnimalMetrics.Api.csproj"

# Copia todo o resto do código e compila
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Estágio de Execução
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AnimalMetrics.Api.dll"]