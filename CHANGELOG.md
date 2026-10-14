# Registro de cambios

Registra aquí solo cambios integrados en `dev`. El agente que integra agrega una entrada bajo el lock `dev-sigha-web` tras re-verificar el cambio en `dev`; las demás tareas no editan este archivo.

Formato: `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.
2026-10-13 | agent/codex/nextjs-migration | feat: migración a Next.js App Router, superficies públicas y reorganización por módulos | verificación: bun run build correcto; suites no ejecutadas
2026-10-13 | sigha-web-20261013-j7y5 | style: alinear paleta, tipografías y preview de marketing con los design tokens de la app | verificación: bun run build correcto en dev; lint y 2 tests fallan por causas preexistentes ajenas al cambio (verificado en baseline dev)
2026-10-13 | sigha-web-20261013-5hy3 | refactor: renombrar Hogar de Ancianos/ASOPOGUA a Sistema Integral de Gestión Holística y de Asistencia (SIGHA) | verificación: build OK en worktree y dev; lint y test:run con fallos preexistentes idénticos al baseline (2 err lint en mis archivos, 2 fail en TwoFactorContext); funcional: login/e2e sin ASOPOGUA, cero restos
2026-10-13 | sigha-web-20261014-irxn | feat: módulo de marca por organización (/settings/organization, solo admin) + AuthLayout sin logo genérico (org → neutra S; asopogua.png solo slug asopogua) | verificación: 16/16 tests nuevos OK en worktree y dev; build OK 75 rutas en ambos; lint 0 errores nuevos (3 warns misma regla no-img); e2e live contra api dev no ejecutado (sin backend/JWT; contrato verificado estático contra T2)
