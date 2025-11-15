import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/atoms';
import { useTwoFactorStatus } from '../../../infrastructure/flows/twoFactor';
import { PermissionUtils } from '../../../utils/permissionUtils';
import './style.css';

interface MenuOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: string;
}

export default function MainMenuPage() {
    const navigate = useNavigate();
    const { isEnabled, loading } = useTwoFactorStatus();
    const [hasRequiredPermissions, setHasRequiredPermissions] = useState<boolean | null>(null);

    // Verificar permisos del usuario
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const [canManageUsers, isSuperAdmin] = await Promise.all([
                    PermissionUtils.canViewAllUsers(),
                    PermissionUtils.isSuperAdmin()
                ]);
                setHasRequiredPermissions(canManageUsers || isSuperAdmin);
            } catch (error) {
                console.error('Error checking permissions:', error);
                setHasRequiredPermissions(false);
            }
        };

        checkPermissions();
    }, []);

    const menuOptions: MenuOption[] = [
        {
            id: '1',
            title: 'Fichas Virtuales',
            description: 'Gestionar y visualizar todas las fichas virtuales de pacientes',
            icon: 'assignment',
            route: '/virtualFiles'
        },
        {
            id: '2',
            title: 'Enfermería',
            description: 'Gestionar citas médicas, pacientes y seguimiento de enfermería',
            icon: 'medical_services',
            route: '/nursing'
        },
        {
            id: '3',
            title: 'Usuarios',
            description: 'Administrar usuarios del sistema y sus permisos',
            icon: 'group',
            route: '/users'
        },
        {
            id: '4',
            title: 'Roles',
            description: 'Gestionar roles del sistema y sus permisos asociados',
            icon: 'admin_panel_settings',
            route: '/roles'
        },
        {
            id: '5',
            title: 'Permisos',
            description: 'Administrar permisos del sistema y sus configuraciones',
            icon: 'security',
            route: '/permissions'
        },
        {
            id: '6',
            title: 'Configuración 2FA',
            description: 'Configurar autenticación de dos factores para mayor seguridad',
            icon: 'lock',
            route: '/two-factor'
        },
        {
            id: '7',
            title: 'Entradas y Salidas',
            description: 'Registrar y visualizar entradas y salidas de personas y vehículos',
            icon: 'transfer_within_a_station',
            route: '/entrance-exit'
        },
        {
            id: '8',
            title: 'Auditoría',
            description: 'Revisar registros de auditoría y actividad del sistema',
            icon: 'shield',
            route: '/audits'
        },
        {
            id: '9',
            title: 'Mi Perfil',
            description: 'Ver y editar tu información personal y configuración de cuenta',
            icon: 'person',
            route: '/profile'
        }
    ];

    const handleMenuClick = (route: string) => {
        navigate(route);
    };

    // Filtrar opciones del menú basado en estado del 2FA y permisos
    const getFilteredMenuOptions = () => {
        // Si está cargando, mostrar opciones limitadas
        if (loading) {
            return menuOptions.filter(option =>
                option.id === '5' || // Configuración 2FA
                option.id === '8'    // Mi Perfil
            );
        }

        // Si el usuario no tiene 2FA activado, mostrar solo opciones limitadas
        if (!isEnabled) {
            return menuOptions.filter(option =>
                option.id === '5' || // Configuración 2FA
                option.id === '8'    // Mi Perfil
            );
        }

        // Si tiene 2FA activado pero no tiene permisos avanzados, mostrar opciones básicas
        if (hasRequiredPermissions === false) {
            return menuOptions.filter(option =>
                option.id === '1' || // Fichas Virtuales
                option.id === '5' || // Configuración 2FA
                option.id === '8'    // Mi Perfil
            );
        }

        // Usuarios con permisos completos ven todas las opciones
        return menuOptions;
    };

    const filteredMenuOptions = getFilteredMenuOptions();

    return (
        <div className="container py-4">
           
            {/* Indicador de carga */}
            {loading && (
                <div className="alert alert-info text-center mb-4">
                    <i className="bi bi-hourglass-split me-2"></i>
                    Verificando configuración de seguridad...
                </div>
            )}

            {/* Grid de opciones del menú */}
            <div className="row g-4">
                {filteredMenuOptions.map((option) => (
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
                                        <Icon name={option.icon} size="xl" className="text-primary" />
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
            {filteredMenuOptions.length === 0 && (
                <div className="text-center py-5">
                    <div className="text-muted">
                        No hay opciones de menú disponibles
                    </div>
                </div>
            )}
        </div>
    );
}