// No-op stub for @vercel/blob/client during SSR pre-rendering.
export const upload = () => Promise.resolve({ url: "" });
export const put = () => Promise.resolve({ url: "" });
export default { upload: () => Promise.resolve({ url: "" }) };
