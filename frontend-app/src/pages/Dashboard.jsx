/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { AdminAPI } from "../lib/api";
import { Stat, ListSkeleton } from "../components/Helpers";
import { FcOpenedFolder } from "react-icons/fc";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [ordering, setOrdering] = useState("-created");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const statusBadge = (s = "") => {
    const val = (s || "").toLowerCase();
    if (val.includes("resolved") || val.includes("closed"))
      return "bg-green-100 text-green-800 border-green-200";
    if (val.includes("progress"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (val.includes("open") || val.includes("new"))
      return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // fetcher
  async function load() {
    setLoading(true);
    setErr("");
    try {
      // Try to pass common DRF query params; backend can ignore unknown ones
      const params = {
        search: q || undefined,
        category: category !== "All" ? category : undefined,
        status: status !== "All" ? status : undefined,
        ordering: ordering || undefined,
        page,
        page_size: pageSize,
      };
      const data = await AdminAPI.listIncidents(params);

      if (Array.isArray(data)) {
        setItems(data);
        setCount(data.length);
      } else {
        setItems(data?.results || []);
        setCount(typeof data?.count === "number" ? data.count : (data?.results?.length || 0));
      }
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, ordering]); // page/order refetch

  const filteredLocal = useMemo(() => {
    return items.filter((it) => {
      const matchesQ =
        !q ||
        String(it.title || it.name || "")
          .toLowerCase()
          .includes(q.toLowerCase()) ||
        String(it.description || "")
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchesCat = category === "All" || (it.category || "") === category;
      const matchesStatus = status === "All" || (it.status || "").toLowerCase() === status.toLowerCase();
      return matchesQ && matchesCat && matchesStatus;
    });
  }, [items, q, category, status]);

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Monitor recent incidents and triage quickly.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load()}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid sm:grid-cols-3 gap-4">
        <Stat title="Total (this page or count)" value={count} />
        <Stat
          title="Open"
          value={items.filter((x) => (x.status || "").toLowerCase().includes("open")).length}
        />
        <Stat
          title="In Progress"
          value={items.filter((x) => (x.status || "").toLowerCase().includes("progress")).length}
        />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border p-4">
        <div className="grid md:grid-cols-5 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title/description…"
            className="md:col-span-2 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-xl p-3"
          >
            <option>All</option>
            <option>Incident</option>
            <option>Maintenance</option>
            <option>Safety</option>
            <option>Other</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-xl p-3"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
            }}
            className="border rounded-xl p-3"
            title="Requires DRF ordering backend support"
          >
            <option value="-created">Newest first</option>
            <option value="created">Oldest first</option>
            <option value="title">Title A→Z</option>
            <option value="-title">Title Z→A</option>
          </select>
        </div>

        <div className="mt-3 flex gap-3">
          <button
            onClick={() => {
              setPage(1);
              load(); // try server-side
            }}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setQ("");
              setCategory("All");
              setStatus("All");
              setOrdering("-created");
              setPage(1);
              load();
            }}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </section>

      {/* list/table */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Recent Incidents</div>

        {loading && <ListSkeleton />}

        {!loading && err && (
          <div className="p-6 text-red-600">
            Failed to load: {err}{" "}
            <button onClick={() => load()} className="underline underline-offset-2">
              Retry
            </button>
          </div>
        )}

        {!loading && !err && filteredLocal.length === 0 && (
          <div className="p-10 text-center text-gray-600">
            <div className="text-3xl mb-2"><FcOpenedFolder className="mx-auto" /></div>
            <div className="font-medium">No incidents match your filters.</div>
            <div className="text-sm">Try resetting filters or searching differently.</div>
          </div>
        )}

        {!loading && !err && filteredLocal.length > 0 && (
          <div className="divide-y">
            {filteredLocal.map((it) => (
              <div
                key={it.id}
                className="px-4 py-3 grid md:grid-cols-12 gap-3 items-start"
              >
                <div className="md:col-span-6">
                  <div className="font-medium">{it.title || "Untitled"}</div>
                  <div className="text-sm text-gray-600">
                    {(it.category && `Category: ${it.category} · `) || ""}
                    {it.location || ""}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <span className={`text-sm px-2 py-1 rounded-full border ${statusBadge(it.status)}`}>
                    {it.status || "—"}
                  </span>
                </div>
                <div className="md:col-span-3 text-sm text-gray-600 md:text-right">
                  {formatWhen(it.created_at || it.created || it.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !err && count > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
            <div className="text-sm text-gray-600">
              Page {page}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

// format when - date/time 
function formatWhen(dateLike) {
    if (!dateLike) return "—";
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return "—";
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    const days = Math.floor(diff / 86400);
    if (days <= 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return d.toLocaleString();
}