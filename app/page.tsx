import Link from "next/link";

export default function Home() {
  return (
    <main className="page-container">
      <section className="hero">
        <div>
          <p className="eyebrow">Launch MVP</p>
          <h1>Track live website changes with a simple dashboard.</h1>
          <p>Start with one launch tier, monitor pages, choose fields, and stay compliant.</p>
          <div className="button-row">
            <Link href="/auth/login" className="button primary">
              Sign in
            </Link>
            <Link href="/auth/signup" className="button secondary">
              Create account
            </Link>
          </div>
        </div>
      </section>
      <section className="cards-grid">
        <article className="card">
          <h2>Auto field discovery</h2>
          <p>Paste a URL and get a preview of page metadata, prices, titles, and custom fields.</p>
        </article>
        <article className="card">
          <h2>User-defined defaults</h2>
          <p>Choose the fields that matter most, then expand to track more data later.</p>
        </article>
        <article className="card">
          <h2>Compliance-first</h2>
          <p>Robots rules and rate limiting are built into the scraper layer from day one.</p>
        </article>
      </section>
    </main>
  );
}
