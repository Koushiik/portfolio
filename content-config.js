window.PORTFOLIO_CONTENT_DEFAULTS = {
  heroName: "Ariful Islam Koushik",
  heroSubtitle: "Product Operations & Technical Operations Leader",
  heroText: "Building scalable systems, smooth workflows, and reliable operations.",
  aboutParagraph1:
    "I’m a Product Operations professional with 6+ years of experience managing large-scale systems, logistics, and technical operations. I enjoy turning complex operational problems into clear and scalable solutions.",
  aboutParagraph2:
    "I’ve launched instant delivery services, led warehouse automation, managed 24/7 technical operations, and worked closely with engineering teams to build practical, reliable systems.",
  phoneNumber: "+8801622486838",
  email: "hello@koushik.bd",
  linkedinUrl: "https://www.linkedin.com/in/ariful-islam-koushik/"
};

(() => {
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  window.PORTFOLIO_CMS_CONFIG = {
    workerBaseUrl: isLocalHost
      ? "http://localhost:8787"
      : "https://portfolio-admin-api.koushik-admin-portal.workers.dev"
  };
})();
