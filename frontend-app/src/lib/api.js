import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    // withCredentials: true,            // for Django session auth
    // timeout: 15000,                   // avoid forever hangs
});

const ok = (res) => res.data;
const fail = (err) => {
    if (err.response) {
        const { status, statusText, data } = err.response;
        const msg = typeof data === "string"
            ? data
            : data?.detail || JSON.stringify(data);
        throw new Error(`${status} ${statusText}${msg ? ` — ${msg}` : ""}`);
    }
    throw err;
};

// Admin APIs — requires proper auth on the backend
export const AdminAPI = {
    listIncidents: (params = {}) =>
        api.get("/admin-api/incidents/", { params }).then(ok).catch(fail),

    getIncident: (id) =>
        api.get(`/admin-api/incidents/${id}/`).then(ok).catch(fail),

    createIncidentJSON: (payload) =>
        api.post("/admin-api/incidents/", payload, {
            headers: { "Content-Type": "application/json" },
        }).then(ok).catch(fail),

    createIncidentForm: (formData) =>
        api.post("/admin-api/incidents/", formData).then(ok).catch(fail),

    updateIncident: (id, payload) =>
        api.patch(`/admin-api/incidents/${id}/`, payload, {
            headers: { "Content-Type": "application/json" },
        }).then(ok).catch(fail),

    deleteIncident: (id) =>
        api.delete(`/admin-api/incidents/${id}/`).then(ok).catch(fail),
};

// User API — public submit endpoint
export const UserAPI = {
    // JSON submit (no files)
    submitReportJSON: (payload) =>
        api.post("/user-api/report/", payload, {
            headers: { "Content-Type": "application/json" },
        }).then(ok).catch(fail),

    // multipart submit (with image)
    submitReportForm: (formData) =>
        api.post("/user-api/report/", formData).then(ok).catch(fail),

    reportsByPhone: (phone) =>
        api.get("/user-api/reports-by-phone/", { params: { phone } }).then(ok).catch(fail),
};

// Public tracking
export const PublicAPI = {
    trackByToken: (token) =>
        api.get(`/track/${token}/`).then(ok).catch(fail),
};