/**
 * Pricing Examples — edit quotation tiles and details here.
 * Replace images under images/pricing/ when ready (paths below).
 */
const PRICING_QUOTES = [
  {
    category: "Three-seat sofa",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "[Secondary specification detail, if any]",
    quantityNote: "[e.g. Price applies to a stated order quantity or configuration]",
    quotationDate: null,
    image: "../images/broad-01-living.jpg",
    alt: "Placeholder photograph: three-seat sofa in a showroom setting.",
    width: 1184,
    height: 861,
  },
  {
    category: "Dining table",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-01-dining.jpg",
    alt: "Placeholder photograph: dining table in a showroom setting.",
    width: 856,
    height: 750,
  },
  {
    category: "Dining chair",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "[Per chair, if applicable]",
    quotationDate: null,
    image: "../images/broad-02-rustic.jpg",
    alt: "Placeholder photograph: dining or lounge chair in a showroom setting.",
    width: 1092,
    height: 794,
  },
  {
    category: "Bed and headboard",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-01-bedroom.jpg",
    alt: "Placeholder photograph: bed and headboard in a showroom setting.",
    width: 864,
    height: 676,
  },
  {
    category: "Coffee table",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-01-natural.jpg",
    alt: "Placeholder photograph: coffee table in a showroom setting.",
    width: 1404,
    height: 1154,
  },
  {
    category: "Wardrobe",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-01-fashion.jpg",
    alt: "Placeholder photograph: wardrobe or storage furniture in a showroom setting.",
    width: 1313,
    height: 806,
  },
  {
    category: "Sectional sofa",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-02-collection.jpg",
    alt: "Placeholder photograph: sectional sofa in a showroom setting.",
    width: 1266,
    height: 764,
  },
  {
    category: "Occasional chair",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-01-fashion.jpg",
    alt: "Placeholder photograph: occasional chair in a showroom setting.",
    width: 1313,
    height: 806,
  },
  {
    category: "Side table",
    name: "[Product name]",
    price: "RMB [PRICE]",
    specs: "[Primary specification detail]",
    specsExtra: "",
    quantityNote: "",
    quotationDate: null,
    image: "../images/broad-01-dining.jpg",
    alt: "Placeholder photograph: side or occasional table.",
    width: 856,
    height: 750,
  },
];

(function initPricingExamples() {
  const grid = document.querySelector("#pricing-quote-grid");
  const modal = document.querySelector("#quote-modal");
  const dialog = document.querySelector("#quote-dialog");
  if (!grid || !modal || !dialog) return;

  const imgEl = dialog.querySelector(".quote-modal-img");
  const titleEl = dialog.querySelector("#quote-modal-title");
  const priceEl = dialog.querySelector("#quote-modal-price");
  const specsEl = dialog.querySelector("#quote-modal-specs");
  const dateEl = dialog.querySelector("#quote-modal-date");
  const noteEl = dialog.querySelector("#quote-modal-note");
  const countEl = dialog.querySelector(".quote-modal-count");
  const prevBtn = dialog.querySelector("[data-quote-prev]");
  const nextBtn = dialog.querySelector("[data-quote-next]");

  let index = 0;
  let lastFocus = null;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function revealOverlay() {
    modal.removeAttribute("hidden");
    if (motionQuery.matches) {
      modal.classList.add("overlay-open");
      return;
    }
    modal.classList.remove("overlay-open");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("overlay-open"));
    });
  }

  function dismissOverlay(done) {
    if (modal.hasAttribute("hidden")) return;
    if (motionQuery.matches) {
      modal.classList.remove("overlay-open");
      modal.setAttribute("hidden", "");
      done?.();
      return;
    }
    modal.classList.remove("overlay-open");
    window.setTimeout(() => {
      modal.setAttribute("hidden", "");
      done?.();
    }, 180);
  }

  function quoteFocusable() {
    return [...dialog.querySelectorAll("a[href], button:not([disabled])")];
  }

  function renderQuote() {
    const q = PRICING_QUOTES[index];
    if (!q || !imgEl || !titleEl || !priceEl || !specsEl) return;

    imgEl.src = q.image;
    imgEl.alt = q.alt;
    imgEl.width = q.width;
    imgEl.height = q.height;
    titleEl.textContent = q.name;
    priceEl.textContent = q.price;

    const specParts = [q.specs, q.specsExtra].filter(Boolean);
    specsEl.textContent = specParts.length ? specParts.join(" ") : "[Specifications]";

    if (dateEl) {
      if (q.quotationDate) {
        dateEl.textContent = `Quotation date: ${q.quotationDate}`;
        dateEl.hidden = false;
      } else {
        dateEl.textContent = "";
        dateEl.hidden = true;
      }
    }

    if (noteEl) {
      if (q.quantityNote) {
        noteEl.textContent = q.quantityNote;
        noteEl.hidden = false;
      } else {
        noteEl.textContent = "";
        noteEl.hidden = true;
      }
    }

    if (countEl) countEl.textContent = `${index + 1} of ${PRICING_QUOTES.length}`;
    if (prevBtn) prevBtn.toggleAttribute("disabled", PRICING_QUOTES.length < 2);
    if (nextBtn) nextBtn.toggleAttribute("disabled", PRICING_QUOTES.length < 2);
  }

  function openQuote(i, opener) {
    index = i;
    lastFocus = opener instanceof HTMLElement ? opener : null;
    renderQuote();
    revealOverlay();
    document.body.classList.add("modal-open");
    dialog.focus();
  }

  function closeQuote() {
    dismissOverlay(() => {
      document.body.classList.remove("modal-open");
      if (imgEl) imgEl.removeAttribute("src");
      lastFocus?.focus();
    });
  }

  function stepQuote(delta) {
    if (PRICING_QUOTES.length < 2) return;
    index = (index + delta + PRICING_QUOTES.length) % PRICING_QUOTES.length;
    renderQuote();
  }

  PRICING_QUOTES.forEach((quote, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pricing-quote-tile";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-controls", "quote-dialog");
    btn.dataset.quoteIndex = String(i);

    const img = document.createElement("img");
    img.src = quote.image;
    img.alt = quote.alt;
    img.width = quote.width;
    img.height = quote.height;
    img.loading = "lazy";
    btn.appendChild(img);

    if (quote.category) {
      const label = document.createElement("span");
      label.className = "pricing-quote-tile__label";
      label.textContent = quote.category;
      btn.appendChild(label);
    }

    grid.appendChild(btn);
  });

  grid.addEventListener("click", (event) => {
    const tile = event.target.closest(".pricing-quote-tile");
    if (!(tile instanceof HTMLElement)) return;
    const i = Number(tile.dataset.quoteIndex);
    if (!Number.isNaN(i)) openQuote(i, tile);
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-close-quote]")) closeQuote();
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hasAttribute("hidden")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeQuote();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepQuote(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepQuote(1);
      return;
    }
    if (event.key !== "Tab") return;

    const nodes = quoteFocusable();
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

  prevBtn?.addEventListener("click", () => stepQuote(-1));
  nextBtn?.addEventListener("click", () => stepQuote(+1));
})();
