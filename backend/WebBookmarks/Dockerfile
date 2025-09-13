FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

# restore using the full relative path from the build context
RUN dotnet restore "WebBookmarks/WebBookmarks.csproj"

# publish using the same path
RUN dotnet publish "WebBookmarks/WebBookmarks.csproj" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "WebBookmarks.dll"]
