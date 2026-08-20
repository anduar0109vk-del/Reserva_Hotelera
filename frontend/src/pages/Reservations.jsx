import { useEffect, useState } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { apiFetch } from '../api';

const emptyForm = { guestId: '', roomId: '', checkIn: '', checkOut: '', notes: '' };
const formatDate = (value) => value ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-';
const guestName = (guest) => `${guest.firstName} ${guest.lastName}`;

const Reservations = () => {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => Promise.all([apiFetch('/hotel/guests'), apiFetch('/hotel/rooms'), apiFetch('/hotel/reservations')]).then(async ([guestResponse, roomResponse, reservationResponse]) => {
    if (!guestResponse.ok || !roomResponse.ok || !reservationResponse.ok) throw new Error('No se pudo cargar la información del hotel.');
    const [guestData, roomData, reservationData] = await Promise.all([guestResponse.json(), roomResponse.json(), reservationResponse.json()]);
    setGuests(guestData); setRooms(roomData); setReservations(reservationData);
    setForm((current) => ({ ...current, guestId: current.guestId || guestData[0]?.id || '', roomId: current.roomId || roomData[0]?.id || '' }));
  });

  useEffect(() => { load().catch((loadError) => setError(loadError.message)).finally(() => setLoading(false)); }, []);

  const saveReservation = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await apiFetch('/hotel/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error(await response.text() || 'No se pudo crear la reserva.');
      const reservation = await response.json(); setReservations((current) => [...current, reservation]); setOpen(false); setForm(emptyForm);
    } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  };

  const cancel = async (id) => { const response = await apiFetch(`/hotel/reservations/${id}/cancel`, { method: 'PUT' }); if (response.ok) setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, status: 'CANCELLED' } : reservation)); };

  return <div className="mx-auto w-full max-w-[1600px] space-y-6"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Casa Andina</p><h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Reservas</h2><p className="mt-1 text-gray-500 dark:text-gray-400">Gestiona estadías, habitaciones y disponibilidad.</p></div><button type="button" disabled={!guests.length || !rooms.length} onClick={() => { setForm({ ...emptyForm, guestId: guests[0]?.id || '', roomId: rooms[0]?.id || '' }); setOpen(true); }} className="inline-flex items-center gap-2 self-start rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50"><Plus size={17} /> Nueva reserva</button></div>{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Metric label="Reservas" value={reservations.length} /><Metric label="Confirmadas" value={reservations.filter((reservation) => reservation.status === 'CONFIRMED').length} /><Metric label="Habitaciones" value={rooms.length} /></div><section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#202d30]"><div className="flex items-center gap-2 border-b border-gray-100 p-4 dark:border-gray-800"><CalendarDays size={19} className="text-primary-600" /><h3 className="font-semibold text-gray-800 dark:text-gray-100">Reservas registradas</h3></div>{loading ? <p className="p-10 text-center text-gray-500">Cargando...</p> : reservations.length ? <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Huésped', 'Habitación', 'Tipo', 'Entrada', 'Salida', 'Total', 'Estado', ''].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{reservations.map((reservation) => <tr key={reservation.id}><td className="px-5 py-4 font-semibold">{guestName(reservation.guest)}</td><td className="px-5 py-4">{reservation.room.number}</td><td className="px-5 py-4">{reservation.room.type}</td><td className="px-5 py-4">{formatDate(reservation.checkIn)}</td><td className="px-5 py-4">{formatDate(reservation.checkOut)}</td><td className="px-5 py-4">S/ {reservation.totalAmount}</td><td className="px-5 py-4"><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">{reservation.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}</span></td><td className="px-5 py-4 text-right">{reservation.status !== 'CANCELLED' && <button type="button" onClick={() => cancel(reservation.id)} className="text-xs font-semibold text-red-600 hover:underline">Cancelar</button>}</td></tr>)}</tbody></table></div> : <p className="p-10 text-center text-gray-500">Todavía no hay reservas. Registra una nueva para comenzar.</p>}</section>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={saveReservation} className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-[#202d30]"><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold">Nueva reserva</h3><p className="text-sm text-gray-500">La habitación se validará automáticamente.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar"><X /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Huésped"><select required value={form.guestId} onChange={(event) => setForm({ ...form, guestId: event.target.value })}>{guests.map((guest) => <option key={guest.id} value={guest.id}>{guestName(guest)}</option>)}</select></Field><Field label="Habitación"><select required value={form.roomId} onChange={(event) => setForm({ ...form, roomId: event.target.value })}>{rooms.map((room) => <option key={room.id} value={room.id}>{room.number} · {room.type} · S/ {room.pricePerNight}</option>)}</select></Field><Field label="Fecha de entrada"><input required type="date" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} /></Field><Field label="Fecha de salida"><input required type="date" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} /></Field></div><label className="mt-4 block text-sm font-medium">Notas<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows="3" className="mt-1 w-full rounded-lg border border-gray-300 p-3" /></label><button type="submit" disabled={saving} className="mt-5 w-full rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white">{saving ? 'Guardando...' : 'Confirmar reserva'}</button></form></div>}</div>;
};

const Metric = ({ label, value }) => <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#202d30]"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
const Field = ({ label, children }) => <label className="text-sm font-medium">{label}{children.type === 'select' ? <div className="mt-1 [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-gray-300 [&>select]:bg-white [&>select]:p-3">{children}</div> : <div className="mt-1 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-gray-300 [&>input]:p-3">{children}</div>}</label>;

export default Reservations;
