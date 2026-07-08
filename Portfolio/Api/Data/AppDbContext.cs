using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ContactMethod> ContactMethods { get; set; }
    public DbSet<UserProfile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tags)
            .WithMany()
            .UsingEntity(j => j.ToTable("ProjectTags"));

        modelBuilder.Entity<Project>()
            .HasOne<UserProfile>()
            .WithMany()
            .HasForeignKey(p => p.ProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserProfile>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        modelBuilder.Entity<UserProfile>().HasData(
            new UserProfile
            {
                Id = 1,
                Name = "Serhio",
                Role = "Software & Unity Developer",
                Bio = "I build immersive experiences...",
                PhotoUrl = "https://placehold.co/400x400/10b981/white?text=S",
                CvUrl = "#",
                Email = "hello@example.com",
                Slug = "unity",
                ThemeKey = "unity"
            },
            new UserProfile
            {
                Id = 2,
                Name = "Serhio",
                Role = ".NET Developer",
                Bio = "I build robust backend systems and APIs.",
                PhotoUrl = "https://placehold.co/400x400/6366f1/white?text=S",
                CvUrl = "#",
                Email = "hello@example.com",
                Slug = "dotnet",
                ThemeKey = "dotnet"
            }
        );
    }
}
