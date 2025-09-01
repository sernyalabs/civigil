/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { UserAPI } from "../lib/api";

export default function Report() {
  const [form, setForm] = useState({
    title: "",
    category: "Incident",
    description: "",
    location: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // client-side validation
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (form.title.length > 120) e.title = "Keep the title under 120 characters.";
    if (form.description.trim().length < 10)
      e.description = "Add at least 10 characters so we can triage.";
    if (form.location.length > 140) e.location = "Location is too long.";
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
    if (file) {
      setForm((f) => ({ ...f, image: file }));
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSuccess(null);
    try {
      let data;
      if (form.image) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("category", form.category);
        fd.append("description", form.description);
        fd.append("location", form.location);
        fd.append("image", form.image);
        data = await UserAPI.submitReportForm(fd);
      } else {
        data = await UserAPI.submitReportJSON({
          title: form.title,
          category: form.category,
          description: form.description,
          location: form.location,
        });
      }

      setSuccess({
        token: data?.token || data?.tracking_token || null,
        id: data?.id || data?.pk || null,
        message: "Report submitted successfully.",
      });

      setForm({
        title: "",
        category: "Incident",
        description: "",
        location: "",
        image: null,
      });
      fileRef.current?.value && (fileRef.current.value = "");
    } catch (err) {
      setSuccess(null);
      setErrors((e) => ({ ...e, submit: err.message || "Submit failed" }));
    } finally {
      setLoading(false);
    }
  }

  const imagePreviewUrl = useMemo(() => {
    if (!form.image) return null;
    return URL.createObjectURL(form.image);
  }, [form.image]);

  return (
    <section className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Create Report</h1>
      <p className="text-gray-600 mb-6">
        Tell us what happened.
      </p>

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
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Streetlight outage on 5th Ave"
              required
              maxLength={120}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Keep it short and specific.
              </span>
              <span className="text-xs text-gray-400">
                {form.title.length}/120
              </span>
            </div>
            {errors.title && (
              <div className="text-xs text-red-600 mt-1">{errors.title}</div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full border rounded-xl p-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option>Incident</option>
                <option>Maintenance</option>
                <option>Safety</option>
                <option>Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the closest match.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.location ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="City, Area, Street"
                maxLength={140}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">
                  Add a landmark if possible.
                </span>
                <span className="text-xs text-gray-400">
                  {form.location.length}/140
                </span>
              </div>
              {errors.location && (
                <div className="text-xs text-red-600 mt-1">{errors.location}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className={`w-full border rounded-xl p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="What happened? When did you notice it? Any risks?"
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
              <div className="text-xs text-red-600 mt-1">
                {errors.description}
              </div>
            )}
          </div>
        </div>

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
                title: "",
                category: "Incident",
                description: "",
                location: "",
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