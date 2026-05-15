import Link from "next/link";
import { ProtectedPage } from "../../../lib/protected-page";

async function getTracker(id: string) {
  const res = await fetch(`/api/trackers?trackerId=${id}`, { cache: "no-store" });
  return res.ok ? res.json() : null;
}

export default async function TrackerDetailPage({ params }: { params: { id: string } }) {
  const tracker = await getTracker(params.id);

  return (
    <ProtectedPage>
      <main className="page-container">
        {!tracker ? (
          <p>Tracker not found.</p>
        ) : (
          <>
            <div className="hero">
              <div>
                <p className="eyebrow">Tracker</p>
                <h1>{tracker.name}</h1>
                <p>{tracker.url}</p>
              </div>
              <Link href="/dashboard" className="button secondary">
                Back to dashboard
              </Link>
            </div>

            <section className="card">
              <h2>Tracked fields</h2>
              <ul>
                {tracker.fields.map((field: any) => (
                  <li key={field.id}>
                    <strong>{field.name}</strong> — <code>{field.selector}</code>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card">
              <h2>Latest snapshot</h2>
              <pre>{JSON.stringify(tracker.snapshots?.[0]?.data ?? {}, null, 2)}</pre>
            </section>
          </>
        )}
      </main>
    </ProtectedPage>
  );
}
