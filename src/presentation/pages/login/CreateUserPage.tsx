import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { ButtonNew as Button } from '../../components'
import { AuthLayout } from '../../components/molecules'

export default function CreateUserPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Crear Usuario"
      description="Formulario de registro próximamente"
      showBackButton={true}
      onBackClick={() => navigate('/login')}
      backButtonText="Volver al inicio de sesión"
    >
      <div className="space-y-4 text-center">
        <div className="p-6 rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/25">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Registro de Usuarios</h3>
          <p className="text-muted-foreground mb-4">
            El registro de nuevos usuarios debe ser realizado por un administrador del sistema.
          </p>
          <p className="text-sm text-muted-foreground">
            Contacta al administrador para crear tu cuenta de usuario.
          </p>
        </div>

        <Button
          onClick={() => navigate('/login')}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          Volver al Inicio de Sesión
        </Button>
      </div>
    </AuthLayout>
  )
}