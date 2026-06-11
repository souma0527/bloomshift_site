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

const hobbyGallery = document.querySelector("[data-hobby-gallery]");

if (hobbyGallery) {
  const hobbyButtons = Array.from(hobbyGallery.querySelectorAll("[data-hobby-target]"));
  const hobbyPanels = Array.from(hobbyGallery.querySelectorAll("[data-hobby-panel]"));

  const setActiveHobby = (key) => {
    for (const button of hobbyButtons) {
      const isActive = button.dataset.hobbyTarget === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    for (const panel of hobbyPanels) {
      const isActive = panel.dataset.hobbyPanel === key;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    }
  };

  for (const button of hobbyButtons) {
    button.addEventListener("click", () => {
      const key = button.dataset.hobbyTarget;
      if (key) {
        setActiveHobby(key);
      }
    });
  }

  const defaultButton = hobbyButtons.find((button) => button.classList.contains("is-active")) || hobbyButtons[0];
  if (defaultButton?.dataset.hobbyTarget) {
    setActiveHobby(defaultButton.dataset.hobbyTarget);
  }

  for (const photo of hobbyGallery.querySelectorAll(".hobby-panel .hobby-photo")) {
    photo.setAttribute("role", "button");
    photo.tabIndex = 0;

    const caption = photo.querySelector("figcaption")?.textContent?.trim();
    if (caption) {
      photo.setAttribute("aria-label", `${caption} を開く`);
    }
  }
}

const lightbox = document.querySelector("[data-lightbox]");

if (lightbox) {
  const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
  const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");
  const lightboxTitle = lightbox.querySelector("[data-lightbox-title]");
  const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
  const lightboxPrev = lightbox.querySelector("[data-lightbox-prev]");
  const lightboxNext = lightbox.querySelector("[data-lightbox-next]");
  const lightboxCloseButtons = Array.from(lightbox.querySelectorAll("[data-lightbox-close]"));

  let activeSlides = [];
  let activeIndex = 0;
  let restoreFocus = null;

  const renderSlide = () => {
    const slide = activeSlides[activeIndex];
    if (!slide || !lightboxImage) return;

    lightboxImage.src = slide.src;
    lightboxImage.alt = slide.alt || slide.caption || slide.title || "写真";

    if (lightboxCounter) {
      lightboxCounter.textContent = `${activeIndex + 1} / ${activeSlides.length}`;
    }

    if (lightboxTitle) {
      lightboxTitle.textContent = slide.title || "";
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = slide.caption || "";
    }
  };

  const openLightbox = (panel, figure) => {
    const figures = Array.from(panel.querySelectorAll(".hobby-photo"));
    activeSlides = figures.map((item) => {
      const img = item.querySelector("img");
      return {
        src: img?.getAttribute("src") || "",
        alt: img?.getAttribute("alt") || "",
        caption: item.querySelector("figcaption")?.textContent?.trim() || "",
        title: panel.querySelector(".hobby-panel-copy h3")?.textContent?.trim() || "",
      };
    });

    activeIndex = Math.max(0, figures.indexOf(figure));
    restoreFocus = figure;
    renderSlide();
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightboxCloseButtons[0]?.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (restoreFocus && typeof restoreFocus.focus === "function") {
      restoreFocus.focus();
    }
  };

  const stepSlide = (delta) => {
    if (!activeSlides.length) return;
    activeIndex = (activeIndex + delta + activeSlides.length) % activeSlides.length;
    renderSlide();
  };

  hobbyGallery.addEventListener("click", (event) => {
    const figure = event.target.closest(".hobby-panel .hobby-photo");
    if (!figure) return;

    const panel = figure.closest(".hobby-panel");
    if (!panel || panel.hidden) return;

    openLightbox(panel, figure);
  });

  hobbyGallery.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const figure = event.target.closest?.(".hobby-panel .hobby-photo");
    if (!figure) return;

    const panel = figure.closest(".hobby-panel");
    if (!panel || panel.hidden) return;

    event.preventDefault();
    openLightbox(panel, figure);
  });

  for (const button of lightboxCloseButtons) {
    button.addEventListener("click", closeLightbox);
  }

  lightboxPrev?.addEventListener("click", () => stepSlide(-1));
  lightboxNext?.addEventListener("click", () => stepSlide(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.hasAttribute("data-lightbox-close")) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepSlide(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepSlide(1);
    }
  });
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
