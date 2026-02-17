import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
    // Pages with shared Layout (navbar + footer)
    layout("./components/Layout.jsx", [
        index("./pages/Home.jsx"),
        route("about", "./pages/About.jsx"),
        route("services", "./pages/Services.jsx"),
        route("projects", "./pages/Projects.jsx"),
        route("resume", "./pages/Resume.jsx"),
        route("contact", "./pages/Contact.jsx"),
        route("blog", "./pages/Blog.jsx"),
        route("blog/:slug", "./pages/BlogPost.jsx"),
        route("faq", "./pages/FAQ.jsx"),
    ]),

    // Standalone pages (no shared Layout)
    route("admin/login", "./pages/Admin/Login.jsx"),
    route("checkout", "./pages/Checkout.jsx"),
    route("success", "./pages/Success.jsx"),
    route("portal", "./pages/Portal.jsx"),
    route("admin", "./pages/Admin/Dashboard.jsx"),
    route("*", "./pages/NotFound.jsx"),
] satisfies RouteConfig;
