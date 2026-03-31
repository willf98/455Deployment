using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ShopDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("ShopConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "https://your-app.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure order_predictions table exists without touching existing tables
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS order_predictions (
            order_id INTEGER PRIMARY KEY,
            late_delivery_probability REAL,
            predicted_late_delivery INTEGER,
            prediction_timestamp TEXT
        )
    ");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
