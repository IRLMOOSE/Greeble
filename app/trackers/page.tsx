"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedPage } from "../../lib/protected-page";

export default function TrackersPage() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handlePreview() {
    setMessage("");
    setPreview(null);
    if (!url) {
      setMessage("Please enter a URL first.");
      return;
    }

    const response = await fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      setMessage("Preview failed. Check the URL and try again.");
      return;
    }

    const data = await response.json();
    setPreview(data);
  }

  async function handleSubmit() {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/trackers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        name: preview?.title || url,
        fields: preview?.fields?.slice(0, 5) || [],
      }),
    });

    setSaving(false);

    if (!response.ok) {
      setMessage("Unable to save tracker. Try again later.");
      return;
    }

    setMessage("Tracker created successfully.");
    setUrl("");
    setPreview(null);
    router.push("/dashboard");
  }

  return (
    <ProtectedPage>
      <main className="page-container">
        <div className="hero">
          <div>
            <p className="eyebrow">Create tracker</p>
            <h1>Add a URL to monitor.</h1>
            <p>Paste any public page URL and preview the data our scraper detects.</p>
          </div>
          <Link href="/dashboard" className="button secondary">
            Back to dashboard
          </Link>
        </div>

        <section className="card">
          <label className="label">Page URL</label>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="input"
            placeholder="https://example.com/product"
          />
          <div className="button-row">
            <button onClick={handlePreview} className="button primary">
              Preview fields
            </button>
            <button onClick={handleSubmit} disabled={saving || !preview} className="button secondary">
              {saving ? "Saving..." : "Save tracker"}
            </button>
          </div>
          {message && <p className="notice">{message}</p>}
        </section>

        {preview && (
          <section className="card">
            <h2>Preview</h2>
            <p>
              <strong>Title:</strong> {preview.title || "None"}
            </p>
            <p>
              <strong>Description:</strong> {preview.description || "None"}
            </p>
            <div>
              <h3>Detected fields</h3>
              <ul>
                {preview.fields.map((field: any, index: number) => (
                  <li key={index}>
                    <strong>{field.name}</strong>: {field.value}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </ProtectedPage>
  );
}
