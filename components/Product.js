import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
import toast from "react-hot-toast";

export default function Product({
    _id,
    Título: existingTítulo,
    Descripción: existingDescripción,
    Precio: existingPrecio,
    Imagenes: existingImagenes,
    Categoria: existingCategoria,
    stock: existingStock,
    colors: existingColors,
    código: existingCódigo,
}) {
    const [redirect, setRedirect] = useState(false)
    const router = useRouter();

    const [Título, setTitle] = useState(existingTítulo || '');
    const [Descripción, setDescription] = useState(existingDescripción || '');
    const [Precio, setPrice] = useState(existingPrecio || '');
    const [Imagenes, setImages] = useState(existingImagenes || []);
    const [category, setCategory] = useState(existingCategoria || '');
    const [categories, setCategories] = useState([]);
    const [stock, setStock] = useState(existingStock || 0);
    const [colors, setColors] = useState(existingColors || []);
    const [código, setCódigo] = useState(existingCódigo || '');
    const [newColorCode, setNewColorCode] = useState('#000000');
    const [newColorName, setNewColorName] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Add function to check for duplicate product codes
    const checkDuplicateCode = async (code) => {
        try {
            const response = await axios.get(`/api/products/check-code?code=${encodeURIComponent(code)}&excludeId=${_id || ''}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error checking duplicate code:', error);
            return false;
        }
    };

    useEffect(() => {
        axios.get('/api/categories').then(response => {
            setCategories(response.data);
            if (existingCategoria) {
                // Set the category ID, handling both string ID and object formats
                const categoryId = typeof existingCategoria === 'string' ? existingCategoria : existingCategoria._id;
                setCategory(categoryId);
            }
        });
    }, [existingCategoria]);

    const [isUploading, setIsUploading] = useState(false);

    const uploadImagesQueue = [];

    async function createProduct(ev) {
        ev.preventDefault();

        // 1. Lógica de validación
        const errors = {};
        if (!Título) errors.Título = 'El título es requerido.';
        if (!Descripción) errors.Descripción = 'La descripción es requerida.';
        if (!Precio) errors.Precio = 'El precio es requerido.';
        // Require código only for new products
        if (!código && !_id) {
            errors.código = 'El código es requerido para productos nuevos.';
        }
        if (stock === null || stock === undefined || stock === '') errors.stock = 'El stock es requerido.';
        if (Imagenes.length === 0) errors.Imagenes = 'Se requiere al menos una imagen.';
        if (!category) errors.category = 'La categoría es requerida.';

        // Check for duplicate product code if código is provided
        if (código) {
            try {
                const isDuplicate = await checkDuplicateCode(código);
                if (isDuplicate) {
                    errors.código = 'Este código de producto ya existe. Por favor, usa un código diferente.';
                }
            } catch (error) {
                console.error('Error checking duplicate code:', error);
                errors.código = 'Error al verificar el código. Inténtalo de nuevo.';
            }
        }

        // 2. Si hay errores, actualiza el estado y detiene la función
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            if (errors.código && errors.código.includes('ya existe')) {
                toast.error('Código duplicado: Este código ya está en uso.');
            } else {
                toast.error('Por favor, completa todos los campos requeridos.');
            }
            return;
        }

        // 3. Si no hay errores, limpia los errores y procede
        setFormErrors({});

        if (isUploading) {
            await Promise.all(uploadImagesQueue)
        }
        const data = { Título, Descripción, Precio, Imagenes, Categoria: category, stock, colors, código };
        
        if (_id) {
            await axios.put('/api/products', { ...data, _id });
            toast.success('Producto actualizado!')
        } else {
            await axios.post('/api/products', data);
            toast.success('Producto creado!')
        }
        setRedirect(true);
    };

    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true)
            for (const file of files) {
                const data = new FormData();
                data.append('file', file);

                uploadImagesQueue.push(
                    axios.post('/api/upload', data).then(res => {
                        setImages(oldImages => [...oldImages, ...res.data.links])
                    })
                )
            }
            await Promise.all(uploadImagesQueue)
            setIsUploading(false)
        } else {
            return ('No hay archivos seleccionados para cargar');
        }
    }

    if (redirect) {
        router.push('/products');
        return null;
    }


    function updateImagesOrder(Imagenes) {
        setImages(Imagenes);
    }

    function handleDeleteImage(index) {
        const updateImages = [...Imagenes];
        updateImages.splice(index, 1);
        setImages(updateImages);
    }

    function addColor() {
        if (newColorName && newColorCode) {
            setColors(prev => [...prev, { name: newColorName, code: newColorCode }]);
            setNewColorName('');
            setNewColorCode('#000000');
        }
    }

    function removeColor(colorToRemove) {
        setColors(prev => prev.filter(color => color.code !== colorToRemove.code));
    }


    return <>
        <form onSubmit={createProduct} className="mx-auto max-w-screen-sm">
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Título</label>
                    <input type="text" id="example1" class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3" placeholder="Título del producto" value={Título} onChange={ev => setTitle(ev.target.value)} />
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label class="mb-1 block text-lg font-medium text-gray-700 py-1">Código del Producto</label>
                    <input 
                        type="text" 
                        class={`block w-full rounded-md border ${formErrors.código ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3`}
                        placeholder="Código del producto" 
                        value={código} 
                        onChange={ev => setCódigo(ev.target.value)} 
                    />
                    {formErrors.código && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.código}</p>
                    )}
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Descripción</label>
                    <textarea class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3" placeholder="Descripción del producto" value={Descripción} onChange={ev => setDescription(ev.target.value)}></textarea>
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Precio</label>
                    <input type="number" id="example1" class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3" placeholder="Precio del producto" value={Precio} onChange={ev => setPrice(ev.target.value)} />
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Categoría</label>
                    <select
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3"
                        value={category}
                        onChange={ev => setCategory(ev.target.value)}
                    >
                        <option value={""}>Sin Categoría</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mx-auto max-w-2xl my-4">
                <div>
                    <label className="mb-1 block text-lg font-medium text-gray-700 py-1">
                        Stock
                    </label>
                    <input
                        type="number"
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3"
                        placeholder="Stock del producto"
                        value={stock}
                        onChange={(ev) => setStock(Number(ev.target.value))}
                    />
                </div>
            </div>
            <div className="mx-auto max-w-2xl my-4">
                <label className="mb-1 block text-lg font-medium text-gray-700 py-1">
                    Colores
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="Nombre del Color"
                        value={newColorName}
                        onChange={ev => setNewColorName(ev.target.value)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3"
                    />
                    <input
                        type="color"
                        value={newColorCode}
                        onChange={ev => setNewColorCode(ev.target.value)}
                        className="w-12 h-12"
                    />
                    <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-2 bg-gray-200 rounded-md"
                    >
                        Agregar
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <div
                                onClick={() => removeColor(color)}
                                className="w-8 h-8 rounded-full cursor-pointer border border-gray-200 flex items-center justify-center"
                                style={{ backgroundColor: color.code }}
                                title={color.name}
                            >
                                <span className="text-white text-sm opacity-0 hover:opacity-100">×</span>
                            </div>
                            <span className="text-sm">{color.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <label className="mb-1 block text-lg font-medium text-gray-700 py-1">Imágenes</label>
                <div className="mb-2 flex flex-wrap gap-2">
                    <ReactSortable
                        list={Imagenes}
                        setList={updateImagesOrder}
                        className="flex flex-wrap gap-2"
                    >
                        {!!Imagenes?.length && Imagenes.map((link, index) => (
                            <div key={index} className="relative h-24 bg-white p-4 shadow-sm border border-gray-200 rounded-lg cursor-grab">
                                <img src={link} alt="product image" className="h-full rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </ReactSortable>
                    {isUploading && (
                        <div className="h-24 p-1 flex items-center">
                            <Spinner />
                        </div>
                    )}
                    <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <div>Subir</div>
                        <input type="file" onChange={uploadImages} className="hidden" multiple accept="image/*" />
                    </label>
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <button
                    className="inline-block rounded-sm border border-green-600 px-12 py-3 text-sm font-medium text-green-600 hover:bg-green-600 hover:text-white focus:ring-3 focus:outline-hidden w-full"
                    type="submit"
                >
                    Guardar Producto
                </button>
            </div>
        </form>
    </>
}