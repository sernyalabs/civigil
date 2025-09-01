/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PublicAPI } from "../lib/api";

export default function Track() {
  const { token: tokenParam } = useParams();
  const [token, setToken] = useState(tokenParam || "");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const hasToken = useMemo(() => !!token?.trim(), [token]);

  async function fetchData(t) {
    if (!t) return;
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const res = await PublicAPI.trackByToken(t.trim());
      setData(res);
      // keep URL in sync with entered token
      if (t !== tokenParam) navigate(`/track/${encodeURIComponent(t.trim())}`, { replace: true });
    } catch (e) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      fetchData(tokenParam);
    }
  }, [tokenParam]);

  const badgeClass = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("resolved") || s.includes("closed"))
      return "bg-green-100 text-green-800 border-green-200";
    if (s.includes("progress"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (s.includes("open") || s.includes("new"))
      return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
    // tweak colors to match your statuses
  };

  return (
    <section className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Track Report</h1>
          <p className="text-gray-600">Enter your tracking token to view status and details.</p>
        </div>
      </header>

      {/* token input card */}
      <div className="rounded-2xl border p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter tracking token"
            className="flex-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex gap-3">
            <button
              onClick={() => fetchData(token)}
              disabled={!hasToken || loading}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? "Loading…" : "Track"}
            </button>
            <button
              type="button"
              onClick={() => {
                setToken("");
                setData(null);
                setErr("");
                navigate("/track", { replace: true });
              }}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </div>

      {/* loading skeleton */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-36 rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-56 rounded-xl bg-gray-100 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-36 rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      )}

      {/* no data yet (and not loading) */}
      {!loading && !err && !data && (
        <div className="text-gray-600">
          Enter your token and click <span className="font-medium">Track</span>.
        </div>
      )}

      {/* data view */}
      {!loading && data && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Status + Details */}
          <div className="md:col-span-2 space-y-6">
            {/* status card */}
            <div className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Current status</div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full border ${badgeClass(
                        data.status || data.current_status
                      )}`}
                    >
                      {data.status || data.current_status || "Unknown"}
                    </span>
                    {data.priority && (
                      <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                        Priority: {data.priority}
                      </span>
                    )}
                  </div>
                </div>
                {data.token || data.tracking_token ? (
                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText(data.token || data.tracking_token)
                    }
                    className="text-sm text-blue-700 hover:underline"
                  >
                    Copy token
                  </button>
                ) : null}
              </div>

              {/* title + meta */}
              <div className="mt-4">
                <h2 className="text-xl font-semibold">
                  {data.title || data.name || "Untitled report"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {(data.category && `Category: ${data.category} · `) || ""}
                  {(data.location && `Location: ${data.location}`) || ""}
                </p>
                <p className="text-gray-700 mt-3">
                  {data.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* optional timeline */}
            {(Array.isArray(data.history) && data.history.length > 0) && (
              <div className="rounded-2xl border p-5">
                <div className="font-semibold mb-3">Timeline</div>
                <ol className="relative border-s border-gray-200 ms-3">
                  {data.history.map((ev, idx) => (
                    <li key={idx} className="mb-4 ms-4">
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full mt-1.5 -start-1.5"></div>
                      <time className="mb-1 text-xs text-gray-500 block">
                        {ev.timestamp || ev.time || ev.date || ""}
                      </time>
                      <div className="text-sm font-medium">
                        {ev.title || ev.event || ev.status || "Update"}
                      </div>
                      {ev.note || ev.details ? (
                        <div className="text-sm text-gray-700">{ev.note || ev.details}</div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Right: Info + Image */}
          <aside className="space-y-6">
            <div className="rounded-2xl border p-5">
              <div className="font-semibold mb-3">Report Info</div>
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                <dt className="text-gray-500">Token</dt>
                <dd className="col-span-2 break-all">
                  {data.token || data.tracking_token || "—"}
                </dd>

                <dt className="text-gray-500">ID</dt>
                <dd className="col-span-2">{data.id ?? data.pk ?? "—"}</dd>

                <dt className="text-gray-500">Created</dt>
                <dd className="col-span-2">{data.created_at || data.created || "—"}</dd>

                <dt className="text-gray-500">Updated</dt>
                <dd className="col-span-2">{data.updated_at || data.updated || "—"}</dd>
              </dl>
            </div>

            {(data.image_url || data.image || data.photo) && (
              <div className="rounded-2xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Attachment</div>
                <img
                  src={data.image_url || data.image || data.photo}
                  alt="Attachment"
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => fetchData(token)}
                className="w-full px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Back home
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}