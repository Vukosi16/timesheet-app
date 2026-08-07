import './App.css'
import LoginPage from './pages/LoginPage'
import { useAuth } from './context/authContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import CoachDashboardPage from './pages/CoachDashboardPage'
import { Route, Routes } from 'react-router-dom'

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path="/coach" element={<CoachDashboardPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
    </Routes>
  );
}

export default App
