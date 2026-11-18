/* ============================================================
   LOVE PRATAP — PORTFOLIO INTERACTIONS
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Current year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  const closeMenu = () => {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* ---------- Typing effect ---------- */
  const typedEl = document.getElementById("typedText");
  // Exposed on window so the CMS can replace roles without a page rebuild.
  const roles = window.portfolioRoles = [
    "Security Analyst",
    "Web App VAPT Consultant",
    "Network Penetration Tester",
    "API Security Researcher",
    "Bug Hunter"
  ];

  if (typedEl && !reduceMotion) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const current = roles[roleIndex];
      charIndex += deleting ? -1 : 1;
      typedEl.textContent = current.slice(0, charIndex);

      let delay = deleting ? 45 : 90;

      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = 1900;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      }
      window.setTimeout(type, delay);
    };
    window.setTimeout(type, 700);
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver = null;
  if ("IntersectionObserver" in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }

  window.observeReveals = function (root) {
    const els = (root || document).querySelectorAll(".reveal:not(.visible)");
    els.forEach((el, index) => {
      if (revealObserver) {
        el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
        revealObserver.observe(el);
      } else {
        el.classList.add("visible");
      }
    });
  };
  window.observeReveals();

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(".nav-link:not(.nav-cta)");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navItems.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Stat count-up ---------- */
  const statNumbers = document.querySelectorAll(".stat-number");
  if ("IntersectionObserver" in window && !reduceMotion && statNumbers.length) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          if (isNaN(target)) return;
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 30));
          const timer = window.setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current >= target) window.clearInterval(timer);
          }, 30);
          statObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach((el) => statObserver.observe(el));
  }

  /* ---------- Copy to clipboard ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  };

  document.querySelectorAll(".copy-value").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        showToast("Copied to clipboard");
      } catch (err) {
        // Fallback for browsers without clipboard API
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand("copy");
          showToast("Copied to clipboard");
        } catch (e) {
          showToast("Could not copy — select manually");
        }
        document.body.removeChild(input);
      }
    });
  });
})();
