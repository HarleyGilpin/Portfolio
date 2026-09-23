export const profile = {
    name: 'Harley Gilpin',
    tagline: 'Software Engineer · IT Auditor (CISA)',
    location: 'Eugene, Oregon',
    github: 'https://github.com/HarleyGilpin',
    linkedin: 'https://www.linkedin.com/in/harleygilpin/',
    summary:
        'Software engineer and CISA-certified IT auditor in Eugene, Oregon. 15 years building, securing, and maintaining web applications for small-business clients, and 4+ years at Armanino testing SOC 1 and SOC 2 controls and building the automation that scales audit delivery across an 80-client portfolio. Work spans full-stack web (React, Next.js, Astro, Django, Stripe), internal tooling and workflow automation, application security, and Unity/XR development.',
};

export const stats = [
    { value: '2011', label: 'Building for the web since' },
    { value: 'CISA', label: 'Certified by ISACA, 2026' },
    { value: '4+ yrs', label: 'SOC 1 / SOC 2 audit' },
    { value: '20+', label: 'Production sites shipped' },
];

export const experience = [
    {
        title: 'IT Audit Associate II',
        company: 'Armanino LLP',
        location: 'Remote',
        dates: 'Mar 2022 – Present',
        bullets: [
            'Perform control testing and evaluate audit evidence on SOC 1, SOC 2, and AUP engagements for financial institutions, credit bureaus, and education SaaS clients.',
            'Evaluate IAM (authentication, role-based provisioning, privileged access, terminations) and ITGCs against SSAE 18 Trust Services Criteria.',
            'Engineered a Django platform that scaled delivery across 80 clients: 2,000+ manual hours removed in year one and 40% faster report cycle time.',
            'Developed automation that drafts SOC 2 reports and sets up testing workpapers, raising reporting throughput 300% in 6 months.',
            'Built automation for client acceptance and onboarding pipelines, integrated with QRM acceptance review so high-risk engagements are flagged automatically.',
            'Document control exceptions and remediation recommendations for engagement managers to review with clients; write team docs and train non-technical staff on tooling.',
        ],
    },
    {
        title: 'Freelance Software Engineer & Consultant',
        company: 'harleygilpin.com',
        location: 'Eugene, OR',
        dates: 'May 2011 – Present',
        bullets: [
            'Delivered and maintain 20+ production marketing and e-commerce sites, owning each account from scoping and quoting through post-launch support.',
            'Implement designs from brand guidelines, then tune for SEO, Core Web Vitals, and accessibility.',
            'Integrate Stripe, Auth.js, Resend/EmailJS, Cloudflare, and Vercel, and document each site so clients can self-serve.',
            'Harden sites (TLS, CSP, input validation) and run a WAF that blocked 15,000+ intrusion attempts in one year, with zero client security incidents.',
            'Built and published three Unity social VR worlds (Quest/SteamVR) and deployed Unity iOS/Android apps to devices.',
        ],
    },
];

export const highlights = [
    {
        title: 'Void: MMO Preservation & Emulation Project',
        category: 'Open Source',
        featured: true,
        description:
            'Second-largest contributor to Void, an open-source Kotlin server that preserves and faithfully emulates a 2011-era MMO so it stays playable after the original version was retired (170+ stars, 100+ forks). 83 merged pull requests since May 2025, recreating whole game systems end to end across content scripts, data definitions, and tests.',
        bullets: [
            'Summoning: every familiar special and passive ability, pets, and beast-of-burden storage.',
            'A random events framework plus the events built on it.',
            'PvP bots that fight players in the Clan Wars free-for-all arena.',
            'The Hunter skill: box traps, deadfalls, magic boxes, falconry, and kebbit tracking.',
            'Player moderation (report abuse, mute, ban, black marks) and bank PIN security.',
            'Tutorial Island, several minigames, and 440+ missing drop tables and combat definitions.',
            'Reliability fixes, including dropped connections that never saved the player.',
        ],
        tags: ['Kotlin', 'Gradle', 'Emulation', 'Game Preservation'],
        link: { label: 'View merged pull requests', href: 'https://github.com/GregHib/void/pulls?q=is%3Apr+author%3AHarleyGilpin+is%3Amerged' },
    },
    {
        title: 'Subscription E-commerce Platform',
        category: 'Web',
        description:
            'Membership site for a coaching client: tiered Stripe subscriptions and webhooks, Google sign-in, a member portal with entitlement-gated video, and an admin panel. Migrated the existing WordPress subscriber base onto Stripe without interrupting billing.',
        tags: ['Next.js', 'Stripe', 'Auth.js', 'PostgreSQL', 'Cloudflare Stream'],
    },
    {
        title: 'Contractor Marketing Site & Local SEO',
        category: 'Web',
        description:
            'Launched as a React SPA, then migrated to statically generated Astro for crawlability and load time. Service pages, gallery, reviews, and an estimate form, backed by schema.org JSON-LD, Open Graph tags, canonical URLs, and a sitemap.',
        tags: ['Astro', 'React', 'Tailwind', 'JSON-LD', 'Vercel'],
    },
    {
        title: 'Multi-Client Delivery Platform',
        category: 'Automation',
        description:
            'Internal Django platform running intake, scoping, status tracking, and reporting across an 80-account portfolio. Removed 2,000+ manual hours in its first year and cut report turnaround 40%.',
        tags: ['Django', 'Python', 'SQL', 'Power Automate'],
    },
    {
        title: 'Site Hardening & Web Application Firewall',
        category: 'Security',
        description:
            'Standardized TLS, CSP headers, and input validation across 20+ client sites and deployed a WAF that blocked 15,000+ intrusion attempts (SQL injection, XSS, bot traffic) in one year. Zero client security incidents to date.',
        tags: ['Security', 'Logging', 'Detection'],
    },
    {
        title: 'Social VR Worlds for Meta Quest',
        category: 'Games & XR',
        description:
            'Three social VR worlds published on VRChat for Meta Quest and SteamVR, including Space Yacht (2022). Held a steady 72 Hz on Quest through batching, atlasing, LODs, baked lighting, occlusion culling, and ASTC textures.',
        tags: ['Unity', 'C# / UdonSharp', 'VRChat SDK', 'Profiling'],
        link: { label: 'Watch Space Yacht walkthrough', href: 'https://www.youtube.com/watch?v=zBH7FFViokE' },
    },
    {
        title: 'iOS & Android Builds',
        category: 'Games & XR',
        description:
            'Unity and cross-platform mobile apps deployed to devices for clients and testers, with backend services and automated build and deployment pipelines. Fixed load-time, memory, and stability issues and carried SDKs through breaking upgrades.',
        tags: ['Unity', 'iOS', 'Android'],
    },
    {
        title: 'Unreal Engine 5 Editor Tooling',
        category: 'Games & XR',
        description:
            'Self-directed UE5 work building Editor Utility Widgets and Blueprint-based tools for asset and project workflows, expanding into C++ modules and the Automation Test Framework.',
        tags: ['Unreal Engine 5', 'Blueprints', 'Editor Utilities'],
    },
];

export const skills = [
    { label: 'Languages', items: ['TypeScript / JavaScript', 'Python', 'C#', 'Java', 'Kotlin', 'SQL', 'Bash'] },
    { label: 'Front End', items: ['React', 'Next.js', 'Astro', 'Tailwind CSS', 'HTML / CSS'] },
    { label: 'Back End & Data', items: ['Node.js', 'Django', '.NET', 'PostgreSQL', 'MySQL', 'Prisma', 'REST APIs', 'Webhooks', 'OAuth 2.0 / Auth.js'] },
    { label: 'Integrations', items: ['Stripe', 'Resend', 'EmailJS', 'Cloudflare Stream'] },
    { label: 'Security & Compliance', items: ['SOC 1 / SOC 2', 'SSAE 18', 'ITGC', 'IAM', 'PCI-DSS', 'HIPAA', 'NIST CSF', 'CSP / TLS', 'WAF', 'WCAG (pa11y)'] },
    { label: 'Games & XR', items: ['Unity', 'Meta Quest / SteamVR', 'VRChat SDK / UdonSharp', 'Unity Profiler', 'Unreal Engine 5'] },
    { label: 'Tooling', items: ['Git / GitHub', 'CI', 'Vercel', 'Cloudflare DNS', 'Power BI', 'Power Automate', 'Claude Code'] },
];

export const certifications = [
    { name: 'Certified Information Systems Auditor (CISA)', issuer: 'ISACA', date: 'March 2026' },
];

export const education = [
    {
        degree: 'B.S. Business Administration',
        school: 'Bushnell University',
        location: 'Eugene, OR',
        details: ['Cum Laude, GPA 3.5+', 'All-CCC Athlete, 2015 – 2019'],
    },
];
