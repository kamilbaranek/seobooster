import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface WebDto {
  id: string;
  url: string;
  status: string;
}

const POLL_INTERVAL_MS = 4000;
const TIMEOUT_MS = 60000;

const SuccessPage = () => {
  const router = useRouter();
  const webId = router.query.webId as string | undefined;
  const [status, setStatus] = useState<string>('pending');
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }

    if (!webId) {
      return;
    }

    let cancelled = false;
    let timer: NodeJS.Timeout;
    const startedAt = Date.now();

    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await apiFetch<WebDto>(`/webs/${webId}`);
        setStatus(data.status);
        if (data.status === 'ACTIVE') {
          router.replace('/dashboard');
          return;
        }
      } catch (error) {
        // keep silent, retry
      }

      if (Date.now() - startedAt > TIMEOUT_MS) {
        setTimeoutReached(true);
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router, webId]);

  return (
    <>
      <Head>
        <title>SEO Booster – Platba potvrzena</title>
      </Head>
      <main className="auth">
        <div className="panel">
          <h1>Děkujeme za platbu!</h1>
          <p>
            Náš orchestrátor právě spouští první scan webu. Jakmile bude váš web aktivní, přesměrujeme vás na dashboard.
          </p>
          <p className="status">Aktuální stav: {status}</p>

          {timeoutReached && (
            <div className="notice">
              <p>
                Zpracování trvá déle než obvykle. Klikněte na tlačítko níže a přejděte na dashboard, kde můžete stav
                zkontrolovat ručně.
              </p>
              <Link className="button ghost" href="/dashboard">
                Pokračovat na dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        .auth {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05060b;
          padding: 2rem;
          color: #fff;
        }
        .panel {
          width: min(520px, 100%);
          background: #0f1323;
          border-radius: 1.2rem;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .status {
          margin-top: 1.5rem;
          font-weight: 600;
        }
        .notice {
          margin-top: 1.5rem;
          background: rgba(125, 211, 252, 0.1);
          border-radius: 1rem;
          padding: 1rem 1.5rem;
        }
        .button {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          border-radius: 999px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.6);
          color: #fff;
        }
      `}</style>
    </>
  );
};

export default SuccessPage;
