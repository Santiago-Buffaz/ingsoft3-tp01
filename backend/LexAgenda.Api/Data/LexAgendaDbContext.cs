using LexAgenda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LexAgenda.Api.Data;

public class LexAgendaDbContext(DbContextOptions<LexAgendaDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Caso> Casos => Set<Caso>();
    public DbSet<Turno> Turnos => Set<Turno>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => x.Dni).IsUnique().HasFilter("\"Dni\" IS NOT NULL");
            entity.Property(x => x.NombreCompleto).HasMaxLength(160);
            entity.Property(x => x.Email).HasMaxLength(200);
            entity.Property(x => x.Dni).HasMaxLength(20);
            entity.Property(x => x.Telefono).HasMaxLength(50);
        });

        modelBuilder.Entity<Caso>(entity =>
        {
            entity.Property(x => x.Tipo).HasConversion<string>();
            entity.Property(x => x.Prioridad).HasConversion<string>();
            entity.Property(x => x.Estado).HasConversion<string>();
            entity.Property(x => x.Titulo).HasMaxLength(180);
            entity.HasOne(x => x.Cliente).WithMany(x => x.Casos)
                .HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Turno>(entity =>
        {
            entity.Property(x => x.Estado).HasConversion<string>();
            entity.Property(x => x.Motivo).HasMaxLength(200);
            entity.HasOne(x => x.Cliente).WithMany(x => x.Turnos)
                .HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Caso).WithMany(x => x.Turnos)
                .HasForeignKey(x => x.CasoId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
