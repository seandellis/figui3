/*
MIT License
Copyright (c) 2026 Rogie King
License: https://github.com/rogie/figui3/blob/main/LICENSE
*/
import { figBooleanAttribute, figNextFrame } from "../../shared/dom.js";

function figInputSelectOnFocusEnabled(host) {
  return (
    !host.hasAttribute("select-on-focus") ||
    figBooleanAttribute(host, "select-on-focus")
  );
}

function figInputSelectRange(host, fallback = "all") {
  const raw = (host.getAttribute("select-range") || fallback).trim().toLowerCase();
  return raw === "numeric" ? "numeric" : "all";
}

/** Bumps so any pending focus-time select scheduled on the host is skipped. */
function figCancelPendingInputSelectOnFocus(host) {
  if (!host) return;
  host.__figSelectOnFocusId = (host.__figSelectOnFocusId || 0) + 1;
}

function figSelectInputControl(input, options = {}) {
  if (!input || input.disabled || input.readOnly) return;
  const host = options.host;
  if (host && !figInputSelectOnFocusEnabled(host)) return;
  // Respect explicit caret/range (e.g. palette sync after an external value update).
  if (
    input.selectionStart !== input.selectionEnd &&
    input.selectionStart !== null
  ) {
    return;
  }
  const value = input.value;
  if (!value) return;

  const range = options.range || "all";
  if (range === "numeric" && options.units) {
    if (options.unitPosition === "prefix") {
      input.setSelectionRange(options.units.length, value.length);
      return;
    }
    const unitPos = value.indexOf(options.units);
    if (unitPos > -1) {
      input.setSelectionRange(0, unitPos);
      return;
    }
  }

  if (typeof input.select === "function") {
    input.select();
    return;
  }
  input.setSelectionRange(0, value.length);
}

function figInputSelectContent(host, input, overrides = {}) {
  if (!host || !input) return;
  if (
    (host.hasAttribute("disabled") && host.getAttribute("disabled") !== "false") ||
    (host.hasAttribute("readonly") && host.getAttribute("readonly") !== "false")
  ) {
    return;
  }
  const getOptions = overrides.getSelectOptions;
  const resolved =
    typeof getOptions === "function" ? getOptions() : overrides;
  const range =
    overrides.range ||
    figInputSelectRange(
      host,
      host.localName === "fig-input-number" ? "numeric" : "all",
    );
  figSelectInputControl(input, {
    host,
    range,
    units: resolved.units,
    unitPosition: resolved.unitPosition,
  });
}

function figHandleInputSelectOnFocus(host, input, overrides = {}) {
  const id = (host.__figSelectOnFocusId = (host.__figSelectOnFocusId || 0) + 1);
  figNextFrame(host, () => {
    if (host.__figSelectOnFocusId !== id) return;
    if (document.activeElement !== input) return;
    figInputSelectContent(host, input, overrides);
  });
}

export {
  figCancelPendingInputSelectOnFocus,
  figHandleInputSelectOnFocus,
  figInputSelectContent,
};
