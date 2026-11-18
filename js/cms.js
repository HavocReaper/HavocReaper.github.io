/* ============================================================
   CONTENT LOADER — pulls editable content from content/site.json
   The HTML already contains the same content as a fallback, so
   the page still works if this file or the JSON is unavailable.
   ============================================================ */
(function () {
  "use strict";

  const ICONS = {
    shield: '<path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm0 5.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6zm0 2.1a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z"/>',
    network: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2.1c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4.2 13.6h-1.6v-4.9H9.4v4.9H7.8V9.3c.5-.9 2.2-1.7 4.2-1.7s3.7.8 4.2 1.7v8.4z"/>',
    mobile: '<path d="M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm0 17H7V6h10v12zm-5 2.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>',
    code: '<path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>',
    clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3h2v5l3.5 2-1 1.7L11 13V7z"/>',
    check: '<path d="M12 2 3 6v6c0 5.05 3.41 9.74 9 11 5.59-1.26 9-5.95 9-11V6l-9-4zm-1.2 13.6-4.2-4.2 1.4-1.4 2.8 2.8 5.8-5.8 1.4 1.4-7.2 7.2z"/>',
    github: '<path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.72c-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.93c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/>',
    book: '<path d="M12 3 1 9l4 2.2v6L12 20l7-2.8v-6L23 9 12 3zm0 2.5 5.3 2.9-5.3 2.9-5.3-2.9L12 5.5zM6 12.6l4 2.2v3.6l-4-1.6v-4.2zm8 5.8v-3.6l4-2.2v4.2l-4 1.6z"/>'
  };

  const EXTERNAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h5v2H6v11h11v-4h2v6H5V5z"/></svg>';

  const esc = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const svg = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.code) + '</svg>';

  const get = (obj, path) => path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

  function applyText(data) {
    document.querySelectorAll("[data-cms]").forEach((el) => {
      const value = get(data, el.dataset.cms);
      if (value == null) return;
      el.textContent = String(value);
    });

    document.querySelectorAll("[data-cms-attr]").forEach((el) => {
      const value = get(data, el.dataset.cms);
      if (value == null) return;
      el.setAttribute(el.dataset.cmsAttr, String(value));
    });

    document.querySelectorAll("[data-cms-href]").forEach((el) => {
      const value = get(data, el.dataset.cmsHref);
      if (value == null) return;
      el.setAttribute("href", String(value));
    });

    document.querySelectorAll("[data-cms-copy]").forEach((el) => {
      const value = get(data, el.dataset.cmsCopy);
      if (value == null) return;
      el.dataset.copy = String(value);
    });
  }

  function renderServices(items) {
    const root = document.getElementById("aboutServices");
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((s) => `
      <article class="service-card reveal">
        <div class="service-icon">${svg(s.icon)}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
      </article>`).join("");
  }

  function renderSkills(items) {
    const root = document.getElementById("skillsGrid");
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((g) => `
      <div class="skill-group reveal">
        <div class="skill-group-head">
          <span class="skill-group-icon">${svg(g.icon)}</span>
          <h3>${esc(g.title)}</h3>
        </div>
        <div class="tag-list">${(g.tags || []).map((t) => `<span class="tag${g.accent ? " tag-accent" : ""}">${esc(t)}</span>`).join("")}</div>
      </div>`).join("");
  }

  function renderExperience(items) {
    const root = document.getElementById("timeline");
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((job) => `
      <article class="timeline-item reveal">
        <div class="timeline-marker" aria-hidden="true"></div>
        <div class="timeline-content${job.compact ? " timeline-compact" : ""}">
          <div class="timeline-top">
            <div><h3>${esc(job.title)}</h3><p class="company">${esc(job.company)}</p></div>
            <span class="date-badge${job.current ? " current" : ""}">${esc(job.date)}</span>
          </div>
          ${(job.bullets || []).length ? `<ul>${job.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
        </div>
      </article>`).join("");
  }

  function renderProjects(items) {
    const root = document.getElementById("projectGrid");
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((p) => {
      const iconClass = p.accent === "green" ? " project-icon-green" : "";
      const link = p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub ${EXTERNAL}</a>` : "";
      return `
      <article class="project-card reveal">
        <div class="project-icon${iconClass}">${svg(p.icon)}</div>
        <span class="project-label">${esc(p.label)}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="tag-list">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        ${link}
      </article>`;
    }).join("");
  }

  function renderEducation(items) {
    const root = document.getElementById("educationGrid");
    if (!root || !Array.isArray(items)) return;
    root.innerHTML = items.map((e) => `
      <article class="edu-card reveal">
        <div class="edu-year">${esc(e.year)}</div>
        <div class="edu-body">
          <h3>${esc(e.title)}</h3>
          <p class="edu-place">${esc(e.place)}</p>
          <span class="edu-grade">${esc(e.grade)}</span>
        </div>
      </article>`).join("");
  }

  async function init() {
    try {
      const response = await fetch("content/site.json", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();

      window.PORTFOLIO_DATA = data;

      applyText(data);

      if (Array.isArray(data.hero && data.hero.roles) && window.portfolioRoles) {
        const roles = window.portfolioRoles;
        roles.splice(0, roles.length, ...data.hero.roles);
      }

      renderServices(data.about && data.about.services);
      renderSkills(data.skills);
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderEducation(data.education);

      if (window.observeReveals) window.observeReveals();
    } catch (err) {
      // Offline or JSON unavailable — the static HTML fallback stays in place.
      console.info("Using built-in portfolio content (content/site.json unavailable).");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
