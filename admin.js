(() => {
  const contentDefaults = window.PORTFOLIO_CONTENT_DEFAULTS || {};
  const cmsConfig = window.PORTFOLIO_CMS_CONFIG || {};
  const loginForm = document.getElementById("login-form");
  const adminForm = document.getElementById("admin-form");
  const blogForm = document.getElementById("blog-form");
  const editorNav = document.getElementById("editor-nav");
  const openBlogEditorButton = document.getElementById("open-blog-editor");
  const openGeneralEditorButton = document.getElementById("open-general-editor");
  const logoutButton = document.getElementById("logout");
  const previewWebsiteButton = document.getElementById("preview-website");
  const statusText = document.getElementById("status-text");
  const previewModal = document.getElementById("admin-blog-preview-modal");
  const previewModalImage = document.getElementById("admin-blog-preview-image");
  const previewModalTitle = document.getElementById("admin-blog-preview-title");
  const previewModalSummary = document.getElementById("admin-blog-preview-summary");
  const previewModalBody = document.getElementById("admin-blog-preview-body");
  const previewModalLink = document.getElementById("admin-blog-preview-link");
  const selectionToolbar = document.getElementById("editor-selection-toolbar");
  const floatingHeadingPicker = document.getElementById("floating-heading-picker");
  const floatingHeadingToggle = document.getElementById("floating-heading-toggle");
  const floatingHeadingMenu = document.getElementById("floating-heading-menu");
  const ADMIN_PREVIEW_STORAGE_KEY_PREFIX = "portfolioAdminPreviewContent:";

  if (!loginForm || !adminForm || !blogForm) return;

  const BLOG_KEYS = [
    "blogTitle",
    "blog1Title",
    "blog1Description",
    "blog1Url",
    "blog1Body",
    "blog2Title",
    "blog2Description",
    "blog2Url",
    "blog2Body",
    "blog3Title",
    "blog3Description",
    "blog3Url",
    "blog3Body"
  ];
  const GENERAL_KEYS = Object.keys(contentDefaults).filter((key) => !BLOG_KEYS.includes(key));
  const OPTIONAL_EMPTY_KEYS = new Set(["blog1Body", "blog2Body", "blog3Body"]);

  const loginSubmitButton = loginForm.querySelector("button[type='submit']");
  const generalSaveButton = adminForm.querySelector("button[type='submit']");
  const blogSaveButton = blogForm.querySelector("button[type='submit']");
  const generalCommitInput = adminForm.elements.namedItem("commitMessage");
  const blogCommitInput = blogForm.elements.namedItem("blogCommitMessage");
  const blogPanels = Array.from(blogForm.querySelectorAll(".blog-editor-section[data-blog-panel]"));
  const editorSelections = new WeakMap();
  let activeBlogEditor = null;

  const workerBaseUrl = String(cmsConfig.workerBaseUrl || "").replace(/\/+$/, "");
  let currentContent = { ...contentDefaults };
  let loginPending = false;
  let generalSavePending = false;
  let blogSavePending = false;
  let logoutPending = false;
  let activeEditorMode = "general";

  const setStatus = (message, tone = "info") => {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.classList.remove("status-info", "status-success", "status-error");
    statusText.classList.add(`status-${tone}`);
  };

  const isBusy = () => loginPending || generalSavePending || blogSavePending || logoutPending;

  const setEditorMode = (mode) => {
    activeEditorMode = mode === "general" ? "general" : "blog";
    adminForm.classList.toggle("is-hidden", activeEditorMode !== "general");
    blogForm.classList.toggle("is-hidden", activeEditorMode !== "blog");
    if (openBlogEditorButton) {
      openBlogEditorButton.classList.toggle("is-active", activeEditorMode === "blog");
      openBlogEditorButton.setAttribute("aria-pressed", activeEditorMode === "blog" ? "true" : "false");
    }
    if (openGeneralEditorButton) {
      openGeneralEditorButton.classList.toggle("is-active", activeEditorMode === "general");
      openGeneralEditorButton.setAttribute("aria-pressed", activeEditorMode === "general" ? "true" : "false");
    }
  };

  const setViewState = (authenticated) => {
    loginForm.classList.toggle("is-hidden", authenticated);
    if (editorNav) editorNav.classList.toggle("is-hidden", !authenticated);
    if (!authenticated) {
      adminForm.classList.add("is-hidden");
      blogForm.classList.add("is-hidden");
      return;
    }
    setEditorMode(activeEditorMode);
  };

  const setPendingState = (form, isPending) => {
    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) field.disabled = isPending;
    });
  };

  const setEditorPendingState = (isPending) => {
    setPendingState(adminForm, isPending);
    setPendingState(blogForm, isPending);
  };

  const getErrorMessage = (error) => {
    const raw = error instanceof Error ? error.message : "Unexpected error";
    const normalized = String(raw).toLowerCase();
    if (
      normalized.includes("failed to fetch") ||
      normalized.includes("networkerror") ||
      normalized.includes("load failed")
    ) {
      return "Cannot reach worker API. Check worker URL, CORS origin, and whether wrangler dev is running.";
    }
    return raw;
  };

  const apiRequest = async (path, options = {}) => {
    if (!workerBaseUrl) {
      throw new Error("Missing worker URL in content-config.js");
    }

    const response = await fetch(`${workerBaseUrl}${path}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Request failed");
    }
    return payload;
  };

  const setInputValue = (name, value) => {
    const target = document.querySelector(`[name="${name}"]`);
    if (target && "value" in target) {
      target.value = value ?? "";
    }
  };

  const normalizeRichTextInput = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.includes("<") && raw.includes(">")) return raw;
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
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

  const normalizeEditorHtml = (html) => {
    const template = document.createElement("template");
    template.innerHTML = sanitizeRichHtml(html);

    template.content.querySelectorAll("div").forEach((node) => {
      const p = document.createElement("p");
      p.innerHTML = node.innerHTML;
      node.replaceWith(p);
    });

    const isEmptyBlock = (node) => {
      const text = String(node.textContent || "").trim();
      if (text) return false;
      return !node.querySelector("img,video,iframe,embed,object,br");
    };

    const rootElements = Array.from(template.content.children);
    rootElements.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (["P", "H1", "H2", "H3", "H4", "H5", "H6", "LI"].includes(node.tagName) && isEmptyBlock(node)) {
        node.remove();
      }
    });

    // Prevent invalid nested heading tags that can amplify rendered size.
    template.content.querySelectorAll("h1 h1, h1 h2, h1 h3, h1 h4, h1 h5, h1 h6, h2 h1, h2 h2, h2 h3, h2 h4, h2 h5, h2 h6, h3 h1, h3 h2, h3 h3, h3 h4, h3 h5, h3 h6, h4 h1, h4 h2, h4 h3, h4 h4, h4 h5, h4 h6, h5 h1, h5 h2, h5 h3, h5 h4, h5 h5, h5 h6, h6 h1, h6 h2, h6 h3, h6 h4, h6 h5, h6 h6")
      .forEach((nestedHeading) => {
        const span = document.createElement("span");
        span.innerHTML = nestedHeading.innerHTML;
        nestedHeading.replaceWith(span);
      });

    const trimmedElements = Array.from(template.content.children);
    for (let i = trimmedElements.length - 1; i >= 0; i -= 1) {
      const node = trimmedElements[i];
      if (!(node instanceof HTMLElement)) continue;
      if (!["P", "H1", "H2", "H3", "H4", "H5", "H6"].includes(node.tagName)) break;
      if (!isEmptyBlock(node)) break;
      node.remove();
    }

    return template.innerHTML.trim();
  };

  const syncBlogEditorsFromFields = () => {
    [1, 2, 3].forEach((index) => {
      const source = blogForm.elements.namedItem(`blog${index}Body`);
      const surface = document.getElementById(`blog${index}BodyEditor`);
      if (!source || !surface) return;
      surface.innerHTML = normalizeEditorHtml(normalizeRichTextInput(source.value));
    });
  };

  const syncBlogEditorsToFields = () => {
    [1, 2, 3].forEach((index) => {
      const source = blogForm.elements.namedItem(`blog${index}Body`);
      const surface = document.getElementById(`blog${index}BodyEditor`);
      if (!source || !surface) return;
      const cleaned = normalizeEditorHtml(surface.innerHTML);
      source.value = cleaned === "<br>" ? "" : cleaned;
    });
  };

  const getVisibleEditorSurface = () => {
    if (activeBlogEditor) return activeBlogEditor;
    return blogForm.querySelector(".blog-editor-surface");
  };

  const getActiveBlogIndex = () => {
    if (activeBlogEditor && activeBlogEditor.id) {
      const match = activeBlogEditor.id.match(/^blog(\d+)BodyEditor$/);
      if (match && match[1]) return match[1];
    }
    const openedPanel = blogForm.querySelector(".blog-editor-section[open][data-blog-panel]");
    if (openedPanel) return String(openedPanel.getAttribute("data-blog-panel") || "1");
    return "1";
  };

  const ensureSelectionInSurface = (surface) => {
    const selection = window.getSelection();
    if (!selection) return;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (surface.contains(range.commonAncestorContainer)) return;
    }
    const range = document.createRange();
    range.selectNodeContents(surface);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const saveSurfaceSelection = (surface) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) return false;
    editorSelections.set(surface, range.cloneRange());
    return true;
  };

  const restoreSurfaceSelection = (surface) => {
    const range = editorSelections.get(surface);
    if (!range) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const getToolbarButtons = (surface) => {
    const editor = surface.closest(".blog-editor");
    if (!editor) return [];
    return Array.from(editor.querySelectorAll("[data-editor-action]"));
  };

  const getFloatingToolbarButtons = () => {
    if (!selectionToolbar) return [];
    return Array.from(selectionToolbar.querySelectorAll("[data-editor-action]"));
  };

  const hasNonCollapsedSelectionInSurface = (surface) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    return surface.contains(range.commonAncestorContainer);
  };

  const queryCommandStateSafe = (command) => {
    try {
      return Boolean(document.queryCommandState(command));
    } catch {
      return false;
    }
  };

  const queryCommandValueSafe = (command) => {
    try {
      return String(document.queryCommandValue(command) || "");
    } catch {
      return "";
    }
  };

  const execCommandSafe = (command, value = null) => {
    try {
      return Boolean(document.execCommand(command, false, value));
    } catch {
      return false;
    }
  };

  const updateEditorToolbarState = (surface) => {
    const buttons = [...getToolbarButtons(surface), ...getFloatingToolbarButtons()];
    const toggle = (action, enabled) => {
      buttons
        .filter((item) => item.getAttribute("data-editor-action") === action)
        .forEach((item) => item.classList.toggle("is-active", Boolean(enabled)));
    };

    toggle("bold", queryCommandStateSafe("bold"));
    toggle("italic", queryCommandStateSafe("italic"));
    toggle("underline", queryCommandStateSafe("underline"));
    toggle("bullet", queryCommandStateSafe("insertUnorderedList"));
    toggle("numbered", queryCommandStateSafe("insertOrderedList"));
    const format = queryCommandValueSafe("formatBlock").toLowerCase();
    const headingMatch = format.match(/h([1-6])/);
    const headingLevel = headingMatch ? headingMatch[1] : "";
    toggle("paragraph", false);
    toggle("heading", headingLevel === "2");
    toggle("heading1", headingLevel === "1");
    toggle("heading2", headingLevel === "2");
    toggle("heading3", headingLevel === "3");
    toggle("heading4", headingLevel === "4");
    toggle("heading5", headingLevel === "5");
    toggle("heading6", headingLevel === "6");
  };

  const hideSelectionToolbar = () => {
    if (!selectionToolbar) return;
    selectionToolbar.classList.add("is-hidden");
    if (floatingHeadingMenu) floatingHeadingMenu.classList.add("is-hidden");
    if (floatingHeadingToggle) floatingHeadingToggle.setAttribute("aria-expanded", "false");
  };

  const hideFloatingHeadingMenu = () => {
    if (floatingHeadingMenu) floatingHeadingMenu.classList.add("is-hidden");
    if (floatingHeadingToggle) floatingHeadingToggle.setAttribute("aria-expanded", "false");
  };

  const updateSelectionToolbar = (surface) => {
    if (!selectionToolbar || !surface) return;
    const activeElement = document.activeElement;
    const isEditorFocused = activeElement instanceof HTMLElement && activeElement === surface;
    const isToolbarFocused = activeElement instanceof HTMLElement && selectionToolbar.contains(activeElement);
    if (!isEditorFocused && !isToolbarFocused) {
      hideSelectionToolbar();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      hideSelectionToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) {
      hideSelectionToolbar();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) {
      hideSelectionToolbar();
      return;
    }

    selectionToolbar.classList.remove("is-hidden");
    const toolbarWidth = selectionToolbar.offsetWidth || 260;
    const toolbarHeight = selectionToolbar.offsetHeight || 40;
    const margin = 8;
    const left = Math.min(
      window.innerWidth - toolbarWidth - margin,
      Math.max(margin, rect.left + rect.width / 2 - toolbarWidth / 2)
    );
    const top = rect.top - toolbarHeight - 10 < margin ? rect.bottom + 10 : rect.top - toolbarHeight - 10;

    selectionToolbar.style.left = `${Math.round(left)}px`;
    selectionToolbar.style.top = `${Math.round(top)}px`;
    updateEditorToolbarState(surface);
  };

  const wrapSelectionWithTag = (surface, tagName) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return false;
    if (!surface.contains(range.commonAncestorContainer)) return false;

    const wrapper = document.createElement(tagName);
    const extracted = range.extractContents();
    wrapper.appendChild(extracted);
    range.insertNode(wrapper);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    editorSelections.set(surface, nextRange.cloneRange());
    return true;
  };

  const applyInlineFormat = (surface, action, tagName) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) return false;

    if (!range.collapsed) {
      return wrapSelectionWithTag(surface, tagName);
    }

    return execCommandSafe(action);
  };

  const applyHeadingFormat = (surface, level) => {
    const tag = `h${level}`;
    // Use block formatting to avoid nested heading wrappers and compounding sizes.
    return execCommandSafe("formatBlock", tag) || execCommandSafe("formatBlock", `<${tag}>`);
  };

  const updateBlogBodyStats = () => {
    [1, 2, 3].forEach((index) => {
      const bodyField = document.getElementById(`blog${index}BodyEditor`);
      const wordTarget = document.getElementById(`blog${index}BodyWords`);
      const charTarget = document.getElementById(`blog${index}BodyChars`);
      if (!bodyField || !wordTarget || !charTarget) return;

      const text = String(bodyField.textContent || "");
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      wordTarget.textContent = String(words);
      charTarget.textContent = String(text.length);
    });
  };

  const updateBlogSectionSummaries = () => {
    [1, 2, 3].forEach((index) => {
      const titleInput = blogForm.elements.namedItem(`blog${index}Title`);
      const summary = document.getElementById(`blog${index}SectionSummary`);
      if (!titleInput || !summary) return;

      const title = String(titleInput.value || "").trim();
      summary.textContent = title || `Blog Post ${index}`;
    });
  };

  const closeBlogPreview = () => {
    if (!previewModal) return;
    previewModal.classList.add("is-hidden");
    document.body.style.overflow = "";
  };

  const openBlogPreview = (indexOverride = null) => {
    if (!previewModal || !previewModalImage || !previewModalTitle || !previewModalSummary || !previewModalBody || !previewModalLink) return;
    syncBlogEditorsToFields();

    const index = indexOverride ? String(indexOverride) : getActiveBlogIndex();
    const titleInput = blogForm.elements.namedItem(`blog${index}Title`);
    const descriptionInput = blogForm.elements.namedItem(`blog${index}Description`);
    const bodyInput = blogForm.elements.namedItem(`blog${index}Body`);
    const urlInput = blogForm.elements.namedItem(`blog${index}Url`);

    const title = String(titleInput?.value || "");
    const summary = String(descriptionInput?.value || "");
    const bodyHtml = sanitizeRichHtml(bodyInput?.value || "");
    const url = String(urlInput?.value || "#").trim();
    const imageMap = {
      "1": "assets/blog-cover-ops.svg",
      "2": "assets/blog-cover-delivery.svg",
      "3": "assets/blog-cover-warehouse.svg"
    };

    previewModalImage.setAttribute("src", imageMap[index] || imageMap["1"]);
    previewModalImage.setAttribute("alt", `Cover image for ${title || "blog post preview"}`);
    previewModalTitle.textContent = title || "Untitled Blog Post";
    previewModalSummary.textContent = summary;
    previewModalBody.innerHTML = bodyHtml;

    if (url && url !== "#") {
      previewModalLink.classList.remove("is-hidden");
      previewModalLink.setAttribute("href", url);
    } else {
      previewModalLink.classList.add("is-hidden");
      previewModalLink.setAttribute("href", "#");
    }

    previewModal.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  };

  const applyEditorAction = (surface, action) => {
    surface.focus();
    if (!restoreSurfaceSelection(surface)) {
      ensureSelectionInSurface(surface);
    }
    const format = queryCommandValueSafe("formatBlock").toLowerCase();

    switch (action) {
      case "paragraph":
        execCommandSafe("formatBlock", "p") || execCommandSafe("formatBlock", "<p>");
        break;
      case "heading":
        if (format.includes("h2")) {
          execCommandSafe("formatBlock", "p") || execCommandSafe("formatBlock", "<p>");
        } else {
          applyHeadingFormat(surface, 2);
        }
        break;
      case "heading1":
        applyHeadingFormat(surface, 1);
        break;
      case "heading2":
        applyHeadingFormat(surface, 2);
        break;
      case "heading3":
        applyHeadingFormat(surface, 3);
        break;
      case "heading4":
        applyHeadingFormat(surface, 4);
        break;
      case "heading5":
        applyHeadingFormat(surface, 5);
        break;
      case "heading6":
        applyHeadingFormat(surface, 6);
        break;
      case "bold":
        applyInlineFormat(surface, "bold", "strong");
        break;
      case "italic":
        applyInlineFormat(surface, "italic", "em");
        break;
      case "underline":
        applyInlineFormat(surface, "underline", "u");
        break;
      case "bullet":
        execCommandSafe("insertUnorderedList");
        break;
      case "numbered":
        execCommandSafe("insertOrderedList");
        break;
      case "link": {
        const url = window.prompt("Enter link URL", "https://");
        if (url) {
          execCommandSafe("createLink", url);
        }
        break;
      }
      case "linebreak":
        execCommandSafe("insertParagraph");
        break;
      case "undo":
        execCommandSafe("undo");
        break;
      case "redo":
        execCommandSafe("redo");
        break;
      default:
        return;
    }
    updateEditorToolbarState(surface);
    saveSurfaceSelection(surface);
    syncBlogEditorsToFields();
    updateBlogBodyStats();
  };

  const initializeBlogBodyEditors = () => {
    hideSelectionToolbar();
    const editors = Array.from(blogForm.querySelectorAll(".blog-editor"));
    editors.forEach((editor) => {
      const surface = editor.querySelector(".blog-editor-surface");
      if (!surface) return;
      activeBlogEditor = activeBlogEditor || surface;
      const buttons = Array.from(editor.querySelectorAll("[data-editor-action]"));
      buttons.forEach((button) => {
        button.addEventListener("mousedown", (event) => {
          saveSurfaceSelection(surface);
          event.preventDefault();
        });
        button.addEventListener("click", () => {
          saveSurfaceSelection(surface);
          const action = button.getAttribute("data-editor-action");
          if (!action) return;
          applyEditorAction(surface, action);
        });
      });

      surface.addEventListener("focus", () => {
        activeBlogEditor = surface;
        saveSurfaceSelection(surface);
        updateEditorToolbarState(surface);
        hideSelectionToolbar();
      });
      surface.addEventListener("mouseup", () => {
        saveSurfaceSelection(surface);
        updateEditorToolbarState(surface);
        if (hasNonCollapsedSelectionInSurface(surface)) {
          updateSelectionToolbar(surface);
        } else {
          hideSelectionToolbar();
        }
      });
      surface.addEventListener("keyup", () => {
        saveSurfaceSelection(surface);
        updateEditorToolbarState(surface);
        if (hasNonCollapsedSelectionInSurface(surface)) {
          updateSelectionToolbar(surface);
        } else {
          hideSelectionToolbar();
        }
      });

      surface.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          if (event.shiftKey) {
            execCommandSafe("insertLineBreak");
            syncBlogEditorsToFields();
            updateBlogBodyStats();
            updateEditorToolbarState(surface);
            return;
          }
          applyEditorAction(surface, "linebreak");
          return;
        }

        if (event.key === "Tab") {
          event.preventDefault();
          execCommandSafe(event.shiftKey ? "outdent" : "indent");
          syncBlogEditorsToFields();
          updateBlogBodyStats();
          updateEditorToolbarState(surface);
          return;
        }

        const isMod = event.ctrlKey || event.metaKey;
        if (!isMod) return;

        const key = String(event.key || "").toLowerCase();
        const code = String(event.code || "");
        if (key === "b") {
          event.preventDefault();
          applyEditorAction(surface, "bold");
        } else if (key === "i") {
          event.preventDefault();
          applyEditorAction(surface, "italic");
        } else if (key === "u") {
          event.preventDefault();
          applyEditorAction(surface, "underline");
        } else if (key === "k") {
          event.preventDefault();
          applyEditorAction(surface, "link");
        } else if (key === "z") {
          event.preventDefault();
          applyEditorAction(surface, event.shiftKey ? "redo" : "undo");
        } else if (key === "y") {
          event.preventDefault();
          applyEditorAction(surface, "redo");
        } else if ((key === "8" || key === "*") && event.shiftKey) {
          event.preventDefault();
          applyEditorAction(surface, "bullet");
        } else if (key === "7" && event.shiftKey) {
          event.preventDefault();
          applyEditorAction(surface, "numbered");
        } else if (event.altKey && (code === "Digit1" || key === "1")) {
          event.preventDefault();
          applyEditorAction(surface, "heading1");
        } else if (event.altKey && (code === "Digit2" || key === "2")) {
          event.preventDefault();
          applyEditorAction(surface, "heading");
        } else if (event.altKey && (code === "Digit3" || key === "3")) {
          event.preventDefault();
          applyEditorAction(surface, "heading3");
        } else if (event.altKey && (code === "Digit4" || key === "4")) {
          event.preventDefault();
          applyEditorAction(surface, "heading4");
        } else if (event.altKey && (code === "Digit5" || key === "5")) {
          event.preventDefault();
          applyEditorAction(surface, "heading5");
        } else if (event.altKey && (code === "Digit6" || key === "6")) {
          event.preventDefault();
          applyEditorAction(surface, "heading6");
        } else if (event.altKey && (code === "Digit0" || key === "0")) {
          event.preventDefault();
          applyEditorAction(surface, "paragraph");
        } else if (event.shiftKey && key === "n") {
          event.preventDefault();
          applyEditorAction(surface, "paragraph");
        }
      });

      surface.addEventListener("input", () => {
        saveSurfaceSelection(surface);
        syncBlogEditorsToFields();
        updateBlogBodyStats();
        updateEditorToolbarState(surface);
        hideSelectionToolbar();
      });

      surface.addEventListener("blur", () => {
        const normalized = normalizeEditorHtml(surface.innerHTML);
        if (surface.innerHTML !== normalized) {
          surface.innerHTML = normalized;
        }
        syncBlogEditorsToFields();
        updateBlogBodyStats();
        updateEditorToolbarState(surface);
        hideSelectionToolbar();
      });

      surface.addEventListener("paste", (event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return;
        const plain = clipboard.getData("text/plain");
        if (!plain) return;
        event.preventDefault();
        execCommandSafe("insertText", plain);
      });

      execCommandSafe("styleWithCSS", false);
      execCommandSafe("defaultParagraphSeparator", "p");
    });

    document.addEventListener("selectionchange", () => {
      if (!activeBlogEditor) return;
      if (document.activeElement !== activeBlogEditor) {
        hideSelectionToolbar();
        return;
      }
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        hideSelectionToolbar();
        return;
      }
      const range = selection.getRangeAt(0);
      if (!activeBlogEditor.contains(range.commonAncestorContainer)) {
        hideSelectionToolbar();
        return;
      }
      editorSelections.set(activeBlogEditor, range.cloneRange());
      updateEditorToolbarState(activeBlogEditor);
      updateSelectionToolbar(activeBlogEditor);
    });

    const floatingButtons = getFloatingToolbarButtons();
    floatingButtons.forEach((button) => {
      button.addEventListener("mousedown", (event) => {
        if (activeBlogEditor) saveSurfaceSelection(activeBlogEditor);
        event.preventDefault();
      });
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-editor-action");
        if (!action || !activeBlogEditor) return;
        applyEditorAction(activeBlogEditor, action);
        hideSelectionToolbar();
      });
    });

    if (floatingHeadingToggle && floatingHeadingMenu) {
      floatingHeadingToggle.addEventListener("mousedown", (event) => {
        if (activeBlogEditor) saveSurfaceSelection(activeBlogEditor);
        event.preventDefault();
      });
      floatingHeadingToggle.addEventListener("click", () => {
        const isHidden = floatingHeadingMenu.classList.contains("is-hidden");
        floatingHeadingMenu.classList.toggle("is-hidden", !isHidden);
        floatingHeadingToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
      });
    }

    document.addEventListener("mousedown", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (floatingHeadingPicker && !floatingHeadingPicker.contains(target)) {
        hideFloatingHeadingMenu();
      }
      if (selectionToolbar && selectionToolbar.contains(target)) return;
      hideSelectionToolbar();
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    });

    window.addEventListener("scroll", hideSelectionToolbar, { passive: true });
    window.addEventListener("resize", hideSelectionToolbar);
  };

  const initializeBlogEditorUx = () => {
    if (!blogPanels.length) return;
    blogPanels.forEach((panel) => {
      panel.addEventListener("toggle", () => {
        if (!panel.open) return;
        const surface = panel.querySelector(".blog-editor-surface");
        if (surface) activeBlogEditor = surface;
      });
    });

    [1, 2, 3].forEach((index) => {
      const titleInput = blogForm.elements.namedItem(`blog${index}Title`);
      if (!titleInput) return;
      titleInput.addEventListener("input", () => {
        updateBlogSectionSummaries();
      });
    });

    const previewButtons = Array.from(blogForm.querySelectorAll("[data-preview-blog-index]"));
    previewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (isBusy()) return;
        const index = button.getAttribute("data-preview-blog-index");
        if (!index) return;
        openBlogPreview(index);
      });
    });

    updateBlogSectionSummaries();
    updateBlogBodyStats();
  };

  const populateForms = (content) => {
    currentContent = { ...contentDefaults, ...(content || {}) };
    Object.keys(contentDefaults).forEach((key) => setInputValue(key, currentContent[key]));
    syncBlogEditorsFromFields();
    updateBlogSectionSummaries();
    updateBlogBodyStats();
  };

  const readFormPatch = (form, keys) => {
    const patch = {};
    keys.forEach((key) => {
      const input = form.elements.namedItem(key);
      if (!input) return;
      const rawValue = String(input.value ?? "");
      const trimmed = rawValue.trim();

      if (!trimmed && !OPTIONAL_EMPTY_KEYS.has(key)) {
        patch[key] = contentDefaults[key];
        return;
      }

      patch[key] = OPTIONAL_EMPTY_KEYS.has(key) ? rawValue : trimmed;
    });
    return patch;
  };

  const getCommitMessage = (input) => {
    if (!input) return "";
    return String(input.value || "").trim();
  };

  const buildPreviewContent = () => {
    syncBlogEditorsToFields();
    const generalPatch = readFormPatch(adminForm, GENERAL_KEYS);
    const blogPatch = readFormPatch(blogForm, BLOG_KEYS);
    return { ...currentContent, ...generalPatch, ...blogPatch };
  };

  const saveContentPatch = async (patch, commitMessage) => {
    const nextContent = { ...currentContent, ...patch };
    const payload = await apiRequest("/admin/content", {
      method: "PUT",
      body: JSON.stringify({
        content: nextContent,
        commitMessage
      })
    });
    currentContent = { ...contentDefaults, ...(payload.content || nextContent) };
    populateForms(currentContent);
  };

  const loadPublicContent = async () => {
    const response = await fetch("./data/content.json", { cache: "no-store" });
    if (!response.ok) return { ...contentDefaults };
    const payload = await response.json();
    return { ...contentDefaults, ...(payload || {}) };
  };

  const loadAdminContent = async () => {
    const payload = await apiRequest("/admin/content", { method: "GET" });
    populateForms(payload.content || {});
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isBusy()) return;
    setStatus("", "info");

    const passwordInput = loginForm.elements.namedItem("password");
    const password = passwordInput ? String(passwordInput.value).trim() : "";
    if (!password) {
      setStatus("Password is required.", "error");
      return;
    }

    loginPending = true;
    setPendingState(loginForm, true);
    if (loginSubmitButton) loginSubmitButton.textContent = "Signing In...";

    try {
      await apiRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify({ password })
      });
      setViewState(true);
      await loadAdminContent();
      if (passwordInput) passwordInput.value = "";
      setStatus("Signed in.", "success");
    } catch (error) {
      setStatus(`Sign in failed: ${getErrorMessage(error)}`, "error");
    } finally {
      loginPending = false;
      setPendingState(loginForm, false);
      if (loginSubmitButton) loginSubmitButton.textContent = "Sign In";
    }
  });

  adminForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isBusy()) return;
    setStatus("", "info");
    generalSavePending = true;
    setEditorPendingState(true);
    if (generalSaveButton) generalSaveButton.textContent = "Saving...";

    try {
      const patch = readFormPatch(adminForm, GENERAL_KEYS);
      await saveContentPatch(patch, getCommitMessage(generalCommitInput));
      if (generalCommitInput) generalCommitInput.value = "";
      setStatus("General content saved. GitHub Pages will publish shortly.", "success");
    } catch (error) {
      if (String(error.message || "").toLowerCase().includes("unauthorized")) {
        setViewState(false);
      }
      setStatus(`Save failed: ${getErrorMessage(error)}`, "error");
    } finally {
      generalSavePending = false;
      setEditorPendingState(false);
      if (generalSaveButton) generalSaveButton.textContent = "Save Changes";
    }
  });

  blogForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isBusy()) return;
    setStatus("", "info");
    blogSavePending = true;
    setEditorPendingState(true);
    if (blogSaveButton) blogSaveButton.textContent = "Saving Blog...";

    try {
      syncBlogEditorsToFields();
      const patch = readFormPatch(blogForm, BLOG_KEYS);
      await saveContentPatch(patch, getCommitMessage(blogCommitInput));
      if (blogCommitInput) blogCommitInput.value = "";
      setStatus("Blog content saved. GitHub Pages will publish shortly.", "success");
    } catch (error) {
      if (String(error.message || "").toLowerCase().includes("unauthorized")) {
        setViewState(false);
      }
      setStatus(`Blog save failed: ${getErrorMessage(error)}`, "error");
    } finally {
      blogSavePending = false;
      setEditorPendingState(false);
      if (blogSaveButton) blogSaveButton.textContent = "Save Blog Changes";
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      if (isBusy()) return;
      logoutPending = true;
      setEditorPendingState(true);
      logoutButton.textContent = "Signing Out...";

      try {
        await apiRequest("/admin/logout", { method: "POST", body: JSON.stringify({}) });
      } catch {
        // Ignore logout errors in UI.
      } finally {
        logoutPending = false;
        setEditorPendingState(false);
        logoutButton.textContent = "Log Out";
        setViewState(false);
        setStatus("Signed out.", "success");
      }
    });
  }

  if (previewWebsiteButton) {
    previewWebsiteButton.addEventListener("click", () => {
      if (isBusy()) return;
      try {
        const previewContent = buildPreviewContent();
        const previewId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const previewStorageKey = `${ADMIN_PREVIEW_STORAGE_KEY_PREFIX}${previewId}`;
        window.localStorage.setItem(previewStorageKey, JSON.stringify(previewContent));
        const targetUrl = new URL("./index.html", window.location.href);
        targetUrl.searchParams.set("adminPreview", "1");
        targetUrl.searchParams.set("previewId", previewId);
        targetUrl.searchParams.set("t", String(Date.now()));
        window.open(targetUrl.toString(), "_blank", "noopener");
        setStatus("Opened website preview with unsaved draft edits.", "info");
      } catch (error) {
        setStatus(`Preview failed: ${getErrorMessage(error)}`, "error");
      }
    });
  }

  if (openBlogEditorButton) {
    openBlogEditorButton.addEventListener("click", () => {
      if (isBusy()) return;
      setEditorMode("blog");
    });
  }

  if (openGeneralEditorButton) {
    openGeneralEditorButton.addEventListener("click", () => {
      if (isBusy()) return;
      setEditorMode("general");
    });
  }

  if (previewModal) {
    previewModal.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("[data-close-admin-preview='true']")) {
        closeBlogPreview();
      }
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !previewModal.classList.contains("is-hidden")) {
        closeBlogPreview();
      }
    });
  }

  const initialize = async () => {
    if (!workerBaseUrl) {
      setStatus("Worker URL is not configured.", "error");
      setViewState(false);
      return;
    }

    try {
      setStatus("Checking session...", "info");
      const session = await apiRequest("/admin/session", { method: "GET" });
      const authenticated = Boolean(session.authenticated);
      setViewState(authenticated);
      if (authenticated) {
        await loadAdminContent();
        setStatus("Signed in.", "success");
      } else {
        populateForms(await loadPublicContent());
        setStatus("Please sign in to edit content.", "info");
      }
    } catch (error) {
      setViewState(false);
      setStatus(`Worker unavailable: ${getErrorMessage(error)}`, "error");
      populateForms(await loadPublicContent());
    }
  };

  initializeBlogBodyEditors();
  initializeBlogEditorUx();
  initialize();
})();
