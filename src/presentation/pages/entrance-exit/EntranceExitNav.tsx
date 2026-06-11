import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, History, LogIn, LogOut } from 'lucide-react'

const TABS = [
  { label: 'Dashboard', path: '/entrance-exit', icon: <LayoutDashboard size={15} />, exact: true },
  { label: 'Historial', path: '/entrance-exit/history', icon: <History size={15} />, exact: false },
  { label: 'Reg. Entrada', path: '/entrance-exit/register?type=entrance', icon: <LogIn size={15} />, exact: false, matchPath: '/entrance-exit/register' },
  { label: 'Reg. Salida',  path: '/entrance-exit/register?type=exit',     icon: <LogOut size={15} />, exact: false, matchPath: '/entrance-exit/register' },
]

export default function EntranceExitNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (tab: typeof TABS[number]) => {
    const checkPath = tab.matchPath ?? tab.path.split('?')[0]
    if (tab.exact) return location.pathname === checkPath
    return location.pathname.startsWith(checkPath)
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
      {TABS.map(tab => {
        const active = isActive(tab)
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none',
              cursor: 'pointer', fontSize: '0.8375rem', fontWeight: active ? 700 : 500,
              background: active ? '#eff6ff' : 'transparent',
              color: active ? '#2563eb' : '#475569',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}