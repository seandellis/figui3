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

function figSelectInputControl(input, options = {}) {
  if (!input || input.disabled || input.readOnly) return;
  const host = options.host;
  if (host && !figInputSelectOnFocusEnabled(host)) return;
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
  figNextFrame(host, () => figInputSelectContent(host, input, overrides));
}

export { figHandleInputSelectOnFocus, figInputSelectContent };
