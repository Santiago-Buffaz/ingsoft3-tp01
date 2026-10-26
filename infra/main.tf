# Proyecto NUEVO y exclusivo de preprod. No administra el proyecto del TP6.
resource "neon_project" "preprod" {
  name                      = "lexagenda-preprod-sbuffaz"
  org_id                    = var.neon_org_id
  region_id                 = "aws-us-east-1"
  pg_version                = 16
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}
