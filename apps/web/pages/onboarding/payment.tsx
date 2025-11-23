import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface CheckoutResponse {
  checkoutUrl: string;
}

interface PlanLimit {
  webs: number;
  articlesPerMonth: number;
  regenerations: number;
}

interface Plan {
  id: string;
  name: string;
  limits: PlanLimit;
}

const PaymentPage = () => {
  const router = useRouter();
  const webId = router.query.webId as string | undefined;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/onboarding');
      return;
    }

    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    apiFetch<Plan[]>('/billing/plans')
      .then((data) => {
        setPlans(data);
        if (data.length > 0) {
          // Default to first plan or specific logic
          setSelectedPlanId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch plans', err);
        setError('Nepodařilo se načíst plány.');
      });
  }, [router]);

  const successUrl = useMemo(() => `${origin}/onboarding/success?webId=${webId ?? ''}`, [origin, webId]);
  const cancelUrl = useMemo(() => `${origin}/onboarding/cancel?webId=${webId ?? ''}`, [origin, webId]);

  const handleCheckout = async () => {
    if (!selectedPlanId) {
      setError('Vyberte prosím plán.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await apiFetch<CheckoutResponse>('/billing/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId, successUrl, cancelUrl })
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
        <title>SEO Booster – Výběr plánu</title>
      </Head>
      <main className="auth">
        <div className="panel">
          <p className="eyebrow">Krok 2/2</p>
          <h1>Vyberte si plán</h1>
          <p>Zvolte předplatné, které nejlépe vyhovuje vašim potřebám.</p>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan ${selectedPlanId === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <h2>{plan.name}</h2>
                <ul className="limits">
                  <li>{plan.limits.webs} Web{plan.limits.webs > 1 ? 'ů' : ''}</li>
                  <li>{plan.limits.articlesPerMonth} Článků / měsíc</li>
                  <li>{plan.limits.regenerations} Regenerací</li>
                </ul>
              </div>
            ))}
          </div>

          {error && <p className="error">{error}</p>}

          <button className="button primary" onClick={handleCheckout} disabled={loading || !origin || !selectedPlanId}>
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
          width: min(600px, 100%);
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
        .plans-grid {
          display: grid;
          gap: 1rem;
          margin: 1.5rem 0 2rem;
        }
        .plan {
          padding: 1.2rem 1.5rem;
          border-radius: 1rem;
          background: #131a2f;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .plan:hover {
          background: #1c2540;
        }
        .plan.selected {
          border-color: #0ea5e9;
          background: #1c2540;
        }
        .plan h2 {
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
        }
        .limits {
          list-style: none;
          padding: 0;
          margin: 0;
          color: #cbd5f5;
          font-size: 0.9rem;
        }
        .limits li {
          margin-bottom: 0.2rem;
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
