terraform {
  required_version = ">= 1.5, < 2.0"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0"
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

# Las credenciales se leen del entorno de la terminal.
provider "neon" {}
provider "render" {}
