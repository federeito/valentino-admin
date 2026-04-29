import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Settings() {
    const { data: session } = useSession();
    const router = useRouter();
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [bcc, setBcc] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    async function logout() {
        await router.push('/');
        await signOut();
    }

    async function handleSendEmail(e) {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, subject, body, bcc }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage('Email enviado correctamente.');
                setTo(''); setSubject(''); setBody(''); setBcc('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Error al enviar el email.');
            }
        } catch {
            setStatus('error');
            setMessage('Error de conexión.');
        }
    }

    if (session) {
        return <>
            <header>
                <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <div className="sm:flex sm:gap-4 my-4 flex gap-4 items-center">
                                <div class="h-10 w-10">
                                    <img class="h-full w-full rounded-full object-cover object-center" src={session.user.image} alt="" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 sm:text-3xl">{session.user.name}</h1>
                            </div>

                            <p className="mt-1.5 px-6 text-md text-gray-500 max-w-lg">
                                {session.user.email}
                            </p>

                        </div>

                        <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                            <button
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-600 px-5 py-3 text-red-700 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring"
                                onClick={logout}
                            >
                                <span className="text-md font-medium"> Cerrar Sesión </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-screen-2xl px-4 pb-10 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
                    <h2 className="text-xl font-semibold mb-1">Enviar Email a Clientes</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Desde: <span className="font-medium">contacto@valentinoaccesorios.com.ar</span>
                    </p>
                    <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Destinatario</label>
                            <input
                                type="text"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                required
                                placeholder="cliente1@ejemplo.com, cliente2@ejemplo.com"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">Podés ingresar múltiples direcciones separadas por coma.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">BCC</label>
                            <input
                                type="email"
                                value={bcc}
                                onChange={e => setBcc(e.target.value)}
                                placeholder="copia@ejemplo.com (opcional)"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Asunto</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                                placeholder="Asunto del email"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mensaje</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={6}
                                placeholder="Escribí tu mensaje aquí..."
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 self-start"
                        >
                            {status === 'loading' ? 'Enviando...' : 'Enviar Email'}
                        </button>
                        {status !== 'idle' && status !== 'loading' && (
                            <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </main>
        </>
    }
}