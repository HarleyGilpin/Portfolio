# Harley Gilpin - Portfolio & Blog

A futuristic, modern portfolio website built with **React** and **Vite**, featuring a fully functional blog, admin dashboard, and **Headless Agency Automation** powered by **Vercel Serverless Functions**, **Stripe**, and **Linear**.

## 🚀 Features

### Front-End & Design
- **Futuristic Design**: Premium dark theme with neon accents and glassmorphism effects.
- **Responsive Layout**: Fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Blog**: SEO-optimized article pages backed by Neon PostgreSQL.
- **Admin Dashboard**: Secure WYSIWYG editor for content management with Vercel Blob image hosting.

### 🤖 Headless Agency Automation
The site automates core agency operations by connecting Stripe events directly to Linear tasks:
- **New Project Ingestion**: Successful payments trigger a "New Project" task in Linear with client details, deadlines, and requirements.
- **Revenue Protection**: Failed recurring payments trigger an **URGENT** "Revenue Alert" task with a direct link to the invoice.
- **Churn Management**: Hosting cancellations allow for automated "Server Offboarding" tasks to be created immediately.

### e-Commerce & Client Management
- **Service & Hosting Checkout**: Integrated Stripe Checkout supporting mixed one-time service fees and monthly hosting subscriptions.
- **Automated Agreements**: legally binding Service Agreements (with conditional Hosting Addendums) are generated, "sealed," and stored in the database at the moment of purchase.
- **Client Portal**: Self-service portal (`/portal`) for clients to manage their subscriptions and payment methods.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Neon (PostgreSQL) via `@vercel/postgres`
- **Automation**: Stripe Webhooks -> Linear GraphQL API
- **Storage**: Vercel Blob via `@vercel/blob`
- **Email**: EmailJS (`@emailjs/browser`)

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

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Email (EmailJS)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Dashboard > Developers > Webhooks

# Linear (Automation)
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=your_team_id
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
3.  Add all **Environment Variables** in the Vercel Project Settings.
4.  **Stripe Webhook Configuration**:
    - Add endpoint: `https://your-domain.com/api/stripe-webhook`
    - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
5.  Deploy!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
