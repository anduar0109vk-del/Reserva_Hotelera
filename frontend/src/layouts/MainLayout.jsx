import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { Moon, Sun, LayoutDashboard, Users, CalendarDays, BedDouble, CreditCard, Briefcase } from 'lucide-react';

const MainLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen min-w-0 bg-[#edf2f3] text-[#263438] transition-colors dark:bg-[#172225] dark:text-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-[#d7e0e2] bg-[#f8fafb] md:flex dark:border-[#344447] dark:bg-[#202d30]">
        <div className="flex h-16 items-center gap-2 border-b border-[#d7e0e2] px-5 dark:border-[#344447]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm dark:bg-primary-500 dark:text-dark-bg">
            <Briefcase size={19} strokeWidth={2.5} />
          </div>
          <h1 className="truncate text-lg font-bold tracking-tight text-[#0f766e] dark:text-[#8adbd3]">Casa Andina</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center space-x-3 rounded-lg border-l-2 p-3 transition-colors ${isActive ? 'border-primary-600 bg-primary-100 text-primary-800 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300' : 'border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/employees" className={({ isActive }) => `flex items-center space-x-3 rounded-lg border-l-2 p-3 transition-colors ${isActive ? 'border-primary-600 bg-primary-100 text-primary-800 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300' : 'border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <Users size={20} />
            <span>Huéspedes</span>
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `flex items-center space-x-3 rounded-lg border-l-2 p-3 transition-colors ${isActive ? 'border-primary-600 bg-primary-100 text-primary-800 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300' : 'border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <CalendarDays size={20} />
            <span>Reservas</span>
          </NavLink>
          <NavLink to="/vacations" className={({ isActive }) => `flex items-center space-x-3 rounded-lg border-l-2 p-3 transition-colors ${isActive ? 'border-primary-600 bg-primary-100 text-primary-800 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300' : 'border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <BedDouble size={20} />
            <span>Habitaciones</span>
          </NavLink>
          <NavLink to="/complaints" className={({ isActive }) => `flex items-center space-x-3 rounded-lg border-l-2 p-3 transition-colors ${isActive ? 'border-primary-600 bg-primary-100 text-primary-800 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300' : 'border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            <CreditCard size={20} />
            <span>Pagos</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-[#d7e0e2] bg-white px-6 dark:border-[#344447] dark:bg-[#202d30]">
          <div className="text-lg font-semibold tracking-tight text-[#263438] dark:text-[#e5ecee]">Gestión hotelera</div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Alternar Modo Oscuro"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
            <button type="button" onClick={handleLogout} title="Cerrar sesión" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white transition-opacity hover:opacity-85">
              A
            </button>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
