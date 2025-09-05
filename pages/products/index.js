import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [])
  return <>
    <header>
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-3xl">Todos los Productos</h1>

            <p className="mt-1.5 text-md text-gray-500 max-w-lg">
              Vamos a crear un nuevo producto! 🎉
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
            <Link
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-600 px-5 py-3 text-green-700 transition hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring"
              href={"/products/new"}
            >
              <span className="text-md font-medium"> Crear Productos </span>

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

            </Link>
          </div>
        </div>
      </div>
    </header>


    <hr class="my-1 h-px border-0 bg-gray-300" />

    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      {products.length === 0 ? (
        <p>No hay productos</p>
      ) : (


        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Imagen</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Nombre</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Código</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Descripción</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Precio</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Categoría</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Stock</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900">Colores</th>
                <th scope="col" className="px-6 py-4 font-medium text-gray-900"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr className="divide-y divide-gray-100 border-t border-gray-100" key={product._id}>
                  {/* Celda para la Imagen */}
                  <td className="px-6 py-4">
                    {product.Imagenes && product.Imagenes.length > 0 && (
                      <img
                        src={product.Imagenes[0]}
                        alt={product.Título}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    )}
                  </td>

                  {/* Celda para el Nombre */}
                  <td className="px-6 py-4 font-medium text-gray-900">{product.Título}</td>

                  {/* Celda para el Código */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.código || 'Sin código'}
                  </td>

                  {/* Celda para la Descripción */}
                  <td className="px-6 py-4 truncate max-w-xs">{product.Descripción}</td>

                  {/* Celda para el Precio */}
                  <td className="px-6 py-4">{formatPrice(product.Precio)}</td>

                  {/* Celda para la Categoría */}
                  <td className="px-6 py-4">
                    {product.Categoria ? product.Categoria.name : 'Uncategorized'}
                  </td>

                  {/* Celda para el Stock */}
                  <td className="px-6 py-4">
                    {product.stock > 0 ? product.stock : 'Sin Stock'}
                  </td>

                  {/* Celda para los Colores */}
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {product.colors?.map((color, index) => (
                        <div
                          key={index} // It's better to use a unique key if possible, but index is okay here
                          className="w-6 h-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: color.code }}
                          title={color.name}
                        ></div>
                      ))}
                    </div>
                  </td>

                  {/* Celda para las Acciones */}
                  <td className="flex justify-end gap-4 px-6 py-9 font-medium">
                    <Link href={"/products/delete/" + product._id} className="text-red-700">Delete</Link>
                    <Link href={"/products/edit/" + product._id} className="text-green-700">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
}