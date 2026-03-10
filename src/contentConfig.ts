export const PORTFOLIO_CONTENT_DEFAULTS = {
  heroName: "Ariful Islam Koushik",
  heroSubtitle: "Product Operations & Technical Operations Leader",
  heroText: "Building scalable systems, smooth workflows, and reliable operations.",
  heroPrimaryButtonLabel: "Contact Me",
  heroSecondaryButtonLabel: "View Projects",
  heroResumeButtonLabel: "Download Resume",
  aboutTitle: "About Me",
  aboutParagraph1:
    "I’m a Product Operations professional with 7+ years of experience managing large-scale systems, logistics, and technical operations. I enjoy turning complex operational problems into clear and scalable solutions.",
  aboutParagraph2:
    "I’ve launched instant delivery services, led warehouse automation, managed 24/7 technical operations, and worked closely with engineering teams to build practical, reliable systems.",
  skillsTitle: "Skills",
  skillsCard1Title: "Product & Operations",
  skillsCard1Items:
    "Product feature launches\nPRD preparation\nRoadmap execution\nStakeholder management\nAgile & Scrum collaboration",
  skillsCard2Title: "Operations & Logistics",
  skillsCard2Items:
    "Warehouse automation\nLast-mile delivery optimization\nInventory management\nProcess improvement",
  skillsCard3Title: "Tools & Technology",
  skillsCard3Items:
    "Microsoft 365 ecosystem\nPower Automate\nSharePoint\nAzure DevOps\nExcel, Word, PowerPoint",
  skillsCard4Title: "Leadership",
  skillsCard4Items:
    "Team recruitment & mentoring\nStaff training\nCross-functional coordination\nRoot-cause problem solving",
  experienceTitle: "Experience",
  experienceItem1Title: "Assistant Director, Product Operations",
  experienceItem1Meta: "Chaldal PLC · Feb 2024 – Present",
  experienceItem1Bullets:
    "Launched instant delivery with 10–15 minute fulfillment\nLed warehouse automation across 5+ sites\nOptimized last-mile delivery to reduce cost and time\nMentored product managers and built operational frameworks",
  experienceItem2Title: "Manager, Technical Operations & Product Ops",
  experienceItem2Meta: "Chaldal PLC · Jan 2022 – Jan 2024",
  experienceItem2Bullets:
    "Managed 24/7 operations for 3 data centers\nLed server relocation and infrastructure setup\nRecruited and trained technical operations teams",
  experienceItem3Title: "Executive & Associate, Technical Operations",
  experienceItem3Meta: "Chaldal PLC · Jul 2019 – Jan 2022",
  experienceItem3Bullets:
    "Handled critical technical escalations\nImproved internal support workflows\nMentored junior team members",
  projectsTitle: "Projects",
  project1Title: "Information Security Training",
  project1Description:
    "Trained 2,200+ employees using a Train-the-Trainer model with 100% participation.",
  project2Title: "Product Discoverability & Tagging",
  project2Description:
    "Led metadata optimization for 12,000+ SKUs to improve search accuracy and conversion.",
  project3Title: "Engineering Bootcamp",
  project3Description: "Managed end-to-end logistics for a 110-person engineering bootcamp.",
  blogTitle: "Blog Posts by Koushik",
  blog1Title: "Building Reliable 24/7 Ops Teams",
  blog1Description: "A practical playbook for staffing, escalation, and improvement loops in around-the-clock operations.",
  blog1Url: "#",
  blog1Body:
    "Running a 24/7 operations team is less about heroics and more about repeatable systems.\n\nAt Chaldal, we focused on three fundamentals: clear shift ownership, fast incident escalation, and tight feedback loops between operations and engineering.\n\nWhen those three are healthy, teams can handle pressure without burnout and customers still get a reliable experience.",
  blog2Title: "Instant Delivery: What Makes It Work",
  blog2Description: "Coming soon: Koushik is currently writing this post and will publish it soon.",
  blog2Url: "#",
  blog2Body: "",
  blog3Title: "Warehouse Automation Without Chaos",
  blog3Description: "Coming soon: Koushik is currently writing this post and will publish it soon.",
  blog3Url: "#",
  blog3Body: "",
  educationTitle: "Education",
  educationDegree: "Bachelor of Business Administration (BBA)",
  educationInstitutionYears: "National University (2016 – 2020)",
  contactTitle: "Get in Touch",
  phoneNumber: "+8801622486838",
  email: "hello@koushik.bd",
  linkedinUrl: "https://www.linkedin.com/in/ariful-islam-koushik/",
  footerName: "Ariful Islam Koushik"
} satisfies Record<string, string>;

export type PortfolioContent = { [K in keyof typeof PORTFOLIO_CONTENT_DEFAULTS]: string };

export const getCmsConfig = () => {
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  return {
    workerBaseUrl: isLocalHost
      ? "http://localhost:8787"
      : "https://portfolio-admin-api.koushik-admin-portal.workers.dev"
  };
};
