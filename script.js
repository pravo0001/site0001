const CURRENT_YEAR = new Date().getFullYear().toString();
const CONSULTATION_EMAIL = "contact@taxlawyer.com.ua";
const THEME_MODE_KEY = "site-theme-mode";
const body = document.body;
const themeToggle = document.querySelector("#theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = CURRENT_YEAR;
});

const applyTheme = (theme) => {
  const next = theme === "night" ? "night" : "day";
  const isNight = next === "night";

  body.classList.remove("theme-day", "theme-night");
  body.classList.add(isNight ? "theme-night" : "theme-day");

  if (themeToggle instanceof HTMLButtonElement) {
    themeToggle.textContent = isNight ? "☼" : "☾";
    themeToggle.setAttribute("aria-pressed", isNight ? "true" : "false");
    themeToggle.setAttribute("aria-label", isNight ? "Увімкнути денну тему" : "Увімкнути нічну тему");
    themeToggle.setAttribute("title", isNight ? "Увімкнути денну тему" : "Увімкнути нічну тему");
  }

  if (themeColorMeta instanceof HTMLMetaElement) {
    themeColorMeta.setAttribute("content", isNight ? "#0b0705" : "#120b08");
  }
};

const getStoredThemeMode = () => {
  try {
    const saved = localStorage.getItem(THEME_MODE_KEY);
    return saved === "day" || saved === "night" || saved === "auto" ? saved : null;
  } catch {
    return null;
  }
};

const setStoredThemeMode = (mode) => {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // ignore
  }
};

const getSystemTheme = () => (systemThemeMedia.matches ? "night" : "day");

const getPreferredTheme = () => {
  const storedMode = getStoredThemeMode();
  if (storedMode === "day" || storedMode === "night") {
    return storedMode;
  }

  return getSystemTheme();
};

applyTheme(getPreferredTheme());

if (themeToggle instanceof HTMLButtonElement) {
  themeToggle.addEventListener("click", () => {
    const isNight = body.classList.contains("theme-night");
    const nextTheme = isNight ? "day" : "night";
    applyTheme(nextTheme);
    setStoredThemeMode(nextTheme);
  });
}

const handleSystemThemeChange = () => {
  const storedMode = getStoredThemeMode();
  if (storedMode === "day" || storedMode === "night") {
    return;
  }

  applyTheme(getSystemTheme());
};

if (typeof systemThemeMedia.addEventListener === "function") {
  systemThemeMedia.addEventListener("change", handleSystemThemeChange);
} else if (typeof systemThemeMedia.addListener === "function") {
  systemThemeMedia.addListener(handleSystemThemeChange);
}

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

if (menuToggle instanceof HTMLButtonElement && menu instanceof HTMLElement) {
  const closeMenu = () => {
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const nextState = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", nextState);
    menuToggle.setAttribute("aria-expanded", String(nextState));
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!menu.contains(target) && !menuToggle.contains(target)) {
      closeMenu();
    }
  });

  const desktopMedia = window.matchMedia("(min-width: 961px)");
  const handleMediaChange = () => {
    if (desktopMedia.matches) {
      closeMenu();
    }
  };

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleMediaChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(handleMediaChange);
  }
}

const normalizePhone = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "").slice(0, 15);
  if (!digits) return "";

  return `${hasPlus ? "+" : ""}${digits}`;
};

const buildMailtoUrl = ({ name, phone, message, pageUrl }) => {
  const subject = `Запит на консультацію: ${name}`;
  const body = [
    "Нова заявка з сайту taxlawyer.com.ua",
    "",
    `Ім'я: ${name}`,
    `Телефон: ${phone}`,
    `Суть питання: ${message || "-"}`,
    `Сторінка: ${pageUrl}`,
  ].join("\n");

  return `mailto:${CONSULTATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

document.querySelectorAll("[data-consultation-form]").forEach((form) => {
  if (!(form instanceof HTMLFormElement)) return;

  const note = form.querySelector("[data-form-note]");
  const phoneInput = form.querySelector('input[name="phone"]');
  const createdAt = Date.now();

  if (phoneInput instanceof HTMLInputElement) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = normalizePhone(phoneInput.value);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameField = form.querySelector('input[name="name"]');
    const phoneField = form.querySelector('input[name="phone"]');
    const messageField = form.querySelector('textarea[name="message"]');
    const websiteField = form.querySelector('input[name="website"]');

    const name = nameField instanceof HTMLInputElement ? nameField.value.trim() : "";
    const phone = phoneField instanceof HTMLInputElement ? normalizePhone(phoneField.value) : "";
    const message = messageField instanceof HTMLTextAreaElement ? messageField.value.trim() : "";
    const website = websiteField instanceof HTMLInputElement ? websiteField.value.trim() : "";

    if (!(note instanceof HTMLElement)) return;

    if (website) {
      note.textContent = "Не вдалося підготувати заявку. Спробуйте ще раз.";
      return;
    }

    if (Date.now() - createdAt < 1500) {
      note.textContent = "Заповніть форму уважно та повторіть відправку через кілька секунд.";
      return;
    }

    if (name.length < 2) {
      note.textContent = "Вкажіть, будь ласка, ваше ім'я.";
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      note.textContent = "Вкажіть коректний номер телефону.";
      return;
    }

    if (message.length > 1200) {
      note.textContent = "Скоротіть опис ситуації до 1200 символів.";
      return;
    }

    const mailtoUrl = buildMailtoUrl({
      name,
      phone,
      message,
      pageUrl: window.location.href,
    });

    note.textContent = "Відкриваємо чернетку листа. Якщо поштовий клієнт не запустився, скористайтеся телефоном або месенджером нижче.";
    window.location.href = mailtoUrl;
    form.reset();
  });
});
