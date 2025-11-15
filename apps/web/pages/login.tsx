import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api-client';
import { saveToken } from '../lib/auth-storage';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    webs: Array<{ id: string; url: string; status: string }>;
  };
}

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });
      saveToken(data.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se přihlásit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SEO Booster – Přihlášení</title>
      </Head>
      <main className="auth">
        <form className="panel" onSubmit={handleSubmit}>
          <h1>Přihlášení</h1>
          <p>Zadejte e-mail a heslo, které jste použili při registraci.</p>

          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Přihlašuji…' : 'Pokračovat'}
          </button>

          <p className="footnote">
            Nemáte účet? <Link href="/onboarding">Založte si jej během 2 minut.</Link>
          </p>
        </form>
      </main>
      <style jsx>{`
        .auth {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05060b;
          padding: 2rem;
        }
        .panel {
          width: min(400px, 100%);
          background: #0f1323;
          border-radius: 1.2rem;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        h1 {
          margin-bottom: 0.5rem;
        }
        p {
          color: #cbd5f5;
        }
        label {
          display: block;
          font-size: 0.9rem;
          margin-top: 1.2rem;
          color: #dbe4ff;
        }
        input {
          width: 100%;
          margin-top: 0.4rem;
          padding: 0.8rem 1rem;
          border-radius: 0.8rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #080b16;
          color: #fff;
          font-size: 1rem;
        }
        .button {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.9rem 1rem;
          border-radius: 999px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .button.primary {
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6);
          color: #fff;
        }
        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          color: #fecaca;
          background: rgba(248, 113, 113, 0.1);
          border-radius: 0.6rem;
          padding: 0.75rem 1rem;
          margin-top: 1rem;
        }
        .footnote {
          margin-top: 1.5rem;
          font-size: 0.9rem;
        }
        a {
          color: #7dd3fc;
        }
      `}</style>
    </>
  );
};

export default LoginPage;

