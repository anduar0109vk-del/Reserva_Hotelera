import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Operations from './pages/Operations';
import Reservations from './pages/Reservations';
import Rooms from './pages/Rooms';
import MainLayout from './layouts/MainLayout';

const ProtectedRoute = ({ children }) => localStorage.getItem('token') ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Reservations />} />
            <Route path="vacations" element={<Rooms />} />
            <Route path="complaints" element={<Operations type="complaints" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
