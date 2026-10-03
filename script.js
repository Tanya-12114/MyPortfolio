(() => {
  "use strict";

  // ---- Contact form config ----
  // Optional: paste a free Web3Forms access key (web3forms.com) or a Formspree URL to receive
  // messages directly. Leave both empty and the form opens the visitor's email app instead.
  const WEB3FORMS_KEY = "";
  const FORMSPREE_URL = "";
  const EMAIL = "tanyasharma12gzb@gmail.com";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const toggle = $(".nav-toggle"), links = $("#nav-links");
  const closeMenu = () => { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  // Active nav link on scroll
  const navMap = new Map($$(".nav-links a[href^='#']").map(a => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    navMap.forEach(a => a.classList.remove("active"));
    const a = navMap.get(en.target.id); if (a) a.classList.add("active");
  }), { rootMargin: "-45% 0px -50% 0px" });
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  // Scroll reveal
  const reveal = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); reveal.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$(".section-title, .about-grid, .exp-card, .skills-row, .cert-card, .project-card, .contact-box, .info-card")
    .forEach(el => { el.classList.add("reveal"); reveal.observe(el); });

  // Show resume buttons only if the PDF actually exists
  fetch("Tanya_Sharma_Resume.pdf", { method: "HEAD" })
    .then(r => { if (r.ok) $$(".resume-link").forEach(a => a.hidden = false); })
    .catch(() => {});

  // Certifications show more / less
  const certBtn = $("#cert-toggle"), extras = $$(".cert-card.extra");
  certBtn.addEventListener("click", () => {
    const show = certBtn.getAttribute("aria-expanded") !== "true";
    extras.forEach(c => { c.hidden = !show; if (show) c.classList.add("in"); });
    certBtn.setAttribute("aria-expanded", String(show));
    certBtn.textContent = show ? "Show fewer" : "Show all " + (extras.length + 4) + " certifications";
  });

  // Project filter
  const chips = $$(".chip"), cards = $$(".project-card");
  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.toggle("active", c === chip));
    cards.forEach(card => { card.hidden = chip.dataset.filter !== "all" && card.dataset.cat !== chip.dataset.filter; });
  }));

  // Contact form
  const form = $("#contact-form"), status = $("#form-status");
  const say = (msg, cls) => { status.textContent = msg; status.className = "form-status " + (cls || ""); };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form));
    const btn = $("button[type=submit]", form);
    try {
      if (WEB3FORMS_KEY || FORMSPREE_URL) {
        btn.disabled = true; say("Sending…");
        const res = WEB3FORMS_KEY
          ? await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: "Portfolio message from " + data.name, ...data }) })
          : await fetch(FORMSPREE_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error("bad response");
        form.reset(); say("Thanks! Your message was sent. I'll reply soon.", "ok");
      } else {
        const body = encodeURIComponent(data.message + "\n\n— " + data.name + " (" + data.email + ")");
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Portfolio message from " + data.name) + "&body=" + body;
        say("Opening your email app… if nothing happens, write to " + EMAIL, "ok");
      }
    } catch (err) {
      say("Couldn't send right now. Please email " + EMAIL + " directly.", "err");
    } finally { btn.disabled = false; }
  });

  $("#year").textContent = new Date().getFullYear();
})();