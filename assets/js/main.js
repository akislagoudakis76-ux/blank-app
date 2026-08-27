/* ============================================================
   AETHER MARINE — Interactions
   Reveal-on-scroll, 3D tilt, parallax, count-up, cursor, nav, form.
   ============================================================ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky nav + mobile menu ---- */
  const nav = document.getElementById("nav");
  const burger = nav && nav.querySelector(".nav__burger");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---- Scroll progress bar ---- */
  const bar = document.querySelector(".scroll-progress");
  if (bar) {
    const setBar = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.width = (p * 100).toFixed(2) + "%";
    };
    window.addEventListener("scroll", setBar, { passive: true });
    setBar();
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---- Count-up stats ---- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          cio.unobserve(el);
          const target = parseFloat(el.dataset.count) || 0;
          const suffix = el.dataset.suffix || "";
          const dur = 1400;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = (el.dataset.count || "") + (el.dataset.suffix || "")));
  }

  /* ---- Parallax on scroll ---- */
  const parallax = Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallax.length && !reduced) {
    let ticking = false;
    const apply = () => {
      const vh = window.innerHeight;
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-mid * speed).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    apply();
  }

  /* ---- Cursor gloss ---- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(hover: hover)").matches) {
    let gx = 0, gy = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => { gx = e.clientX; gy = e.clientY; });
    (function follow() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ---- 3D tilt on media cards ---- */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      const max = 7; // degrees
      let raf = null;
      function move(e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-6px)`;
        });
      }
      function reset() {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = "";
      }
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
    });
  }

  /* ---- Contact form (front-end demo) ---- */
  const form = document.querySelector(".contact__form");
  if (form) {
    const note = form.querySelector(".contact__note");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = "Please add your name and a valid email.";
        note.style.color = "#f0a5a5";
        return;
      }
      note.style.color = "";
      note.textContent = `Thank you, ${name.split(" ")[0]} — the Aether Marine team will be in touch shortly to plan your voyage.`;
      form.reset();
    });
  }
})();
