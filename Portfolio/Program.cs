using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy => policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=portfolio.db"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

// Активуємо політику
app.UseCors("AllowAngularApp");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    // Створюємо базу, якщо її ще немає
    context.Database.EnsureCreated();

    // Якщо в таблиці Projects порожньо — додаємо перші записи
    if (!context.Projects.Any())
    {
        context.Projects.AddRange(
            new Portfolio.Api.Models.Project { Name = "Coin Bubbles", Platform = "Google Play", Downloads = "50,000+" },
            new Portfolio.Api.Models.Project { Name = "Money Clash", Platform = "Google Play", Downloads = "50,000+" }
        );
        context.SaveChanges();
    }
}

app.Run();
