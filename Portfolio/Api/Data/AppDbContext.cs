using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<UserProfile> Profiles { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<UserProfile>().HasData(new UserProfile
        {
            Id = 1,
            Name = "Serhio",
            Role = "Software & Unity Developer",
            Bio = "I build immersive experiences...",
            PhotoUrl = "https://placehold.co/400x400/10b981/white?text=S",
            CvUrl = "#",
            Email = "hello@example.com"
        });
    }
}