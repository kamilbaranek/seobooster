import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const steps = [
  {
    title: '1. Analyze your site',
    description: 'Paste your URL and we instantly crawl the public pages to understand your offer and target audience.'
  },
  {
    title: '2. Build an SEO strategy',
    description: 'Our AI orchestrator groups topics into pillars, clusters, and daily keyword opportunities.'
  },
  {
    title: '3. Draft and publish',
    description: 'Every day you receive a new article draft in WordPress (or email) ready for a one‑click approval.'
  }
];

const benefits = [
  'Automated research + article creation every day.',
  'Full tenant isolation: each website gets its own strategy.',
  'Approval workflow that fits your WordPress stack.',
  'Bring your own AI budgets via OpenRouter or switch providers later.'
];

const Home: NextPage = () => (
  <>
    <Head>
      <title>SEO Booster – AI articles for your website</title>
      <meta name="description" content="Automate SEO strategy and WordPress drafts with AI." />
    </Head>
    <main className="landing">
      <header className="hero">
        <p className="eyebrow">AI Content SaaS for website owners</p>
        <h1>
          Daily AI articles <span>that stay on strategy</span>
        </h1>
        <p className="subtitle">
          SEO Booster scans your website, designs a tailored SEO roadmap, and creates WordPress drafts on autopilot.
        </p>
        <div className="cta">
          <Link href="/onboarding" className="button primary">
            Začít zdarma
          </Link>
          <Link href="/dashboard" className="button ghost">
            Podívat se na demo
          </Link>
        </div>
      </header>

      <section className="section">
        <h2>Jak to funguje</h2>
        <div className="cards">
          {steps.map((step) => (
            <article key={step.title} className="card">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section dark">
        <div className="section-content">
          <h2>Proč týmy volí SEO Booster</h2>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
    <style jsx>{`
      :global(body) {
        margin: 0;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #05060b;
        color: #f1f5ff;
      }
      .landing {
        padding: 4rem 1.5rem 6rem;
        max-width: 1040px;
        margin: 0 auto;
      }
      .hero {
        text-align: center;
        margin-bottom: 4rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.8rem;
        color: #7dd3fc;
        margin-bottom: 1rem;
      }
      h1 {
        font-size: clamp(2.5rem, 6vw, 3.5rem);
        margin: 0 0 1rem;
        line-height: 1.1;
      }
      h1 span {
        display: block;
        color: #7dd3fc;
      }
      .subtitle {
        font-size: 1.2rem;
        color: #cbd5f5;
        margin: 0 auto 1.5rem;
        max-width: 42rem;
      }
      .cta {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }
      .button {
        border-radius: 999px;
        padding: 0.9rem 2.5rem;
        font-weight: 600;
        text-decoration: none;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      .button.primary {
        background: linear-gradient(120deg, #0ea5e9, #8b5cf6);
        color: #fff;
      }
      .button.primary:hover {
        filter: brightness(1.1);
      }
      .button.ghost {
        border-color: rgba(255, 255, 255, 0.4);
        color: #e2e8ff;
      }
      .button.ghost:hover {
        border-color: #fff;
      }
      .section {
        margin-top: 4rem;
      }
      .section h2 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
      }
      .card {
        background: #101528;
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .card h3 {
        margin-top: 0;
        color: #7dd3fc;
      }
      .dark {
        background: #090d1a;
        border-radius: 1.2rem;
        padding: 2.5rem;
      }
      .dark ul {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
        display: grid;
        gap: 0.8rem;
      }
      .dark li {
        padding-left: 1.5rem;
        position: relative;
      }
      .dark li::before {
        content: '';
        width: 0.4rem;
        height: 0.4rem;
        border-radius: 50%;
        background: #7dd3fc;
        position: absolute;
        left: 0;
        top: 0.6rem;
      }
      @media (max-width: 640px) {
        .landing {
          padding: 3rem 1rem 4rem;
        }
        .dark {
          padding: 1.5rem;
        }
      }
    `}</style>
  </>
);

export default Home;
