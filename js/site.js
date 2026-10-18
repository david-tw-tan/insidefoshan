document.querySelectorAll("[data-open-catalog]").forEach((opener) => {
  const detailEl = opener.querySelector(".resource-detail");
  if (detailEl) detailEl.textContent = opener.dataset.detail || "";
});

const menuToggle = document.querySelector(".menu-float");
const siteNav = document.querySelector("#site-nav");

function setMenuOpen(open) {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  menuToggle.textContent = open ? "Close" : "Menu";
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
    requestAnimationFrame(() => {
      root.classList.add("overlay-open");
    });
  });
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

function openContact() {
  if (!contactModal || !contactDialog || !contactModal.hasAttribute("hidden")) return;
  contactLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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

const lightbox = document.querySelector("#photo-lightbox");
const photoDialog = document.querySelector("#photo-dialog");
let photoSet = null;
let photoIndex = 0;
let photoLastFocus = null;

function photoFocusable() {
  if (!photoDialog) return [];
  return [...photoDialog.querySelectorAll("button:not([disabled])")];
}

function renderPhoto() {
  if (!photoSet || !photoDialog) return;
  const img = photoDialog.querySelector(".lightbox-img");
  const titleEl = photoDialog.querySelector(".lightbox-title");
  const countEl = photoDialog.querySelector(".lightbox-count");
  const prev = photoDialog.querySelector("[data-photo-prev]");
  const next = photoDialog.querySelector("[data-photo-next]");
  if (!img || !titleEl || !countEl || !prev || !next) return;
  const photo = photoSet.images[photoIndex];
  img.src = photo.src;
  img.alt = photo.alt;
  img.width = photo.width;
  img.height = photo.height;
  titleEl.textContent = photoSet.title;
  const total = photoSet.images.length;
  countEl.textContent = `${photoIndex + 1} of ${total}`;
  prev.toggleAttribute("disabled", total < 2);
  next.toggleAttribute("disabled", total < 2);
}

function openPhotos(opener) {
  if (!lightbox || !photoDialog) return;
  const template = document.getElementById(opener.dataset.openPhotos || "");
  if (!(template instanceof HTMLTemplateElement)) return;
  const images = [...template.content.querySelectorAll("img")].map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
    width: Number(img.getAttribute("width")) || 0,
    height: Number(img.getAttribute("height")) || 0,
  }));
  if (!images.length) return;
  photoSet = { title: opener.dataset.title || "", images };
  photoIndex = 0;
  photoLastFocus = opener;
  renderPhoto();
  revealOverlay(lightbox);
  document.body.classList.add("lightbox-open");
  photoDialog.focus();
}

function closePhotos() {
  if (!lightbox || lightbox.hasAttribute("hidden")) return;
  dismissOverlay(lightbox, () => {
    document.body.classList.remove("lightbox-open");
    const img = photoDialog?.querySelector(".lightbox-img");
    if (img) {
      img.removeAttribute("src");
      img.alt = "";
    }
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

  if (target.closest("[data-open-factory-contact]")) {
    event.preventDefault();
    openFactoryContact();
    return;
  }
  if (target.closest("[data-open-contact]")) {
    event.preventDefault();
    openContact();
  }
  if (target.closest("[data-close-factory-contact]")) closeFactoryContact();
  if (target.closest("[data-close-contact]")) closeContact();

  const catalogOpener = target.closest("[data-open-catalog]");
  if (catalogOpener instanceof HTMLElement) openCatalog(catalogOpener);
  if (target.closest("[data-close-catalog]")) closeCatalog();

  const photoOpener = target.closest("[data-open-photos]");
  if (photoOpener instanceof HTMLElement) openPhotos(photoOpener);
  if (target.closest("[data-close-lightbox]")) closePhotos();
  if (target.closest("[data-photo-prev]")) stepPhoto(-1);
  if (target.closest("[data-photo-next]")) stepPhoto(1);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const quoteModal = document.querySelector("#quote-modal");
    if (quoteModal && !quoteModal.hasAttribute("hidden")) {
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

  const dialog = [photoDialog, catalogDialog, factoryContactDialog, contactDialog].find((node) => {
    if (!node) return false;
    const wrap = node.closest("[hidden]");
    return !wrap;
  });
  if (!dialog) return;
  const nodes =
    dialog === photoDialog
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
