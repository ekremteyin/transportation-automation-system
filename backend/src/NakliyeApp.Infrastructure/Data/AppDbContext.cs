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
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Message> Messages => Set<Message>();

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

        modelBuilder.Entity<Message>(e =>
        {
            e.HasOne(m => m.Offer)
             .WithMany()
             .HasForeignKey(m => m.OfferId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Sender)
             .WithMany()
             .HasForeignKey(m => m.SenderId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.Property(n => n.Type).HasConversion<string>();
            e.HasOne(n => n.User)
             .WithMany()
             .HasForeignKey(n => n.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(n => n.Advert)
             .WithMany()
             .HasForeignKey(n => n.AdvertId)
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
