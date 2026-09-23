import { useEffect, useState } from "react";

// This component only renders the Toaster on the client side.
// sonner uses `document` at module scope, so we must avoid importing
// it during server-side prerendering.
export default function ClientToaster() {
    const [ToasterComponent, setToasterComponent] = useState(null);

    useEffect(() => {
        import("sonner").then((mod) => {
            setToasterComponent(() => mod.Toaster);
        });
    }, []);

    if (!ToasterComponent) return null;

    return <ToasterComponent position="top-center" theme="dark" richColors />;
}
