---
description: How to setup Enterprise DNS (Cloudflare) for Vercel projects
---

# Enterprise DNS Management Strategy

To fulfill the "Enterprise DNS Management" promise while hosting on Vercel, the industry standard best practice is to use **Cloudflare** as the DNS and security layer sitting in front of Vercel.

## Why Cloudflare?
- **DDoS Protection**: Vercel has good protection, but Cloudflare's is "Enterprise" grade and marketed as such.
- **WAF (Web Application Firewall)**: Blocks malicious bots and attacks before they reach Vercel.
- **Faster DNS**: Cloudflare has the fastest globally distributed DNS resolvers (1.1.1.1).
- **Page Rules**: Granular control over caching and forwarding.

## Setup Workflow

### 1. Account Setup
- Create a **Cloudflare Account** (The free tier is sufficient for 99% of "Enterprise" claims for small biz).
- **Pro Tip**: You can create a single "Agency" account and add clients' sites there, OR create separate accounts for them (recommended for true ownership).

### 2. Add Site to Cloudflare
1. Click **+ Add a Site**
2. Enter client's domain (e.g., `client-business.com`)
3. Select **Free Plan** (or Pro if they need image optimization/more firewall rules)
4. Cloudflare will scan existing DNS records.

### 3. Point Nameservers
1. Go to the domain registrar (GoDaddy, Namecheap, etc.)
2. Change Nameservers to the ones Cloudflare provides (e.g., `bob.ns.cloudflare.com`, `alice.ns.cloudflare.com`)

### 4. Connect to Vercel
1. In Vercel Project Settings > Domains, add `client-business.com`
2. Vercel will ask for an **A Record** (`76.76.21.21`) and **CNAME** (`cname.vercel-dns.com`).
3. **IMPORTANT**: In Cloudflare DNS settings:
   - **Proxy Status**: Set to **DNS Only (Grey Cloud)** initially to verify SSL.
   - Once Vercel issues the certificate (usually instant), you can switch to **Proxied (Orange Cloud)** for the security benefits.
   - *Note*: Vercel generally recommends "DNS Only" to let them handle SSL, but "Proxied" works if you set SSL/TLS encryption mode to **Full (Strict)** in Cloudflare.

## What to Tell Clients
When they ask about "Enterprise DNS", you tell them:
> "We route your traffic through a global enterprise content delivery network (Cloudflare) which provides banking-grade DDoS protection, a Web Application Firewall, and ensuring 100% uptime through redundant DNS resolution."
