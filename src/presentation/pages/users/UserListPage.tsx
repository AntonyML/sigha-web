import React, { useState, useEffect } from 'react';

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

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

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

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Lista de Usuarios</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => console.log('Navegar a creación de usuario')}
                >
                    Crear Usuario
                </button>
            </div>

            {/* Buscador de usuarios */}
            <div className="row mb-4">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="input-group">
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
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 && searchTerm && (
                            <tr>
                                <td colSpan={4}>No se encontraron resultados para "{searchTerm}".</td>
                            </tr>
                        )}
                        {filteredUsers.length === 0 && !searchTerm && (
                            <tr>
                                <td colSpan={4} className="text-center">
                                    No se encontraron usuarios
                                </td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}