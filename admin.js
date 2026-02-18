(() => {
  const contentDefaults = window.PORTFOLIO_CONTENT_DEFAULTS || {};
  const cmsConfig = window.PORTFOLIO_CMS_CONFIG || {};
  const loginForm = document.getElementById("login-form");
  const adminForm = document.getElementById("admin-form");
  const resetButton = document.getElementById("reset-content");
  const logoutButton = document.getElementById("logout");
  const statusText = document.getElementById("status-text");

  if (!loginForm || !adminForm) return;

  const workerBaseUrl = String(cmsConfig.workerBaseUrl || "").replace(/\/+$/, "");

  const setStatus = (message) => {
    if (statusText) statusText.textContent = message;
  };

  const setViewState = (authenticated) => {
    loginForm.classList.toggle("is-hidden", authenticated);
    adminForm.classList.toggle("is-hidden", !authenticated);
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

  const populateForm = (content) => {
    Object.keys(contentDefaults).forEach((key) => {
      const input = adminForm.elements.namedItem(key);
      if (!input) return;
      input.value = content[key] ?? "";
    });
  };

  const getFormPayload = () => {
    const payload = {};
    Object.keys(contentDefaults).forEach((key) => {
      const input = adminForm.elements.namedItem(key);
      const value = input ? String(input.value).trim() : "";
      payload[key] = value || contentDefaults[key];
    });
    return payload;
  };

  const loadPublicContent = async () => {
    const response = await fetch("./data/content.json", { cache: "no-store" });
    if (!response.ok) return { ...contentDefaults };
    const payload = await response.json();
    return { ...contentDefaults, ...(payload || {}) };
  };

  const loadAdminContent = async () => {
    const payload = await apiRequest("/admin/content", { method: "GET" });
    populateForm({ ...contentDefaults, ...(payload.content || {}) });
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const passwordInput = loginForm.elements.namedItem("password");
    const password = passwordInput ? String(passwordInput.value).trim() : "";
    if (!password) {
      setStatus("Password is required.");
      return;
    }

    try {
      await apiRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify({ password })
      });
      setViewState(true);
      await loadAdminContent();
      if (passwordInput) passwordInput.value = "";
      setStatus("Signed in.");
    } catch (error) {
      setStatus(`Sign in failed: ${error.message}`);
    }
  });

  adminForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      await apiRequest("/admin/content", {
        method: "PUT",
        body: JSON.stringify({ content: getFormPayload() })
      });
      setStatus("Saved. GitHub Pages will publish the update shortly.");
    } catch (error) {
      if (error.message.toLowerCase().includes("unauthorized")) {
        setViewState(false);
      }
      setStatus(`Save failed: ${error.message}`);
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", async () => {
      setStatus("");
      try {
        const payload = await apiRequest("/admin/content/reset", {
          method: "POST",
          body: JSON.stringify({})
        });
        populateForm({ ...contentDefaults, ...(payload.content || {}) });
        setStatus("Defaults restored. GitHub Pages will publish shortly.");
      } catch (error) {
        if (error.message.toLowerCase().includes("unauthorized")) {
          setViewState(false);
        }
        setStatus(`Reset failed: ${error.message}`);
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await apiRequest("/admin/logout", { method: "POST", body: JSON.stringify({}) });
      } catch {
        // Ignore logout errors in UI.
      } finally {
        setViewState(false);
        setStatus("Signed out.");
      }
    });
  }

  const initialize = async () => {
    if (!workerBaseUrl) {
      setStatus("Worker URL is not configured.");
      setViewState(false);
      return;
    }

    try {
      const session = await apiRequest("/admin/session", { method: "GET" });
      const authenticated = Boolean(session.authenticated);
      setViewState(authenticated);
      if (authenticated) {
        await loadAdminContent();
      } else {
        populateForm(await loadPublicContent());
      }
    } catch (error) {
      setViewState(false);
      setStatus(`Worker unavailable: ${error.message}`);
      populateForm(await loadPublicContent());
    }
  };

  initialize();
})();
