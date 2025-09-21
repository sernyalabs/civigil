import { useEffect, useState } from "react";
import { AdminAPI } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// fallback center
const DEFAULT_CENTER = [27.3389, 88.6065];

const Home = () => {
  const [stats, setStats] = useState({ total: 0, recent: [] });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await AdminAPI.listIncidents({ limit: 5 });
        const items = Array.isArray(data) ? data : (data?.results || []);
        setStats({ total: data?.count ?? items.length, recent: items.slice(0, 5) });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="rounded-2xl p-8 border">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Report, track & resolve civic issues with <span className="underline">Civigil</span>
        </h1>
        <p className="text-gray-700 max-w-2xl">
          File incident reports in seconds, track progress with a public token, and
          help your city respond faster.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/report"
            className="px-5 py-2.5 rounded-xl border border-black bg-black text-white hover:bg-neutral-100 hover:text-black"
          >
            Create a report
          </Link>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-black text-black hover:bg-black/10"
          >
            View dashboard
          </Link>
        </div>

        {/* quick stat if available */}
        {!error && (
          <div className="mt-6 text-sm text-gray-600">
            {stats.total > 0
              ? `Currently tracking ${stats.total} incident${stats.total === 1 ? "" : "s"}.`
              : "Be the first to submit a report today."}
          </div>
        )}
      </header>

      {/* MAP PREVIEW + RECENT INCIDENTS */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* Map preview */}
        <div className="md:col-span-2 rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Map preview</h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-black hover:underline"
            >
              Open full dashboard →
            </button>
          </div>

          <div className="aspect-[16/9] w-full rounded-xl border overflow-hidden">
            {!error && stats.recent.length > 0 ? (
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {stats.recent
                  .filter((it) => it.latitude && it.longitude)
                  .map((it) => (
                    <Marker key={it.id} position={[it.latitude, it.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{it.category}</div>
                          <div>{it.area_name || "Unknown area"}</div>
                          <div className="text-xs text-gray-600">{it.status}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            ) : (
              <div className="grid place-items-center text-gray-500 text-sm h-full">
                No incident locations yet.
              </div>
            )}
          </div>

          {/* Tiny “how to wire a map” hint */}
          <p className="mt-3 text-xs text-gray-500">
            {/* Tip: when your incidents include <code>latitude</code>/<code>longitude</code>, render
            markers for <code>stats.recent</code> here. */}
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam, qui!
          </p>
        </div>

        {/* Recent incidents list (from admin-api) */}
        <div className="rounded-2xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Recent incidents</div>
          <div className="divide-y">
            {error && (
              <div className="px-4 py-3 text-sm text-gray-600">
                Couldn’t load incidents: {error}
              </div>
            )}

            {!error && stats.recent.length === 0 && (
              <div className="px-4 py-6 text-gray-500 text-sm">No incidents yet.</div>
            )}

            {!error &&
              stats.recent.map((it) => (
                <div key={it.id} className="px-4 py-3">
                  <p className="font-medium">{it.title || "Untitled"}</p>
                  <p className="text-xs text-gray-600">
                    {(it.category && `Category: ${it.category} · `) || ""}
                    {it.location || ""}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <h2 className="text-xl font-bold mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl">
            <div className="text-sm font-semibold mb-1">1 - Submit a report</div>
            <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi, rem.
            </p>
            <Link to="/report" className="text-sm text-black hover:underline mt-2 inline-block">
              Go to report →
            </Link>
          </div>

          <div className="p-4 border rounded-xl">
            <div className="text-sm font-semibold mb-1">2 - Track with token</div>
            <p className="text-sm text-gray-600">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores placeat at quasi numquam eum saepe dolores qui delectus nisi quos.
            </p>
          </div>

          <div className="p-4 border rounded-xl">
            <div className="text-sm font-semibold mb-1">3 - Admin triage & resolve</div>
            <p className="text-sm text-gray-600">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque facilis assumenda obcaecati natus et? Dolore illo delectus quo culpa qui nesciunt commodi quae facilis suscipit rerum, alias odit esse vel!
            </p>
            <Link to="/dashboard" className="text-sm text-black hover:underline mt-2 inline-block">
              View dashboard →
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Home;