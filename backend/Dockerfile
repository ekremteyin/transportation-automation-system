FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY NakliyeApp.sln .
COPY src/NakliyeApp.API/NakliyeApp.API.csproj             src/NakliyeApp.API/
COPY src/NakliyeApp.Application/NakliyeApp.Application.csproj   src/NakliyeApp.Application/
COPY src/NakliyeApp.Domain/NakliyeApp.Domain.csproj        src/NakliyeApp.Domain/
COPY src/NakliyeApp.Infrastructure/NakliyeApp.Infrastructure.csproj src/NakliyeApp.Infrastructure/

RUN dotnet restore

COPY . .
RUN dotnet publish src/NakliyeApp.API -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "NakliyeApp.API.dll"]
