/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { UserAPI } from "../lib/api";
import toast from "react-hot-toast";
import WarningBanner from "../components/WarningBanner";
import Map from "../components/Map";

export default function Report() {
  const [form, setForm] = useState({
    category: "OTHER",
    description: "",
    area_name: "",
    nearest_landmark: "",
    address: "",
    building_name: "",
    floor_no: "",
    phone_number: "",
    image: null,
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // validation (simple)
  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.area_name.trim()) e.area_name = "Area name is required.";
    if (form.phone_number && form.phone_number.length > 15)
      e.phone_number = "Phone number is too long.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (Object.keys(errors).length) validate();
  }, [form]);

  function onChange(e) {
    const { name, value, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "image" ? (files?.[0] || null) : value,
    }));
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setForm((f) => ({ ...f, image: file }));
  }
  function onDragOver(e) { e.preventDefault(); setDragOver(true); }
  function onDragLeave(e) { e.preventDefault(); setDragOver(false); }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSuccess(null);
    try {
      let data;
      if (form.image) {
        const fd = new FormData();
        // append only non-empty fields
        Object.entries(form).forEach(([k, v]) => {
          if (v !== null && v !== "") fd.append(k, v);
        });
        data = await UserAPI.submitReportForm(fd);
      } else {
        // JSON payload with backend field names
        data = await UserAPI.submitReportJSON({
          description: form.description.trim(),
          category: form.category,
          area_name: form.area_name.trim(),
          nearest_landmark: form.nearest_landmark.trim() || null,
          address: form.address.trim() || null,
          building_name: form.building_name.trim() || null,
          floor_no: form.floor_no.trim() || null,
          phone_number: form.phone_number.trim() || null,
          latitude: form.latitude,
          longitude: form.longitude,
        });
      }

      setSuccess({
        token: data?.reporter_token || data?.token || null,
        id: data?.id || data?.pk || null,
        message: "Report submitted successfully.",
      });

      // toast
      toast.success("Report submitted");

      setForm({
        category: "OTHER",
        description: "",
        area_name: "",
        nearest_landmark: "",
        address: "",
        building_name: "",
        floor_no: "",
        phone_number: "",
        image: null,
        latitude: null,
        longitude: null,
      });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setSuccess(null);
      setErrors((e) => ({ ...e, submit: err.message || "Submit failed" }));
      // toast
      toast.error(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  const imagePreviewUrl = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : null),
    [form.image]
  );

  return (
    <section className="max-w-5xl h-full mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Create Report</h1>
      <p className="text-gray-600 mb-6">Tell us what happened.</p>

      <WarningBanner className="mb-6">
        Submitting false reports wastes police time and may be an offense.
        Reports are anonymous to the public, but each submission has an internal tracking ID
        and can be investigated by authorities if required by law. All misuse is logged.
      </WarningBanner>

      {/* success */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="font-semibold text-green-800">{success.message}</div>
          <div className="text-sm text-green-700 mt-1">
            {success.id && <>Report ID: <code>{success.id}</code> · </>}
            {success.token ? (
              <>
                Tracking token: <code>{success.token}</code>{" "}
                <button
                  onClick={() => navigator.clipboard?.writeText(success.token)}
                  className="ml-2 text-green-800 underline underline-offset-2"
                >
                  Copy
                </button>
                <div className="mt-1">
                  Use this at <code>/track/{success.token}</code> to see status.
                </div>
              </>
            ) : (
              "Save your reference details for tracking."
            )}
          </div>
        </div>
      )}

      {/* error */}
      {errors.submit && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {errors.submit}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Map picker */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Select Location on Map *</label>
            <div className="rounded-2xl overflow-hidden border">
              <Map
                onSelect={(latlng) =>
                  setForm((f) => ({ ...f, latitude: latlng.lat, longitude: latlng.lng }))
                }
              />
            </div>
            {form.latitude && form.longitude ? (
              <p className="text-sm text-green-700 mt-2">
                📍 Location selected: <code>{form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</code>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                📍 Click anywhere on the map to drop a marker.
              </p>
            )}
          </div>

          {/* Category (backend enums) */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full border rounded-xl p-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="DRUG_PEDDLING">Drug Peddling</option>
              <option value="THEFT">Theft</option>
              <option value="VIOLENCE">Violence</option>
              <option value="OTHER">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the closest match.</p>
          </div>

          {/* Area name */}
          <div>
            <label className="block text-sm font-medium mb-1">Area name *</label>
            <input
              name="area_name"
              value={form.area_name}
              onChange={onChange}
              className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.area_name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Neighborhood / street / locality"
              required
            />
            {errors.area_name && (
              <div className="text-xs text-red-600 mt-1">{errors.area_name}</div>
            )}
          </div>

          {/* Optional location details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nearest landmark</label>
              <input
                name="nearest_landmark"
                value={form.nearest_landmark}
                onChange={onChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 border-gray-300"
                placeholder="Bus stop / school / temple (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 border-gray-300"
                placeholder="Street, City (optional)"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Building name</label>
              <input
                name="building_name"
                value={form.building_name}
                onChange={onChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 border-gray-300"
                placeholder="(optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Floor no</label>
              <input
                name="floor_no"
                value={form.floor_no}
                onChange={onChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 border-gray-300"
                placeholder="(optional)"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className={`w-full border rounded-xl p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="What happened? When did you notice it? Any risks?"
              required
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Include details that help triage and resolve.
              </span>
              <span className="text-xs text-gray-400">
                {form.description.length}
              </span>
            </div>
            {errors.description && (
              <div className="text-xs text-red-600 mt-1">{errors.description}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={onChange}
              className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.phone_number ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Your phone number (optional)"
            />
            {errors.phone_number && (
              <div className="text-xs text-red-600 mt-1">{errors.phone_number}</div>
            )}
          </div>
        </div>

        {/* ASIDE — unchanged UI (image + disclaimer + buttons) */}
        <aside className="space-y-5">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`rounded-2xl border p-4 text-center ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-300"
            }`}
          >
            <div className="font-semibold mb-1">Attach image (optional)</div>
            <p className="text-xs text-gray-600 mb-3">
              Drag & drop here, or choose a file.
            </p>

            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={onChange}
              className="hidden"
              id="image-input"
            />
            <label
              htmlFor="image-input"
              className="inline-block px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer text-sm"
            >
              Browse…
            </label>

            {form.image && (
              <div className="mt-3 text-left">
                <div className="text-xs text-gray-600">
                  Selected: <span className="font-medium">{form.image.name}</span> ({Math.round(form.image.size / 1024)} KB)
                </div>
                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="mt-2 w-full aspect-video object-cover rounded-lg border"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, image: null }));
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="mt-2 text-xs text-red-300 hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-4 bg-gray-50">
            <div className="text-sm text-gray-700">
              By submitting, you agree that your report may be reviewed by city
              staff. Do not include sensitive personal data.
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-black text-white disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit report"}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                category: "OTHER",
                description: "",
                area_name: "",
                nearest_landmark: "",
                address: "",
                building_name: "",
                floor_no: "",
                phone_number: "",
                image: null,
              });
              if (fileRef.current) fileRef.current.value = "";
              setErrors({});
              setSuccess(null);
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700"
          >
            Cancel
          </button>
        </aside>
      </form>
    </section>
  );
}