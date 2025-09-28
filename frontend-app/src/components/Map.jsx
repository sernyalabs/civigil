import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Approx bounding box around
const LOCATIONS = L.latLngBounds(
  [27.10, 88.00], // SW
  [27.90, 88.90]  // NE
);

const DEFAULT_CENTER = [27.3389, 88.6065];

function useReverseGeocode() {
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState(null);
  const abortRef = useRef(null);

  const reverse = useCallback(async (lat, lon) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setAddr(null);

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "civigil-frontend/1.0 (+contact@example.com)",
        },
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Reverse geocoding failed");

      const data = await res.json();
      const display = data?.display_name || "";
      const address = data?.address || {};

      setAddr({
        display,
        road: address.road || "",
        suburb: address.suburb || address.neighbourhood || "",
        village: address.village || "",
        town: address.town || "",
        city: address.city || "",
        county: address.county || "",
        state: address.state || "",
        postcode: address.postcode || "",
        country: address.country || "",
      });

      return data;
    } catch (e) {
      console.error("Reverse geocoding error:", e);
      return null; // make sure function always resolves
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, addr, reverse };
}

function LocationPicker({ value, onChange, onAddress }) {
  const [pos, setPos] = useState(value || null);
  const { loading, addr, reverse } = useReverseGeocode();

  // sync with external value
  useEffect(() => {
    if (value) {
      setPos(value);
    }
  }, [value]);

  // Map click to set position
  useMapEvents({
    click: async (e) => {
      const p = e.latlng;
      setPos(p);
      onChange?.(p);
      const data = await reverse(p.lat, p.lng);
      onAddress?.(data);
    },
  });

  // Draggable marker
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend: async () => {
        const m = markerRef.current;
        if (m) {
          const p = m.getLatLng();
          setPos(p);
          onChange?.(p);
          const data = await reverse(p.lat, p.lng);
          onAddress?.(data);
        }
      },
    }),
    [onChange, onAddress, reverse]
  );

  return pos ? (
    <Marker position={pos} draggable eventHandlers={eventHandlers} ref={markerRef}>
      <Popup minWidth={200}>
        <div className="space-y-1 text-sm">
          <div className="font-medium">Selected location</div>
          <div>Lat: {pos.lat.toFixed(5)}, Lng: {pos.lng.toFixed(5)}</div>
          {loading ? (
            <div className="text-gray-500">Finding address…</div>
          ) : (
            addr?.display && <div className="text-gray-700">{addr.display}</div>
          )}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function Map({
  onSelect,
  onAddress,
  height = "350px",
  defaultCenter = DEFAULT_CENTER,
  initialValue = null,
}) {
  return (
    <div className="relative">
      <MapContainer
        center={initialValue ? [initialValue.lat, initialValue.lng] : defaultCenter}
        zoom={13}
        style={{ height, width: "100%" }}
        className="rounded-xl border"
        maxBounds={LOCATIONS}
        maxBoundsViscosity={0.9}
      >
        <TileLayer
        //   attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker value={initialValue} onChange={onSelect} onAddress={onAddress} />
      </MapContainer>


      {initialValue && (
        <div className="absolute left-3 bottom-3 z-[400] rounded-xl bg-white/95 border shadow p-2 text-xs">
          <div className="font-medium">Current pin</div>
          <div>
            Lat: {initialValue.lat.toFixed(5)}, Lng: {initialValue.lng.toFixed(5)}
          </div>
          <div className="text-gray-500">Drag the marker or click anywhere to change</div>
        </div>
      )}
    </div>
  );
}