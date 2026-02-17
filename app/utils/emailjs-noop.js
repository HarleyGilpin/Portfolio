// No-op stub for @emailjs/browser during SSR pre-rendering.
const noop = () => Promise.resolve({ status: 200, text: "OK" });

export const send = noop;
export const sendForm = noop;
export const init = () => { };
export default { send: noop, sendForm: noop, init: () => { } };
