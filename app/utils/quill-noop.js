// No-op stub for quill during SSR pre-rendering.
const noop = () => { };
class QuillStub {
    static register() { }
    static import() { return {}; }
    static find() { return null; }
    on() { }
    off() { }
    container = { style: {} };
}

export default QuillStub;
