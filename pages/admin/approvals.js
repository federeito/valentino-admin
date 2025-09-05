import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'pending' 
        ? '/api/admin/approvals' 
        : `/api/admin/users${filter !== 'all' ? `?status=${filter}` : ''}`;
      
      console.log('Fetching from endpoint:', endpoint);
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      console.log('API response:', data);
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        console.error('API error:', data.error);
        toast.error(data.error || 'Error al obtener usuarios');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error al obtener usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updateData) => {
    try {
      console.log('Updating user:', userId, updateData);
      
      const response = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...updateData }),
      });

      const data = await response.json();
      
      console.log('Update response:', data);
      
      if (data.success) {
        toast.success('Usuario actualizado exitosamente');
        fetchUsers(); // Refresh the list
      } else {
        console.error('Update error:', data.error);
        toast.error(data.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Update fetch error:', error);
      toast.error('Error al actualizar usuario: ' + error.message);
    }
  };

  const initializeAdminFields = async (userId) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          isApproved: true, 
          canViewPrices: true 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Campos de administrador inicializados exitosamente');
        fetchUsers();
      } else {
        toast.error(data.error || 'Error al inicializar campos de administrador');
      }
    } catch (error) {
      toast.error('Error al inicializar campos de administrador: ' + error.message);
    }
  };

  const handleApprove = (userId) => {
    updateUser(userId, { action: 'approve' });
  };

  const handleReject = (userId) => {
    updateUser(userId, { action: 'reject' });
  };

  const togglePriceViewing = (userId, currentStatus) => {
    updateUser(userId, { canViewPrices: !currentStatus });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Aprobaciones de Usuario</h1>
          <p className="text-gray-600 mt-2">Gestionar registros de usuarios y permisos</p>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Filtro actual: <strong>{filter}</strong> | Usuarios encontrados: <strong>{users.length}</strong>
          </p>
        </div>

        {/* Filter buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todos los Usuarios
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pendientes de Aprobación
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md ${
              filter === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Usuarios Aprobados
          </button>
        </div>

        {/* Users table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Información del Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo Electrónico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acceso a Precios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isAdmin = user.email === 'fedebojaminsky@gmail.com' || user.email === 'valentinobayres@hotmail.com';
                const hasApprovalFields = user.isApproved !== undefined && user.canViewPrices !== undefined;
                
                return (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'N/A'}
                          {isAdmin && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Admin</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user._id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isApproved ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePriceViewing(user._id, user.canViewPrices)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          user.canViewPrices
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.canViewPrices ? 'Puede Ver Precios' : 'Sin Acceso a Precios'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {isAdmin && !hasApprovalFields ? (
                        <button
                          onClick={() => initializeAdminFields(user._id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Inicializar Campos de Admin
                        </button>
                      ) : !user.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReject(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Revocar Aprobación
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron usuarios para el filtro seleccionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
