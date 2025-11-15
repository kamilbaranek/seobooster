import Head from 'next/head';
import Link from 'next/link';

const CancelPage = () => (
  <>
    <Head>
      <title>SEO Booster – Platba zrušena</title>
    </Head>
    <main className="auth">
      <div className="panel">
        <h1>Platba byla zrušena</h1>
        <p>Pokud jste se rozhodli pokračovat později, klidně se vraťte k poslednímu kroku onboarding formuláře.</p>
        <div className="actions">
          <Link className="button primary" href="/onboarding/payment">
            Zpět k platbě
          </Link>
          <Link className="button ghost" href="/">
            Zpět na homepage
          </Link>
        </div>
      </div>
    </main>
    <style jsx>{`
      .auth {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #05060b;
        padding: 2rem;
        color: #fff;
      }
      .panel {
        width: min(420px, 100%);
        background: #0f1323;
        border-radius: 1.2rem;
        padding: 2.5rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .actions {
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .button {
        display: inline-block;
        text-align: center;
        padding: 0.85rem 1rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 600;
      }
      .button.primary {
        background: linear-gradient(120deg, #0ea5e9, #8b5cf6);
        color: #fff;
      }
      .button.ghost {
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: #fff;
      }
    `}</style>
  </>
);

export default CancelPage;

