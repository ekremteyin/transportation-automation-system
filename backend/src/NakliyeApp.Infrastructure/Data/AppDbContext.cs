using Microsoft.EntityFrameworkCore;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Advert> Adverts => Set<Advert>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Complaint> Complaints => Set<Complaint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
            e.Property(u => u.AverageRating).HasPrecision(3, 2);
        });

        modelBuilder.Entity<Advert>(e =>
        {
            e.Property(a => a.Status).HasConversion<string>();
            e.HasOne(a => a.Sender)
             .WithMany(u => u.Adverts)
             .HasForeignKey(a => a.SenderId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Offer>(e =>
        {
            e.Property(o => o.Status).HasConversion<string>();
            e.Property(o => o.Price).HasPrecision(10, 2);
            e.HasOne(o => o.Advert)
             .WithMany(a => a.Offers)
             .HasForeignKey(o => o.AdvertId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(o => o.Carrier)
             .WithMany(u => u.Offers)
             .HasForeignKey(o => o.CarrierId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.HasOne(r => r.Advert)
             .WithMany(a => a.Reviews)
             .HasForeignKey(r => r.AdvertId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Reviewer)
             .WithMany()
             .HasForeignKey(r => r.ReviewerId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Reviewed)
             .WithMany()
             .HasForeignKey(r => r.ReviewedId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Complaint>(e =>
        {
            e.HasOne(c => c.Reporter)
             .WithMany()
             .HasForeignKey(c => c.ReporterId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Target)
             .WithMany()
             .HasForeignKey(c => c.TargetId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(c => c.Advert)
             .WithMany()
             .HasForeignKey(c => c.AdvertId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Admin seed (password: Admin@123)
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@nakliye.com",
            PasswordHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKnrWNtELbHSvQy",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
