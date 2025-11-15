import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface CheckoutResponse {
  checkoutUrl: string;
}

const PaymentPage = () => {
  const router = useRouter();
  const webId = router.query.webId as string | undefined;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/onboarding');
      return;
    }

    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, [router]);

  const successUrl = useMemo(() => `${origin}/onboarding/success?webId=${webId ?? ''}`, [origin, webId]);
  const cancelUrl = useMemo(() => `${origin}/onboarding/cancel?webId=${webId ?? ''}`, [origin, webId]);

  const handleCheckout = async () => {
    if (!webId) {
      setError('Chybí identifikátor webu. Začněte prosím onboarding znovu.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await apiFetch<CheckoutResponse>('/billing/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ webId, successUrl, cancelUrl })
      });
      window.location.href = response.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se otevřít platební bránu.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SEO Booster – Platba</title>
      </Head>
      <main className="auth">
        <div className="panel">
          <p className="eyebrow">Krok 2/2</p>
          <h1>Aktivujte SEO Booster přes Stripe</h1>
          <p>Po úspěšné platbě vás automaticky přesměrujeme zpět a dokončíme první analýzu webu.</p>

          <div className="plan">
            <h2>Pro plán</h2>
            <p>Všechny funkce + 1 web · Denní články · Bez závazků</p>
            <p className="price">€199 / měsíc</p>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="button primary" onClick={handleCheckout} disabled={loading || !origin}>
            {loading ? 'Otevírám Stripe…' : 'Pokračovat na Stripe'}
          </button>

          <p className="footnote">
            Potřebujete změnit e-mail nebo URL? <Link href="/onboarding">Vraťte se o krok zpět.</Link>
          </p>
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
        .plan {
          margin: 1.5rem 0 2rem;
          padding: 1.2rem 1.5rem;
          border-radius: 1rem;
          background: #131a2f;
        }
        .plan h2 {
          margin: 0 0 0.2rem;
        }
        .plan p {
          margin: 0.2rem 0;
          color: #cbd5f5;
        }
        .plan .price {
          font-size: 1.4rem;
          color: #fff;
          font-weight: 600;
        }
        .button {
          width: 100%;
          margin-top: 1.5rem;
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

export default PaymentPage;
