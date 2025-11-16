import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface MeResponse {
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

const AdminPromptsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!getToken()) {
      router.replace('/login');
      return;
    }

    const checkRole = async () => {
      try {
        const me = await apiFetch<MeResponse>('/me');
        if (!isMounted) return;

        if (me.user.role !== 'SUPERADMIN') {
          router.replace('/dashboard');
          return;
        }

        setIsSuperadmin(true);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Nastala chyba při ověřování.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>SEO Booster – Superadmin prompty</title>
      </Head>
      <main className="admin-prompts">
        <header>
          <div>
            <p className="eyebrow">Superadmin</p>
            <h1>Správa AI promptů</h1>
          </div>
          <Link href="/dashboard" className="button ghost">
            Zpět na dashboard
          </Link>
        </header>
        {loading && <p>Ověřuji oprávnění…</p>}
        {!loading && !isSuperadmin && !error && <p>Přesměrovávám…</p>}
        {error && <p className="error">{error}</p>}
        {isSuperadmin && !error && <p>Vyber task z levého menu (UI přijde v další fázi).</p>}
      </main>
      <style jsx>{`
        .admin-prompts {
          min-height: 100vh;
          background: #05060b;
          color: #f1f5ff;
          padding: 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.8rem;
          color: #7dd3fc;
          margin-bottom: 0.5rem;
        }
        h1 {
          margin: 0;
        }
        .button {
          border-radius: 999px;
          padding: 0.6rem 1.5rem;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #e2e8ff;
          transition: border-color 0.2s ease;
        }
        .button:hover {
          border-color: #fff;
        }
        .error {
          color: #fda4af;
        }
      `}</style>
    </>
  );
};

export default AdminPromptsPage;
