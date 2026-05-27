const THEME_KEY = "agriease-theme";
const MEASUREMENT_UNIT_KEY = "agriease-measurement-unit";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readPreference(key, fallback, allowedValues) {
  const storage = getStorage();
  if (!storage) return fallback;

  const rawValue = storage.getItem(key);
  if (!rawValue) return fallback;

  if (Array.isArray(allowedValues) && !allowedValues.includes(rawValue)) {
    return fallback;
  }

  return rawValue;
}

function writePreference(key, value) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(key, value);
}

export function getStoredThemePreference() {
  return readPreference(THEME_KEY, "light", ["light", "dark"]);
}

export function setStoredThemePreference(theme) {
  writePreference(THEME_KEY, theme);
}

export function getStoredMeasurementUnit() {
  return readPreference(MEASUREMENT_UNIT_KEY, "metric", ["metric", "imperial"]);
}

export function setStoredMeasurementUnit(unit) {
  writePreference(MEASUREMENT_UNIT_KEY, unit);
}
