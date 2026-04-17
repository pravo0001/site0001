const CURRENT_YEAR = new Date().getFullYear().toString();
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

const PHONE_PREFIX = "+380";
const TELEGRAM_BOT_TOKEN = "8556207665:AAF-6bJnbwQOREkA3jAqFiAVmqQTFumiUgY";
const TELEGRAM_CHAT_ID = "1262055797";
const SPAM_MIN_FILL_MS = 3500;
const SPAM_COOLDOWN_MS = 120000;
const LAST_SUBMIT_KEY = "consultation-last-submit-at";

const normalizeUaPhone = (raw) => {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("380")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  return `${PHONE_PREFIX}${digits}`;
};

const setPhoneCaretToEnd = (input) => {
  const end = input.value.length;
  requestAnimationFrame(() => {
    try {
      input.setSelectionRange(end, end);
    } catch {
      // ignore
    }
  });
};

document.querySelectorAll("[data-consultation-form]").forEach((form) => {
  if (!(form instanceof HTMLFormElement)) return;

  const note = form.querySelector("[data-form-note]");
  const phoneInput = form.querySelector('input[name="phone"]');
  const createdAt = Date.now();

  if (phoneInput instanceof HTMLInputElement) {
    phoneInput.value = normalizeUaPhone(phoneInput.value);

    phoneInput.addEventListener("focus", () => {
      phoneInput.value = normalizeUaPhone(phoneInput.value);
      setPhoneCaretToEnd(phoneInput);
    });

    phoneInput.addEventListener("click", () => {
      if (phoneInput.selectionStart !== null && phoneInput.selectionStart < PHONE_PREFIX.length) {
        setPhoneCaretToEnd(phoneInput);
      }
    });

    phoneInput.addEventListener("keydown", (event) => {
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      if (phoneInput.selectionStart !== phoneInput.selectionEnd) return;

      if (event.key === "Backspace" && (phoneInput.selectionStart ?? 0) <= PHONE_PREFIX.length) {
        event.preventDefault();
        setPhoneCaretToEnd(phoneInput);
      }

      if (event.key === "Delete" && (phoneInput.selectionStart ?? 0) < PHONE_PREFIX.length) {
        event.preventDefault();
        setPhoneCaretToEnd(phoneInput);
      }
    });

    phoneInput.addEventListener("beforeinput", (event) => {
      if (event.inputType !== "deleteContentBackward") return;
      const start = phoneInput.selectionStart ?? 0;
      const end = phoneInput.selectionEnd ?? 0;
      if (start === end && start <= PHONE_PREFIX.length) {
        event.preventDefault();
      }
    });

    phoneInput.addEventListener("input", () => {
      const prev = phoneInput.value;
      const next = normalizeUaPhone(prev);
      if (prev !== next) {
        phoneInput.value = next;
      }

      if ((phoneInput.selectionStart ?? 0) < PHONE_PREFIX.length) {
        setPhoneCaretToEnd(phoneInput);
      }
    });

    phoneInput.addEventListener("paste", (event) => {
      event.preventDefault();
      const pasted = event.clipboardData?.getData("text") ?? "";
      phoneInput.value = normalizeUaPhone(pasted);
      setPhoneCaretToEnd(phoneInput);
    });
  }

  const getLastSubmitAt = () => {
    try {
      const raw = localStorage.getItem(LAST_SUBMIT_KEY);
      const value = Number(raw);
      return Number.isFinite(value) ? value : 0;
    } catch {
      return 0;
    }
  };

  const setLastSubmitAt = (timestamp) => {
    try {
      localStorage.setItem(LAST_SUBMIT_KEY, String(timestamp));
    } catch {
      // ignore
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameField = form.querySelector('input[name="name"]');
    const phoneField = form.querySelector('input[name="phone"]');
    const messageField = form.querySelector('textarea[name="message"]');
    const websiteField = form.querySelector('input[name="website"]');

    const name = nameField instanceof HTMLInputElement ? nameField.value.trim() : "";
    const phone = phoneField instanceof HTMLInputElement ? phoneField.value.trim() : "";
    const message = messageField instanceof HTMLTextAreaElement ? messageField.value.trim() : "";
    const website = websiteField instanceof HTMLInputElement ? websiteField.value.trim() : "";

    if (!(note instanceof HTMLElement)) return;

    if (website) {
      note.textContent = "Не вдалося надіслати заявку. Спробуйте ще раз.";
      return;
    }

    const now = Date.now();
    const filledTooFast = now - createdAt < SPAM_MIN_FILL_MS;
    if (filledTooFast) {
      note.textContent = "Заявка відправлена занадто швидко. Будь ласка, повторіть через кілька секунд.";
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

    const lastSubmitAt = getLastSubmitAt();
    const msLeft = lastSubmitAt + SPAM_COOLDOWN_MS - now;
    if (msLeft > 0) {
      const secLeft = Math.ceil(msLeft / 1000);
      note.textContent = `Зачекайте ${secLeft} с перед наступною заявкою.`;
      return;
    }

    if (/https?:\/\/|www\./i.test(message)) {
      note.textContent = "Будь ласка, приберіть посилання з повідомлення і спробуйте ще раз.";
      return;
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      note.textContent = "Форма не налаштована: додайте токен Telegram-бота та chat id у script.js.";
      return;
    }

    note.textContent = "Надсилаємо заявку...";

    const text = [
      "Нова заявка на консультацію",
      `Ім'я: ${name || "-"}`,
      `Телефон: ${phone || "-"}`,
      `Ситуація: ${message || "-"}`,
      `Сторінка: ${window.location.href}`,
      `Час: ${new Date().toLocaleString("uk-UA")}`,
    ].join("\n");

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
        }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const description = payload && typeof payload === "object" && "description" in payload
          ? String(payload.description)
          : "Telegram API error";
        throw new Error(description);
      }

      note.textContent = "Дякуємо! Заявку отримано. Ми зв'яжемося з вами найближчим часом.";
      setLastSubmitAt(Date.now());
      form.reset();
      if (phoneInput instanceof HTMLInputElement) {
        phoneInput.value = PHONE_PREFIX;
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "невідома помилка";
      note.textContent = `Не вдалося надіслати заявку: ${reason}.`;
    }
  });
});
