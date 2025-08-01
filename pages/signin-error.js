import { useRouter } from 'next/router';
import Link from 'next/link'

export default function SignInError() {
  const router = useRouter();
  const { error } = router.query;

  let errorMessage = 'An unknown error occurred.';

  if (error === 'AccessDenied') {
    errorMessage = 'Acceso Denegado: Su cuenta no tiene permiso para ingresar a este panel de administración.';
  } else if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'La cuenta de Google ya está vinculada a otro usuario. Por favor, use la cuenta original o intente otra.';
  }
  // Add more custom messages for other error types if needed

  return (
    <div className="grid h-screen px-4 bg-white place-content-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          ¡Ups!
        </h1>
        <p className="mt-4 text-gray-500">
          {errorMessage}
        </p>

        {/* Button to return to the Home page */}
        <Link href="/">
          <button
            className="mt-6 inline-block rounded bg-red-500 px-5 py-3 text-sm font-medium text-white hover:bg-gray-400 focus:ring focus:outline-none mr-2"
          // You might want to adjust the styling to match your site's theme
          >
            Regresar al Inicio
          </button>
        </Link>
      </div>
    </div>
  );
}