/**
 * code-runner.js — CF Solutions
 * Injects ▶ Run buttons into Python code blocks (Pyodide / WASM).
 * Injects 🔗 Try it buttons into C++ code blocks (opens Wandbox).
 * Runs on every page load (not just home page).
 */

(function () {
  "use strict";

  let pyodideReady    = null;   // promise
  let pyodideInstance = null;

  /* ── Load Pyodide lazily ─────────────────────────────────────────────── */
  function ensurePyodide() {
    if (pyodideReady) return pyodideReady;
    pyodideReady = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" })
      .then((py) => { pyodideInstance = py; return py; })
      .catch((err) => { console.error("[CF] Pyodide load failed:", err); throw err; });
    return pyodideReady;
  }

  /* ── Run Python code ─────────────────────────────────────────────────── */
  async function runPython(code, outputEl, btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Loading…";
    outputEl.hidden = false;
    outputEl.className = "cf-run-output";
    outputEl.textContent = "Loading Python runtime (first run may take ~5 s)…";

    try {
      const py = await ensurePyodide();

      // Capture stdout/stderr
      py.runPython(`
import sys, io
_cf_stdout = io.StringIO()
_cf_stderr = io.StringIO()
sys.stdout = _cf_stdout
sys.stderr = _cf_stderr
`);

      btn.textContent = "⏳ Running…";
      try {
        py.runPython(code);
      } catch (runErr) {
        // script-level errors
        py.runPython("sys.stderr.write(str(_cf_exc) if '_cf_exc' in dir() else '')");
        outputEl.className = "cf-run-output error";
        outputEl.textContent = String(runErr);
        return;
      }

      const stdout = py.runPython("_cf_stdout.getvalue()");
      const stderr = py.runPython("_cf_stderr.getvalue()");

      // Restore
      py.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");

      if (stderr) {
        outputEl.className = "cf-run-output error";
        outputEl.textContent = stderr;
      } else {
        outputEl.textContent = stdout || "(no output)";
      }
    } catch (err) {
      outputEl.className = "cf-run-output error";
      outputEl.textContent = "Error: " + String(err);
    } finally {
      btn.disabled = false;
      btn.textContent = "▶ Run";
    }
  }

  /* ── Open C++ in Wandbox ─────────────────────────────────────────────── */
  function openCpp(code) {
    const body = JSON.stringify({
      compiler: "gcc-13",
      code,
      "compiler-option-raw": "-std=c++17 -O2 -Wall",
    });

    // POST to Wandbox compile API, then open permalink
    fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.url) window.open(d.url, "_blank");
        else {
          // Fallback: open Wandbox main with code in clipboard hint
          window.open("https://wandbox.org/", "_blank");
        }
      })
      .catch(() => window.open("https://wandbox.org/", "_blank"));
  }

  /* ── Create output box ───────────────────────────────────────────────── */
  function mkOutput() {
    const el = document.createElement("pre");
    el.className = "cf-run-output";
    el.hidden = true;
    return el;
  }

  /* ── Inject buttons into code blocks ─────────────────────────────────── */
  function injectButtons() {
    // Python blocks
    document.querySelectorAll("pre > code.language-python").forEach((code) => {
      const pre = code.parentElement;
      if (pre.dataset.cfInjected) return;
      pre.dataset.cfInjected = "1";

      const wrap = document.createElement("div");
      wrap.className = "cf-runner-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const toolbar = document.createElement("div");
      toolbar.className = "cf-runner-toolbar";

      const btn = document.createElement("button");
      btn.className = "cf-run-btn";
      btn.type = "button";
      btn.textContent = "▶ Run";
      toolbar.appendChild(btn);

      const output = mkOutput();

      wrap.appendChild(toolbar);
      wrap.appendChild(output);

      btn.addEventListener("click", () => {
        const src = code.textContent;
        runPython(src, output, btn);
      });
    });

    // C++ blocks
    document.querySelectorAll(
      "pre > code.language-cpp, pre > code.language-c\\+\\+"
    ).forEach((code) => {
      const pre = code.parentElement;
      if (pre.dataset.cfInjected) return;
      pre.dataset.cfInjected = "1";

      const wrap = document.createElement("div");
      wrap.className = "cf-runner-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const toolbar = document.createElement("div");
      toolbar.className = "cf-runner-toolbar";

      const btn = document.createElement("button");
      btn.className = "cf-run-btn cf-run-btn--cpp";
      btn.type = "button";
      btn.textContent = "🔗 Try on Wandbox";
      toolbar.appendChild(btn);

      wrap.appendChild(toolbar);

      btn.addEventListener("click", () => openCpp(code.textContent));
    });
  }

  /* ── Bootstrap ───────────────────────────────────────────────────────── */
  function init() {
    // Only inject on problem pages (not home)
    if (document.getElementById("hero-stats")) return;
    injectButtons();
  }

  document.addEventListener("DOMContentLoaded", init);
  document$.subscribe(init);   // Material SPA hook
})();
