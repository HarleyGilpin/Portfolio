// No-op stub for sonner used during SSR pre-rendering.
// The real sonner package references `document` at module scope, which
// crashes in Node.js.  This module exports the same API shape as stubs.

const noop = () => { };
noop.success = noop;
noop.error = noop;
noop.info = noop;
noop.warning = noop;
noop.loading = noop;
noop.promise = noop;
noop.dismiss = noop;
noop.custom = noop;
noop.message = noop;

export const toast = noop;
export const Toaster = () => null;
export default { toast: noop, Toaster: () => null };
