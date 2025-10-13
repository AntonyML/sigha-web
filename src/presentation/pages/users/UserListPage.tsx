import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
}

export default function UserListPage() {
    const [users, setUsers] = useState<User[]>([
        {
            id: '1',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            roles: ['Admin', 'Editor']
        },
        {
            id: '2',
            name: 'María García',
            email: 'maria@example.com',
            roles: ['Viewer']
        },
        {
            id: '3',
            name: 'Carlos López',
            email: 'carlos@example.com',
            roles: ['Editor', 'Moderator']
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const navigate = useNavigate();
    const [canDelete, setCanDelete] = useState(true);
    const [canEdit, setCanEdit] = useState(true);
    const [canCreate, setCanCreate] = useState(true);
    const [canView, setCanView] = useState(true);

    // Efecto para filtrar los usuarios basado en el término de búsqueda
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.roles.some(role =>
                    role.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredUsers(filtered);
        }
    }, [users, searchTerm]);

    // Función para limpiar la búsqueda
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    if (!canView) return null;

    const handleView = (user: User) => {
        navigate(`/users/view/${user.id}`);
        console.log('Ver usuario:', user.id);
    };

    const handleEdit = (user: User) => {
        navigate(`/users/edit/${user.id}`);
        console.log('Editar usuario:', user.id);
    };

    const handleDeleteClick = (user: User) => {
        if (!canDelete) {
            window.alert('No tienes permiso para eliminar.');
            return;
        }

        const ok = window.confirm(`¿Estás seguro que deseas eliminar al usuario "${user.name}"?`);
        if (!ok) return;

        setUsers((prev) => prev.filter((u) => u.id !== user.id));
    };

    if (loading) return <div>Cargando usuarios...</div>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Lista de Usuarios</h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/main-menu')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Regresar
                    </button>
                    {canCreate && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/users/create')}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Crear Usuario
                        </button>
                    )}
                </div>
            </div>

            {/* Buscador de usuarios */}
            <div className="row mb-4">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nombre, email o rol"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={handleClearSearch}
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <small className="text-muted mt-1 d-block">
                            Mostrando {filteredUsers.length} de {users.length} usuarios
                        </small>
                    )}
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Roles</th>
                            <th>Email</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 && searchTerm && (
                            <tr>
                                <td colSpan={5}>No se encontraron resultados para "{searchTerm}".</td>
                            </tr>
                        )}
                        {filteredUsers.length === 0 && !searchTerm && (
                            <tr>
                                <td colSpan={5}>No se encontraron usuarios.</td>
                            </tr>
                        )}
                        {filteredUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>
                                    {user.roles.map((role, roleIndex) => (
                                        <span key={roleIndex}>
                                            {role}
                                            {roleIndex < user.roles.length - 1 && ', '}
                                        </span>
                                    ))}
                                </td>
                                <td>{user.email}</td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleView(user)}
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            Ver
                                        </button>
                                        {canEdit && (
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <i className="bi bi-pencil-square me-2"></i>
                                                Editar
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteClick(user)}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}