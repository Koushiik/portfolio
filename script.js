(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const contentDefaults = window.PORTFOLIO_CONTENT_DEFAULTS || {};
  const ADMIN_PREVIEW_STORAGE_KEY_PREFIX = "portfolioAdminPreviewContent:";
  let activeContent = { ...contentDefaults };

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

  const setAttributeValue = (id, name, value) => {
    const element = document.getElementById(id);
    if (element && value) {
      element.setAttribute(name, value);
    }
  };

  const sanitizeRichHtml = (html) => {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("script,style,iframe,object,embed").forEach((node) => node.remove());
    template.content.querySelectorAll("*").forEach((node) => {
      Array.from(node.attributes).forEach((attr) => {
        if (/^on/i.test(attr.name)) {
          node.removeAttribute(attr.name);
        }
      });
      if (node instanceof HTMLAnchorElement) {
        const href = node.getAttribute("href") || "";
        if (href.trim().toLowerCase().startsWith("javascript:")) {
          node.removeAttribute("href");
        }
      }
    });
    return template.innerHTML.trim();
  };

  const setListContent = (id, value) => {
    const element = document.getElementById(id);
    if (!element || !value) return;
    const items = String(value)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!items.length) return;

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      element.appendChild(li);
    });
  };

  const applyPortfolioContent = (content) => {
    activeContent = { ...contentDefaults, ...(content || {}) };
    setTextContent("hero-name", content.heroName);
    setTextContent("hero-subtitle", content.heroSubtitle);
    setTextContent("hero-text", content.heroText);
    setTextContent("hero-contact-btn", content.heroPrimaryButtonLabel);
    setTextContent("hero-projects-btn", content.heroSecondaryButtonLabel);
    setTextContent("hero-resume-btn", content.heroResumeButtonLabel);
    setTextContent("about-title", content.aboutTitle);
    setTextContent("about-paragraph-1", content.aboutParagraph1);
    setTextContent("about-paragraph-2", content.aboutParagraph2);
    setTextContent("skills-title", content.skillsTitle);
    setTextContent("skills-card-1-title", content.skillsCard1Title);
    setTextContent("skills-card-2-title", content.skillsCard2Title);
    setTextContent("skills-card-3-title", content.skillsCard3Title);
    setTextContent("skills-card-4-title", content.skillsCard4Title);
    setListContent("skills-card-1-list", content.skillsCard1Items);
    setListContent("skills-card-2-list", content.skillsCard2Items);
    setListContent("skills-card-3-list", content.skillsCard3Items);
    setListContent("skills-card-4-list", content.skillsCard4Items);
    setTextContent("experience-title", content.experienceTitle);
    setTextContent("experience-item-1-title", content.experienceItem1Title);
    setTextContent("experience-item-1-meta", content.experienceItem1Meta);
    setTextContent("experience-item-2-title", content.experienceItem2Title);
    setTextContent("experience-item-2-meta", content.experienceItem2Meta);
    setTextContent("experience-item-3-title", content.experienceItem3Title);
    setTextContent("experience-item-3-meta", content.experienceItem3Meta);
    setListContent("experience-item-1-list", content.experienceItem1Bullets);
    setListContent("experience-item-2-list", content.experienceItem2Bullets);
    setListContent("experience-item-3-list", content.experienceItem3Bullets);
    setTextContent("projects-title", content.projectsTitle);
    setTextContent("project-1-title", content.project1Title);
    setTextContent("project-1-description", content.project1Description);
    setTextContent("project-2-title", content.project2Title);
    setTextContent("project-2-description", content.project2Description);
    setTextContent("project-3-title", content.project3Title);
    setTextContent("project-3-description", content.project3Description);
    setTextContent("blog-title", content.blogTitle);
    setTextContent("blog-1-title", activeContent.blog1Title);
    setTextContent("blog-1-description", activeContent.blog1Description);
    setTextContent("blog-2-title", activeContent.blog2Title);
    setTextContent("blog-2-description", activeContent.blog2Description);
    setTextContent("blog-3-title", activeContent.blog3Title);
    setTextContent("blog-3-description", activeContent.blog3Description);
    setTextContent("education-title", content.educationTitle);
    setTextContent("education-degree", content.educationDegree);
    setTextContent("education-institution-years", content.educationInstitutionYears);
    setTextContent("contact-title", content.contactTitle);
    setTextContent("footer-name", content.footerName);
    setLinkHref("blog-1-link", activeContent.blog1Url);
    setLinkHref("blog-2-link", activeContent.blog2Url);
    setLinkHref("blog-3-link", activeContent.blog3Url);
    setAttributeValue("blog-1-link", "aria-label", `Read blog post: ${activeContent.blog1Title}`);
    setAttributeValue("blog-2-link", "aria-label", `Read blog post: ${activeContent.blog2Title}`);
    setAttributeValue("blog-3-link", "aria-label", `Read blog post: ${activeContent.blog3Title}`);

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

  const initializeBlogModal = () => {
    const modal = document.getElementById("blog-modal");
    const modalImage = document.getElementById("blog-modal-image");
    const modalTitle = document.getElementById("blog-modal-title");
    const modalSummary = document.getElementById("blog-modal-summary");
    const modalBody = document.getElementById("blog-modal-body");
    const modalLink = document.getElementById("blog-modal-link");
    const blogCards = Array.from(document.querySelectorAll(".blog-card[data-blog-index]"));
    if (!modal || !modalImage || !modalTitle || !modalSummary || !modalBody || !modalLink || !blogCards.length) return;

    const closeModal = () => {
      modal.classList.add("is-hidden");
      document.body.style.overflow = "";
    };

    const openModal = (index) => {
      const safeIndex = String(index);
      const cardImage = document.getElementById(`blog-${safeIndex}-image`);
      const title = activeContent[`blog${safeIndex}Title`] || "";
      const summary = activeContent[`blog${safeIndex}Description`] || "";
      const body = activeContent[`blog${safeIndex}Body`] || "";
      const url = activeContent[`blog${safeIndex}Url`] || "#";

      if (cardImage) {
        modalImage.src = cardImage.getAttribute("src") || "";
        modalImage.alt = cardImage.getAttribute("alt") || title;
      }

      modalTitle.textContent = title;
      modalSummary.textContent = summary;
      modalBody.innerHTML = sanitizeRichHtml(body);

      if (url && url !== "#") {
        modalLink.classList.remove("is-hidden");
        modalLink.setAttribute("href", url);
      } else {
        modalLink.classList.add("is-hidden");
        modalLink.setAttribute("href", "#");
      }

      modal.classList.remove("is-hidden");
      document.body.style.overflow = "hidden";
    };

    blogCards.forEach((card) => {
      const triggerLink = card.querySelector("[data-blog-trigger='true']");
      if (triggerLink) {
        triggerLink.addEventListener("click", (event) => {
          const index = card.getAttribute("data-blog-index");
          if (!index) return;
          event.preventDefault();
          event.stopPropagation();
          openModal(index);
        });
      }

      card.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("[data-close-blog-modal='true']")) return;
        const index = card.getAttribute("data-blog-index");
        if (!index) return;
        event.preventDefault();
        openModal(index);
      });

      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const index = card.getAttribute("data-blog-index");
        if (!index) return;
        event.preventDefault();
        openModal(index);
      });
    });

    modal.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("[data-close-blog-modal='true']")) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.classList.contains("is-hidden")) {
        closeModal();
      }
    });
  };

  const loadPortfolioContent = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const isAdminPreview = searchParams.get("adminPreview") === "1";
    const previewId = String(searchParams.get("previewId") || "").trim();
    if (isAdminPreview) {
      try {
        const rawPreview = previewId
          ? window.localStorage.getItem(`${ADMIN_PREVIEW_STORAGE_KEY_PREFIX}${previewId}`)
          : null;
        if (rawPreview) {
          const previewContent = JSON.parse(rawPreview);
          applyPortfolioContent({ ...contentDefaults, ...(previewContent || {}) });
          return;
        }
      } catch {
        // Fall back to content.json when preview payload is unavailable.
      }
    }

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
  initializeBlogModal();

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

  const anchorLinks = document.querySelectorAll("a[href^='#']:not([data-blog-trigger='true'])");
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
