import { useEffect, useState } from 'react';
import { BedDouble, CalendarCheck, CreditCard, Users } from 'lucide-react';
import { apiFetch } from '../api';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#202d30]">
    <div className={`shrink-0 rounded-xl p-3 ${color}`}><Icon size={22} className="text-white" /></div>
    <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p><h3 className="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</h3></div>
  </div>
);

const fullName = (employee) => employee ? `${employee.firstName} ${employee.lastName}` : 'Huésped';
const dateText = (value) => value ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '';

const Dashboard = () => {
  const [data, setData] = useState({ guests: [], rooms: [], reservations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all(['guests', 'rooms', 'reservations'].map((resource) => apiFetch(`/hotel/${resource}`).then((response) => {
      if (!response.ok) throw new Error('No se pudieron cargar las métricas.');
      return response.json();
    }))).then(([guests, rooms, reservations]) => {
      if (!cancelled) setData({ guests, rooms, reservations });
    }).catch((loadError) => {
      if (!cancelled) setError(`${loadError.message} Comprueba que el backend esté iniciado.`);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayReservations = data.reservations.filter((record) => record.checkIn <= today && record.checkOut > today && record.status !== 'CANCELLED');
  const occupancyValue = data.rooms.length ? `${Math.round((todayReservations.length / data.rooms.length) * 100)}%` : 'Sin datos';
  const activeReservations = data.reservations.filter((record) => record.status === 'CONFIRMED').length;
  const pendingPayments = data.reservations.filter((record) => record.status === 'PENDING_PAYMENT').length;
  const activities = [
    ...data.reservations.map((record) => ({ date: record.checkIn, text: `${fullName(record.guest)} reservó la habitación ${record.room.number} hasta el ${dateText(record.checkOut)}.`, color: 'bg-green-500' })),
  ].filter((activity) => activity.date).sort((first, second) => second.date.localeCompare(first.date)).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Casa Andina</p><h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Resumen del hotel</h2><p className="mt-1 text-gray-500 dark:text-gray-400">Control de reservas, huéspedes, habitaciones y pagos.</p></div>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Huéspedes registrados" value={loading ? '...' : data.guests.length} icon={Users} color="bg-primary-600" /><StatCard title="Ocupación de hoy" value={loading ? '...' : occupancyValue} icon={BedDouble} color="bg-green-600" /><StatCard title="Reservas activas" value={loading ? '...' : activeReservations} icon={CalendarCheck} color="bg-amber-500" /><StatCard title="Pagos pendientes" value={loading ? '...' : pendingPayments} icon={CreditCard} color="bg-orange-500" /></div>
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#202d30]"><div className="flex items-center justify-between gap-4"><div><h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Actividad reciente</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Últimos movimientos registrados.</p></div><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{activities.length} registros</span></div>{loading ? <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Cargando actividad...</p> : activities.length ? <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">{activities.map((activity, index) => <div key={`${activity.date}-${index}`} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activity.color}`} /><div><p className="text-sm text-gray-700 dark:text-gray-300">{activity.text}</p><p className="mt-1 text-xs text-gray-400">{dateText(activity.date)}</p></div></div>)}</div> : <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Todavía no hay actividad registrada.</div>}</section>
    </div>
  );
};

export default Dashboard;
