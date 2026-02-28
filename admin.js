(() => {
  const contentDefaults = window.PORTFOLIO_CONTENT_DEFAULTS || {};
  const cmsConfig = window.PORTFOLIO_CMS_CONFIG || {};
  const loginForm = document.getElementById("login-form");
  const adminForm = document.getElementById("admin-form");
  const resetButton = document.getElementById("reset-content");
  const logoutButton = document.getElementById("logout");
  const statusText = document.getElementById("status-text");

  if (!loginForm || !adminForm) return;
  const loginSubmitButton = loginForm.querySelector("button[type='submit']");
  const saveSubmitButton = adminForm.querySelector("button[type='submit']");

  const workerBaseUrl = String(cmsConfig.workerBaseUrl || "").replace(/\/+$/, "");
  let loginPending = false;
  let savePending = false;
  let resetPending = false;
  let logoutPending = false;

  const setStatus = (message, tone = "info") => {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.classList.remove("status-info", "status-success", "status-error");
    statusText.classList.add(`status-${tone}`);
  };

  const setViewState = (authenticated) => {
    loginForm.classList.toggle("is-hidden", authenticated);
    adminForm.classList.toggle("is-hidden", !authenticated);
  };

  const setPendingState = (form, isPending) => {
    Array.from(form.elements).forEach((field) => {
      if (field instanceof HTMLElement) field.disabled = isPending;
    });
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
    if (loginPending) return;
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
    if (savePending || resetPending || logoutPending) return;
    setStatus("", "info");
    savePending = true;
    setPendingState(adminForm, true);
    if (saveSubmitButton) saveSubmitButton.textContent = "Saving...";

    try {
      await apiRequest("/admin/content", {
        method: "PUT",
        body: JSON.stringify({ content: getFormPayload() })
      });
      setStatus("Saved. GitHub Pages will publish the update shortly.", "success");
    } catch (error) {
      if (error.message.toLowerCase().includes("unauthorized")) {
        setViewState(false);
      }
      setStatus(`Save failed: ${getErrorMessage(error)}`, "error");
    } finally {
      savePending = false;
      setPendingState(adminForm, false);
      if (saveSubmitButton) saveSubmitButton.textContent = "Save Changes";
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", async () => {
      if (savePending || resetPending || logoutPending) return;
      resetPending = true;
      setStatus("", "info");
      setPendingState(adminForm, true);
      resetButton.textContent = "Resetting...";
      try {
        const payload = await apiRequest("/admin/content/reset", {
          method: "POST",
          body: JSON.stringify({})
        });
        populateForm({ ...contentDefaults, ...(payload.content || {}) });
        setStatus("Defaults restored. GitHub Pages will publish shortly.", "success");
      } catch (error) {
        if (error.message.toLowerCase().includes("unauthorized")) {
          setViewState(false);
        }
        setStatus(`Reset failed: ${getErrorMessage(error)}`, "error");
      } finally {
        resetPending = false;
        setPendingState(adminForm, false);
        resetButton.textContent = "Reset Defaults";
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      if (savePending || resetPending || logoutPending) return;
      logoutPending = true;
      setPendingState(adminForm, true);
      logoutButton.textContent = "Signing Out...";
      try {
        await apiRequest("/admin/logout", { method: "POST", body: JSON.stringify({}) });
      } catch {
        // Ignore logout errors in UI.
      } finally {
        logoutPending = false;
        setPendingState(adminForm, false);
        logoutButton.textContent = "Log Out";
        setViewState(false);
        setStatus("Signed out.", "success");
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
        populateForm(await loadPublicContent());
        setStatus("Please sign in to edit content.", "info");
      }
    } catch (error) {
      setViewState(false);
      setStatus(`Worker unavailable: ${getErrorMessage(error)}`, "error");
      populateForm(await loadPublicContent());
    }
  };

  initialize();
})();
