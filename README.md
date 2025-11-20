# Harley Gilpin - Portfolio & Blog

A futuristic, modern portfolio website built with **React** and **Vite**. This project showcases professional experience, projects, and includes a fully functional blog with an admin dashboard.

![Portfolio Preview](https://via.placeholder.com/800x400?text=Portfolio+Preview)

## 🚀 Features

- **Futuristic Design**: Premium dark theme with neon accents and glassmorphism effects.
- **Responsive Layout**: Fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Blog**:
  - Public blog listing and individual article pages.
  - SEO-optimized with dynamic meta tags.
- **Admin Dashboard**:
  - Password-protected access.
  - **WYSIWYG Editor**: Create and edit posts with rich text and image support (powered by `react-quill-new`).
  - CRUD operations (Create, Read, Update, Delete) for blog posts.
- **Persistence**: Blog posts are currently saved to `localStorage` for easy demo purposes without a backend.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, CSS Variables
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Editor**: React Quill New
- **SEO**: React Helmet Async
- **Icons**: Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/portfolio.git
    cd portfolio
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # If you encounter dependency conflicts with React 19, use:
    npm install --legacy-peer-deps
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 🔐 Admin Access

To access the Admin Dashboard and manage blog posts:

1.  Navigate to `/admin/login` (e.g., `http://localhost:5173/admin/login`).
2.  Enter the demo password: **`admin123`**

> **Note**: Data is persisted in your browser's `localStorage`. Clearing your cache will remove all blog posts.

## 🏗️ Building for Production

To create a production-ready build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready to be deployed to Vercel, Netlify, or any static host.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
