import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileFlow } from '../../../infrastructure/flows/profile';
import { roleFlow } from '../../../infrastructure/flows/role';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import { useTwoFactorStatus } from '../../../infrastructure/flows/twoFactor';
import type { User, UserRole, UpdateUserData } from '../../../types/user';

interface ProfileFormData {
    uIdentification: string;
    uName: string;
    uFLastName: string;
    uSLastName?: string;
    uEmail: string;
    roleId: number;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const defaultProfileFormData: ProfileFormData = {
    uIdentification: '',
    uName: '',
    uFLastName: '',
    uSLastName: '',
    uEmail: '',
    roleId: 0,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
};

export default function EditProfilePage() {
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const { isEnabled } = useTwoFactorStatus();
    const [formData, setFormData] = useState<ProfileFormData>(defaultProfileFormData);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [originalUser, setOriginalUser] = useState<User | null>(null);

    const loadProfileAndRoles = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const [profileResult, rolesResult] = await Promise.all([
                profileFlow.getProfile(),
                roleFlow.getAllRoles()
            ]);

            if (!profileResult.success || !profileResult.user) {
                setError(profileResult.error || 'Error al cargar el perfil');
                return;
            }

            const user = profileResult.user;
            setOriginalUser(user);

            setFormData({
                uIdentification: user.uIdentification || '',
                uName: user.uName || '',
                uFLastName: user.uFLastName || '',
                uSLastName: user.uSLastName || '',
                uEmail: user.uEmail || '',
                roleId: user.role?.id || 0,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setRoles(rolesResult.roles || []);
        } catch (error: unknown) {
            console.error('Error loading profile:', error);
            setError('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfileAndRoles();
    }, [loadProfileAndRoles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!originalUser) return;

        // Verificar que tenga 2FA activado
        if (!isEnabled) {
            setError('Debes activar la autenticación de dos factores (2FA) para editar tu perfil');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // Validate password change if provided
            if (formData.newPassword && formData.newPassword.trim()) {
                if (!formData.currentPassword || !formData.currentPassword.trim()) {
                    setError('Debe proporcionar la contraseña actual para cambiarla');
                    setSaving(false);
                    return;
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    setError('La nueva contraseña y su confirmación no coinciden');
                    setSaving(false);
                    return;
                }
            }

            // Update profile data
            const updateData: Partial<UpdateUserData> = {
                uIdentification: formData.uIdentification,
                uName: formData.uName,
                uFLastName: formData.uFLastName,
                uSLastName: formData.uSLastName,
                uEmail: formData.uEmail,
                roleId: formData.roleId
            };

            const profileResult = await profileFlow.updateProfile(updateData);

            if (!profileResult.success) {
                setError(profileResult.error || 'Error al actualizar el perfil');
                setSaving(false);
                return;
            }

            // Change password if provided
            if (formData.newPassword && formData.newPassword.trim()) {
                const passwordResult = await profileFlow.changePassword({
                    currentPassword: formData.currentPassword!,
                    newPassword: formData.newPassword
                });

                if (!passwordResult.success) {
                    setError(passwordResult.error || 'Error al cambiar la contraseña');
                    setSaving(false);
                    return;
                }
            }

            feedback.showNotification({
                title: 'Éxito',
                message: 'Perfil actualizado exitosamente',
                variant: 'success'
            });
            navigate('/profile');
        } catch (error: unknown) {
            console.error('Error updating profile:', error);
            setError('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
                            <p className="mt-2 text-gray-600">Actualiza tu información personal</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* 2FA Warning */}
                {!isEnabled && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">
                                    Autenticación de Dos Factores Requerida
                                </h3>
                                <div className="mt-2 text-sm text-amber-700">
                                    <p>
                                        Para editar tu perfil, debes tener activada la autenticación de dos factores (2FA).
                                        Esto es una medida de seguridad adicional para proteger tu información personal.
                                    </p>
                                    <p className="mt-2">
                                        <button
                                            onClick={() => navigate('/two-factor')}
                                            className="font-medium underline text-amber-700 hover:text-amber-600"
                                        >
                                            Configurar 2FA ahora →
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden relative">
                    {!isEnabled && (
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Edición deshabilitada</h3>
                                <p className="mt-1 text-sm text-gray-500">Activa 2FA para editar tu perfil</p>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={`p-8 ${!isEnabled ? 'pointer-events-none opacity-50' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Identification */}
                            <div>
                                <label htmlFor="uIdentification" className="block text-sm font-medium text-gray-700 mb-2">
                                    Identificación *
                                </label>
                                <input
                                    type="text"
                                    id="uIdentification"
                                    name="uIdentification"
                                    value={formData.uIdentification}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* First Name */}
                            <div>
                                <label htmlFor="uName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    id="uName"
                                    name="uName"
                                    value={formData.uName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* First Last Name */}
                            <div>
                                <label htmlFor="uFLastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Primer Apellido *
                                </label>
                                <input
                                    type="text"
                                    id="uFLastName"
                                    name="uFLastName"
                                    value={formData.uFLastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Second Last Name */}
                            <div>
                                <label htmlFor="uSLastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Segundo Apellido
                                </label>
                                <input
                                    type="text"
                                    id="uSLastName"
                                    name="uSLastName"
                                    value={formData.uSLastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="uEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    id="uEmail"
                                    name="uEmail"
                                    value={formData.uEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Rol *
                                </label>
                                <select
                                    id="roleId"
                                    name="roleId"
                                    value={formData.roleId}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value={0}>Seleccione un rol</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.rName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Current Password */}
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña Actual
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Requerida para cambiar contraseña"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Opcional"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="md:col-span-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Confirmar nueva contraseña"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || !isEnabled}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Guardando...' : !isEnabled ? 'Requiere 2FA' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}