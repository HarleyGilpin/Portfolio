// No-op stub for dompurify during SSR pre-rendering.
const noop = () => "";

const DOMPurify = {
    sanitize: (dirty) => (typeof dirty === "string" ? dirty : ""),
    addHook: noop,
    removeHook: noop,
    removeHooks: noop,
    removeAllHooks: noop,
    setConfig: noop,
    clearConfig: noop,
    isSupported: false,
    version: "0.0.0-ssr-noop",
};

export default DOMPurify;
