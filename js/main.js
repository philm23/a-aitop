/* ═══════════════════════════════════════════════════════════
   Padaria Contemporânea — motion & interatividade de scroll
   Vanilla JS, sem dependências.
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ── Split de letras (hero + visita) ─────────────────────── */
  $$("[data-letters]").forEach(el => {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", i);
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch === " " ? " " : ch;
      el.appendChild(span);
    });
  });

  /* ── Split de palavras (texto do conceito) ───────────────── */
  const conceptText = $("#conceptText");
  let conceptWords = [];
  if (conceptText) {
    const words = conceptText.textContent.trim().split(/\s+/);
    conceptText.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = w;
      conceptText.appendChild(span);
      if (i < words.length - 1) conceptText.appendChild(document.createTextNode(" "));
    });
    conceptWords = $$(".w", conceptText);
  }

  /* ── Loader ──────────────────────────────────────────────── */
  const loader = $("#loader");
  const finishLoader = () => {
    loader.classList.add("is-done");
    document.body.classList.add("chars-in");
    setTimeout(() => loader.remove(), 1300);
  };
  if (reduceMotion) {
    loader.remove();
    document.body.classList.add("chars-in");
  } else {
    window.addEventListener("load", () => setTimeout(finishLoader, 900));
    setTimeout(() => { if (document.body.contains(loader)) finishLoader(); }, 3000);
  }

  /* ── IntersectionObserver: reveals, contadores, títulos ──── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("in", "chars-in");
      $$("[data-count]", el.classList.contains("stat") ? el : el).forEach(runCounter);
      io.unobserve(el);
    });
  }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });

  $$(".reveal, .visit__title").forEach(el => io.observe(el));

  /* ── Contadores animados ─────────────────────────────────── */
  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const dur = 1600;
    const t0 = performance.now();
    const fmt = v => v.toFixed(decimals).replace(".", ",");
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const tick = now => {
      const p = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── Navegação: esconder ao descer, mostrar ao subir ─────── */
  const nav = $("#nav");
  let lastY = window.scrollY;

  /* ── Secções scroll-driven ───────────────────────────────── */
  const progressBar = $("#progressBar");
  const parallaxEls = $$("[data-parallax]");
  const parallaxYEls = $$("[data-parallax-y]");
  const conceptSection = $("#conceito");
  const productsSection = $("#produtos");
  const productsTrack = $("#productsTrack");
  const marquees = $$("[data-marquee-speed]").map(el => ({
    el,
    track: $(".marquee__track", el),
    speed: parseFloat(el.dataset.marqueeSpeed),
    offset: 0,
    half: 0
  }));

  const measure = () => {
    marquees.forEach(m => { m.half = m.track.scrollWidth / 2; });
    if (productsSection && productsTrack) {
      const extra = Math.max(0, productsTrack.scrollWidth - window.innerWidth);
      productsSection.style.height = reduceMotion ? "auto" : `${window.innerHeight + extra}px`;
    }
  };
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);

  /* progresso de uma secção "pinned": 0 no topo, 1 no fim */
  const sectionProgress = section => {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 1;
    return clamp(-rect.top / total, 0, 1);
  };

  let scrollVel = 0;

  const frame = () => {
    const y = window.scrollY;
    scrollVel += ((y - lastYFrame) - scrollVel) * 0.12;
    lastYFrame = y;

    /* barra de progresso da página */
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    /* parallax dos blobs / elementos flutuantes do hero */
    parallaxEls.forEach(el => {
      el.style.transform = `translateY(${y * parseFloat(el.dataset.parallax) * -0.4}px)`;
    });
    parallaxYEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translateY(${center * -parseFloat(el.dataset.parallaxY)}px)`;
    });

    /* marquees: deriva constante + impulso da velocidade de scroll */
    marquees.forEach(m => {
      if (!m.half) return;
      m.offset -= m.speed * (0.8 + Math.min(Math.abs(scrollVel) * 0.12, 5));
      const x = ((m.offset % m.half) + m.half) % m.half;
      m.track.style.transform = `translateX(${-x}px)`;
    });

    /* conceito: palavras acendem com o progresso */
    if (conceptWords.length) {
      const p = sectionProgress(conceptSection);
      const lead = p * (conceptWords.length + 4);
      conceptWords.forEach((w, i) => {
        w.classList.toggle("lit", i < lead);
        w.classList.toggle("hot", i < lead && i > lead - 4);
      });
    }

    /* produtos: translação horizontal ligada ao scroll */
    if (productsTrack) {
      const p = sectionProgress(productsSection);
      const extra = Math.max(0, productsTrack.scrollWidth - window.innerWidth);
      productsTrack.style.transform = `translateX(${-p * extra}px)`;
    }

    /* nav */
    if (y > 60) nav.classList.add("is-scrolled"); else nav.classList.remove("is-scrolled");
    if (y > lastY + 6 && y > 300) nav.classList.add("is-hidden");
    else if (y < lastY - 6) nav.classList.remove("is-hidden");
    lastY = y;

    requestAnimationFrame(frame);
  };

  let lastYFrame = window.scrollY;
  if (!reduceMotion) requestAnimationFrame(frame);
  else {
    /* modo reduzido: apenas barra de progresso, sem animações */
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }, { passive: true });
  }

  /* ── Tilt 3D nos cartões de avaliação ────────────────────── */
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    $$("[data-tilt]").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 8}deg) rotateX(${py * -8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ── Horário: dia de hoje + estado aberto/fechado ────────── */
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  $$("#hoursList li").forEach(li => {
    if (li.dataset.days.split(",").map(Number).includes(day)) li.classList.add("is-today");
  });
  const status = $("#openStatus");
  if (status) {
    let open = false;
    if (day >= 1 && day <= 5) open = minutes >= 7 * 60 && minutes < 19 * 60;
    else if (day === 6) open = minutes >= 8 * 60 && minutes < 19 * 60;
    status.textContent = open ? "Aberto agora — o pão está a sair do forno" : "Fechado agora — voltamos já de manhã cedo";
    status.classList.toggle("is-closed", !open);
  }

  /* ── Ano no rodapé ───────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
})();
