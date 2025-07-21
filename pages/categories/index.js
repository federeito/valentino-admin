import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Categories() {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [editedCategory, setEditedCategory] = useState(null);
  const router = useRouter(); // Initialize router for redirection

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    });
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    const data = { name };
    if (editedCategory) {
      // Update existing category
      await axios.put('/api/categories', { ...data, _id: editedCategory._id });
      setEditedCategory(null); // Clear edited category after update
    } else {
      // Create new category
      await axios.post('/api/categories', data);
    }
    setName(''); // Clear input field
    fetchCategories(); // Refresh list
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name); // Populate form with category name
  }

  async function deleteCategory(id) {
    // You might want a confirmation dialog here
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (confirmed) {
      await axios.delete('/api/categories?id=' + id);
      fetchCategories(); // Refresh list
    }
  }

  function cancelEdit() {
    setEditedCategory(null);
    setName('');
  }

  return (
    <>
      <header>
        <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-3xl">Categorias</h1>
              <p className="mt-1.5 text-md text-gray-500 max-w-lg">Gestione aquí sus categorías de productos!</p>
            </div>
          </div>
        </div>
      </header>

      <hr className="my-1 h-px border-0 bg-gray-300" />

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <form onSubmit={saveCategory} className="mb-8">
          <label className="block text-sm font-medium text-gray-700">
            {editedCategory ? `Edit Category ${editedCategory.name}` : 'Nuevo nombre de categoría'}
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={ev => setName(ev.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {editedCategory ? 'Actualizar' : 'Guardar'}
            </button>
            {editedCategory && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Categorías Existentes</h2>

        {categories.length === 0 ? (
          <p>No se han encontrado categorías.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de la categoría
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map(category => (
                  <tr key={category._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => editCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCategory(category._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}