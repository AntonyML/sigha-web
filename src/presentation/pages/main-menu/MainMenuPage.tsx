import { useNavigate } from 'react-router-dom';
import './style.css';

interface MenuOption {
    id: string;
    title: string;
    description: string;
    image: string;
    route: string;
}

export default function MainMenuPage() {
    const navigate = useNavigate();

    const menuOptions: MenuOption[] = [
        {
            id: '1',
            title: 'Fichas Virtuales',
            description: 'Gestionar y visualizar todas las fichas virtuales de pacientes',
            image: '📋',
            route: '/virtualFiles'
        },
        {
            id: '2',
            title: 'Usuarios',
            description: 'Administrar usuarios del sistema y sus permisos',
            image: '👥',
            route: '/users'
        },
        {
            id: '3',
            title: 'Configuración 2FA',
            description: 'Configurar autenticación de dos factores para mayor seguridad',
            image: '🔐',
            route: '/two-factor'
        },
         {
            id: '4',
            title: 'Entradas y Salidas',
            description: 'Registrar y visualizar entradas y salidas de personas y vehículos',
            image: '➡️',
            route: '/entrance-exit'
        }
    ];

    const handleMenuClick = (route: string) => {
        navigate(route);
    };

    return (
        <div className="container py-4">
            {/* Título del menú */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary">Menú Principal</h1>
                <p className="lead text-muted">Selecciona una opción para continuar</p>
            </div>

            {/* Grid de opciones del menú */}
            <div className="row g-4">
                {menuOptions.map((option) => (
                    <div key={option.id} className="col-12 col-md-6 col-lg-4">
                        <div
                            className="card h-100 shadow-sm border-0 hover-card"
                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                            onClick={() => handleMenuClick(option.route)}
                        >
                            <div className="card-body text-center p-4 d-flex flex-column">
                                {/* Imagen/Icono */}
                                <div className="mb-3">
                                    <div
                                        className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                                        style={{ width: '80px', height: '80px' }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{option.image}</span>
                                    </div>
                                </div>

                                {/* Título */}
                                <h5 className="card-title fw-bold text-dark mb-2">
                                    {option.title}
                                </h5>

                                {/* Descripción */}
                                <p className="card-text text-muted flex-grow-1">
                                    {option.description}
                                </p>

                                {/* Indicador de acción */}
                                <div className="mt-auto">
                                    <span className="text-primary fw-semibold">
                                        Acceder →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Espacio para futuras opciones */}
            {menuOptions.length === 0 && (
                <div className="text-center py-5">
                    <div className="text-muted">
                        No hay opciones de menú disponibles
                    </div>
                </div>
            )}
        </div>
    );
}