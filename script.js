(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const contentDefaults = window.PORTFOLIO_CONTENT_DEFAULTS || {};

  const setTextContent = (id, value) => {
    const element = document.getElementById(id);
    if (element && value) {
      element.textContent = value;
    }
  };

  const setLinkHref = (id, hrefValue) => {
    const element = document.getElementById(id);
    if (element && hrefValue) {
      element.setAttribute("href", hrefValue);
    }
  };

  const applyPortfolioContent = (content) => {
    setTextContent("hero-name", content.heroName);
    setTextContent("hero-subtitle", content.heroSubtitle);
    setTextContent("hero-text", content.heroText);
    setTextContent("about-paragraph-1", content.aboutParagraph1);
    setTextContent("about-paragraph-2", content.aboutParagraph2);

    if (content.phoneNumber) {
      const normalizedPhone = String(content.phoneNumber).replace(/\s+/g, "");
      setLinkHref("contact-phone-link", `tel:${normalizedPhone}`);
      setLinkHref("contact-whatsapp-link", `https://wa.me/${normalizedPhone.replace(/^\+/, "")}`);
    }

    if (content.email) {
      setLinkHref("contact-email-link", `mailto:${content.email}`);
    }

    setLinkHref("contact-linkedin-link", content.linkedinUrl);
  };

  const loadPortfolioContent = async () => {
    try {
      const response = await fetch("./data/content.json", {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Failed to load content");
      const payload = await response.json();
      applyPortfolioContent({ ...contentDefaults, ...(payload || {}) });
    } catch (error) {
      applyPortfolioContent({ ...contentDefaults });
    }
  };

  loadPortfolioContent();

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const timeEl = document.getElementById("local-time");
  if (timeEl) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const updateTime = () => {
      const now = new Date();
      timeEl.textContent = `Local time ${formatter.format(now)}`;
    };

    updateTime();
    setInterval(updateTime, 30000);
  }

  const anchorLinks = document.querySelectorAll("a[href^='#']");
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      history.pushState(null, "", targetId);
    });
  });

  const topNav = document.querySelector(".top-nav");
  const navToggle = document.querySelector(".nav-toggle");

  if (topNav && navToggle) {
    const closeMenu = () => {
      topNav.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      topNav.classList.add("menu-open");
      navToggle.setAttribute("aria-expanded", "true");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = topNav.classList.contains("menu-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!topNav.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
    });

    topNav.querySelectorAll(".nav-links a[href^='#']").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const sectionMap = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      const section = id ? document.querySelector(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (sectionMap.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sectionMap.forEach(({ link, section }) => {
              link.classList.toggle("active", section === entry.target);
            });
          }
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0.1,
      }
    );

    sectionMap.forEach(({ section }) => observer.observe(section));
  }
})();
