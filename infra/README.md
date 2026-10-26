# Preprod de LexAgenda

Terraform declara un proyecto propio en Neon, un rol, la base `app_preprod` y dos servicios gratuitos en Render. La imagen de ambos componentes corresponde a `v7.0.0` (`87aceb673cc160a9cd28e64355020e4139fc8e82`). Los servicios QA/PROD y su pipeline no se administran desde esta carpeta.

## Preparación

Usar Terraform >= 1.5 y < 2.0; esta configuración se validó con 1.15.8. Los providers quedan fijados a `kislerdm/neon` 0.18.0 y `render-oss/render` 1.9.1, con `.terraform.lock.hcl` versionado.

En macOS se puede instalar con `brew tap hashicorp/tap` y `brew install hashicorp/tap/terraform`. En una terminal zsh, cargar las claves sin escribir sus valores en el historial:

```zsh
read -rs 'NEON_API_KEY?API key personal de Neon: '; print
read -rs 'RENDER_API_KEY?API key de Render: '; print
read -r 'RENDER_OWNER_ID?Owner ID del workspace de Render (usr-... o tea-...): '
export NEON_API_KEY RENDER_API_KEY RENDER_OWNER_ID
```

La API key de Neon debe permitir crear proyectos en la organización indicada por `neon_org_id`. Una clave limitada al proyecto de QA/PROD no sirve para crear preprod. Los tres valores sólo viven en esta terminal. No se escriben en HCL ni se publican.

## Crear y comprobar

Desde esta carpeta:

```sh
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
terraform output
```

En el primer plan completo se esperan cinco altas: `neon_project.preprod`, `neon_role.preprod`, `neon_database.preprod`, `render_web_service.api` y `render_web_service.front`. El proyecto Neon también incluye sus recursos iniciales internos. Leé el plan antes de responder `yes`.

Render puede terminar de desplegar después de que Terraform haya creado el servicio. Esperá `Live` y comprobá las direcciones devueltas:

```sh
TP8_API=$(terraform output -raw api_url)
TP8_FRONT=$(terraform output -raw front_url)
curl -fsS --max-time 120 "$TP8_API/health"
curl -fsS --max-time 120 "$TP8_API/api/clientes"
curl -fsS --max-time 120 "$TP8_FRONT/health"
curl -fsS --max-time 120 "$TP8_FRONT/api/clientes"
open "$TP8_FRONT/clientes"
```

Creá un cliente de prueba desde la interfaz, recargá la página y comprobá que sigue apareciendo; después eliminalo. Esto comprueba frontend, proxy, API y persistencia. El primer request puede tardar mientras despiertan servicios gratuitos.

La cadena de conexión se deriva del proyecto, base, rol y contraseña creados en Neon. `BACKEND_URL` se deriva de `render_web_service.api.url`; no se copia una URL de QA o PROD.

## Estado y repetición

El estado local está en `infra/terraform.tfstate`. Puede contener contraseñas en texto plano. No se commitea, ni se adjunta a PRs o al chat; tampoco se borra mientras haya recursos administrados. `.terraform/`, tfvars, planes y backups de estado están ignorados. El lockfile sí se versiona. Conservar una copia privada del estado si se cambia de máquina y todavía existe preprod.

Después de aplicar, `terraform plan` debe indicar `No changes`. Para practicar drift antes de levantar los servicios, se puede borrar solamente `app_preprod` en el proyecto exclusivo de preprod: el próximo plan debe proponer recrearla. Una base creada manualmente fuera de la declaración no aparece como recurso administrado. No probar esto contra QA o PROD.

## Destruir y recrear

```sh
terraform plan -destroy
terraform destroy
terraform state list
terraform apply
terraform output
```

El destroy elimina preprod completo y sus datos de prueba. La recreación devuelve la configuración, no los datos destruidos; sus IDs, contraseñas o URLs pueden cambiar. Volvé a comprobar los outputs y el funcionamiento del entorno. Los cuatro servicios QA/PROD deben seguir disponibles.

Para practicar `prevent_destroy`, agregar temporalmente `lifecycle { prevent_destroy = true }` al recurso de la base y ejecutar `terraform plan -destroy`: debe rechazar el plan. Retirar ese bloque al terminar para conservar el carácter desechable de preprod.

Al finalizar una sesión, ejecutar `terraform destroy` y confirmar que el estado no contiene recursos. Para la defensa, llegar con preprod destruido y las claves listas: crear, comprobar y destruir en vivo.

## Límite conocido del provider Render

La consigna registra un problema de actualizaciones del plan gratuito con el campo maintenance mode en la versión 1.9.1. El ciclo usado es crear y destruir. Si se cambia la imagen o configuración, inspeccionar el plan: Terraform puede proponer una actualización, no un reemplazo. Para recrear se pide explícitamente `-replace` o se destruye y vuelve a crear preprod; no se cambia a un plan de pago para esquivar ese error.

El entorno se opera desde esta terminal; no se agregó al pipeline ni se implementó el workflow opcional de plan por PR.
