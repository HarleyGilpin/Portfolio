// SSR-safe wrapper for sonner toast.
// sonner accesses `document` at module scope, crashing prerender.
// This module provides a no-op version during SSR and lazy-loads sonner on the client.

let _toast = null;

if (typeof document !== "undefined") {
    // Dynamically import sonner only in the browser
    import("sonner").then((mod) => {
        _toast = mod.toast;
    });
}

const noopToast = () => { };
noopToast.success = () => { };
noopToast.error = () => { };
noopToast.info = () => { };
noopToast.warning = () => { };
noopToast.loading = () => { };
noopToast.promise = () => { };
noopToast.dismiss = () => { };

export const toast = new Proxy(noopToast, {
    apply(_target, _thisArg, args) {
        if (_toast) return _toast(...args);
    },
    get(_target, prop) {
        if (_toast && prop in _toast) return _toast[prop];
        return noopToast[prop] || (() => { });
    },
});
