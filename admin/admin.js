/* ============================================================
   PORTFOLIO ADMIN — GitHub-backed content editor
   ============================================================ */
(function () {
  "use strict";

  const API = "https://api.github.com";
  const TOKEN_KEY = "portfolio_admin_token";
  const REPO_KEY = "portfolio_admin_repo";
  const PATH_KEY = "portfolio_admin_path";

  const OBJECT_ARRAYS = new Set(["experience", "projects", "skills", "education", "facts", "services"]);

  let token = sessionStorage.getItem(TOKEN_KEY) || "";
  let repo = sessionStorage.getItem(REPO_KEY) || "HavocReaper/HavocReaper.github.io";
  let contentPath = sessionStorage.getItem(PATH_KEY) || "content/site.json";
  let fileSha = "";
  let workingData = null;

  const $ = (id) => document.getElementById(id);

  const loginView = $("loginView");
  const appView = $("appView");
  const loginStatus = $("loginStatus");
  const saveStatus = $("saveStatus");
  const editorRoot = $("editorRoot");

  function setStatus(el, message, type) {
    el.textContent = message || "";
    el.className = "status" + (type ? " " + type : "") + (el === saveStatus ? " global-status" : "");
  }

  function labelFor(key) {
    return String(key)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  function setPath(obj, path, value) {
    const parts = path.split(".");
    let node = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (node[key] == null || typeof node[key] !== "object") node[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      node = node[key];
    }
    node[parts[parts.length - 1]] = value;
  }

  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  function fromBase64(b64) {
    const binary = atob(String(b64).replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  async function ghRequest(url, options) {
    const response = await fetch(url, Object.assign({
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }, options || {}));

    let body = null;
    try { body = await response.json(); } catch (e) { body = null; }

    if (!response.ok) {
      const msg = body && body.message ? body.message : "GitHub request failed (" + response.status + ")";
      throw new Error(msg);
    }
    return body;
  }

  async function loadContent() {
    const url = API + "/repos/" + encodeURI(repo) + "/contents/" + encodeURI(contentPath);
    const data = await ghRequest(url);
    fileSha = data.sha;
    workingData = JSON.parse(fromBase64(data.content));
    renderEditor();
  }

  function emptyLike(sample) {
    if (Array.isArray(sample)) return [];
    if (sample && typeof sample === "object") {
      const out = {};
      Object.keys(sample).forEach((k) => { out[k] = emptyLike(sample[k]); });
      return out;
    }
    if (typeof sample === "boolean") return false;
    return "";
  }

  function itemTitle(item, index) {
    const keys = ["title", "label", "name", "company", "year", "place"];
    for (const k of keys) if (item[k]) return String(item[k]).slice(0, 60);
    return "Item " + (index + 1);
  }

  function makeField(path, value, key) {
    const wrap = document.createElement("div");
    wrap.className = "field";

    // ---- boolean ----
    if (typeof value === "boolean") {
      wrap.className += " field-bool";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = "f_" + path.replace(/\W/g, "_");
      input.checked = value;
      input.addEventListener("change", () => setPath(workingData, path, input.checked));
      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = labelFor(key);
      wrap.appendChild(input);
      wrap.appendChild(label);
      return wrap;
    }

    const label = document.createElement("label");
    label.htmlFor = "f_" + path.replace(/\W/g, "_");
    label.textContent = labelFor(key);
    wrap.appendChild(label);

    let input;

    // ---- array of objects (repeatable cards) ----
    if (Array.isArray(value) && OBJECT_ARRAYS.has(key)) {
      const list = document.createElement("div");
      list.className = "object-list";

      value.forEach((item, index) => {
        if (!item || typeof item !== "object") return;
        const card = document.createElement("div");
        card.className = "object-item";

        const head = document.createElement("div");
        head.className = "object-item-head";
        const title = document.createElement("strong");
        title.textContent = (index + 1) + ". " + itemTitle(item, index);
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn btn-danger btn-small";
        del.textContent = "Remove";
        del.addEventListener("click", () => {
          getPath(workingData, path).splice(index, 1);
          renderEditor();
        });
        head.appendChild(title);
        head.appendChild(del);

        const body = document.createElement("div");
        body.className = "object-item-body";
        Object.keys(item).forEach((childKey) => {
          body.appendChild(makeField(path + "." + index + "." + childKey, item[childKey], childKey));
        });

        card.appendChild(head);
        card.appendChild(body);
        list.appendChild(card);
      });

      const add = document.createElement("button");
      add.type = "button";
      add.className = "btn btn-ghost btn-small add-btn";
      add.textContent = "+ Add " + labelFor(key).replace(/s$/, "");
      add.addEventListener("click", () => {
        const arr = getPath(workingData, path);
        arr.push(emptyLike(value[0] || { title: "", description: "" }));
        renderEditor();
      });

      wrap.removeChild(label);
      wrap.appendChild(list);
      wrap.appendChild(add);
      return wrap;
    }

    // ---- array of strings (one per line) ----
    if (Array.isArray(value)) {
      input = document.createElement("textarea");
      input.value = value.join("\n");
      input.rows = Math.max(3, Math.min(10, value.length + 1));
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "One item per line";
      input.addEventListener("input", () => {
        setPath(workingData, path, input.value.split("\n").map((s) => s.trim()).filter(Boolean));
      });
      wrap.appendChild(input);
      wrap.appendChild(hint);
      return wrap;
    }

    // ---- nested object ----
    if (value && typeof value === "object") {
      const group = document.createElement("div");
      group.className = "nested-group";
      Object.keys(value).forEach((childKey) => {
        group.appendChild(makeField(path + "." + childKey, value[childKey], childKey));
      });
      wrap.removeChild(label);
      const heading = document.createElement("h4");
      heading.textContent = labelFor(key);
      wrap.appendChild(heading);
      wrap.appendChild(group);
      return wrap;
    }

    // ---- long string -> textarea, short string -> input ----
    if (String(value).length > 90 || String(value).includes("\n")) {
      input = document.createElement("textarea");
      input.rows = Math.max(3, Math.min(8, Math.ceil(String(value).length / 80)));
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    input.id = "f_" + path.replace(/\W/g, "_");
    input.value = value == null ? "" : String(value);
    input.addEventListener("input", () => setPath(workingData, path, input.value));
    wrap.appendChild(input);
    return wrap;
  }

  function makeSection(title, path, value) {
    const card = document.createElement("section");
    card.className = "section-card";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "section-head";
    head.innerHTML = "<span>" + title + "</span><span class=\"chevron\">▼</span>";

    const body = document.createElement("div");
    body.className = "section-body";

    head.addEventListener("click", () => {
      head.classList.toggle("collapsed");
      body.classList.toggle("collapsed");
    });

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.keys(value).forEach((key) => {
        body.appendChild(makeField(path + "." + key, value[key], key));
      });
    } else {
      body.appendChild(makeField(path, value, path));
    }

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function renderEditor() {
    editorRoot.innerHTML = "";
    if (!workingData) return;
    Object.keys(workingData).forEach((key) => {
      editorRoot.appendChild(makeSection(labelFor(key), key, workingData[key]));
    });
  }

  async function save() {
    if (!workingData || !fileSha) {
      setStatus(saveStatus, "Nothing loaded yet.", "err");
      return;
    }
    const buttons = [$("saveBtn"), $("saveBtnBottom")];
    buttons.forEach((b) => { b.disabled = true; b.textContent = "Saving…"; });
    setStatus(saveStatus, "Saving to GitHub…");

    try {
      const content = JSON.stringify(workingData, null, 2) + "\n";
      const result = await ghRequest(
        API + "/repos/" + encodeURI(repo) + "/contents/" + encodeURI(contentPath),
        {
          method: "PUT",
          headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28"
          },
          body: JSON.stringify({
            message: "Update portfolio content via admin panel",
            content: toBase64(content),
            sha: fileSha,
            branch: "main"
          })
        }
      );
      fileSha = result.content.sha;
      setStatus(saveStatus, "Saved! Your changes are committed. Allow a few minutes for the live site to refresh.", "ok");
      saveStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      setStatus(saveStatus, "Save failed: " + err.message, "err");
    } finally {
      buttons.forEach((b) => { b.disabled = false; b.textContent = "Save changes"; });
    }
  }

  function showApp() {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    $("repoLabel").textContent = repo;
  }

  async function connect() {
    setStatus(loginStatus, "Connecting to GitHub…");
    $("connectBtn").disabled = true;
    try {
      await loadContent();
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(REPO_KEY, repo);
      sessionStorage.setItem(PATH_KEY, contentPath);
      showApp();
      setStatus(saveStatus, "Content loaded. Edit away!", "ok");
    } catch (err) {
      setStatus(loginStatus, "Could not connect: " + err.message, "err");
    } finally {
      $("connectBtn").disabled = false;
    }
  }

  $("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    token = $("tokenInput").value.trim();
    repo = $("repoInput").value.trim();
    contentPath = $("pathInput").value.trim();
    if (!token || !repo || !contentPath) {
      setStatus(loginStatus, "Please fill in all fields.", "err");
      return;
    }
    connect();
  });

  $("saveBtn").addEventListener("click", save);
  $("saveBtnBottom").addEventListener("click", save);

  $("refreshBtn").addEventListener("click", async () => {
    setStatus(saveStatus, "Reloading from GitHub…");
    try {
      await loadContent();
      setStatus(saveStatus, "Reloaded. Any unsaved edits were discarded.", "ok");
    } catch (err) {
      setStatus(saveStatus, "Reload failed: " + err.message, "err");
    }
  });

  $("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(TOKEN_KEY);
    token = "";
    workingData = null;
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
    $("tokenInput").value = "";
    setStatus(loginStatus, "Signed out.");
  });

  // Auto-connect if a token is already in this tab's session
  if (token) {
    $("repoInput").value = repo;
    $("pathInput").value = contentPath;
    connect();
  }
})();
