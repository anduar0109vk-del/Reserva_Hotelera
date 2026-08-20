import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Mail, Plus, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { apiFetch } from '../api';

const emptyForm = { firstName: '', lastName: '', email: '', position: '', department: '', salary: '', hireDate: '', status: 'Activo' };

const formatDate = (date) => date ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`)) : '-';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/employees')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudieron cargar los empleados.');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEmployees(data);
          setError('');
        }
      })
      .catch((loadError) => {
        if (!cancelled) setError(`${loadError.message} Comprueba que el backend esté iniciado.`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName} ${employee.position} ${employee.department}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) && (status === 'Todos' || employee.status === status);
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await apiFetch('/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, salary: Number(form.salary) }) });
      if (!response.ok) throw new Error('No se pudo guardar el empleado.');
      const createdEmployee = await response.json();
      setEmployees((current) => [...current, createdEmployee]);
      setForm(emptyForm);
      setIsFormOpen(false);
      setError('');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const exportRows = () => filteredEmployees.map((employee) => ({
    Huésped: `${employee.firstName} ${employee.lastName}`,
    Correo: employee.email,
    Cargo: employee.position,
    Área: employee.department,
    Ingreso: employee.hireDate || '-',
    Estado: employee.status,
    Salario: employee.salary ?? '-',
  }));

  const exportEmployeesCsv = () => {
    const rows = exportRows();
    const header = Object.keys(rows[0]);
    const values = rows.map((row) => header.map((column) => row[column]));
    const csv = [header, ...values].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'huespedes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportEmployeesExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows());
    worksheet['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 24 }, { wch: 18 }, { wch: 15 }, { wch: 14 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Huéspedes');
    XLSX.writeFile(workbook, 'huespedes.xlsx');
  };

  const exportEmployeesPdf = () => {
    const rows = exportRows();
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const columns = ['Nombre', 'Correo', 'Cargo', 'Área', 'Ingreso', 'Estado', 'Salario'];
    const widths = [38, 55, 42, 30, 28, 25, 25];
    pdf.setFontSize(16);
    pdf.text('Listado de huéspedes - Casa Andina', 14, 16);
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')} | Registros: ${rows.length}`, 14, 22);
    let y = 31;
    const drawRow = (values, header = false) => {
      let x = 14;
      pdf.setFillColor(header ? 13 : 255, header ? 148 : 255, header ? 136 : 255);
      pdf.setTextColor(header ? 255 : 35);
      pdf.rect(14, y - 5, widths.reduce((total, width) => total + width, 0), 8, header ? 'F' : 'S');
      values.forEach((value, index) => { pdf.text(String(value ?? '-').slice(0, 28), x + 2, y); x += widths[index]; });
      y += 8;
    };
    drawRow(columns, true);
    rows.forEach((row) => {
      if (y > 190) { pdf.addPage('a4', 'landscape'); y = 16; drawRow(columns, true); }
      drawRow(columns.map((column) => row[column]));
    });
    pdf.save('huespedes.pdf');
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Casa Andina</p><h2 className="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Huéspedes</h2><p className="mt-1 text-gray-500 dark:text-gray-400">Registro de huéspedes y datos de contacto del hotel.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={exportEmployeesCsv} disabled={!filteredEmployees.length} title="Descargar CSV" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-dark-surface dark:text-gray-200 dark:hover:bg-gray-800"><Download size={17} /> CSV</button><button type="button" onClick={exportEmployeesExcel} disabled={!filteredEmployees.length} title="Descargar Excel" className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"><FileSpreadsheet size={17} /> Excel</button><button type="button" onClick={exportEmployeesPdf} disabled={!filteredEmployees.length} title="Descargar PDF" className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><FileText size={17} /> PDF</button><button type="button" onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"><Plus size={17} /> Nuevo huésped</button></div>
      </div>

      {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Cerrar mensaje"><X size={17} /></button></div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-surface"><p className="text-sm text-gray-500 dark:text-gray-400">Total empleados</p><p className="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-100">{employees.length}</p></div><div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-surface"><p className="text-sm text-gray-500 dark:text-gray-400">Activos</p><p className="mt-1 text-2xl font-bold text-green-600">{employees.filter((employee) => employee.status === 'Activo').length}</p></div><div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-surface"><p className="text-sm text-gray-500 dark:text-gray-400">Registros visibles</p><p className="mt-1 text-2xl font-bold text-primary-600">{filteredEmployees.length}</p></div></div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-dark-surface"><div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between"><div className="relative w-full md:max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, cargo o área" className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-dark-bg dark:text-white" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-500 dark:border-gray-700 dark:bg-dark-bg dark:text-gray-200 md:w-auto"><option>Todos</option><option>Activo</option><option>Ausente</option></select></div>{loading ? <div className="p-12 text-center text-gray-500 dark:text-gray-400">Cargando empleados...</div> : filteredEmployees.length ? <div className="max-w-full overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400"><tr><th className="px-5 py-3 font-semibold">Empleado</th><th className="px-5 py-3 font-semibold">Cargo</th><th className="px-5 py-3 font-semibold">Área</th><th className="px-5 py-3 font-semibold">Ingreso</th><th className="px-5 py-3 font-semibold">Estado</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{filteredEmployees.map((employee) => { const name = `${employee.firstName} ${employee.lastName}`; return <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40"><td className="px-5 py-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{employee.firstName?.[0]}{employee.lastName?.[0]}</div><div className="min-w-0"><p className="truncate font-semibold text-gray-800 dark:text-gray-100">{name}</p><p className="flex items-center gap-1 truncate text-xs text-gray-500"><Mail size={12} />{employee.email}</p></div></div></td><td className="px-5 py-4 text-gray-600 dark:text-gray-300">{employee.position}</td><td className="px-5 py-4 text-gray-600 dark:text-gray-300">{employee.department}</td><td className="px-5 py-4 text-gray-600 dark:text-gray-300">{formatDate(employee.hireDate)}</td><td className="px-5 py-4"><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">{employee.status}</span></td></tr>; })}</tbody></table></div> : <div className="p-12 text-center text-gray-500 dark:text-gray-400">No hay empleados que coincidan con la búsqueda.</div>}</section>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4"><form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-dark-surface"><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Nuevo empleado</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">El registro se guardará en la base de datos.</p></div><button type="button" onClick={() => setIsFormOpen(false)} aria-label="Cerrar formulario" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button></div><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">{[['firstName', 'Nombre', 'text'], ['lastName', 'Apellido', 'text'], ['email', 'Correo electrónico', 'email'], ['position', 'Cargo', 'text'], ['department', 'Área', 'text'], ['salary', 'Salario', 'number'], ['hireDate', 'Fecha de ingreso', 'date']].map(([name, label, type]) => <label key={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}<input required={name !== 'salary'} type={type} min={type === 'number' ? '0' : undefined} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-dark-bg dark:text-white" /></label>)}<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-dark-bg dark:text-white"><option>Activo</option><option>Ausente</option></select></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">Cancelar</button><button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar empleado'}</button></div></form></div>}
    </div>
  );
};

export default Employees;
