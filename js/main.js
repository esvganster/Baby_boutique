const WHATSAPP_NUMBER = "18090000000";

const selectors = {
  header: "[data-header]",
  navToggle: "[data-nav-toggle]",
  navMenu: "[data-nav-menu]",
  revealItems: ".reveal",
  contactForm: "[data-contact-form]",
  formFeedback: "[data-form-feedback]",
  trackedLinks: "[data-track-click]",
};

// Controls the mobile menu and keeps keyboard behavior predictable.
class NavigationMenu {
  constructor(toggleButton, menu) {
    this.toggleButton = toggleButton;
    this.menu = menu;
    this.focusableSelector = "a, button";
  }

  init() {
    if (!this.toggleButton || !this.menu) return;

    this.toggleButton.addEventListener("click", () => this.toggle());
    this.menu.addEventListener("click", (event) => this.closeOnLinkClick(event));
    document.addEventListener("keydown", (event) => this.handleKeyboard(event));
  }

  toggle() {
    const shouldOpen = !this.menu.classList.contains("is-open");
    shouldOpen ? this.open() : this.close();
  }

  open() {
    this.menu.classList.add("is-open");
    this.toggleButton.classList.add("is-open");
    this.toggleButton.setAttribute("aria-expanded", "true");
  }

  close() {
    this.menu.classList.remove("is-open");
    this.toggleButton.classList.remove("is-open");
    this.toggleButton.setAttribute("aria-expanded", "false");
  }

  closeOnLinkClick(event) {
    if (event.target.closest("a")) {
      this.close();
    }
  }

  handleKeyboard(event) {
    if (event.key === "Escape") {
      this.close();
      this.toggleButton.focus();
    }
  }
}

// Builds a WhatsApp message from the contact form without needing a backend.
class ContactForm {
  constructor(form) {
    this.form = form;
    this.feedback = form?.querySelector(selectors.formFeedback);
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener("submit", (event) => this.handleSubmit(event));
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.form.checkValidity()) {
      this.form.reportValidity();
      return;
    }

    const data = new FormData(this.form);
    const message = this.buildWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    this.showFeedback("Mensaje preparado. Se abrira WhatsApp para continuar el pedido.");
    window.open(url, "_blank", "noopener");
  }

  buildWhatsAppMessage(data) {
    return [
      "Hola Olive's Baby Boutique.",
      `Mi nombre es ${data.get("nombre")}.`,
      `Mi telefono es ${data.get("telefono")}.`,
      `Estoy interesada/o en: ${data.get("pedido")}.`,
      `Detalle del pedido: ${data.get("mensaje")}.`,
    ].join("\n");
  }

  showFeedback(message) {
    if (this.feedback) {
      this.feedback.textContent = message;
    }
  }
}

// Adds a subtle shadow after the user starts scrolling.
function updateHeaderOnScroll() {
  const header = document.querySelector(selectors.header);
  if (!header) return;

  const toggleHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  toggleHeaderState();
  window.addEventListener("scroll", toggleHeaderState, { passive: true });
}

// Reveals content progressively as it enters the viewport.
function revealOnScroll() {
  const items = document.querySelectorAll(selectors.revealItems);
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

// Allows service/category cards to respond to Enter and Space.
function addKeyboardCardSupport() {
  const cards = document.querySelectorAll(".feature-card[tabindex='0']");

  cards.forEach((card) => {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("is-selected");
      }
    });
  });
}

// Lightweight click hooks for important conversion links.
function trackImportantClicks() {
  const links = document.querySelectorAll(selectors.trackedLinks);

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.dataset.trackClick;
      console.info(`Interaccion registrada: ${target}`);
    });
  });
}

function initApp() {
  const menu = new NavigationMenu(
    document.querySelector(selectors.navToggle),
    document.querySelector(selectors.navMenu)
  );
  const form = new ContactForm(document.querySelector(selectors.contactForm));

  menu.init();
  form.init();
  updateHeaderOnScroll();
  revealOnScroll();
  addKeyboardCardSupport();
  trackImportantClicks();
}

document.addEventListener("DOMContentLoaded", initApp);
