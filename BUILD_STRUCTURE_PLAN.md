# Estructura de Build Recomendada - Proton Hogar Frontend

## Resumen
Estructura propuesta para separar builds por plataforma (web, desktop, móvil) manteniendo el código fuente único y organizado.

## Estructura Recomendada

```
/
├── package.json
├── vite.config.ts                    # Configuración base de Vite
├── vitest.config.ts
├── tsconfig*.json
├── /config                           # Configuraciones por plataforma
│   └── /platform
│       ├── web.config.ts             # Overrides para web
│       ├── desktop.config.ts         # Overrides para desktop
│       └── mobile.config.ts          # Overrides para móvil
├── /src                              # Código fuente compartido (UI, servicios, etc.)
├── /public                           # Assets estáticos compartidos
├── /electron                         # Código fuente específico de Electron
│   ├── main.cjs
│   └── preload.cjs
├── /android                          # Proyecto nativo Android (generado por Capacitor)
├── /ios                              # Proyecto nativo iOS (opcional)
├── /build                            # Directorio de salida (NO versionar en Git)
│   ├── /web                          # Build para web (vite build --outDir build/web)
│   ├── /desktop                      # Build para desktop (vite build --outDir build/desktop)
│   └── /mobile                       # Build para móvil (vite build --outDir build/mobile)
├── .env                              # Variables de entorno base
├── .env.production                   # Variables para producción
├── .env.mobile                       # Variables específicas para móvil
├── .env.desktop                      # Variables específicas para desktop
└── .gitignore                        # Incluir /build, /android, /ios si no se versionan
```

## Principios de la Estructura

### 1. Separación de Responsabilidades
- **Código fuente único**: Todo el código compartido permanece en `/src`
- **Configuraciones específicas**: Overrides por plataforma en `/config/platform`
- **Artefactos separados**: Builds generados en `/build/<plataforma>`
- **Proyectos nativos**: En carpetas propias (`/android`, `/electron`)

### 2. No Versionar Artefactos
- `/build` debe estar en `.gitignore`
- Solo versionar código fuente y configuraciones
- Artefactos finales (AAB/APK) se almacenan en CI/CD o releases

## Configuraciones por Plataforma

### Variables de Entorno
- `.env` - Base para todas las plataformas
- `.env.production` - Overrides para producción
- `.env.mobile` - Específicos para móvil (ej: `VITE_API_URL=https://api.produccion.com`)
- `.env.desktop` - Específicos para desktop

### Vite Config
- `vite.config.ts` - Configuración base
- `config/platform/*.config.ts` - Overrides específicos (opcional)

## Scripts Recomendados (package.json)

```json
{
  "scripts": {
    "build:web": "vite build --outDir build/web --base /",
    "build:mobile": "vite build --outDir build/mobile --base ./",
    "build:desktop": "vite build --outDir build/desktop --base ./",
    "cap:init": "npx cap init com.hogarancianos.proton \"Proton Hogar\"",
    "cap:add:android": "npx cap add android",
    "cap:copy:android": "npx cap copy android",
    "capsync:mobile": "npm run build:mobile && npx cap copy android",
    "electron:build": "npm run build:desktop && electron-builder"
  }
}
```

## Consideraciones Técnicas

### Router
- **Web**: BrowserRouter (requiere configuración de servidor)
- **Móvil/Desktop**: HashRouter (funciona con archivos locales)

### Base Href
- **Web**: `--base /` (rutas absolutas)
- **Móvil/Desktop**: `--base ./` (rutas relativas)

### Assets y PWA
- `manifest.json` y service worker en `/public`
- Habilitados para web y PWA/TWA
- Para móvil empaquetado, el SW puede no ser necesario

## Proyectos Nativos

### Capacitor (Android/iOS)
- Generado con `npx cap init` y `npx cap add android` → crea `/android`
- Mantener en repo root, no en `/build`
- Contiene código nativo y configuraciones específicas

### Electron (Desktop)
- Ya existe `/electron` con main.cjs y preload.cjs
- Mantener en repo root
- Build genera ejecutables en `/build/desktop`

## CI/CD Pipeline Sugerido

```yaml
# Ejemplo GitHub Actions
- name: Build Mobile
  run: npm run build:mobile

- name: Sync Capacitor
  run: npx cap copy android

- name: Build Android AAB
  run: cd android && ./gradlew bundleRelease

- name: Upload AAB
  uses: actions/upload-artifact@v3
  with:
    name: app-release.aab
    path: android/app/build/outputs/bundle/release/app-release.aab
```

## Próximos Pasos

1. Crear carpeta `/config/platform` con archivos de configuración
2. Actualizar `package.json` con scripts de build por plataforma
3. Configurar `.gitignore` para excluir `/build`
4. Instalar Capacitor y generar proyecto Android
5. Probar builds y sincronización con plataformas nativas

## Notas Importantes

- Mantener código fuente único evita duplicación
- Configuraciones específicas solo cuando sea necesario
- Artefactos de build no se versionan
- Proyectos nativos requieren setup específico (Android Studio, Xcode)
- Para móvil: considerar SecureStorage en lugar de localStorage para tokens

---

*Documento creado: Octubre 2025*
*Pendiente implementación futura*</content>
<parameter name="filePath">d:\Ano_2025_UCR\Analisis\Proyecto\frontend_proton_react_hogar_de_ancianos\BUILD_STRUCTURE_PLAN.md