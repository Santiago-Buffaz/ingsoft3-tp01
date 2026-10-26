output "neon_project_id" {
  description = "Proyecto exclusivo de preprod."
  value       = neon_project.preprod.id
}

output "db_host" {
  value = neon_project.preprod.database_host
}

output "database" {
  value = neon_database.preprod.name
}
