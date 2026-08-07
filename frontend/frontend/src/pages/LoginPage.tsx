import { useState } from 'react';
import { login } from '../lib/api';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { refetchUser } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      const user = await refetchUser();

      if (user?.role === 'COACH') {
        navigate('/coach');
      }

      if (user?.role === 'ADMIN') {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };



  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <p className="admin">Admin: vukosimohlabini16@gmail.com. admin123</p>
      <p className="coach">Coach: vukosimohlabini@gmail.com. pass123</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}

export default LoginPage;