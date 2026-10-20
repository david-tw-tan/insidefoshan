/** Flip to true when Pricing Examples is ready to publish (removes coming-soon gate). */
const PRICING_SECTION_LIVE = false;

function pricingPreviewAllowed() {
  return PRICING_SECTION_LIVE || new URLSearchParams(window.location.search).has("preview");
}

function isPricingPathname(pathname) {
  return /\/pricing\/?$/i.test(pathname) || /\/pricing\/index\.html$/i.test(pathname);
}

function linkHrefIsPricing(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    return isPricingPathname(url.pathname);
  } catch {
    return false;
  }
}

function catalogsHomeHref() {
  const path = window.location.pathname;
  if (path.includes("/whyfoshan/") || path.includes("/howtosource/") || path.includes("/pricing/")) {
    return "../";
  }
  return "./";
}

let pricingSoonModal = null;
let pricingSoonLastFocus = null;
let pricingSoonDirectVisit = false;

function ensurePricingSoonModal() {
  if (pricingSoonModal) return pricingSoonModal;

  const root = document.createElement("div");
  root.id = "pricing-soon-modal";
  root.className = "modal modal--center";
  root.setAttribute("hidden", "");
  root.innerHTML = `
    <button class="modal-backdrop" type="button" data-close-pricing-soon tabindex="-1" aria-label="Close"></button>
    <div id="pricing-soon-dialog" class="modal-panel pricing-soon-panel" role="alertdialog" aria-modal="true" aria-labelledby="pricing-soon-desc" tabindex="-1">
      <p id="pricing-soon-desc">Our pricing page is under construction. Please check back soon.</p>
      <button type="button" class="help-btn pricing-soon-ok" data-close-pricing-soon>Got it</button>
    </div>
  `;

  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-close-pricing-soon]")) closePricingSoon();
  });

  document.body.appendChild(root);
  pricingSoonModal = root;
  return root;
}

function openPricingSoon({ fromDirectVisit = false } = {}) {
  const root = ensurePricingSoonModal();
  const dialog = root.querySelector("#pricing-soon-dialog");
  if (!dialog || !root.hasAttribute("hidden")) return;
  pricingSoonDirectVisit = fromDirectVisit;
  pricingSoonLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  root.removeAttribute("hidden");
  document.body.classList.add("modal-open");
  const ok = root.querySelector(".pricing-soon-ok");
  if (ok instanceof HTMLElement) ok.focus();
  else dialog.focus();
}

function closePricingSoon() {
  if (!pricingSoonModal || pricingSoonModal.hasAttribute("hidden")) return;
  pricingSoonModal.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");
  if (pricingSoonDirectVisit) {
    window.location.href = catalogsHomeHref();
    return;
  }
  pricingSoonLastFocus?.focus();
  pricingSoonDirectVisit = false;
}

function initPricingGate() {
  if (pricingPreviewAllowed()) return;

  if (isPricingPathname(window.location.pathname)) {
    openPricingSoon({ fromDirectVisit: true });
  }
}

document.querySelectorAll("[data-open-catalog]").forEach((opener) => {
  const detailEl = opener.querySelector(".resource-detail");
  if (detailEl) detailEl.textContent = opener.dataset.detail || "";
});

const SHOWROOM_GALLERY_LABEL = "See real showroom photos";

function syncShowroomGalleryLabels() {
  const manifest = window.SHOWROOM_PHOTOS;
  if (!manifest || typeof manifest !== "object") return;
  document.querySelectorAll("[data-open-photos]").forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const list = manifest[btn.dataset.openPhotos || ""];
    if (!Array.isArray(list) || !list.length) return;
    const n = list.length;
    const label = btn.querySelector(".factory-gallery-label");
    if (label) label.textContent = SHOWROOM_GALLERY_LABEL;
    const hint = btn.querySelector(".visually-hidden");
    if (hint) hint.textContent = `Open actual showroom photo gallery, ${n} photos`;
  });
}

syncShowroomGalleryLabels();
bindShowroomGalleryButtons();

const menuToggle = document.querySelector(".menu-float");
const siteNav = document.querySelector("#site-nav");

let factoryJumpToggle = null;
let factoryJumpPanel = null;

function setFactoryJumpOpen(open) {
  if (!factoryJumpToggle || !factoryJumpPanel) return;
  factoryJumpToggle.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    factoryJumpPanel.removeAttribute("hidden");
    if (menuToggle && siteNav) {
      menuToggle.setAttribute("aria-expanded", "false");
      setMenuButtonLabel("Menu");
      siteNav.setAttribute("hidden", "");
    }
  } else {
    factoryJumpPanel.setAttribute("hidden", "");
  }
}

function setMenuButtonLabel(text) {
  if (!menuToggle) return;
  const label = menuToggle.querySelector(".menu-float-label");
  if (label) label.textContent = text;
  else menuToggle.textContent = text;
}

function setMenuOpen(open) {
  if (!menuToggle || !siteNav) return;
  if (open) setFactoryJumpOpen(false);
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  setMenuButtonLabel(open ? "Close" : "Menu");
  const icon = menuToggle.querySelector(".menu-float-icon");
  if (icon) icon.hidden = open;
  if (open) siteNav.removeAttribute("hidden");
  else siteNav.setAttribute("hidden", "");
}

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!open);
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenuOpen(false);
});

const OVERLAY_MS = 180;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function revealOverlay(root) {
  if (!root) return;
  root.removeAttribute("hidden");
  if (prefersReducedMotion()) {
    root.classList.add("overlay-open");
    return;
  }
  root.classList.remove("overlay-open");
  requestAnimationFrame(() => {
    root.classList.add("overlay-open");
  });
  window.setTimeout(() => {
    if (!root.hasAttribute("hidden")) root.classList.add("overlay-open");
  }, 320);
}

function dismissOverlay(root, done) {
  if (!root || root.hasAttribute("hidden")) return;
  if (prefersReducedMotion()) {
    root.classList.remove("overlay-open");
    root.setAttribute("hidden", "");
    done?.();
    return;
  }
  root.classList.remove("overlay-open");
  window.setTimeout(() => {
    root.setAttribute("hidden", "");
    done?.();
  }, OVERLAY_MS);
}

const contactModal = document.querySelector("#contact-modal");
const contactDialog = document.querySelector("#contact-dialog");
let contactLastFocus = null;

const factoryContactModal = document.querySelector("#factory-contact-modal");
const factoryContactDialog = document.querySelector("#factory-contact-dialog");
let factoryContactLastFocus = null;

function contactFocusable() {
  if (!contactDialog) return [];
  return [...contactDialog.querySelectorAll("a[href], button:not([disabled])")];
}

function contactTitleForOpener(opener) {
  if (!(opener instanceof HTMLElement)) return "Need more help?";
  const label = opener.textContent.replace(/\s+/g, " ").trim();
  if (opener.classList.contains("help-float") || label === "More Help") return "Need more help?";
  return "Got questions?";
}

function openContact(opener) {
  if (!contactModal || !contactDialog || !contactModal.hasAttribute("hidden")) return;
  contactLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const titleEl = contactDialog.querySelector("#contact-title");
  if (titleEl) titleEl.textContent = contactTitleForOpener(opener);
  contactModal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
  contactDialog.focus();
}

function closeContact() {
  if (!contactModal || contactModal.hasAttribute("hidden")) return;
  contactModal.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");
  contactLastFocus?.focus();
}

function factoryContactFocusable() {
  if (!factoryContactDialog) return [];
  return [...factoryContactDialog.querySelectorAll("a[href], button:not([disabled])")];
}

function openFactoryContact() {
  if (!factoryContactModal || !factoryContactDialog || !factoryContactModal.hasAttribute("hidden")) return;
  factoryContactLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  factoryContactModal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
  factoryContactDialog.focus();
}

function closeFactoryContact() {
  if (!factoryContactModal || factoryContactModal.hasAttribute("hidden")) return;
  factoryContactModal.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");
  factoryContactLastFocus?.focus();
}

const catalogModal = document.querySelector("#catalog-modal");
const catalogDialog = document.querySelector("#catalog-dialog");
let catalogLastFocus = null;

function catalogFocusable() {
  if (!catalogDialog) return [];
  return [...catalogDialog.querySelectorAll("a[href], button:not([disabled])")];
}

function openCatalog(opener) {
  if (!catalogModal || !catalogDialog) return;
  const img = catalogDialog.querySelector(".catalog-modal-img");
  const title = catalogDialog.querySelector("#catalog-modal-title");
  const size = catalogDialog.querySelector(".catalog-modal-size");
  const detail = catalogDialog.querySelector(".catalog-modal-detail");
  const download = catalogDialog.querySelector(".catalog-download");
  if (!img || !title || !size || !detail || !(download instanceof HTMLAnchorElement)) return;
  img.src = opener.dataset.thumb || "";
  img.alt = "";
  title.textContent = opener.dataset.title || "";
  size.textContent = opener.dataset.size ? `PDF · ${opener.dataset.size}` : "";
  detail.textContent = opener.dataset.detail || "";
  download.href = opener.dataset.href || "#";
  download.setAttribute("download", opener.dataset.download || "");
  catalogLastFocus = opener;
  revealOverlay(catalogModal);
  document.body.classList.add("modal-open");
  catalogDialog.focus();
}

function closeCatalog() {
  if (!catalogModal || catalogModal.hasAttribute("hidden")) return;
  dismissOverlay(catalogModal, () => {
    document.body.classList.remove("modal-open");
    const img = catalogDialog?.querySelector(".catalog-modal-img");
    if (img) img.removeAttribute("src");
    catalogLastFocus?.focus();
  });
}

function getPhotoLightbox() {
  return document.querySelector("#photo-lightbox");
}

function getPhotoDialog() {
  return document.querySelector("#photo-dialog");
}

let photoSet = null;
let photoIndex = 0;
let photoLastFocus = null;
let photoLoadToken = 0;
let photoIgnoreCloseUntil = 0;
let photoPreloadRun = null;
const photoLoadCache = new Map();

function bindShowroomGalleryButtons() {
  document.querySelectorAll("[data-open-photos]").forEach((btn) => {
    if (!(btn instanceof HTMLElement) || btn.dataset.showroomBound === "1") return;
    btn.dataset.showroomBound = "1";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openPhotos(btn);
    });
  });
}

function photoFocusable() {
  const photoDialog = getPhotoDialog();
  if (!photoDialog) return [];
  return [...photoDialog.querySelectorAll("button:not([disabled])")];
}

function getShowroomManifest(key) {
  const manifest = window.SHOWROOM_PHOTOS;
  if (!manifest || typeof manifest !== "object") return null;
  const list = manifest[key];
  return Array.isArray(list) && list.length ? list : null;
}

function getShowroomImages(key) {
  const fromManifest = getShowroomManifest(key);
  if (fromManifest) return fromManifest;
  const template = document.getElementById(key);
  if (!(template instanceof HTMLTemplateElement)) return null;
  const images = [...template.content.querySelectorAll("img")].map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
  }));
  return images.length ? images : null;
}

function getFactoryGalleryTitle(opener) {
  const article = opener.closest("article.factory");
  const heading = article?.querySelector(".factory-title");
  if (heading) {
    const clone = heading.cloneNode(true);
    clone.querySelector(".factory-count")?.remove();
    const text = clone.textContent.replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return opener.dataset.title || "Showroom photos";
}

function setPhotoLoading(loading) {
  const frame = getPhotoDialog()?.querySelector(".lightbox-frame");
  if (frame) frame.classList.toggle("is-loading", loading);
}

function loadPhotoEntry(entry) {
  const src = entry.src || "";
  if (!src) return Promise.reject(new Error("missing src"));
  const cached = photoLoadCache.get(src);
  if (cached) return cached;
  const promise = new Promise((resolve, reject) => {
    const loader = new Image();
    loader.onload = () => {
      resolve({
        src,
        alt: entry.alt || "",
        width: loader.naturalWidth,
        height: loader.naturalHeight,
      });
    };
    loader.onerror = () => reject(new Error(`failed to load ${src}`));
    loader.src = src;
  });
  photoLoadCache.set(src, promise);
  return promise;
}

function stopSequentialPhotoPreload() {
  photoPreloadRun = null;
}

function startSequentialPhotoPreload(images) {
  stopSequentialPhotoPreload();
  const run = { id: Symbol("photo-preload"), images };
  photoPreloadRun = run;
  (async () => {
    for (const entry of images) {
      if (photoPreloadRun !== run) return;
      await loadPhotoEntry(entry).catch(() => {});
    }
  })();
}

async function renderPhoto() {
  const photoDialog = getPhotoDialog();
  if (!photoSet || !photoDialog) return;
  const img = photoDialog.querySelector(".lightbox-img");
  const countEl = photoDialog.querySelector(".lightbox-count");
  const prev = photoDialog.querySelector("[data-photo-prev]");
  const next = photoDialog.querySelector("[data-photo-next]");
  if (!img || !countEl || !prev || !next) return;
  const total = photoSet.images.length;
  const token = ++photoLoadToken;
  countEl.textContent = `Image ${photoIndex + 1} of ${total}`;
  prev.toggleAttribute("disabled", total < 2);
  next.toggleAttribute("disabled", total < 2);
  setPhotoLoading(true);
  try {
    const loaded = await loadPhotoEntry(photoSet.images[photoIndex]);
    if (token !== photoLoadToken) return;
    img.src = loaded.src;
    img.alt = loaded.alt;
    img.removeAttribute("width");
    img.removeAttribute("height");
    if (typeof img.decode === "function") {
      await img.decode().catch(() => {});
    }
    if (token !== photoLoadToken) return;
  } catch {
    if (token !== photoLoadToken) return;
    img.removeAttribute("src");
    img.alt = "";
    countEl.textContent = "Image unavailable";
  } finally {
    if (token === photoLoadToken) setPhotoLoading(false);
  }
}

function openPhotos(opener) {
  const lightbox = getPhotoLightbox();
  const photoDialog = getPhotoDialog();
  if (!lightbox || !photoDialog) {
    window.alert(
      "Showroom gallery could not open on this page. Use the homepage (Factory Catalogs) over a local web server—not by opening the HTML file directly—and hard-refresh (Shift+Reload) if you recently updated the site.",
    );
    return;
  }
  const key = opener.dataset.openPhotos || "";
  const images = getShowroomImages(key);
  if (!images) {
    window.alert("Showroom photos could not be loaded. Try a hard refresh. If this continues, the photo files may not be published yet.");
    return;
  }
  const galleryTitle = getFactoryGalleryTitle(opener);
  photoSet = { title: galleryTitle, images };
  photoIndex = 0;
  photoLastFocus = opener;
  photoIgnoreCloseUntil = Date.now() + 500;
  const titleEl = photoDialog.querySelector(".lightbox-title");
  if (titleEl) titleEl.textContent = galleryTitle;
  startSequentialPhotoPreload(images);
  revealOverlay(lightbox);
  lightbox.classList.add("overlay-open");
  document.body.classList.add("lightbox-open");
  photoDialog.focus();
  renderPhoto();
}

function closePhotos() {
  const lightbox = getPhotoLightbox();
  if (!lightbox || lightbox.hasAttribute("hidden")) return;
  photoLoadToken += 1;
  stopSequentialPhotoPreload();
  dismissOverlay(lightbox, () => {
    document.body.classList.remove("lightbox-open");
    const dialog = getPhotoDialog();
    const img = dialog?.querySelector(".lightbox-img");
    if (img) {
      img.removeAttribute("src");
      img.alt = "";
    }
    dialog?.querySelector(".lightbox-title")?.replaceChildren();
    setPhotoLoading(false);
    photoLastFocus?.focus();
    photoSet = null;
  });
}

function stepPhoto(delta) {
  if (!photoSet || photoSet.images.length < 2) return;
  photoIndex = (photoIndex + delta + photoSet.images.length) % photoSet.images.length;
  renderPhoto();
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (!pricingPreviewAllowed()) {
    const pricingLink = target.closest("a[href]");
    if (pricingLink instanceof HTMLAnchorElement && linkHrefIsPricing(pricingLink.getAttribute("href") || "")) {
      event.preventDefault();
      setMenuOpen(false);
      openPricingSoon({ fromDirectVisit: false });
      return;
    }
  }

  if (target.closest("[data-open-factory-contact]")) {
    event.preventDefault();
    openFactoryContact();
    return;
  }
  if (target.closest("[data-open-contact]")) {
    event.preventDefault();
    openContact(target.closest("[data-open-contact]"));
  }
  if (target.closest("[data-close-factory-contact]")) closeFactoryContact();
  if (target.closest("[data-close-contact]")) closeContact();

  const catalogOpener = target.closest("[data-open-catalog]");
  if (catalogOpener instanceof HTMLElement) openCatalog(catalogOpener);
  if (target.closest("[data-close-catalog]")) closeCatalog();

  if (target.closest("[data-close-lightbox]")) {
    if (Date.now() < photoIgnoreCloseUntil) {
      event.preventDefault();
      return;
    }
    closePhotos();
  }
  if (target.closest("[data-photo-prev]")) stepPhoto(-1);
  if (target.closest("[data-photo-next]")) stepPhoto(1);
});

function initFactoryJump() {
  factoryJumpToggle = document.querySelector("#factory-jump-toggle");
  factoryJumpPanel = document.querySelector("#factory-jump-panel");
  if (!(factoryJumpToggle instanceof HTMLButtonElement) || !(factoryJumpPanel instanceof HTMLElement)) return;

  const articles = [...document.querySelectorAll("article.factory[id]")];
  if (!articles.length) return;

  articles.forEach((article, index) => {
    const heading = article.querySelector(".factory-title");
    if (!heading) return;
    const clone = heading.cloneNode(true);
    clone.querySelector(".factory-count")?.remove();
    const name = clone.textContent.replace(/\s+/g, " ").trim();
    if (!name) return;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "factory-jump-item";
    item.setAttribute("role", "menuitem");
    item.dataset.factoryJump = `#${article.id}`;
    item.innerHTML = `<span class="factory-jump-idx">${index + 1}</span><span class="factory-jump-name"></span>`;
    item.querySelector(".factory-jump-name").textContent = name;
    factoryJumpPanel.appendChild(item);
  });

  factoryJumpToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = factoryJumpToggle.getAttribute("aria-expanded") === "true";
    setFactoryJumpOpen(!open);
  });

  factoryJumpPanel.addEventListener("click", (event) => {
    const item = event.target instanceof Element ? event.target.closest("[data-factory-jump]") : null;
    if (!(item instanceof HTMLButtonElement)) return;
    const target = item.dataset.factoryJump || "";
    const section = target ? document.querySelector(target) : null;
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    setFactoryJumpOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (factoryJumpToggle.getAttribute("aria-expanded") !== "true") return;
    if (event.target.closest(".factory-jump")) return;
    setFactoryJumpOpen(false);
  });

  const intro = document.querySelector(".home-intro");
  if (!(intro instanceof HTMLElement)) return;

  const syncFactoryJumpVisibility = (entry) => {
    const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    document.body.classList.toggle("factory-jump-visible", show);
    if (!show) setFactoryJumpOpen(false);
  };

  const introObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry) syncFactoryJumpVisibility(entry);
    },
    { threshold: [0, 0.01] },
  );
  introObserver.observe(intro);
}

initFactoryJump();
initPricingGate();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (factoryJumpToggle?.getAttribute("aria-expanded") === "true") {
      setFactoryJumpOpen(false);
      factoryJumpToggle.focus();
      return;
    }
    const quoteModal = document.querySelector("#quote-modal");
    if (quoteModal && !quoteModal.hasAttribute("hidden")) {
      return;
    }
    if (pricingSoonModal && !pricingSoonModal.hasAttribute("hidden")) {
      event.preventDefault();
      closePricingSoon();
      return;
    }
    if (factoryContactModal && !factoryContactModal.hasAttribute("hidden")) {
      event.preventDefault();
      closeFactoryContact();
      return;
    }
    if (contactModal && !contactModal.hasAttribute("hidden")) {
      event.preventDefault();
      closeContact();
      return;
    }
    const lightbox = getPhotoLightbox();
    if (lightbox && !lightbox.hasAttribute("hidden")) {
      event.preventDefault();
      closePhotos();
      return;
    }
    if (catalogModal && !catalogModal.hasAttribute("hidden")) {
      event.preventDefault();
      closeCatalog();
      return;
    }
    setMenuOpen(false);
    return;
  }

  const lightbox = getPhotoLightbox();
  const photoDialog = getPhotoDialog();
  if (lightbox && !lightbox.hasAttribute("hidden") && photoDialog) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepPhoto(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepPhoto(1);
      return;
    }
  }

  if (event.key !== "Tab") return;

  const dialog = [getPhotoDialog(), catalogDialog, factoryContactDialog, contactDialog].find((node) => {
    if (!node) return false;
    const wrap = node.closest("[hidden]");
    return !wrap;
  });
  if (!dialog) return;
  const nodes =
    dialog === getPhotoDialog()
      ? photoFocusable()
      : dialog === catalogDialog
        ? catalogFocusable()
        : dialog === factoryContactDialog
          ? factoryContactFocusable()
          : contactFocusable();
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
});
