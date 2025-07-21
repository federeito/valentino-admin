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
}) {
    const [redirect, setRedirect] = useState(false)
    const router = useRouter();

    const [Título, setTitle] = useState(existingTítulo || '');
    const [Descripción, setDescription] = useState(existingDescripción || '');
    const [Precio, setPrice] = useState(existingPrecio || '');
    const [Imagenes, setImages] = useState(existingImagenes || []);
    const [category, setCategory] = useState(existingCategoria || '');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get('/api/categories').then(response => {
            setCategories(response.data);
            if (existingCategoria) {
                setCategory(existingCategoria);
            }
        });
    }, [existingCategoria]);


    const [isUploading, setIsUploading] = useState(false);

    const uploadImagesQueue = [];

    async function createProduct(ev) {
        ev.preventDefault();

        if (isUploading) {
            await Promise.all(uploadImagesQueue)
        }
        const data = { Título, Descripción, Precio, Imagenes, Categoria: category };
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

    return <>
        <form onSubmit={createProduct} classname="mx-auto max-w-screen-sm">

            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Título</label>
                    <input type="text" id="example1" class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3" placeholder="Título del producto"
                        value={Título}
                        onChange={ev => setTitle(ev.target.value)}
                    />
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Seleccionar Categoria</label>
                    <select class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3"
                        value={category}
                        onChange={ev => setCategory(ev.target.value)}>

                        <option value="">Ninguna categoría seleccionada</option>
                        {categories.length > 0 && categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">

                <div class="mx-auto">
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Imagenes</label>
                    <label class="flex w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-blue-300 p-6 transition-all hover:border-primary-300">
                        <div class="space-y-1 text-center">
                            <div class="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-gray-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                </svg>
                            </div>
                            <div class="text-gray-600"><a href="#" class="font-medium text-primary-500 hover:text-primary-700">Click to upload</a> or drag and drop</div>
                            <p class="text-sm text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                        <input id="fileInput" type="file" className="hidden" accept="image/*"
                            multiple onChange={uploadImages} />
                    </label>
                </div>
            </div>

            <div className="flex justify-center items-center my-4">
                {isUploading && (
                    <Spinner className="p-4 absolute top-1/2 left 1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
            </div>


            {!isUploading && (
                <div className="mx-auto max-w-2xl my-4 flex justify-center">
                    <ReactSortable
                        list={Array.isArray(Imagenes) ? Imagenes : []}
                        setList={updateImagesOrder}
                        animation={200}
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mt-2 w-full"
                    >
                        {Array.isArray(Imagenes) && Imagenes.map((link, index) => (
                            <div key={link} className="relative group flex items-center justify-center h-24 w-24 border border-gray-300 rounded-md overflow-hidden">
                                <img src={link} alt="image" className="object-cover h-full w-full" />
                                <div className="absolute top-2 right-2 cursor-pointer group-hover:opacity-100 opacity-0
                            transition-opacity">
                                    <button onClick={() => handleDeleteImage(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>

                                    </button>
                                </div>
                            </div>
                        ))}
                    </ReactSortable>

                </div>
            )}

            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Descripción</label>
                    <textarea rows={5} type="text" id="example1" class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3" placeholder="Descripcion del producto"
                        value={Descripción}
                        onChange={ev => setDescription(ev.target.value)}
                    />
                </div>
            </div>
            <div class="mx-auto max-w-2xl my-4">
                <div>
                    <label for="example1" class="mb-1 block text-lg font-medium text-gray-700 py-1">Precio</label>
                    <input type="number" id="example1" class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 p-3" placeholder="Precio del producto"
                        value={Precio}
                        onChange={ev => setPrice(ev.target.value)}
                    />
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