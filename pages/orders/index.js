import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/order').then((response) => {
      setOrders(response.data);
    });
  }, []);
  
  // Función para calcular el total de una orden
  const calculateTotal = (lineItems) => {
    return lineItems.reduce((total, item) => {
      // Los precios vienen en centavos, los dividimos por 100
      const price = item.unit_price || item.price_data?.unit_amount;
      if (price) {
        return total + (price / 100) * item.quantity;
      }
      return total;
    }, 0);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No hay pedidos registrados.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-4">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-900">
                    Pedido #{order._id.substring(order._id.length - 6)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(order.createdAt), 'PPPPpp', { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Total: <span className="text-green-600">${calculateTotal(order.line_items).toFixed(2)}</span>
                  </h3>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.paid ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-gray-700">Información del Cliente</h4>
                  <p className="mt-2 text-gray-600"><span className="font-medium">Nombre:</span> {order.name}</p>
                  <p className="text-gray-600"><span className="font-medium">Correo:</span> {order.email}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700">Dirección de Envío</h4>
                  <p className="mt-2 text-gray-600">{order.address}</p>
                  <p className="text-gray-600">{order.city}, {order.state} {order.zip}</p>
                  <p className="text-gray-600">{order.country}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700">Información de Pago</h4>
                  <p className="mt-2 text-gray-600">
                    <span className="font-medium">Método:</span> {order.paymentMethod || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.line_items &&
                      order.line_items.map((item, index) => {
                        const unitPrice = (item.unit_price || item.price_data?.unit_amount) / 100;
                        const subtotal = unitPrice * item.quantity;
                        return (
                          <tr key={item.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.originalTitle || item.title || item.price_data?.product_data?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.color?.title || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.código || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${unitPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subtotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;