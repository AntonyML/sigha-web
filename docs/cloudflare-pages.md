# Cloudflare Pages

SIGHA Web se publica como exportación estática de Next.js en Cloudflare Pages. El proyecto de Pages se crea con **Direct Upload**: no se conecta un repositorio Git en el panel de Cloudflare. Así, Cloudflare no inicia builds ni despliegues al recibir pushes; el despliegue posterior queda bajo control de la GitHub Action.

## Primera carga: crear el proyecto y desplegar

Desde la raíz de `sigha-web`, con Wrangler instalado por Bun:

```powershell
bunx wrangler login
bunx wrangler whoami
$env:NEXT_PUBLIC_API_URL = 'https://api.example.com'
$env:NEXT_PUBLIC_SITE_URL = 'https://sigha-web.pages.dev'
$env:NEXT_PUBLIC_APP_ENV = 'production'
$env:NEXT_PUBLIC_ENABLE_2FA = 'true'
bun run build
bunx wrangler pages deploy out --project-name=sigha-web
```

Reemplaza `https://api.example.com` por el origen público real de NestJS, sin una ruta de proxy de Next.js. En la primera carga, Wrangler crea el proyecto `sigha-web` como **Direct Upload** y sube `out/`; las siguientes cargas son despliegues directos al mismo proyecto. Esta modalidad no se convierte después a Git Integration, que es justo lo que evita builds automáticos de Cloudflare. La Action de GitHub también desplegará directamente `out/` con Wrangler.

La salida `*.pages.dev` se muestra al terminar el comando. Añade ese origen, y el dominio personalizado si luego configuras uno, a la lista CORS del backend.

## Variables para GitHub Actions

En GitHub abre **Settings → Secrets and variables → Actions**. Añade lo siguiente:

| Nombre | Tipo recomendado | Valor |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Repository secret | Token de Cloudflare con permiso **Account → Cloudflare Pages → Edit**. No lo escribas en el repo, en el panel de variables de Pages ni en `NEXT_PUBLIC_*`. |
| `CLOUDFLARE_ACCOUNT_ID` | Repository secret | Account ID de la cuenta Cloudflare donde vive Pages. No es una credencial por sí solo, pero Cloudflare documenta configurarlo como secret junto con el token. |
| `CLOUDFLARE_PAGES_PROJECT` | Repository variable | `sigha-web`. |
| `NEXT_PUBLIC_API_URL` | Repository variable | Origen público del backend NestJS que usará el navegador. Este valor se compila dentro de los archivos públicos, por lo que **no es secreto**. |
| `NEXT_PUBLIC_SITE_URL` | Repository variable | URL pública del sitio, sin barra final; por ejemplo `https://sigha-web.pages.dev`. |
| `NEXT_PUBLIC_APP_ENV` | Repository variable | `production`. |
| `NEXT_PUBLIC_ENABLE_2FA` | Repository variable | `true` si el backend y la instancia están preparados para 2FA; de lo contrario, `false`. |

La Action debe pasar esas cuatro variables `NEXT_PUBLIC_*` al paso de **build**, y después publicar `out/`. Las variables del panel de Cloudflare Pages no sustituyen las variables de build de GitHub porque esta aplicación no ejecuta un servidor en Cloudflare. No hay secretos de ejecución de Pages para esta exportación estática.

La Action de Cloudflare para Wrangler es `cloudflare/wrangler-action@v4`; el comando debe ser `pages deploy out --project-name=sigha-web` (o usar la variable `CLOUDFLARE_PAGES_PROJECT`). El job necesita `contents: read` y `deployments: write`. `GITHUB_TOKEN` lo proporciona GitHub Actions automáticamente; no crees un secret manual para él.

## Desarrollo local

`.env.example` usa `http://localhost:3000` como backend local. `BACKEND_API_URL` solo alimenta el rewrite opcional de `next dev`; la exportación de producción no incluye rewrites y el navegador llama directamente a `NEXT_PUBLIC_API_URL`. El backend debe permitir CORS desde `http://localhost:3001` durante desarrollo y desde el origen de Pages en producción.

Los IDs seleccionados para las pantallas de detalle y edición se guardan en Context y `sessionStorage`. Las páginas tienen rutas fijas para que Pages pueda servirlas desde `out/`; una recarga conserva la selección en esa pestaña. La API mantiene sus endpoints actuales para consultar y modificar el registro seleccionado.

## Referencias

- [Cloudflare: Next.js estático en Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/)
- [Cloudflare: Direct Upload con CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare: configuración Wrangler para Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
