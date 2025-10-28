import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileFlow } from '../../../infrastructure/flows/profile';
import { roleFlow } from '../../../infrastructure/flows/role';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
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

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8">
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
                                disabled={saving}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}