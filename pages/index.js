import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
    const { data: session } = useSession()
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [imageCount, setImageCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const productsResponse = await axios.get('/api/products');
                setProducts(productsResponse.data);

                // Calcular el total de imágenes
                const totalImages = productsResponse.data.reduce((total, product) => {
                    return total + (product.Imagenes?.length || 0);
                }, 0);
                setImageCount(totalImages);

                const categoriesResponse = await axios.get('/api/categories');
                setCategories(categoriesResponse.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setLoading(false);
            }
        };

        if (session) {
            fetchStats();
        }
    }, [session]);
    
    if (session) {
        return <>
            <header>
                <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 sm:text-3xl">
                                Bienvendido de nuevo, <span className="text-green-700">{session.user.name}!</span>
                            </h1>
                            <p className="mt-1.5 text-md text-gray-500 max-w-lg">
                                Consulte las estadísticas sobre su empresa. También gestione y añada productos. 🎉
                            </p>
                        </div>
                        <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                            <Link className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring" href={"/products"}>
                                <span className="text-md font-medium"> Ver Productos </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                            <Link className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-200 px-5 py-3 text-green-500 transition hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring" href={"/admin/approvals"}>
                                <span className="text-md font-medium"> Ver Aprobaciones </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </Link>
                            <Link className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-200 px-5 py-3 text-orange-500 transition hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring" href={"https://valentino-frontend.vercel.app"}>
                                <span className="text-md font-medium"> Ver Tienda </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 px-4 sm:px-6 lg:px-8 mt-8">
                {/* Tarjeta para Productos */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-4">
                        <span className="shrink-0 rounded-full bg-blue-100 p-4 text-blue-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {loading ? 'Cargando...' : products.length}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Total de Productos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tarjeta para Categorías */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-4">
                        <span className="shrink-0 rounded-full bg-purple-100 p-4 text-purple-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 16h.01"></path></svg>
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {loading ? 'Cargando...' : categories.length}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Total de Categorías
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tarjeta para Imágenes */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-4">
                        <span className="shrink-0 rounded-full bg-orange-100 p-4 text-orange-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {loading ? 'Cargando...' : imageCount}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Total de Imágenes
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
    
    return <>
        <div className='flex flex-col items-center justify-center min-h-screen bg-orange-100'>
            <h1 className="text-4xl font-bold mb-4 text-center">Bienvenidos al panel de administracion</h1>
            <p className="font-medium my-4"> Se necesita una cuenta para acceder a este panel. </p>
            <button
                className="inline-block rounded-sm border border-blue-600 bg-indigo-600 px-12 py-3 text-md font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:ring-3 focus:outline-hidden"
                onClick={() => signIn('google')}>
                Iniciar Sesion con Google
            </button>
        </div>
    </>
}