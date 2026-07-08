import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManagementFlow } from '../../../infrastructure/flows/userManagement';
import { roleFlow } from '../../../infrastructure/flows/role';
import { PermissionUtils } from '../../../utils/permissionUtils';
import { permissionApiService } from '../../../services/permissionApiService';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { UserRole, CreateUserData } from '../../../types/user';
import type { Permission, PermissionModuleType } from '../../../types/permissions';
import { PermissionModule } from '../../../types/permissions';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';
import PasswordInput from '../../components/atoms/PasswordInput/PasswordInput';
import {
    WizardTopBar,
    WizardStepper,
    WizardCard,
    WizardGrid,
    WizardField,
    WizardNav,
    IdentificationField,
    type WizardStepDef,
} from '../../components/molecules/CreationWizard';

/* ── Pasos del wizard (mismo patrón visual que /virtualFiles/create) ── */
const STEPS: WizardStepDef[] = [
    { id: 1, label: 'Datos personales', icon: '👤' },
    { id: 2, label: 'Contacto y acceso', icon: '🔐' },
    { id: 3, label: 'Rol y permisos', icon: '🛡️' },
];

interface UserFormData {
    uIdentification: string;
    uName: string;
    uFLastName: string;
    uSLastName?: string;
    uEmail: string;
    uPassword: string;
    roleId: number;
}

const defaultUserFormData: UserFormData = {
    uIdentification: '',
    uName: '',
    uFLastName: '',
    uSLastName: '',
    uEmail: '',
    uPassword: '',
    roleId: 0
};

export default function CreateUserPage() {
    const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string>('');
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    // Verificar permisos y cargar roles al montar el componente
    useEffect(() => {
        const checkPermissionsAndLoadData = async () => {
            try {
                const canCreate = await PermissionUtils.canCreateUsers();
                setHasPermission(canCreate);

                if (!canCreate) {
                    return;
                }

                const result = await roleFlow.getAllRoles();
                if (result.success && result.roles) {
                    setRoles(result.roles);
                } else {
                    console.error('Error al cargar roles:', result.error);
                }
            } catch (err) {
                console.error('Error verificando permisos:', err);
            }
        };

        checkPermissionsAndLoadData();
    }, []);

    function onInputChange(field: keyof UserFormData, value: string | number) {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (field === 'uPassword') {
            setPasswordsMatch((value as string) === confirmPassword);
        }

        if (field === 'roleId') {
            loadRolePermissions(Number(value));
        }
    }

    function handleConfirmPasswordChange(value: string) {
        setConfirmPassword(value);
        setPasswordsMatch(formData.uPassword === value);
    }

    async function loadRolePermissions(roleId: number) {
        if (roleId === 0) {
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsError('');
            return;
        }

        setPermissionsLoading(true);
        setPermissionsError('');

        const timeoutId = setTimeout(() => {
            console.warn('Timeout cargando permisos del rol:', roleId);
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsLoading(false);
            setPermissionsError('Tiempo de espera agotado al cargar permisos del rol');
        }, 5000);

        try {
            const rolePerms = await permissionApiService.getByRole(roleId);
            clearTimeout(timeoutId);

            const mapped: Permission[] = rolePerms
                .filter(rp => rp.rpGranted)
                .map(rp => ({
                    module: rp.permission.pModule as PermissionModuleType,
                    action: rp.permission.pAction as string,
                    enabled: true,
                }));
            setPermissions(mapped);
            setPermissionsLoading(false);

            const initialSelected: Record<string, boolean> = {};
            mapped.forEach(permission => {
                const key = `${permission.module}:${permission.action}`;
                initialSelected[key] = true;
            });
            setSelectedPermissions(initialSelected);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error cargando permisos del rol:', error);
            setPermissions([]);
            setSelectedPermissions({});
            setPermissionsLoading(false);
            setPermissionsError('Error al cargar los permisos del rol seleccionado');
        }
    }

    function handlePermissionChange(module: string, action: string, enabled: boolean) {
        const key = `${module}:${action}`;
        setSelectedPermissions(prev => ({ ...prev, [key]: enabled }));
    }

    /* ── Validación por paso: evita avanzar con datos incompletos ── */
    function validateStep(current: number): string | null {
        if (current === 1) {
            if (!formData.uIdentification.trim()) return 'Por favor ingresa la identificación del usuario';
            if (!/^[0-9]+$/.test(formData.uIdentification.trim())) return 'La identificación debe contener solo números';
            if (!formData.uName.trim()) return 'Por favor ingresa el nombre';
            if (!formData.uFLastName.trim()) return 'Por favor ingresa el primer apellido';
        }
        if (current === 2) {
            if (!formData.uEmail.trim()) return 'Por favor ingresa el correo electrónico';
            if (!formData.uPassword) return 'Por favor ingresa una contraseña';
            if (!passwordsMatch) return 'Las contraseñas no coinciden';
        }
        return null;
    }

    function handleNext() {
        const error = validateStep(step);
        if (error) { feedback.error(error); return; }
        setStep(s => Math.min(s + 1, STEPS.length));
    }

    function handlePrev() {
        if (step === 1) { navigate('/users'); return; }
        setStep(s => Math.max(s - 1, 1));
    }

    async function handleSubmit() {
        if (hasPermission === false) {
            feedback.error('No tienes permisos para crear usuarios.');
            return;
        }

        const stepError = validateStep(1) || validateStep(2);
        if (stepError) { feedback.error(stepError); return; }

        if (!formData.roleId || formData.roleId === 0) {
            feedback.error('Por favor selecciona un rol');
            return;
        }

        setLoading(true);

        const createData: CreateUserData = {
            uIdentification: formData.uIdentification.trim(),
            uName: formData.uName.trim(),
            uFLastName: formData.uFLastName.trim(),
            uEmail: formData.uEmail.trim(),
            uPassword: formData.uPassword,
            roleId: Number(formData.roleId)
        };

        if (formData.uSLastName && formData.uSLastName.trim()) {
            createData.uSLastName = formData.uSLastName.trim();
        }

        const result = await userManagementFlow.createUser(createData);

        if (result.success && result.user) {
            feedback.success(result.message || 'Usuario creado exitosamente');
            feedback.showNotification({
                title: 'Usuario creado',
                message: `El usuario ${result.user.uEmail} ha sido creado exitosamente`,
                variant: 'success',
                icon: 'bi-person-plus-fill'
            });
            navigate('/users');
        } else {
            feedback.error(result.error || 'Error al crear usuario', 'Error de creación');
        }

        setLoading(false);
    }

    if (hasPermission === false) {
        return (
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
                <div className="alert alert-danger shadow-sm" role="alert">
                    <i className="bi bi-shield-x-fill me-2"></i>
                    <strong>Acceso Denegado</strong>
                    <p className="mb-0 mt-2">No tienes permisos para crear usuarios. Solo los administradores del sistema pueden crear nuevos usuarios.</p>
                </div>
                <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/users')}>
                    Volver a la lista
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 4rem', fontFamily: 'inherit' }}>

            <WizardTopBar
                title="Nuevo usuario"
                onBack={() => navigate('/users')}
                currentStep={step}
                totalSteps={STEPS.length}
            />

            <WizardStepper steps={STEPS} currentStep={step} onStepClick={setStep} />

            {/* ── Paso 1: Datos personales ── */}
            {step === 1 && (
                <WizardCard title="👤 Datos personales">
                    <WizardGrid cols={1}>
                        <IdentificationField
                            label="Identificación"
                            required
                            value={formData.uIdentification}
                            onChange={v => onInputChange('uIdentification', v)}
                            onResolved={({ givenNames, firstLastName, secondLastName, normalizedCedula }) => {
                                setFormData(p => ({
                                    ...p,
                                    uIdentification: normalizedCedula,
                                    uName: givenNames,
                                    uFLastName: firstLastName,
                                    uSLastName: secondLastName,
                                }));
                            }}
                        />
                    </WizardGrid>
                    <p style={{ margin: '-0.5rem 0 1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Al encontrar la cédula se autocompletan nombre y apellidos. Puedes ajustarlos manualmente después.
                    </p>
                    <WizardGrid cols={3}>
                        <WizardField label="Nombre(s)" required>
                            <input
                                type="text" className="form-control"
                                value={formData.uName}
                                onChange={e => onInputChange('uName', e.target.value)}
                                placeholder="Ej: Antony Jafeth"
                                disabled={loading}
                            />
                        </WizardField>
                        <WizardField label="Primer apellido" required>
                            <input
                                type="text" className="form-control"
                                value={formData.uFLastName}
                                onChange={e => onInputChange('uFLastName', e.target.value)}
                                placeholder="Primer apellido"
                                disabled={loading}
                            />
                        </WizardField>
                        <WizardField label="Segundo apellido">
                            <input
                                type="text" className="form-control"
                                value={formData.uSLastName}
                                onChange={e => onInputChange('uSLastName', e.target.value)}
                                placeholder="Opcional"
                                disabled={loading}
                            />
                        </WizardField>
                    </WizardGrid>
                </WizardCard>
            )}

            {/* ── Paso 2: Contacto y acceso ── */}
            {step === 2 && (
                <WizardCard title="🔐 Contacto y acceso">
                    <WizardGrid cols={1}>
                        <WizardField label="Correo electrónico" required>
                            <input
                                type="email" className="form-control"
                                value={formData.uEmail}
                                onChange={e => onInputChange('uEmail', e.target.value)}
                                placeholder="correo@ejemplo.com"
                                disabled={loading}
                            />
                        </WizardField>
                    </WizardGrid>
                    <WizardGrid cols={2}>
                        <WizardField label="Contraseña" required>
                            <PasswordInput
                                id="uPassword"
                                value={formData.uPassword}
                                onChange={(e) => onInputChange('uPassword', e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                disabled={loading}
                                minLength={8}
                            />
                        </WizardField>
                        <WizardField label="Confirmar contraseña" required>
                            <PasswordInput
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                placeholder="Confirmar contraseña"
                                disabled={loading}
                                className={!passwordsMatch && confirmPassword ? 'is-invalid' : passwordsMatch && confirmPassword ? 'is-valid' : ''}
                            />
                        </WizardField>
                    </WizardGrid>
                    {!passwordsMatch && confirmPassword && (
                        <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: 0 }}>
                            <i className="bi bi-x-circle me-1" /> Las contraseñas no coinciden
                        </p>
                    )}
                </WizardCard>
            )}

            {/* ── Paso 3: Rol y permisos ── */}
            {step === 3 && (
                <WizardCard title="🛡️ Rol y permisos">
                    <WizardGrid cols={1}>
                        <WizardField label="Rol inicial del usuario" required>
                            <select
                                className="form-select"
                                value={formData.roleId}
                                onChange={(e) => onInputChange('roleId', Number(e.target.value))}
                                disabled={loading}
                            >
                                <option value={0}>Seleccionar rol…</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.rName}</option>
                                ))}
                            </select>
                        </WizardField>
                    </WizardGrid>

                    {formData.roleId === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                            Selecciona un rol para ver y configurar sus permisos
                        </p>
                    ) : permissionsError ? (
                        <AlertMessage type="danger" message={permissionsError} dismissible onDismiss={() => setPermissionsError('')} />
                    ) : permissionsLoading ? (
                        <LoadingSpinner message="Cargando permisos del rol..." size="sm" />
                    ) : permissions.length === 0 ? (
                        <AlertMessage type="warning" message="No se encontraron permisos para este rol" />
                    ) : (
                        <WizardGrid cols={2}>
                            {(Object.keys(PermissionModule) as Array<keyof typeof PermissionModule>).map(moduleKey => {
                                const module = PermissionModule[moduleKey] as PermissionModuleType;
                                const modulePermissions = permissions.filter(p => p.module === module);
                                if (modulePermissions.length === 0) return null;

                                return (
                                    <div key={module} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.875rem' }}>
                                        <h6 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                            <i className="bi bi-folder me-2 text-primary"></i>
                                            {module.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </h6>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {modulePermissions.map(permission => {
                                                const key = `${permission.module}:${permission.action}`;
                                                const isChecked = selectedPermissions[key] ?? permission.enabled;
                                                return (
                                                    <div key={key} className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={key}
                                                            checked={isChecked}
                                                            onChange={(e) => handlePermissionChange(permission.module, permission.action, e.target.checked)}
                                                            disabled={loading}
                                                        />
                                                        <label className="form-check-label text-capitalize" htmlFor={key}>
                                                            {permission.action}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </WizardGrid>
                    )}
                </WizardCard>
            )}

            <WizardNav
                step={step}
                totalSteps={STEPS.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onSubmit={handleSubmit}
                saving={loading}
                submitLabel="✓ Crear usuario"
                savingLabel="⏳ Creando usuario…"
            />
        </div>
    );
}
