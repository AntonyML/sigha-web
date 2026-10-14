# Cloudflare Pages

SIGHA Web se publica como exportación estática de Next.js en Cloudflare Pages. El proyecto de Pages se crea con **Direct Upload**: no se conecta un repositorio Git en el panel de Cloudflare. Así, Cloudflare no inicia builds ni despliegues al recibir pushes; el despliegue posterior queda bajo control de la GitHub Action.

## Primera carga: crear el proyecto y desplegar

Desde la raíz de `sigha-web`, con Wrangler instalado por Bun:

```powershell
bunx wrangler login
bunx wrangler whoami
$env:NEXT_PUBLIC_API_URL = 'https://sigha-api.onrender.com'
$env:NEXT_PUBLIC_SITE_URL = 'https://www.sigha.tonyml.com'
$env:NEXT_PUBLIC_APP_ENV = 'production'
$env:NEXT_PUBLIC_ENABLE_2FA = 'true'
bun run build
bunx wrangler pages project create sigha-web --production-branch=main --force
bunx wrangler pages deploy out --project-name=sigha-web --branch=main
```

Para SIGHA, `NEXT_PUBLIC_API_URL` es `https://sigha-api.onrender.com` y `NEXT_PUBLIC_SITE_URL` es `https://www.sigha.tonyml.com`. La API debe permitir CORS desde el dominio personalizado. La creación inicial usa **Direct Upload** y `--force` para evitar que Wrangler intente configurar un Worker; el despliegue se marca con `--branch=main`, que es la rama de producción del proyecto. En las siguientes cargas basta con repetir `bunx wrangler pages deploy out --project-name=sigha-web --branch=main`. Esta modalidad no conecta Git ni activa builds automáticos de Cloudflare. La Action de GitHub también desplegará directamente `out/` con Wrangler.

La salida `*.pages.dev` se muestra al terminar el comando. El dominio personalizado deseado es `www.sigha.tonyml.com`; debe estar asignado al proyecto `sigha-web` en **Workers & Pages → sigha-web → Custom domains** y tener su DNS activo en Cloudflare. Añade `https://www.sigha.tonyml.com` a la lista CORS del backend. Mientras verificas el primer despliegue, también puedes permitir el origen `https://sigha-web.pages.dev`.

## Variables para GitHub Actions

En GitHub abre **Settings → Secrets and variables → Actions**. Añade lo siguiente:

| Nombre | Tipo recomendado | Valor |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Repository secret | Token de Cloudflare con permiso **Account → Cloudflare Pages → Edit**. No lo escribas en el repo, en el panel de variables de Pages ni en `NEXT_PUBLIC_*`. |
| `CLOUDFLARE_ACCOUNT_ID` | Repository variable | Account ID de la cuenta Cloudflare donde vive Pages. No es un secreto. |
| `CLOUDFLARE_PAGES_PROJECT` | Repository variable | `sigha-web`. |
| `NEXT_PUBLIC_API_URL` | Repository variable | `https://sigha-api.onrender.com`. Este valor se compila dentro de los archivos públicos, por lo que **no es secreto**. |
| `NEXT_PUBLIC_SITE_URL` | Repository variable | `https://www.sigha.tonyml.com` (sin barra final). |
| `NEXT_PUBLIC_APP_ENV` | Repository variable | `production`. |
| `NEXT_PUBLIC_ENABLE_2FA` | Repository variable | `true` si el backend y la instancia están preparados para 2FA; de lo contrario, `false`. |

La Action debe pasar las cuatro variables `NEXT_PUBLIC_*` al paso de **build**, y después publicar `out/`. Las variables del panel de Cloudflare Pages no sustituyen las variables de build de GitHub porque esta aplicación no ejecuta un servidor en Cloudflare. No hay secretos de ejecución de Pages para esta exportación estática. En GitHub, solo `CLOUDFLARE_API_TOKEN` va en **Secrets**; `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT` y las cuatro variables `NEXT_PUBLIC_*` van en **Variables**.

La Action de Cloudflare para Wrangler es `cloudflare/wrangler-action@v4`; el comando debe ser `pages deploy out --project-name=sigha-web` (o usar la variable `CLOUDFLARE_PAGES_PROJECT`). El job necesita `contents: read` y `deployments: write`. `GITHUB_TOKEN` lo proporciona GitHub Actions automáticamente; no crees un secret manual para él.

## Desarrollo local

`.env.example` usa `/api/backend` en `NEXT_PUBLIC_API_URL` durante el desarrollo local. `next dev` reenvía esa ruta al destino de `BACKEND_API_URL` (por defecto, `http://localhost:3000`), así que el navegador usa el mismo origen y no depende de CORS local. La exportación de producción no incluye rewrites: configura `NEXT_PUBLIC_API_URL` con el origen público del API y permite en CORS el origen de Pages.

Los IDs seleccionados para las pantallas de detalle y edición se guardan en Context y `sessionStorage`. Las páginas tienen rutas fijas para que Pages pueda servirlas desde `out/`; una recarga conserva la selección en esa pestaña. La API mantiene sus endpoints actuales para consultar y modificar el registro seleccionado.

## Referencias

- [Cloudflare: Next.js estático en Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/)
- [Cloudflare: Direct Upload con CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare: configuración Wrangler para Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
