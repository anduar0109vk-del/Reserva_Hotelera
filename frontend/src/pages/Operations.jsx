import { useEffect, useState } from 'react';
import { BedDouble, CalendarDays, CreditCard, Plus, X } from 'lucide-react';
import { apiFetch } from '../api';

const configs = {
  attendance: { title: 'Reservas', eyebrow: 'Estadías', description: 'Controla las reservas y fechas de llegada y salida.', icon: CalendarDays, endpoint: 'attendance', columns: ['Huésped', 'Llegada', 'Entrada', 'Salida', 'Estado'] },
  vacations: { title: 'Habitaciones', eyebrow: 'Inventario hotelero', description: 'Consulta la disponibilidad y ocupación de habitaciones.', icon: BedDouble, endpoint: 'vacations', columns: ['Huésped', 'Periodo', 'Noches', 'Solicitud', 'Estado'] },
  complaints: { title: 'Pagos', eyebrow: 'Control financiero', description: 'Da seguimiento a cobros, pagos pendientes y comprobantes.', icon: CreditCard, endpoint: 'complaints', columns: ['Pago', 'Huésped', 'Habitación', 'Fecha', 'Estado'] },
};

const initialForm = { employeeId: '', date: '', checkIn: '', checkOut: '', status: 'Presente', startDate: '', endDate: '', title: '', description: '' };
const employeeName = (employee) => employee ? `${employee.firstName} ${employee.lastName}` : 'Empleado no disponible';
const dateText = (value) => value ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-';
const displayStatus = (value) => value === 'PENDING' ? 'Pendiente' : value === 'RESOLVED' ? 'Resuelto' : value;
const statusClass = (value) => ['Presente', 'Aprobada', 'Resuelto'].includes(displayStatus(value)) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : displayStatus(value) === 'Ausente' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';

const Operations = ({ type }) => {
  const config = configs[type] || configs.attendance;
  const Icon = config.icon;
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch(`/${config.endpoint}`).then((response) => response.json()), apiFetch('/employees').then((response) => response.json())])
      .then(([recordData, employeeData]) => {
        if (!cancelled) {
          setRecords(recordData);
          setEmployees(employeeData);
          setForm((current) => ({ ...current, employeeId: employeeData[0]?.id?.toString() || '' }));
        }
      })
      .catch(() => { if (!cancelled) setError('No se pudieron cargar los datos. Comprueba que el backend esté iniciado.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [config.endpoint]);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const openForm = () => { setError(''); setForm({ ...initialForm, employeeId: employees[0]?.id?.toString() || '', date: new Date().toISOString().slice(0, 10), startDate: new Date().toISOString().slice(0, 10) }); setIsFormOpen(true); };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = type === 'attendance' ? { employeeId: form.employeeId, date: form.date, checkIn: form.checkIn, checkOut: form.checkOut, status: form.status } : type === 'vacations' ? { employeeId: form.employeeId, startDate: form.startDate, endDate: form.endDate } : { employeeId: form.employeeId, title: form.title, description: form.description };
    try {
      const response = await apiFetch(`/${config.endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(await response.text() || 'No se pudo guardar el registro.');
      const createdRecord = await response.json();
      setRecords((current) => [...current, createdRecord]);
      setIsFormOpen(false);
      setError('');
    } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  };

  const rowFor = (record) => {
    const name = employeeName(record.employee);
    if (type === 'attendance') return [name, dateText(record.date), record.checkIn || '-', record.checkOut || '-', record.status];
    if (type === 'vacations') { const days = Math.floor((new Date(record.endDate) - new Date(record.startDate)) / 86400000) + 1; return [name, `${dateText(record.startDate)} - ${dateText(record.endDate)}`, days, dateText(record.requestedAt), record.status]; }
    return [`#${record.id}`, name, record.employee?.department || '-', dateText(record.createdAt?.slice(0, 10)), displayStatus(record.status)];
  };

  const rows = records.map(rowFor);
  const stats = type === 'attendance' ? [['Presentes', records.filter((record) => record.status === 'Presente').length, 'text-green-600'], ['Ausentes', records.filter((record) => record.status === 'Ausente').length, 'text-red-500'], ['Registros', records.length, 'text-primary-600']] : type === 'vacations' ? [['Solicitudes', records.length, 'text-primary-600'], ['Por aprobar', records.filter((record) => record.status === 'Pendiente').length, 'text-yellow-600'], ['Aprobadas', records.filter((record) => record.status === 'Aprobada').length, 'text-green-600']] : [['Total casos', records.length, 'text-gray-700 dark:text-gray-200'], ['Pendientes', records.filter((record) => ['Pendiente', 'PENDING'].includes(record.status)).length, 'text-orange-600'], ['Resueltos', records.filter((record) => ['Resuelto', 'RESOLVED'].includes(record.status)).length, 'text-green-600']];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">{config.eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-100">{config.title}</h2><p className="mt-1 text-gray-500 dark:text-gray-400">{config.description} Los datos provienen de tu base de datos.</p></div><button type="button" onClick={openForm} disabled={!employees.length} className="inline-flex items-center gap-2 self-start rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} /> Nuevo registro</button></div>
      {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Cerrar mensaje"><X size={17} /></button></div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{stats.map(([label, value, color]) => <div key={label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-surface"><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>)}</div>
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-dark-surface"><div className="flex items-center gap-2 border-b border-gray-100 p-4 dark:border-gray-800"><Icon size={19} className="text-primary-600" /><h3 className="font-semibold text-gray-800 dark:text-gray-100">Registro guardado</h3></div>{loading ? <div className="p-12 text-center text-gray-500 dark:text-gray-400">Cargando datos...</div> : rows.length ? <div className="max-w-full overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400"><tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{rows.map((row) => <tr key={row.join('-')} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">{row.map((cell, index) => <td key={`${cell}-${index}`} className="px-5 py-4 text-gray-600 dark:text-gray-300">{index === row.length - 1 ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(cell)}`}>{cell}</span> : index === 0 ? <span className="font-semibold text-gray-800 dark:text-gray-100">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div> : <div className="p-12 text-center text-gray-500 dark:text-gray-400">Todavía no hay registros guardados.</div>}</section>
      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4"><form onSubmit={submitForm} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-dark-surface"><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Nuevo registro de {config.title.toLowerCase()}</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Se guardará en la base de datos.</p></div><button type="button" onClick={() => setIsFormOpen(false)} aria-label="Cerrar formulario" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button></div><label className="mt-6 block text-sm font-medium text-gray-700 dark:text-gray-300">Empleado<select required name="employeeId" value={form.employeeId} onChange={updateField} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-dark-bg dark:text-white">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employeeName(employee)}</option>)}</select></label>{type === 'attendance' && <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><Field name="date" label="Fecha" type="date" value={form.date} onChange={updateField} required /><Field name="checkIn" label="Entrada" type="time" value={form.checkIn} onChange={updateField} /><Field name="checkOut" label="Salida" type="time" value={form.checkOut} onChange={updateField} /><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado<select name="status" value={form.status} onChange={updateField} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-dark-bg dark:text-white"><option>Presente</option><option>Ausente</option></select></label></div>}{type === 'vacations' && <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><Field name="startDate" label="Inicio" type="date" value={form.startDate} onChange={updateField} required /><Field name="endDate" label="Fin" type="date" value={form.endDate} onChange={updateField} required /></div>}{type === 'complaints' && <div className="mt-4 space-y-4"><Field name="title" label="Título" value={form.title} onChange={updateField} required /><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción<textarea required name="description" value={form.description} onChange={updateField} rows="4" className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-dark-bg dark:text-white" /></label></div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">Cancelar</button><button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar registro'}</button></div></form></div>}
    </div>
  );
};

const Field = ({ name, label, type = 'text', value, onChange, required = false }) => <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}<input required={required} name={name} type={type} value={value} onChange={onChange} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-dark-bg dark:text-white" /></label>;

export default Operations;
