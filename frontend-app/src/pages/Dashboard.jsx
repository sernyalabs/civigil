/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminAPI } from "../lib/api";
import { Stat, ListSkeleton } from "../components/Helpers";
import WarningBanner from "../components/WarningBanner";
import toast from "react-hot-toast";
import { FcOpenedFolder } from "react-icons/fc";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix leaflet marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// bounds around
const LOCATIONS = L.latLngBounds([27.1, 88.0], [27.9, 88.9]);
const DEFAULT_CENTER = [27.3389, 88.6065];

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // filters / query
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [ordering, setOrdering] = useState("-created_at"); // backend timestamp field
  const [page, setPage] = useState(1);

  const pageSize = 10;

  // refs for map + markers
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // Map backend statuses to badge styles
  const statusBadge = (s = "") => {
    const val = (s || "").toUpperCase();
    if (val === "RESOLVED") return "bg-green-100 text-green-800 border-green-200";
    if (val === "IN_PROCESS") return "bg-blue-100 text-blue-800 border-blue-200";
    if (val === "PENDING") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  async function load() {
    setLoading(true);
    setErr("");
    try {
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
      const msg = e.message || "Failed to load";
      setErr(msg);
      toast.error(`⚠️ ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, ordering]);

  // Local refine (in case server doesn't filter)
  const filteredLocal = useMemo(() => {
    return items.filter((it) => {
      const matchesQ =
        !q ||
        String(it.area_name || "").toLowerCase().includes(q.toLowerCase()) ||
        String(it.description || "").toLowerCase().includes(q.toLowerCase());
      const matchesCat = category === "All" || (it.category || "") === category;
      const matchesStatus = status === "All" || (it.status || "").toUpperCase() === status.toUpperCase();
      return matchesQ && matchesCat && matchesStatus;
    });
  }, [items, q, category, status]);

  // quick stats based on backend statuses
  const openCount = items.filter((x) => (x.status || "").toUpperCase() === "PENDING").length;
  const inProcessCount = items.filter((x) => (x.status || "").toUpperCase() === "IN_PROCESS").length;

  // jump to marker
  function focusMarker(it) {
    if (!mapRef.current || !markerRefs.current[it.id]) return;
    const marker = markerRefs.current[it.id];
    mapRef.current.setView([it.latitude, it.longitude], 15, { animate: true });
    marker.openPopup();
  }

  return (
    <section className="max-w-7xl h-full mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold pb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor recent incidents and triage quickly.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.loading("Refreshing…", { id: "dash-refresh", duration: 700 });
              load();
            }}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </header>

      <WarningBanner className="mb-4">
        Reminder: Submitting false or misleading reports wastes police time and may be an offense.
        Although reporters are anonymous publicly, each report has an internal ID and can be traced
        by authorities if required by law. Misuse is logged.
      </WarningBanner>

      {/* Stats */}
      <section className="grid sm:grid-cols-3 gap-4">
        <Stat title="Total (this page or count)" value={count} />
        <Stat title="Pending" value={openCount} />
        <Stat title="In Process" value={inProcessCount} />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border p-4">
        <div className="grid md:grid-cols-5 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search area/description…"
            className="md:col-span-2 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-xl p-3"
          >
            <option>All</option>
            <option value="DRUG_PEDDLING">Drug Peddling</option>
            <option value="THEFT">Theft</option>
            <option value="VIOLENCE">Violence</option>
            <option value="OTHER">Other</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-xl p-3"
          >
            <option>All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROCESS">In Process</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="border rounded-xl p-3"
            title="Requires DRF ordering backend support"
          >
            <option value="-created_at">Newest first</option>
            <option value="created_at">Oldest first</option>
            {/* If you add an index on category/status you can also support these: */}
            {/* <option value="category">Category A→Z</option>
            <option value="-category">Category Z→A</option> */}
          </select>
        </div>

        <div className="mt-3 flex gap-3">
          <button
            onClick={() => {
              setPage(1);
              load();
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
              setOrdering("-created_at");
              setPage(1);
              load();
            }}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Incident Map */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Incident Map</div>
        <div style={{ height: "400px", width: "100%" }}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            maxBounds={LOCATIONS}
            maxBoundsViscosity={0.9}
            className="rounded-none"
          >
            <TileLayer
              // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLocal
              .filter((it) => it.latitude && it.longitude)
              .map((it) => (
                <Marker
                  key={it.id}
                  position={[it.latitude, it.longitude]}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{it.category}</div>
                      <div>{it.area_name || "Unknown area"}</div>
                      <div className="text-xs text-gray-600">{it.status}</div>
                      <div className="mt-1 text-xs">{it.description}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
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
                onClick={() => focusMarker(it)}
              >
                <div className="md:col-span-6">
                  {/* Primary: category — area_name */}
                  <div className="font-medium">
                    {(it.category || "—")} — {(it.area_name || "Unknown area")}
                  </div>
                  {/* Secondary: landmark / address */}
                  <div className="text-sm text-gray-600">
                    {it.nearest_landmark
                      ? `Near: ${it.nearest_landmark}`
                      : (it.address || "")}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <span className={`text-sm px-2 py-1 rounded-full border ${statusBadge(it.status)}`}>
                    {it.status || "—"}
                  </span>
                </div>

                <div className="md:col-span-3 text-sm text-gray-600 md:text-right">
                  {formatWhen(it.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !err && count > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
            <div className="text-sm text-gray-600">Page {page}</div>
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