using Microsoft.EntityFrameworkCore;
using ShopProject.API.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ShopDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ShopConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "https://455-deployment.vercel.app",
                "https://455-deployment-willf98-4166s-projects.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Migrate order_predictions to fraud schema if needed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
    db.Database.ExecuteSqlRaw(@"
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'order_predictions'
                  AND column_name = 'late_delivery_probability'
            ) THEN
                DROP TABLE order_predictions;
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'order_predictions'
            ) THEN
                CREATE TABLE order_predictions (
                    order_id             BIGINT PRIMARY KEY REFERENCES orders(order_id),
                    fraud_probability    REAL,
                    predicted_fraud      BOOLEAN,
                    prediction_timestamp TIMESTAMPTZ
                );
            END IF;
        END $$;
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
