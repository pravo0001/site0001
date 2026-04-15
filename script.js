const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear().toString();
}

const form = document.querySelector("#consultation-form");
const note = document.querySelector("#form-note");
const phoneInput = form?.querySelector('input[name="phone"]');

const PHONE_PREFIX = "+380";

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

if (phoneInput) {
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

    if (event.key === "Backspace" && phoneInput.selectionStart <= PHONE_PREFIX.length) {
      event.preventDefault();
      setPhoneCaretToEnd(phoneInput);
    }

    if (event.key === "Delete" && phoneInput.selectionStart < PHONE_PREFIX.length) {
      event.preventDefault();
      setPhoneCaretToEnd(phoneInput);
    }
  });

  phoneInput.addEventListener("beforeinput", (event) => {
    if (event.inputType === "deleteContentBackward") {
      const start = phoneInput.selectionStart ?? 0;
      const end = phoneInput.selectionEnd ?? 0;
      if (start === end && start <= PHONE_PREFIX.length) {
        event.preventDefault();
      }
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

if (form && note) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    note.textContent = "Дякуємо! Заявку отримано. Ми зв'яжемося з вами найближчим часом.";
    form.reset();
    if (phoneInput) {
      phoneInput.value = PHONE_PREFIX;
    }
  });
}

const THEME_KEY = "site-theme";
const body = document.body;
const themeToggle = document.querySelector("#theme-toggle");

const applyTheme = (theme) => {
  const next = theme === "night" ? "night" : "day";
  body.classList.remove("theme-day", "theme-night");
  body.classList.add(next === "night" ? "theme-night" : "theme-day");

  if (themeToggle) {
    const isNight = next === "night";
    themeToggle.textContent = isNight ? "День" : "Ніч";
    themeToggle.setAttribute("aria-pressed", isNight ? "true" : "false");
    themeToggle.setAttribute("aria-label", isNight ? "Увімкнути денну тему" : "Увімкнути нічну тему");
  }

  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // ignore
  }
};

const initialTheme = (() => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "night" || saved === "day") return saved;
  } catch {
    // ignore
  }
  return body.classList.contains("theme-night") ? "night" : "day";
})();

applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isNight = body.classList.contains("theme-night");
    applyTheme(isNight ? "day" : "night");
  });
}