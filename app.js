// -----------------------------
// Helpers
// -----------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(el._t);
  el._t = window.setTimeout(() => el.classList.remove("show"), 2200);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stagger reveal timing within each section for a premium cascade
if (!reduceMotion) {
  document.querySelectorAll("section, header, footer").forEach((block) => {
    const items = [...block.querySelectorAll(".reveal")];
    items.forEach((el, i) => {
      const d = Math.min(i * 80, 320); // cap delay so it never feels slow
      el.style.setProperty("--d", `${d}ms`);
    });
  });
}


function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

// -----------------------------
// Mobile nav
// -----------------------------
const navToggle = $("#navToggle");
const siteNav = $("#siteNav");

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    if (siteNav.classList.contains("open")) {
      siteNav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("click", (e) => {
  if (!siteNav?.classList.contains("open")) return;
  const clickedToggle = e.target.closest("#navToggle");
  const clickedNav = e.target.closest("#siteNav");
  if (!clickedToggle && !clickedNav) {
    siteNav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});


// -----------------------------
// Scroll progress + floating buttons
// -----------------------------
const progressBar = $("#progressBar");
const fabSchedule = $("#fabSchedule");
const toTop = $("#toTop");

function onScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) progressBar.style.width = `${pct}%`;

  const show = scrollTop > 480;
  if (fabSchedule) fabSchedule.style.display = show ? "inline-flex" : "none";
  if (toTop) toTop.style.display = show ? "inline-flex" : "none";
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// -----------------------------
// Active nav section highlight
// -----------------------------
const sections = ["about", "services", "team", "benefits", "contact"].map((id) => document.getElementById(id));
const navLinks = $$("nav a[data-nav]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const id = visible.target.id;

    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.nav === id));
  },
  { root: null, threshold: [0.25, 0.4, 0.6] }
);

sections.forEach((s) => s && sectionObserver.observe(s));

// -----------------------------
// Reveal on scroll
// -----------------------------
const revealEls = $$(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    }
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// -----------------------------
// Animated counters (stats)
// -----------------------------
function animateCount(el, to) {
  const start = 0;
  const dur = 900;
  const t0 = performance.now();

  function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const val = Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3)));
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statNums = $$(".stat-num[data-count]");
const statsSection = $("#about");
const statsObserver = new IntersectionObserver(
  (entries) => {
    const any = entries.some((e) => e.isIntersecting);
    if (!any) return;
    statNums.forEach((el) => animateCount(el, Number(el.dataset.count || "0")));
    statsObserver.disconnect();
  },
  { threshold: 0.35 }
);
if (statsSection) statsObserver.observe(statsSection);



// -----------------------------
// Services filtering + modal details (UPDATED for longer bios + bullets)
// -----------------------------
const serviceGrid = $("#serviceGrid");
const searchInput = $("#serviceSearch");
const chips = $$(".chips .chip");

let activeFilter = "all";

function matchesFilter(card) {
  const text = (card.innerText || "").toLowerCase();
  const q = (searchInput?.value || "").trim().toLowerCase();
  const tags = (card.dataset.tags || "").toLowerCase();

  const qOk = q === "" || text.includes(q) || tags.includes(q);

  if (activeFilter === "all") return qOk;

  // const map = {
  //   primary: ["primary", "physical", "chronic"],
  //   psychiatry: ["psychiatry", "medication", "evaluation"],
  //   wellness: ["wellness", "iv", "hydration"],
  //   virtual: ["telemedicine", "virtual", "online"],
  //   training: ["preceptorship", "training", "student"]
  // };

  const map = {
  primary: ["primary", "physical", "preventive", "checkup", "chronic", "disease", "diabetes", "thyroid", "heart", "hypertension", "management"],
  psychiatry: ["psychiatry", "psychotherapy", "therapy", "counseling", "medication", "evaluation", "anxiety", "depression", "trauma"],
  wellness: ["wellness", "lifestyle", "weight", "loss", "iv", "hydration", "vitamins", "recovery", "coaching", "fatigue"],
  virtual: ["telemedicine", "virtual", "online", "follow-up"]
};


  const need = map[activeFilter] || [];
  const catOk = need.some((k) => tags.includes(k));
  return qOk && catOk;
}

function applyServiceFilter() {
  if (!serviceGrid) return;
  const cards = $$(".svc-card", serviceGrid);
  let shown = 0;

  cards.forEach((card) => {
    const ok = matchesFilter(card);
    card.style.display = ok ? "" : "none";
    if (ok) shown++;
  });

  if (searchInput && shown === 0) toast("No matches — try a different keyword.");
}

chips.forEach((btn) => {
  btn.addEventListener("click", () => {
    chips.forEach((b) => b.classList.remove("chip-on"));
    btn.classList.add("chip-on");
    activeFilter = btn.dataset.filter || "all";
    applyServiceFilter();
  });
});

searchInput?.addEventListener("input", applyServiceFilter);

// Modal refs
const infoModal = $("#infoModal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
const modalTag = $("#modalTag");
const modalList = $("#modalList");

// Modal content (services + practitioners)
const modalContent = {
"Psychiatry & Behavioral Therapy": {
  tag: "Psychiatry & Therapy",
  body:
    "Integrated behavioral health care that includes psychiatric evaluations, behavioral therapy, and medication management. Visits focus on understanding your goals, creating a clear plan, and providing supportive follow-through.",
  bullets: [
    "Psychiatric evaluations + treatment planning",
    "Behavioral therapy for stress, anxiety, depression, and life transitions",
    "Medication management when appropriate",
    "Supportive care with clear next steps and follow-up"
  ]
},

"Primary Care & Chronic Disease": {
  tag: "Primary Care",
  body:
    "Comprehensive primary care that combines annual physicals and preventive screenings with ongoing management of chronic conditions. The goal is long-term health with practical guidance and consistent monitoring.",
  bullets: [
    "Annual physicals + preventive screenings",
    "Ongoing chronic disease management (e.g., diabetes, hypertension, thyroid)",
    "Medication review + lab follow-ups (as appropriate)",
    "Lifestyle coaching and coordinated care"
  ]
},

"Lifestyle & Wellness": {
  tag: "Lifestyle & Wellness",
  body:
    "Wellness services designed to support your energy, recovery, and health goals. Includes lifestyle/weight support and IV hydration options tailored to your needs after a brief assessment.",
  bullets: [
    "Weight loss guidance and sustainable habit support",
    "IV hydration therapy options for recovery/energy (as appropriate)",
    "Goal tracking and practical coaching",
    "Focused on safe, steady, long-term progress"
  ]
},

"Telemedicine": {
  tag: "Virtual",
  body:
    "Secure virtual visits for many services including evaluations, follow-ups, and medication management—convenient care from home while maintaining continuity.",
  bullets: []
},


  // UPDATED: longer bios + bullet highlights
  "Meet Abu": {
    tag: "Practitioner • Psychiatric Nurse Practitioner",
    body:
      "Abu Koroma is a healthcare professional with over 20 years of experience spanning critical care, anesthesia, and mental health. He brings a calm, structured approach to psychiatric care and is committed to creating a supportive environment where patients feel heard, respected, and empowered. He is also a U.S. Army Reserve veteran and a dedicated community mentor.",
    bullets: [
      "20+ years across critical care, anesthesia, and mental health",
      "Evidence-based, patient-centered approach",
      "Focused on clarity, follow-through, and comfort with treatment plans",
      "U.S. Army Reserve veteran • Community mentor"
    ]
  },

  "Meet Zainab": {
    tag: "Practitioner • Nurse Practitioner",
    body:
      "Zainab Koroma is a nurse practitioner and healthcare leader with experience across primary care and mental health. She is the CEO of Wellness Mind Healthcare Services in Baltimore and Co-Owner of Optimal Healthcare Services in York. Her approach emphasizes compassionate, culturally responsive care with practical guidance that helps patients make steady progress over time.",
    bullets: [
      "Experience across primary care + mental health",
      "Compassionate, culturally responsive care philosophy",
      "Leadership: CEO (Wellness Mind Healthcare Services) & Co-Owner (Optimal Healthcare Services)",
      "Committed to improving access and patient outcomes"
    ]
  }
};

function openInfo(title) {
  const c = modalContent[title] || { tag: "", body: "Details coming soon.", bullets: [] };

  modalTitle.textContent = title;
  modalTag.textContent = c.tag || "";
  modalBody.textContent = c.body || "";

  if (modalList) {
    modalList.innerHTML = "";
    (c.bullets || []).forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      modalList.appendChild(li);
    });
  }

  openDialog(infoModal);
}

$$("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => openInfo(btn.dataset.open));
});

// Optional premium UX: clicking a practitioner card opens bio too
$$(".profile").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    const btn = card.querySelector("[data-open]");
    if (btn?.dataset.open) openInfo(btn.dataset.open);
  });
});

$("#closeInfoModal")?.addEventListener("click", () => closeDialog(infoModal));
infoModal?.addEventListener("click", (e) => {
  const rect = infoModal.querySelector(".modal-card")?.getBoundingClientRect();
  if (!rect) return;
  const inCard =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;
  if (!inCard) closeDialog(infoModal);
});

// -----------------------------
// Testimonials slider
// -----------------------------
const tQuote = $("#tQuote");
const tMeta = $("#tMeta");
const tPrev = $("#tPrev");
const tNext = $("#tNext");
const tCard = $("#tCard");

const testimonials = [
  { quote: "Clear plan, no judgment, and I finally felt heard.", meta: "Patient feedback • Communication" },
  { quote: "Flexible scheduling and follow-up made it easy to stay consistent.", meta: "Patient feedback • Access" },
  { quote: "Professional, calm, and thorough—exactly what I needed.", meta: "Patient feedback • Experience" }
];

let tIndex = 0;
function renderTestimonial() {
  const t = testimonials[tIndex];
  if (tQuote) tQuote.textContent = `“${t.quote}”`;
  if (tMeta) tMeta.textContent = t.meta;
}
renderTestimonial();

function transitionTo(newIndex) {
  if (!tCard || reduceMotion) {
    tIndex = newIndex;
    renderTestimonial();
    return;
  }

  tCard.classList.add("t-fade");
  window.setTimeout(() => {
    tIndex = newIndex;
    renderTestimonial();
    tCard.classList.remove("t-fade");
  }, 180);
}

function nextT() {
  transitionTo((tIndex + 1) % testimonials.length);
}

function prevT() {
  transitionTo((tIndex - 1 + testimonials.length) % testimonials.length);
}


tNext?.addEventListener("click", nextT);
tPrev?.addEventListener("click", prevT);
window.setInterval(nextT, 7000);

// -----------------------------
// Schedule modal + FAB
// -----------------------------
const scheduleModal = $("#scheduleModal");
const openScheduleModal = $("#openScheduleModal");
const openScheduleModal2 = $("#openScheduleModal2");
const closeScheduleModal = $("#closeScheduleModal");

function openSchedule() {
  openDialog(scheduleModal);
}

openScheduleModal?.addEventListener("click", openSchedule);
openScheduleModal2?.addEventListener("click", openSchedule);
fabSchedule?.addEventListener("click", openSchedule);

closeScheduleModal?.addEventListener("click", () => closeDialog(scheduleModal));
scheduleModal?.addEventListener("click", (e) => {
  const rect = scheduleModal.querySelector(".modal-card")?.getBoundingClientRect();
  if (!rect) return;
  const inCard =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;
  if (!inCard) closeDialog(scheduleModal);
});

// -----------------------------
// Copy email
// -----------------------------
const copyEmailBtn = $("#copyEmailBtn");
copyEmailBtn?.addEventListener("click", async () => {
  const email = "zkoroma@optimalhealthcare.net";
  try {
    await navigator.clipboard.writeText(email);
    toast("Email copied!");
  } catch {
    toast("Couldn’t copy email—please copy manually.");
  }
});

// -----------------------------
// Contact form validation + toast
// -----------------------------
const form = $("#contactForm");

function setError(input, msg) {
  const err = input?.parentElement?.querySelector(".error");
  if (err) err.textContent = msg || "";
}

function validate() {
  let ok = true;

  const first = form.elements["firstName"];
  const last = form.elements["lastName"];
  const email = form.elements["email"];
  const phone = form.elements["phone"];

  [first, last, email, phone].forEach((i) => setError(i, ""));

  if (!first.value.trim()) { setError(first, "First name is required."); ok = false; }
  if (!last.value.trim()) { setError(last, "Last name is required."); ok = false; }

  const e = email.value.trim();
  if (!e) { setError(email, "Email is required."); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError(email, "Please enter a valid email."); ok = false; }

  const p = phone.value.trim();
  if (!p) { setError(phone, "Phone is required."); ok = false; }

  return ok;
}

form?.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (!validate()) {
    toast("Please fix the highlighted fields.");
    return;
  }
  toast("Thanks! Your message is ready to send (connect backend to deliver).");
  form.reset();
});




