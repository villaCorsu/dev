// Replaces the `window.storage` API available inside Claude.ai artifacts with a
// localStorage-backed implementation, so App.jsx can run unmodified outside Claude.
// Data is stored locally in the visitor's browser (per-origin), not shared or synced.

(function () {
  if (typeof window === "undefined") return;

  const PREFIX = "dieestimator::";
  const key = (k, shared) => PREFIX + (shared ? "shared::" : "priv::") + k;

  window.storage = {
    get(k, shared) {
      return new Promise((resolve) => {
        try {
          const raw = window.localStorage.getItem(key(k, shared));
          if (raw === null) { resolve(null); return; }
          resolve({ key: k, value: raw, shared: !!shared });
        } catch (e) {
          resolve(null);
        }
      });
    },
    set(k, value, shared) {
      return new Promise((resolve) => {
        try {
          window.localStorage.setItem(key(k, shared), value);
          resolve({ key: k, value, shared: !!shared });
        } catch (e) {
          resolve(null);
        }
      });
    },
    delete(k, shared) {
      return new Promise((resolve) => {
        try {
          window.localStorage.removeItem(key(k, shared));
          resolve({ key: k, deleted: true, shared: !!shared });
        } catch (e) {
          resolve(null);
        }
      });
    },
    list(prefix, shared) {
      return new Promise((resolve) => {
        try {
          const base = PREFIX + (shared ? "shared::" : "priv::");
          const full = base + (prefix || "");
          const keys = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const lk = window.localStorage.key(i);
            if (lk && lk.indexOf(full) === 0) keys.push(lk.slice(base.length));
          }
          resolve({ keys, prefix, shared: !!shared });
        } catch (e) {
          resolve(null);
        }
      });
    },
  };
})();
