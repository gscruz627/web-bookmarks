FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore
COPY WebBookmarks.csproj ./
RUN dotnet restore "WebBookmarks.csproj"

# copy everything else
COPY . ./
RUN dotnet publish "WebBookmarks.csproj" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "WebBookmarks.dll"]
