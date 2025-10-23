# 🧭 Sistema de Navegación Global

## 📂 Estructura de Componentes

```
src/presentation/components/organisms/
├── Navbar/
│   └── Navbar.tsx          # Navegación principal (top desktop, bottom mobile)
├── Breadcrumbs/
│   └── Breadcrumbs.tsx     # Migas de pan dinámicas
├── AppLayout/
│   └── AppLayout.tsx       # Wrapper global con navbar + breadcrumbs
└── index.ts                # Exportaciones centralizadas
```

## 🎨 Características

### 1. **Navbar Principal**
- **Desktop**: Barra superior fija con 5 opciones principales
- **Mobile**: Barra inferior fija tipo iOS/Android
- **Opciones globales**:
  - 🏠 Inicio (Main Menu)
  - 👴 Adultos Mayores (Virtual Files)
  - 📅 Actividades (Programs)
  - 🛡️ Auditoría
  - 👤 Perfil (Users)

### 2. **Breadcrumbs Inteligentes**
- Migas de pan dinámicas basadas en la ruta actual
- Cada elemento es clickeable para navegar hacia atrás
- Auto-oculta IDs numéricos (ej: `/users/123` solo muestra "Usuarios / Ver Detalles")
- Se oculta en `/login` y páginas sin jerarquía

### 3. **AppLayout Wrapper**
- Envuelve todas las páginas automáticamente
- Oculta navegación en páginas de login
- Espaciado automático para mobile (pb-20) y desktop (pb-0)

## 🎯 Uso

El sistema se aplica automáticamente a todas las páginas a través de `App.tsx`:

```tsx
import { AppLayout } from './presentation/components/organisms'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Todas las rutas aquí */}
      </Routes>
    </AppLayout>
  )
}
```

## 🔧 Personalización

### Agregar nuevas opciones al Navbar

Edita `src/presentation/components/organisms/Navbar/Navbar.tsx`:

```tsx
const navItems: NavItem[] = [
  {
    id: 'new-option',
    label: 'Nueva Opción',
    icon: <YourIcon className="w-5 h-5" />,
    path: '/nueva-ruta',
  },
  // ...
];
```

### Agregar nombres de rutas al Breadcrumb

Edita `src/presentation/components/organisms/Breadcrumbs/Breadcrumbs.tsx`:

```tsx
const routeNameMap: Record<string, string> = {
  'nueva-ruta': 'Nueva Ruta Legible',
  // ...
};
```

## 📱 Responsive Design

### Mobile (< 768px)
- Navbar en la parte inferior (iOS/Android style)
- Barra superior minimalista con logo y notificaciones
- Bottom safe area respetado (para notch/dynamic island)

### Desktop (>= 768px)
- Navbar en la parte superior
- Logo + nombre completo del sistema
- User menu con logout

## 🎨 Tecnologías

- **React Router** - Navegación y location tracking
- **Lucide React** - Iconos modernos
- **Tailwind CSS** - Estilos responsive
- **TypeScript** - Type safety

## ✅ Ventajas

1. **DRY (Don't Repeat Yourself)**: Un solo lugar para manejar navegación
2. **Consistencia**: Todas las páginas tienen el mismo look & feel
3. **Responsive**: Se adapta automáticamente a mobile/tablet/desktop
4. **Accesibilidad**: Navegación clara y predecible
5. **UX mejorada**: Breadcrumbs ayudan a orientarse en la app

## 🚀 Mejoras Futuras

- [ ] Animaciones de transición entre páginas
- [ ] Búsqueda global en el navbar
- [ ] Notificaciones en tiempo real
- [ ] Menú contextual por rol de usuario
- [ ] Dark mode toggle
