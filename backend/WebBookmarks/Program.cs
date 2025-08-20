using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WebBookmarks.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<BookmarksDBContext>(options =>
    options.UseSqlServer("SERVER=host.docker.internal;Database=WebBookmarks;User Id=administrator;Password=administrator;TrustServerCertificate=True;")
    //options.UseSqlServer("SERVER=DESKTOP-1IVS9TO;Database=WebBookmarks;User Id=administrator;Password=administrator;TrustServerCertificate=True;")

);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = "CoolIssuer",
        ValidateAudience = true,
        ValidAudience = "*",
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("VeryVeryVeryLongKeyVeryVeryVeryLongKey123123VeryVeryVeryLongKeyVeryVeryVeryLongKey123123")),
        ValidateIssuerSigningKey = true
    };

    });

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
