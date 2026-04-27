/**
 * Utilidades compartidas para Parce AU.
 */
const ParceAU = {
    /** Lee un valor desde localStorage como JSON. */
    load(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
            console.error("Error leyendo localStorage", key, e);
            return fallback;
        }
    },

    /** Guarda un valor en localStorage como JSON. */
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    /** Elimina una clave de localStorage. */
    remove(key) {
        localStorage.removeItem(key);
    },

    /** Formatea un número como AUD. */
    formatAUD(n) {
        const num = Number(n) || 0;
        return "$" + num.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " AUD";
    },

    /** Formatea horas con dos decimales. */
    formatHours(h) {
        return (Number(h) || 0).toFixed(2) + " h";
    },

    /** Devuelve un id único basado en timestamp + random. */
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    /**
     * Muestra una notificación toast (usa Bootstrap 5).
     * @param {string} message  Mensaje a mostrar.
     * @param {'success'|'danger'|'warning'|'info'} [variant='success']
     * @param {number} [delay=3000]  Tiempo en ms.
     */
    toast(message, variant = "success", delay = 3000) {
        const container = document.getElementById("parce-toast-container");
        if (!container) {
            console.warn("Toast container no encontrado, fallback a alert()");
            alert(message);
            return;
        }
        const icons = { success: "✅", danger: "❌", warning: "⚠️", info: "ℹ️" };
        const bg = {
            success: "bg-success",
            danger: "bg-danger",
            warning: "bg-warning text-dark",
            info: "bg-info text-dark",
        }[variant] || "bg-success";

        const wrapper = document.createElement("div");
        wrapper.className = `toast align-items-center text-white ${bg} border-0`;
        wrapper.setAttribute("role", "alert");
        wrapper.setAttribute("aria-live", "assertive");
        wrapper.setAttribute("aria-atomic", "true");
        wrapper.innerHTML = `
            <div class="d-flex">
                <div class="toast-body fw-semibold">${icons[variant] || ""} ${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>`;
        container.appendChild(wrapper);

        // Bootstrap toast
        const t = new bootstrap.Toast(wrapper, { delay, autohide: true });
        t.show();
        wrapper.addEventListener("hidden.bs.toast", () => wrapper.remove());
    },

    /** Copia texto al portapapeles. Devuelve Promise<boolean>. */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(ta);
                return ok;
            } catch (e2) {
                console.error("No se pudo copiar", e2);
                return false;
            }
        }
    },
};
