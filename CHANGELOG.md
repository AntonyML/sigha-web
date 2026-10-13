# Registro de cambios

Registra aquí solo cambios integrados en `dev`. El agente que integra agrega una entrada bajo el lock `dev-sigha-web` tras re-verificar el cambio en `dev`; las demás tareas no editan este archivo.

Formato: `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.
2026-10-13 | agent/codex/nextjs-migration | feat: migración a Next.js App Router, superficies públicas y reorganización por módulos | verificación: bun run build correcto; suites no ejecutadas
