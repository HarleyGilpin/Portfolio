// No-op stub for react-quill-new during SSR pre-rendering.
import React from "react";

const ReactQuill = React.forwardRef(function ReactQuillNoop(_props, _ref) {
    return null;
});

export const Quill = {
    register: () => { },
    import: () => ({}),
    find: () => null,
};

export default ReactQuill;
