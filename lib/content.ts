// Planet page content. Every line is taken from site/public/Yousef-Alkady-CV.pdf or docs/copy.md; nothing invented.
// Titles, organisations and dates match Yousef's LinkedIn (screenshots 2026-11-17).
export type Entry = { id?: string; title: string; org?: string; when?: string; tech?: string; link?: { href: string; label: string }; points: string[] };
export type PlanetPage = { slug: string; planet: string; kicker: string; title: string; accent: string; entries: Entry[]; extra?: { title: string; items: string[] } };

export const PAGES: Record<string, PlanetPage> = {
  projects: {
    slug: "projects", planet: "Projects", kicker: "Things I built", title: "Projects", accent: "#ff4f7a",
    entries: [
      {
        id: "unilink", title: "UniLink", org: "Executive Lead Developer · UniLink Campus", when: "Mar 2025 – Nov 2026",
        tech: "React, TypeScript, Vite, Supabase (PostgreSQL), Tailwind CSS, Vercel, Vitest, Playwright",
        points: [
          "Lead development of a student-only campus platform combining forums, anonymous professor reviews, private messaging, communities and events.",
          "Onboarded 500+ verified university users through domain-restricted email authentication.",
          "Built collaborative study tools: a notes vault (course notes, PDFs, past exams), study groups with group chat and shared notes, and a bounty system for academic requests.",
          "Increased community contributions by 35% with a points economy, badges and tiered leaderboards; scores are calculated server-side in the database so users cannot manipulate them.",
          "Maintain Vitest unit tests, Playwright end-to-end tests, ESLint checks and versioned Supabase SQL migrations, with CI/CD deployment on Vercel.",
        ],
      },
      {
        id: "crumbs", title: "Crumbs & Co", org: "Full-Stack Developer · e-commerce storefront", when: "Mar 2026 – Present",
        tech: "Next.js, TypeScript, Tailwind CSS, Supabase",
        points: [
          "Developed a full-stack e-commerce platform with a highly interactive UI using Next.js, TypeScript and Tailwind CSS, resulting in 40% faster page load times.",
          "Built end-to-end purchasing flows with dynamic, state-managed cart logic that securely processes and clears session data for 100+ daily transactions.",
          "Implemented the backend on Supabase, configuring Row Level Security (RLS) policies so customers can only ever reach their own data.",
        ],
      },
      {
        id: "mesh", title: "Off-Grid Military Mesh Network", org: "Hardware Network Engineer", when: "Jan 2026 – Oct 2026",
        tech: "C++, ESP32, SX1276 LoRa, RadioLib, Golomb-Rice coding, MATLAB",
        points: [
          "Designing an infrastructure-free link that delivers camera images over LoRa when cellular and internet service are down, for disaster and field response.",
          "Built a loss-tolerant lossless image coder: every packet decodes on its own (Golomb-Rice rows, bit-reversed interleaving, blending of lost rows), so one lost packet no longer ruins the image.",
          "Best quality in every simulated loss case: 37.5 dB PSNR at 10% random loss against 35.7 dB for contiguous bands, for about 2% more bytes, across 82 test images.",
          "Added a duty-cycle-aware wake-up: one long-preamble packet wakes the sleeping receiver, which picks spreading factor and bandwidth from its SNR within the 10% airtime limit of the 433 MHz band.",
          "On ESP32 + SX1276 boards the codec matched simulation byte for byte, encoded an image in under 57 ms and delivered images through one floor and two walls at no more than 1.7% packet loss; an independent MATLAB re-implementation reproduced the results.",
          "Co-author (with Mai Hassan) of the IEEE-style paper \"Loss-Tolerant Image Delivery over a Single LoRa Link for Infrastructure-Free Disaster Response\".",
        ],
      },
      {
        title: "Uber Distance Optimization", org: "Data project", tech: "Python, NumPy, Matplotlib",
        points: ["Achieved 14% better route-distance prediction by implementing Haversine (curved-Earth) distance in Python/NumPy against a Euclidean baseline."],
      },
      {
        title: "Technical Integration Proposals for MSA University", org: "Phase 2 Solutions · independent student development group", when: "2026",
        points: [
          "Contributed to three formal technical proposals for university IT leadership: Academic Data Synchronization & Event Webhooks, Public-Facing Academic Utilities, and an Annual Inter-University Software Hackathon Framework.",
          "Covered proposed architecture, security protocols, DNS and infrastructure requirements, integration planning and institutional benefits (proposal stage; not implemented).",
        ],
      },
    ],
  },
  experience: {
    slug: "experience", planet: "Experiences", kicker: "Where I've worked", title: "Experience", accent: "#ffb347",
    entries: [
      {
        title: "Information Technology Intern", org: "Arab African International Bank (AAIB) · Full-time · Cairo, Egypt", when: "Aug 2026 – Sep 2026",
        points: [
          "Rotated through the IT and Information Security departments of a regulated Egyptian bank (one-month internship).",
          "Supported configuration, connectivity checks and day-to-day maintenance of Cisco routers, switches and network hardware.",
          "Diagnosed and resolved IP addressing, connectivity and VPN issues, tracing faults from end-user devices to the network layer.",
          "Introduced to penetration-testing and vulnerability-assessment tooling (Nmap, Wireshark, Metasploit, Burp Suite, Nessus) and how security teams use findings to remediate weaknesses.",
          "Cybersecurity: application and information security, OWASP Top 10, secure software development lifecycle (SSDLC), vulnerability assessment (DAST, IAST), web application firewalls and ethical hacking.",
          "IT & infrastructure: IT support, network and technical troubleshooting, enterprise networking, VPN and remote access, Windows administration, Active Directory and Group Policy, identity & access management and virtual machines.",
          "Security concepts: CIA triad, security policies, access control, authentication and authorization, session security, secure configuration, log security, proxy technologies and endpoint security.",
        ],
      },
      {
        title: "Artificial Intelligence Intern", org: "CIB Egypt · Internship · Remote", when: "Jul 2026",
        points: [
          "Participating in the Commercial International Bank (CIB) 2026 Learning Program to gain practical exposure to the banking and financial services industry.",
          "Developing an understanding of banking operations, financial products, customer service and professional banking practices.",
          "Attending technical and professional development sessions on banking fundamentals, compliance and workplace skills.",
          "Collaborating with professionals across departments to see day-to-day banking operations and business processes first hand.",
          "Strengthening analytical, communication, teamwork and problem-solving skills through hands-on activities and case studies.",
        ],
      },
      {
        title: "Partnerships Lead", org: "Codeyssey (an initiative by Talentier)", when: "Sep 2026 – Present",
        link: { href: "https://www.codeyssey.com", label: "codeyssey.com" },
        points: [
          "Lead partnerships for Codeyssey, a national 24-hour AI hackathon for Egyptian students and recent graduates (first edition planned for January 2027).",
          "Secured ElSewedy Electric and ITI as partners; in active discussions with Nokia, Huawei, Avid Beams, Valeo and other organizations.",
          "Created the partner pitch deck, one-pager and promotional videos, defining sponsorship tiers (EGP 50K–250K+), a EGP 200,000 target prize pool and partner benefits.",
        ],
      },
      {
        title: "Data Science & AI Trainee", org: "AMIT Learning · Apprenticeship", when: "Nov 2025 – Nov 2026",
        points: [
          "Completing intensive hands-on training in Data Science, Machine Learning and Artificial Intelligence.",
          "Using Python for data analysis with NumPy, Pandas and Matplotlib.",
          "Applying data preprocessing, exploratory data analysis (EDA), feature engineering and data visualization.",
          "Building and evaluating machine learning models with Scikit-learn.",
          "Working with SQL for data querying and database management.",
          "Gaining practical experience on real-world datasets and project-based assignments, building a foundation in predictive analytics and model evaluation.",
        ],
      },
      {
        title: "Front-End Web Development Intern", org: "EncryptCore · 120-hour internship",
        points: [
          "Completed a 120-hour Front-End Web Development Internship, building responsive and interactive web applications.",
          "Developed skills in HTML5, CSS3, JavaScript (ES6+), DOM manipulation, APIs and responsive web design.",
          "Applied modern front-end practices to create dynamic, user-friendly websites while strengthening problem-solving, debugging and UI implementation.",
        ],
      },
    ],
  },
  education: {
    slug: "education", planet: "Education", kicker: "Where I learned", title: "Education", accent: "#5aa8ff",
    entries: [
      { title: "Bachelor of Science (Hons) in Computer Science", org: "MSA University (October University for Modern Sciences and Arts), Cairo, Egypt, awarded by the University of Greenwich, London, UK", when: "Expected 2028", points: [] },
    ],
    extra: {
      title: "Certifications",
      items: [
        "Building LLM Applications · NVIDIA (issued Sep 2025): LLM applications, retrieval-augmented generation (RAG), inference optimization and full-stack AI integration in Python",
        "Data Science & AI Trainee · AMIT Learning, apprenticeship (Nov 2025 – Nov 2026)",
        "Artificial Intelligence Intern · CIB Egypt (2026 Learning Program)",
        "Front-End Web Development Internship · EncryptCore (certificate of completion, 120 hours)",
      ],
    },
  },
};

// hub planet id -> page route (the UniLink moon opens its project on the Projects page)
export const PLANET_ROUTE: Record<string, string> = { projects: "/projects", unilink: "/projects#unilink", experiences: "/experience", education: "/education" };
