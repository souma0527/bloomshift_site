document.documentElement.classList.add("js");

const introScene = document.querySelector(".intro-scene");
const reveals = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".global-nav a[href^='#']");
const sections = Array.from(document.querySelectorAll("main section[id]"));

sections.forEach((section, index) => {
  section.style.setProperty("--section-sink", `${18 + index * 8}px`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

for (const element of reveals) {
  revealObserver.observe(element);
}

const navObserver = new IntersectionObserver(
  (entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!active) return;

    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", target === active.target.id);
    });
  },
  {
    threshold: [0.2, 0.4, 0.6],
    rootMargin: "-18% 0px -55% 0px",
  }
);

for (const section of sections) {
  navObserver.observe(section);
}

let ticking = false;
let introCompleted = false;

function finishIntro() {
  if (introCompleted) return;
  introCompleted = true;
  document.body.classList.remove("intro-playing");
  document.body.classList.add("intro-done");
  document.documentElement.style.setProperty("--dive-progress", "1");
  if (introScene) {
    introScene.remove();
  }
}

function updateOceanState() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

  document.documentElement.style.setProperty("--dive-progress", progress.toFixed(4));
  document.documentElement.style.setProperty("--dive-shift", `${Math.round(progress * 120)}px`);
  ticking = false;
}

function updateScrollShift() {
  const shift = window.scrollY * 0.14;
  document.documentElement.style.setProperty("--scroll-shift", `${shift}px`);
}

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollShift();
      updateOceanState();
    });
  },
  { passive: true }
);

updateScrollShift();
updateOceanState();

document.body.classList.add("intro-playing");

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    finishIntro();
    return;
  }

  if (introScene) {
    introScene.addEventListener(
      "animationend",
      (event) => {
        if (event.animationName === "intro-scene-exit") {
          finishIntro();
        }
      },
      { once: true }
    );
  }

  window.setTimeout(finishIntro, 4200);
});
