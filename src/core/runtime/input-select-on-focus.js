/*
MIT License
Copyright (c) 2026 Rogie King
License: https://github.com/rogie/figui3/blob/main/LICENSE
*/
import { figBooleanAttribute, figNextFrame } from "../../shared/dom.js";

// Tracks focus listeners for shared select-on-focus behavior on fig inputs.
const figInputSelectOnFocusData = new WeakMap();

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

function figEnsureInputSelectOnFocusListener(host) {
  const data = figInputSelectOnFocusData.get(host);
  if (!data) return;
  const input = data.getInput?.();
  if (!input) return;
  if (data.currentInput && data.currentInput !== input) {
    data.currentInput.removeEventListener("focus", data.boundFocus);
  }
  data.currentInput = input;
  input.removeEventListener("focus", data.boundFocus);
  input.addEventListener("focus", data.boundFocus);
}

function figBindInputSelectOnFocus(host, getInput, options = {}) {
  let data = figInputSelectOnFocusData.get(host);
  if (!data) {
    data = {
      getInput,
      options,
      currentInput: null,
      boundFocus: (event) =>
        figHandleInputSelectOnFocus(host, event.target, {
          getSelectOptions: data.options.getSelectOptions,
        }),
    };
    figInputSelectOnFocusData.set(host, data);
  } else {
    data.getInput = getInput;
    data.options = options;
  }
  figEnsureInputSelectOnFocusListener(host);
}

function figResyncInputSelectOnFocus(host) {
  figEnsureInputSelectOnFocusListener(host);
}

function figUnbindInputSelectOnFocus(host) {
  const data = figInputSelectOnFocusData.get(host);
  if (!data) return;
  data.currentInput?.removeEventListener("focus", data.boundFocus);
  figInputSelectOnFocusData.delete(host);
}

export {
  figBindInputSelectOnFocus,
  figHandleInputSelectOnFocus,
  figInputSelectContent,
  figResyncInputSelectOnFocus,
  figUnbindInputSelectOnFocus,
};
