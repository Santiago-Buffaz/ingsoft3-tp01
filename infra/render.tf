locals {
  # Npgsql: conexión derivada de SU proyecto, base y rol. No sale por output.
  connection_string = "Host=${neon_project.preprod.database_host};Database=${neon_database.preprod.name};Username=${neon_role.preprod.name};Password=\"${replace(neon_role.preprod.password, "\"", "\"\"")}\";SSL Mode=VerifyFull"
}

resource "render_web_service" "api" {
  name              = "lexagenda-api-preprod-sbuffaz"
  plan              = "free"
  region            = "virginia"
  health_check_path = "/health"

  runtime_source = {
    image = {
      image_url = "ghcr.io/santiago-buffaz/ingsoft3-tp01-backend"
      tag       = var.image_tag
    }
  }

  env_vars = {
    ConnectionStrings__Default = { value = local.connection_string }
    ASPNETCORE_ENVIRONMENT     = { value = "Production" }
    ASPNETCORE_URLS            = { value = "http://+:8080" }
    PORT                       = { value = "8080" }
  }
}

resource "render_web_service" "front" {
  name              = "lexagenda-front-preprod-sbuffaz"
  plan              = "free"
  region            = "virginia"
  health_check_path = "/"

  runtime_source = {
    image = {
      image_url = "ghcr.io/santiago-buffaz/ingsoft3-tp01-frontend"
      tag       = var.image_tag
    }
  }

  env_vars = {
    BACKEND_URL  = { value = trimsuffix(render_web_service.api.url, "/") }
    DNS_RESOLVER = { value = "8.8.8.8" }
    PORT         = { value = "80" }
  }
}

output "api_url" {
  value = render_web_service.api.url
}

output "front_url" {
  value = render_web_service.front.url
}
