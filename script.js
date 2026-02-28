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
  const getScrollOffset = () => (window.matchMedia("(min-width: 1024px)").matches ? 132 : 20);

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      const targetTop = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      history.pushState(null, "", targetId);
    });
  });

  const navLinks = Array.from(
    document.querySelectorAll(".nav-links a[href^='#'], .quick-nav a[href^='#']")
  );
  const sections = navLinks
    .map((link) => link.getAttribute("href"))
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .map((id) => ({ id, section: document.querySelector(id) }))
    .filter(({ section }) => section);

  if (sections.length) {
    const setActiveById = (activeId) => {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === activeId);
      });
    };

    const updateActiveLink = () => {
      const offsetFromTop = window.matchMedia("(min-width: 1024px)").matches ? 180 : 120;
      const probeY = window.scrollY + offsetFromTop;

      let currentId = sections[0].id;
      sections.forEach(({ id, section }) => {
        if (section.offsetTop <= probeY) {
          currentId = id;
        }
      });

      setActiveById(currentId);
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
    window.addEventListener("resize", updateActiveLink);
  }
})();
