import type { Config } from "@react-router/dev/config";

export default {
    ssr: false,
    prerender: [
        "/",
        "/about",
        "/services",
        "/projects",
        "/resume",
        "/contact",
        "/blog",
        "/faq",
    ],
} satisfies Config;
