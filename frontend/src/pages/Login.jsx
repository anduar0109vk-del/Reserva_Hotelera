import { useState } from 'react';
import { Briefcase, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [savedEmails, setSavedEmails] = useState(() => JSON.parse(localStorage.getItem('savedEmails') || '[]'));
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isRegistering ? 'register' : 'authenticate';
    const body = isRegistering ? { ...form, role: 'HOTEL_MANAGER' } : form;
    try {
      const response = await fetch(`${API_URL}/auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(isRegistering ? 'No se pudo crear la cuenta. El correo puede estar registrado.' : 'Correo o contraseña incorrectos.');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      if (!isRegistering && rememberEmail && form.email) {
        const emails = [...new Set([form.email, ...savedEmails])].slice(0, 5);
        localStorage.setItem('savedEmails', JSON.stringify(emails));
        setSavedEmails(emails);
      }
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf2f3] px-4 py-8 dark:bg-[#172225]">
      <section className="w-full max-w-md rounded-2xl border border-[#d7e0e2] bg-white p-7 shadow-xl dark:border-[#344447] dark:bg-[#202d30] sm:p-9">
        <div className="mb-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm"><Briefcase size={24} /></div><h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0f766e] dark:text-[#99f6e4]">Casa Andina</h1><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{isRegistering ? 'Crea una cuenta para gestionar el hotel' : 'Accede a la gestión de reservas del hotel'}</p></div>
        {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico{!isRegistering && savedEmails.length > 0 && <select aria-label="Correos guardados" value={savedEmails.includes(form.email) ? form.email : ''} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none dark:border-gray-600 dark:bg-[#172225] dark:text-white"><option value="">Seleccionar correo guardado</option>{savedEmails.map((email) => <option key={email} value={email}>{email}</option>)}</select>}<input required name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="rrhh@empresa.com" className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-[#172225] dark:text-white" /></label><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña<div className="relative mt-1.5"><input required name="password" type={showPassword ? 'text' : 'password'} minLength="6" value={form.password} onChange={updateField} autoComplete={isRegistering ? 'new-password' : 'current-password'} placeholder="Mínimo 6 caracteres" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 dark:border-gray-600 dark:bg-[#172225] dark:text-white" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-gray-700 dark:hover:text-primary-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>{!isRegistering && <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" checked={rememberEmail} onChange={(event) => setRememberEmail(event.target.checked)} className="h-4 w-4 accent-primary-600" />Recordar este correo</label>}<button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">{isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}{loading ? 'Procesando...' : isRegistering ? 'Crear cuenta RRHH' : 'Iniciar sesión'}</button></form>
        <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="mt-6 w-full text-center text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">{isRegistering ? 'Ya tengo una cuenta: iniciar sesión' : '¿Necesitas una cuenta? Registrarme como hotel'}</button>
      </section>
    </main>
  );
};

export default Login;
