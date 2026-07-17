/**
 * calculator.js — CF Solutions
 * Live "max operations per test case" calculator + complexity table.
 * Only runs on the Calculator page (#cf-calc present).
 */

(function () {
  "use strict";

  const COMPLEXITIES = [
    { name: "O(1)", fn: () => 1 },
    { name: "O(log n)", fn: (n) => Math.log2(Math.max(n, 1)) },
    { name: "O(sqrt n)", fn: (n) => Math.sqrt(n) },
    { name: "O(n)", fn: (n) => n },
    { name: "O(n log n)", fn: (n) => n * Math.log2(Math.max(n, 1)) },
    { name: "O(n sqrt n)", fn: (n) => n * Math.sqrt(n) },
    { name: "O(n^2)", fn: (n) => n * n },
    { name: "O(n^2 log n)", fn: (n) => n * n * Math.log2(Math.max(n, 1)) },
    { name: "O(n^3)", fn: (n) => n * n * n },
    { name: "O(n^4)", fn: (n) => Math.pow(n, 4) },
    { name: "O(2^n)", fn: (n) => Math.pow(2, n) },
    { name: "O(n!)", fn: (n) => stirling(n) },
  ];

  // Stirling's approximation of ln(n!) -> avoids overflow for moderate n,
  // still yields Infinity for large n (correctly compared as "fail").
  function stirling(n) {
    if (n <= 1) return 1;
    const lnFact = n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
    return Math.exp(lnFact);
  }

  function formatNum(v) {
    if (!isFinite(v)) return "overflow";
    if (v >= 1e6) return v.toExponential(2);
    return Math.round(v).toLocaleString();
  }

  function readInputs() {
    return {
      tl: parseFloat(document.getElementById("calc-tl").value) || 0,
      ops: parseFloat(document.getElementById("calc-ops").value) || 0,
      mem: parseFloat(document.getElementById("calc-mem").value) || 0,
      tests: Math.max(1, parseInt(document.getElementById("calc-tests").value) || 1),
      n: Math.max(1, parseFloat(document.getElementById("calc-n").value) || 1),
      sumGuaranteed: document.getElementById("calc-sum").checked,
    };
  }

  function compute() {
    const { tl, ops, mem, tests, n, sumGuaranteed } = readInputs();
    const totalBudget = tl * ops;
    const budget = sumGuaranteed ? totalBudget : totalBudget / tests;

    const maxInts = Math.floor((mem * 1024 * 1024) / 4);
    const maxLongs = Math.floor((mem * 1024 * 1024) / 8);

    const resultEl = document.getElementById("calc-result");
    resultEl.innerHTML = `
      <strong>Budget:</strong> ${formatNum(budget)} operations
      ${sumGuaranteed ? "(total, sum-of-n bound)" : `per test case (t = ${tests})`}
      <br>
      <strong>Memory hint:</strong> ~${formatNum(maxInts)} 32-bit ints or
      ~${formatNum(maxLongs)} 64-bit values fit in ${mem} MB.
    `;

    const tbody = document.getElementById("calc-table-body");
    tbody.innerHTML = "";
    COMPLEXITIES.forEach((c) => {
      const value = c.fn(n);
      const pass = value <= budget;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.name}</td>
        <td>${formatNum(value)}</td>
        <td>
          <span class="cf-calc-status ${pass ? "cf-calc-status--pass" : "cf-calc-status--fail"}">
            ${pass ? "PASS" : "FAIL"}
          </span>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function init() {
    const container = document.getElementById("cf-calc");
    if (!container) return;
    container.addEventListener("input", compute);
    compute();
  }

  document.addEventListener("DOMContentLoaded", init);
  document$.subscribe(init); // Material SPA hook
})();
