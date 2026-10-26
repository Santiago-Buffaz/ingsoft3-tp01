variable "image_tag" {
  description = "Imagen publicada del commit de cierre del TP7 (v7.0.0)."
  type        = string
  default     = "sha-87aceb673cc160a9cd28e64355020e4139fc8e82"

  validation {
    condition     = can(regex("^sha-[0-9a-f]{40}$", var.image_tag))
    error_message = "Usá la etiqueta sha- seguida de los 40 caracteres del commit publicado."
  }
}
