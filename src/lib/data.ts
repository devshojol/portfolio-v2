/**
 * Canonical origin, no trailing slash. Used by metadataBase, the sitemap,
 * robots.txt and the JSON-LD graph, so it lives in exactly one place.
 */
export const siteUrl = "https://shojol-islam.web.app";

export const profile = {
  name: "Shojol Islam",
  firstName: "Shojol",
  role: "Frontend Developer",
  specialty: "React & React Native",
  tagline: "React on the web, React Native on mobile.",
  location: "Dhaka, Bangladesh",
  email: "shojolislam3231@gmail.com",
  phone: "+880 1336-189168",
  phoneHref: "+8801336189168",
  summary:
    "Frontend dev in Dhaka. React on the web, React Native on mobile, and the Express/MongoDB bits in between. Two of my apps are on the Play Store and App Store right now.",
  availability: "Open to React & frontend roles",

  /**
   * Résumé. The file in /public is generated from the Google Doc — re-export
   * the doc to PDF and drop it in as `public/Shojol-Islam-Resume.pdf` whenever
   * you update it. Source doc:
   * https://docs.google.com/document/d/1DQDbI53Wf58dt6vvkhcCCMTrm3eDXzv2M4FJc_9WqgQ/edit
   */
  resumeUrl: "/Shojol-Islam-Resume.pdf",
} as const;

export const socials = [
  {
    label: "GitHub",
    handle: "devshojol",
    href: "https://github.com/devshojol",
  },
  {
    label: "LinkedIn",
    handle: "in/devshojol",
    href: "https://www.linkedin.com/in/devshojol/",
  },
  {
    label: "Email",
    handle: "shojolislam3231@gmail.com",
    href: "mailto:shojolislam3231@gmail.com",
  },
] as const;

export const stats = [
  { value: "1.5", suffix: "+", label: "Years shipping" },
  { value: "2", suffix: "", label: "In production" },
  { value: "4", suffix: "", label: "Store listings" },
  { value: "3", suffix: "", label: "Certifications" },
] as const;

export const experience = [
  {
    company: "WebAppick",
    role: "Frontend Developer",
    location: "Dhaka, Bangladesh",
    period: "Sep 2024 — Present",
    current: true,
    points: [
      "I build on both sides — React for web, React Native + Expo for mobile. Same components either way, so I barely notice the switch.",
      "Wrote the API when a screen needed one — Express and MongoDB.",
      "Tests before ship. Jest for units, Maestro and Cypress for the full run. Boring releases are good releases.",
      "Git Flow, Jira. Sitting next to seniors who don't let sloppy code through.",
    ],
    stack: [
      "React",
      "React Native",
      "TypeScript",
      "Express.js",
      "MongoDB",
      "Jira",
    ],
  },
] as const;

export const projects = [
  {
    id: "gonit",
    name: "Gonit",
    subtitle: "Math Olympiad practice app",
    year: "2025",
    blurb:
      "A math practice platform for classes 1-10, built as part of a team. I contributed across the web and mobile apps, helping build and refine the overall user experience, backed by an Express + MongoDB API.",
    highlights: [
      "Practice questions, checked instantly",
      "Progress that follows the student",
      "Out on Play Store and App Store",
    ],
    stack: ["React Native", "Expo", "NativeWind", "Express.js", "MongoDB"],
    accent: "#22d3ee",
    // these are search links, not direct deep links to the app pages.
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/search?q=gonit%20math%20olympiad&c=apps",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/gonit-practice-math-olympiad/id6746192772",
      },
    ],
  },
  {
    id: "chintu",
    name: "Chintu",
    subtitle: "Bengali stories & poems for children",
    year: "2025",
    blurb:
      "Bengali stories, poems and quizzes for kids, pulled from a WordPress backend. The whole job was keeping it simple enough that a six-year-old never gets lost.",
    highlights: [
      "A reader built for small hands",
      "Quizzes straight from WordPress",
      "Out on Play Store and App Store",
    ],
    stack: ["React Native", "Expo", "WordPress REST API"],
    accent: "#4f7dff",
    // these are search links, not direct deep links to the app pages.
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.webappick.chintuapp&pcampaignid=web_share",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/in/app/chintu/id6761411583",
      },
    ],
  },
] as const;

export const skillGroups = [
  {
    title: "Frontend",
    items: [
      "JavaScript (ES6+)",
      "TypeScript",
      "React",
      "Next.js",
      "React Native",
      "Expo",
      "Redux",
      "Tailwind CSS",
      "NativeWind",
    ],
  },
  {
    title: "Backend",
    items: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "Mongoose",
      "REST API design",
      "Firebase",
    ],
  },
  {
    title: "Testing",
    items: ["Jest", "Maestro", "Cypress"],
  },
  {
    title: "Tools & Workflow",
    items: ["Git", "GitHub", "Git Flow", "Jira", "Figma"],
  },
] as const;

export const education = [
  {
    title: "B.B.A (Hons) in Marketing",
    org: "Mohammadpur Kendriya College, Dhaka",
    period: "2025 — Present",
  },
] as const;

export const certifications = [
  { title: "Complete Web Development", org: "Programming Hero" },
  { title: "Next Level Web Development", org: "Programming Hero" },
  { title: "Computer Science Fundamentals", org: "Phitron" },
] as const;

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;

export const marqueeWords = [
  "React",
  "React Native",
  "TypeScript",
  "Next.js",
  "Expo",
  "Node.js",
  "MongoDB",
  "Tailwind",
  "Jest",
  "Cypress",
  "Figma",
  "Git Flow",
] as const;
