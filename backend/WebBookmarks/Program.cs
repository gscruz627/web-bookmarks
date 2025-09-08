using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WebBookmarks.Data;

// Create the Buidler object
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add the DB service to the container
builder.Services.AddDbContext<BookmarksDBContext>(options =>
    options.UseNpgsql("host=bb4vyrniliufl7plbjju-postgresql.services.clever-cloud.com;port=5432;database=bb4vyrniliufl7plbjju;username=utjbtyalrbwxf4o8npuj;password=N88dFC2ioZKmmgjY7wfn4T5WEHJRDV")
//options.UseSqlServer("SERVER=host.docker.internal;Database=WebBookmarks;User Id=administrator;Password=administrator;TrustServerCertificate=True;")
//options.UseSqlServer("SERVER=DESKTOP-1IVS9TO;Database=WebBookmarks;User Id=administrator;Password=administrator;TrustServerCertificate=True
);

// Add the JWT Authentication service to the container
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
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

// Controllers Service
builder.Services.AddControllers();

// CORS Options Service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

WebApplication app = builder.Build();

// Use HTTPS middleware
app.UseHttpsRedirection();

// Custom Middleware: Disable Cache by the client.
app.Use(async (context, next) =>
{

    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Expires"] = "0";

    await next();
});

// Select CORS option middleware.
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

app.Run();
