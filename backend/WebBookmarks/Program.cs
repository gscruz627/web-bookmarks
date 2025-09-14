using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Threading.RateLimiting;
using WebBookmarks.Data;

// Create the Buidler object
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add the DB service to the container
builder.Services.AddDbContext<BookmarksDBContext>(options =>
    options.UseNpgsql(Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING"))
);

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("PerIpPolicy", context =>
    {
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100, // 100 requests
            Window = TimeSpan.FromMinutes(1), // per 1 minute
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0 // Drop extra requests
        });
    });

    // Optional: global reject handler
    options.RejectionStatusCode = 429;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.Headers["Retry-After"] = "60";
        await context.HttpContext.Response.WriteAsync("Too many requests. Try again later.", cancellationToken: token);
    };
});

// Add the JWT Authentication service to the container
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = Environment.GetEnvironmentVariable("ISSUER"),
        ValidateAudience = true,
        ValidAudience = Environment.GetEnvironmentVariable("CLIENT_URL"),
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SIGNING_KEY"))),
        ValidateIssuerSigningKey = true
    };
});

// Controllers Service
builder.Services.AddControllers();

// CORS Options Service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins(Environment.GetEnvironmentVariable("CLIENT_URL"))
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

WebApplication app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookmarksDBContext>();
    db.Database.Migrate();
};

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
}
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
app.UseCors("AllowSpecificOrigin");

app.UseAuthorization();
app.MapControllers();

app.Run();
