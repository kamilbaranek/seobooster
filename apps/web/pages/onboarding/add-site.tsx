import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface WebResponse {
  id: string;
  url: string;
  status: string;
}

const AddSitePage = () => {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const web = await apiFetch<WebResponse>('/webs', {
        method: 'POST',
        body: JSON.stringify({
          url: websiteUrl,
          nickname: nickname || undefined
        })
      });

      router.push(`/onboarding/payment?webId=${web.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se přidat web.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SEO Booster – Přidat web</title>
      </Head>
      <main className="auth">
        <form className="panel" onSubmit={handleSubmit}>
          <p className="eyebrow">Přidat další web</p>
          <h1>Připojte další doménu k vašemu účtu</h1>
          <p>Pro každý web vytvoříme samostatnou SEO strategii i plán generování článků.</p>

          <label>
            URL nového webu
            <input
              type="url"
              placeholder="https://dalsiweb.cz"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              required
            />
          </label>

          <label>
            Interní název (volitelné)
            <input
              type="text"
              placeholder="Např. Firemní blog"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Připravuji platební krok…' : 'Pokračovat k platbě'}
          </button>

          <p className="footnote">
            Zpět na <Link href="/dashboard">dashboard</Link>.
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
          width: min(520px, 100%);
          background: #0f1323;
          border-radius: 1.2rem;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.8rem;
          color: #7dd3fc;
        }
        h1 {
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
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
          padding: 0.85rem 1rem;
          border-radius: 0.8rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #080b16;
          color: #fff;
          font-size: 1rem;
        }
        .button {
          width: 100%;
          margin-top: 1.8rem;
          padding: 0.95rem 1rem;
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

export default AddSitePage;

