import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users?status=approved');
      const data = await response.json();
      
      if (data.success) {
        setClients(data.data || []);
      } else {
        toast.error(data.error || 'Error al obtener clientes');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error al obtener clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePriceViewing = async (userId, currentStatus) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, canViewPrices: !currentStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Acceso a precios actualizado');
        fetchClients();
      } else {
        toast.error(data.error || 'Error al actualizar acceso a precios');
      }
    } catch (error) {
      toast.error('Error al actualizar: ' + error.message);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.email?.toLowerCase().includes(searchLower) ||
      client.name?.toLowerCase().includes(searchLower) ||
      client.firstName?.toLowerCase().includes(searchLower) ||
      client.lastName?.toLowerCase().includes(searchLower) ||
      client.businessName?.toLowerCase().includes(searchLower) ||
      client.cuitcuil?.toLowerCase().includes(searchLower) ||
      client.shippingAddress?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Cargando clientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clientes Aprobados</h1>
          <p className="text-gray-600 mt-2">Gestionar información de clientes y permisos</p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Clientes</div>
            <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Con Acceso a Precios</div>
            <div className="text-2xl font-bold text-blue-600">
              {clients.filter(c => c.canViewPrices).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Sin Acceso a Precios</div>
            <div className="text-2xl font-bold text-gray-600">
              {clients.filter(c => !c.canViewPrices).length}
            </div>
          </div>
        </div>

        {/* Clients table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CUIT/CUIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección de Envío
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acceso a Precios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const fullName = client.firstName && client.lastName 
                    ? `${client.firstName} ${client.lastName}`
                    : client.name || 'N/A';
                  
                  return (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.businessName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.cuitcuil || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={client.shippingAddress}>
                          {client.shippingAddress || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePriceViewing(client._id, client.canViewPrices)}
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                            client.canViewPrices
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {client.canViewPrices ? '✓ Puede Ver Precios' : '✗ Sin Acceso'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {client._id?.slice(-8)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredClients.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? 'No se encontraron clientes que coincidan con la búsqueda.'
                : 'No hay clientes aprobados todavía.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
