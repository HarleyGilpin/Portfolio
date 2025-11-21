# Harley Gilpin - Portfolio & Blog

A futuristic, modern portfolio website built with **React** and **Vite**, featuring a fully functional blog and admin dashboard powered by **Vercel Serverless Functions**, **Neon (PostgreSQL)**, and **Vercel Blob**.

https://github.com/user-attachments/assets/b37f95b5-f715-4737-a592-7130b0bb411c

## 🚀 Features

- **Futuristic Design**: Premium dark theme with neon accents and glassmorphism effects.
- **Responsive Layout**: Fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Blog**:
  - Public blog listing and individual article pages.
  - SEO-optimized with dynamic meta tags.
  - **Database Backed**: Posts are stored in a Neon PostgreSQL database.
- **Admin Dashboard**:
  - Password-protected access.
  - **WYSIWYG Editor**: Create and edit posts with rich text.
  - **Image Uploads**: Direct client-side uploads to Vercel Blob.
  - CRUD operations (Create, Read, Update, Delete).
- **Contact Form**:
  - Real email sending via **EmailJS**.
  - Form validation and success/error states.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Neon (PostgreSQL) via `@vercel/postgres`
- **Storage**: Vercel Blob via `@vercel/blob`
- **Email**: EmailJS (`@emailjs/browser`)
- **Editor**: React Quill New
- **Icons**: Lucide React

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following keys:

```properties
# Admin Access
VITE_ADMIN_PASSWORD=your_secure_password

# Database (Neon)
POSTGRES_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
# ... (other Vercel Postgres keys)

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Email (EmailJS)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Start the Development Server
> [!IMPORTANT]
> You must use the Vercel CLI to run the app locally so that the API functions work correctly.

```bash
npx vercel dev
```
The application will be available at `http://localhost:3000`.

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add the **Environment Variables** in the Vercel Project Settings.
4.  Deploy!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
