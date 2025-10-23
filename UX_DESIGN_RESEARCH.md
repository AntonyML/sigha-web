# Investigación UX/UI: Diseño Adaptativo para LoginPage

**Fecha:** 2025-10-22  
**Proyecto:** frontend_proton_react_hogar_de_ancianos  
**Objetivo:** Implementar diseño adaptativo mobile-first con accesibilidad WCAG AA para el módulo de autenticación

---

## Fuentes Consultadas

### 1. A11Y Project (https://www.a11yproject.com/)

**Hallazgos Clave:**

- **WCAG P.O.U.R. Principles:**
  - **Perceivable:** Contenido debe ser perceptible para todos (contraste de color, tamaños de fuente ajustables)
  - **Operable:** Navegación por teclado completa (Tab, Enter, Escape)
  - **Understandable:** Mensajes de error claros y contextuales
  - **Robust:** Compatible con tecnologías asistivas (screen readers)

- **Semantic HTML:** Usar elementos nativos (`<button>`, `<input>`, `<label>`) en lugar de `<div>` con roles
- **Testing con Screen Readers:** NVDA, JAWS, VoiceOver para iOS
- **Automated Tools Limitation:** Las herramientas automatizadas solo detectan ~30% de problemas de accesibilidad

**Aplicación al Login:**
- Labels asociados con inputs mediante `htmlFor`/`id`
- Mensajes de error con `role="alert"` y `aria-live="polite"`
- Focus visible en todos los elementos interactivos
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande

---

### 2. Nielsen Norman Group (https://www.nngroup.com/articles/)

**Hallazgos Clave:**

- **Inattentional Blindness:** Usuarios no ven elementos importantes si están enfocados en otra tarea
  - Solución: Mensajes de error deben aparecer cerca del input relevante
  
- **Mobile Usability:**
  - Botones táctiles mínimo 48x48px (Apple: 44x44pt, Material: 48x48dp)
  - Espaciado mínimo 8px entre elementos interactivos
  - Inputs con altura mínima de 44px para fácil toque

- **Form Design Best Practices:**
  - Labels encima de inputs (mejor que a la izquierda en mobile)
  - Mostrar requisitos de password ANTES de que el usuario escriba
  - Validación en tiempo real sin ser intrusiva
  - Botón primario visualmente destacado del secundario

- **GenUI (Generative UI):** Interfaces adaptativas que cambian según contexto del usuario
  - Aplicable: Mostrar teclado numérico automáticamente para código 2FA

**Aplicación al Login:**
- Inputs grandes (min 48px altura) con área de toque amplia
- Labels siempre visibles (no placeholder-only)
- Botón "Entrar" destacado con color primario
- Botón "Cancelar" secundario con outline
- Espaciado generoso entre elementos (min 16px)

---

### 3. PageFlows (https://pageflows.com/)

**Hallazgos Clave:**

- **Authentication Flow Patterns:**
  - Login separado de 2FA (no combinar en un solo paso)
  - Progress indicator cuando hay múltiples pasos
  - Opción de "Volver" o "Cancelar" en flujos multi-paso
  
- **Screen Recording Insights:**
  - Airbnb: Login con transición suave entre pasos
  - Dropbox: Input de código 2FA con 6 campos separados (mejor UX que un campo único)
  - Slack: Mostrar hint del método 2FA seleccionado ("Open your authenticator app")

- **Error Handling:**
  - Mostrar errores inline inmediatamente
  - No limpiar el formulario completo en caso de error
  - Proveer sugerencias de solución ("Did you mean...?")

**Aplicación al Login:**
- Flujo de 2 pasos claramente separados: Login → 2FA
- Mantener email visible durante 2FA (contexto)
- Input de código 2FA con formato visual (espacios o guiones cada 3 dígitos)
- Botón "Cancelar" que vuelve a login sin perder contexto

---

### 4. Material Design 3 (https://m3.material.io/)

**Hallazgos Clave:**

- **M3 Expressive:**
  - Vibrant colors con contraste mejorado
  - Motion physics para transiciones naturales
  - Adaptive components que responden al contexto
  
- **Form Components:**
  - Outlined Text Fields: mejor para formularios complejos
  - Filled Text Fields: mejor para formularios simples
  - Helper text persistente debajo del input
  - Error states con iconos y colores distintivos

- **Responsive Layouts:**
  - Breakpoints: 600px (mobile), 840px (tablet), 1240px (desktop)
  - Compact/Medium/Expanded layouts según espacio disponible
  - Adaptive navigation (rail → drawer)

- **Motion:**
  - Duration: 200ms para micro-interactions, 400ms para transiciones de página
  - Easing: Emphasized (fast-out-slow-in) para elementos que entran, Standard para salida

**Aplicación al Login:**
- Outlined inputs con labels flotantes
- Helper text: "Ingrese su correo electrónico registrado"
- Error states con icono ⚠️ y color error.500
- Transiciones suaves entre login y 2FA (400ms fade + slide)
- Layout compacto en mobile, medium en tablet/desktop

---

### 5. Tailwind CSS (https://tailwindcss.com/)

**Hallazgos Clave:**

- **Mobile-First Responsive:**
  ```html
  <!-- Correcto: base (mobile) sin prefijo, luego sm/md/lg -->
  <div class="text-center sm:text-left"></div>
  
  <!-- Incorrecto: sm: NO aplica a mobile -->
  <div class="sm:text-center"></div>
  ```

- **Form Styling:**
  - Plugin `@tailwindlabs/tailwindcss-forms` para reset de estilos nativos
  - Variants: `focus:`, `invalid:`, `disabled:`
  - Contraste automático con `ring` y `ring-offset`

- **Responsive Breakpoints:**
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

- **Accessibility Utilities:**
  - `sr-only`: ocultar visualmente pero mantener para screen readers
  - `focus:ring-2 focus:ring-offset-2`: indicador de foco visible
  - `motion-reduce:`: respetar preferencias de usuario

**Aplicación al Login:**
```jsx
<input
  className="
    w-full px-4 py-3
    text-base sm:text-sm
    border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    invalid:border-red-500 invalid:text-red-600
    disabled:bg-gray-100 disabled:text-gray-500
    placeholder-gray-400
    transition-colors duration-200
  "
/>
```

---

### 6. Chakra UI (https://chakra-ui.com/)

**Hallazgos Clave:**

- **Responsive Syntax:**
  - Object: `fontWeight={{ base: "medium", lg: "bold" }}`
  - Array: `fontWeight={["medium", undefined, undefined, "bold"]}`
  - Ranges: `fontWeight={{ mdToXl: "bold" }}`
  - Single: `fontWeight={{ lgOnly: "bold" }}`

- **Breakpoints:**
  ```typescript
  const breakpoints = {
    base: "0px",   // Mobile
    sm: "480px",   // Mobile landscape
    md: "768px",   // Tablet
    lg: "992px",   // Desktop
    xl: "1280px",  // Large desktop
    "2xl": "1536px" // XL desktop
  }
  ```

- **Accessibility Built-in:**
  - Todos los componentes tienen roles ARIA por defecto
  - Focus management automático
  - Keyboard navigation incluida

- **Form Components:**
  - `FormControl`: envoltorio con error handling
  - `FormLabel`: asociación automática con input
  - `FormErrorMessage`: mostrado condicionalmente
  - `FormHelperText`: hint persistente

**Aplicación al Login:**
```jsx
<FormControl isInvalid={!!error}>
  <FormLabel>Correo</FormLabel>
  <Input
    type="email"
    size={{ base: "lg", md: "md" }}
    focusBorderColor="blue.500"
    errorBorderColor="red.500"
  />
  <FormErrorMessage>{error}</FormErrorMessage>
  <FormHelperText>Ingrese su correo registrado</FormHelperText>
</FormControl>
```

---

### 7. Material UI (MUI) (https://mui.com/)

**Hallazgos Clave:**

- **Responsive Props:**
  ```jsx
  <Grid
    container
    spacing={{ xs: 2, md: 3 }}
    columns={{ xs: 4, sm: 8, md: 12 }}
  >
    <Grid item xs={12} sm={6} md={4}>
      {/* Content */}
    </Grid>
  </Grid>
  ```

- **Container Queries:**
  ```jsx
  <Card
    sx={{
      '@sm': { flexDirection: 'row' },
      '@400/sidebar': { flexDirection: 'row' }
    }}
  />
  ```

- **useMediaQuery Hook:**
  ```jsx
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  ```

- **Form Components:**
  - `TextField`: input con label, helper text y error integrados
  - `InputAdornment`: iconos dentro de inputs
  - `FormHelperText`: descripción del campo
  - `FormControlLabel`: para checkboxes/radios

**Aplicación al Login:**
```jsx
<TextField
  fullWidth
  label="Correo"
  type="email"
  variant="outlined"
  size={isMobile ? "medium" : "small"}
  error={!!error}
  helperText={error || "Ingrese su correo registrado"}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <EmailIcon />
      </InputAdornment>
    ),
  }}
/>
```

---

## Síntesis: Patrones a Implementar

### 1. Mobile-First Responsive Design

**Breakpoints Propuestos:**
```typescript
const breakpoints = {
  mobile: '0px',      // 0-639px
  tablet: '640px',    // 640-1023px
  desktop: '1024px',  // 1024px+
}
```

**Layout Strategy:**
- Mobile (< 640px): Card full-width con padding 16px, inputs stack verticalmente
- Tablet (640-1023px): Card centrado max-width 500px, inputs más compactos
- Desktop (1024px+): Card centrado max-width 420px, inputs estándar

### 2. Accesibilidad WCAG AA

**Checklist Obligatorio:**
- [ ] Contraste de color ≥ 4.5:1 (texto normal) y ≥ 3:1 (texto grande)
- [ ] Navegación completa por teclado (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus visible con ring de 2px y offset de 2px
- [ ] Labels asociados con inputs mediante htmlFor/id
- [ ] Mensajes de error con role="alert" y aria-live="polite"
- [ ] Botones deshabilitados con aria-disabled="true"
- [ ] Loading states con aria-busy="true"
- [ ] Inputs con autocomplete apropiado (email, current-password)

### 3. Form Validation UX

**Timing:**
- Email: Validar formato on blur (no on change)
- Password: Validar longitud on blur
- 2FA Code: Validar formato on change (auto-submit si 6 dígitos válidos)

**Error Display:**
- Mostrar error inline debajo del input
- Color: text-red-600 (light mode), text-red-400 (dark mode)
- Icono: ⚠️ o `<AlertCircle />` antes del mensaje
- Mantener error visible hasta que se corrija

**Success Feedback:**
- Toast notification al completar login exitoso
- Checkmark verde en inputs válidos (opcional, solo si no distrae)

### 4. 2FA Flow Optimizations

**Input de Código:**
- Formato: 6 dígitos con espaciado visual (123 456)
- Keyboard: Numérico en mobile (`inputMode="numeric"`)
- Auto-focus al montar componente
- Auto-submit cuando se ingresan 6 dígitos válidos
- Clear button visible si hay contenido

**Context Preservation:**
- Mostrar email del usuario durante 2FA
- Hint: "Ingrese el código de su app 2FAS"
- Link: "¿No recibiste el código? Usar código de respaldo"

### 5. Electron Window Configuration

**main.ts Adjustments:**
```typescript
const win = new BrowserWindow({
  width: 1200,           // Desktop óptimo
  height: 800,           
  minWidth: 360,         // Mobile mínimo (iPhone SE)
  minHeight: 640,        
  center: true,
  resizable: true,
  webPreferences: {
    preload: join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
  },
  // Opcional: fullscreen en tablets
  // fullscreen: process.platform === 'darwin' && isTablet
})
```

---

## Decisión: Librería UI Seleccionada

**Recomendación: Tailwind CSS + shadcn/ui**

**Justificación:**

1. **Tailwind CSS:**
   - Mobile-first por defecto
   - Utility-first permite ajustes rápidos sin CSS custom
   - Plugin de formularios con reset de estilos nativos
   - Excelente para responsive con prefijos intuitivos
   - Tamaño final optimizado (tree-shaking automático)

2. **shadcn/ui:**
   - Componentes copy-paste (no dependency bloat)
   - Basados en Radix UI (accesibilidad WCAG AA built-in)
   - Totalmente customizables con Tailwind
   - Compatible con React 19.x (proyecto actual)
   - Tipado TypeScript completo

**Alternativas Descartadas:**
- **Chakra UI:** Requiere reescribir todos los componentes existentes (Bootstrap actualmente)
- **MUI:** Bundle size grande (~300kb), conflictos con Bootstrap existente

---

## Plan de Implementación

### Fase 1: Setup (0.5-1 día)
1. Instalar Tailwind CSS + PostCSS + Autoprefixer
2. Instalar shadcn/ui CLI y configurar
3. Instalar plugin `@tailwindlabs/tailwindcss-forms`
4. Configurar `tailwind.config.js` con breakpoints y tema
5. Crear `globals.css` con variables CSS custom

### Fase 2: Componentes Base (1 día)
1. Generar componentes shadcn/ui: `input`, `button`, `card`, `label`, `form`
2. Crear componente `LoginCard` reutilizable
3. Crear componente `AuthInput` con validación y error display
4. Crear componente `TwoFactorInput` con formato numérico

### Fase 3: Refactorización LoginPage (1-1.5 días)
1. Reescribir `LoginPage.tsx` con diseño mobile-first
2. Implementar layout responsive con Tailwind
3. Integrar validación en tiempo real
4. Añadir animaciones de transición (login ↔ 2FA)
5. Implementar loading states y disabled states

### Fase 4: Electron Configuration (0.5 día)
1. Actualizar `main.ts` con dimensiones adaptativas
2. Configurar minWidth/minHeight para mobile
3. Testing en diferentes tamaños de ventana

### Fase 5: Testing & QA (1 día)
1. Testing manual en breakpoints (360px, 768px, 1024px, 1440px)
2. Testing con screen readers (NVDA, VoiceOver)
3. Testing navegación por teclado
4. Testing en dispositivos reales (iOS, Android)
5. Lighthouse audit (Performance, Accessibility, Best Practices)

### Fase 6: Documentación (0.5 día)
1. Crear `UX_PATTERNS.md` con patrones implementados
2. Actualizar README.md con screenshots responsive
3. Documentar componentes en Storybook (opcional)

---

## Referencias Completas

1. **A11Y Project:** https://www.a11yproject.com/checklist/
2. **Nielsen Norman Group:** https://www.nngroup.com/articles/
3. **PageFlows:** https://pageflows.com/ (login flows de Airbnb, Dropbox, Slack)
4. **Material Design 3:** https://m3.material.io/
5. **Tailwind CSS:** https://tailwindcss.com/docs/responsive-design
6. **Chakra UI:** https://chakra-ui.com/docs/styled-system/responsive-styles
7. **Material UI:** https://mui.com/material-ui/react-grid/

---

**Fecha de Creación:** 2025-10-22  
**Última Actualización:** 2025-10-22  
**Autor:** AI Assistant (GitHub Copilot)
