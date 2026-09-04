import { useState } from 'react';
import { login } from '../lib/api';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import '../styles/loginPage.css';
import { ArrowRight, CircleUserRound, LockKeyhole } from 'lucide-react';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { refetchUser } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <main className="loginPage">
      <section className="loginCard" aria-labelledby="loginHeading">
        <div className="loginBrandMark">F</div>
        <div className="loginCardHeader">
          <h1 id="loginHeading">Falcons Timesheets</h1>
          <p>Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="loginForm">
          <label htmlFor="loginEmail">
            Email address
            <span className="loginInputWrapper">
              <CircleUserRound />
              <input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@academy.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label htmlFor="loginPassword">
            Password
            <span className="loginInputWrapper">
              <LockKeyhole />
              <input
                id="loginPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </span>
          </label>

          {error && <p className="loginError" role="alert">{error}</p>}

          <button className="loginSubmit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
            {!submitting && <ArrowRight />}
          </button>
        </form>

        <div className="loginDemoAccess">
          <p>Demo access</p>
          <p>Admin: vukosimohlabini16@gmail.com · admin123</p>
          <p>Coach: vukosimohlabini@gmail.com · pass123</p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;