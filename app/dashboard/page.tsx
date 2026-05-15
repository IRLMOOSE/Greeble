import Link from "next/link";
import { ProtectedPage } from "../../lib/protected-page";

async function getTrackers() {
  const res = await fetch("/api/trackers", { cache: "no-store" });
  return res.ok ? res.json() : [];
}

export default async function DashboardPage() {
  const trackers = await getTrackers();

  return (
    <ProtectedPage>
      <main className="page-container">
        <div className="hero">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Your active trackers</h1>
            <p>Monitor current values, history snapshots, and add new trackers from a URL.</p>
          </div>
          <Link href="/trackers" className="button primary">
            Add tracker
          </Link>
        </div>

        {trackers.length === 0 ? (
          <section className="card">
            <h2>No trackers yet</h2>
            <p>Create your first tracker to begin monitoring page data.</p>
          </section>
        ) : (
          <section className="cards-grid">
            {trackers.map((tracker: any) => (
              <article key={tracker.id} className="card">
                <h2>{tracker.name || tracker.url}</h2>
                <p>{tracker.url}</p>
                <p>Last scraped: {tracker.lastScrapeAt ? new Date(tracker.lastScrapeAt).toLocaleString() : "never"}</p>
                <Link href={`/trackers/${tracker.id}`} className="button secondary">
                  View tracker
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </ProtectedPage>
  );
}
