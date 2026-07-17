---
title: Calculator
hide:
  - toc
---

# Operations Calculator

Estimate the maximum time complexity your algorithm can afford, given a
problem's Time Limit, test case count and input bounds. Works for
Codeforces, LeetCode, HackerRank or any judge with similar constraints.

<div class="cf-calc" id="cf-calc">
  <div class="cf-calc__form">
    <div class="cf-calc__field">
      <label for="calc-tl">Time Limit (seconds)</label>
      <input type="number" id="calc-tl" value="1" min="0.1" step="0.1">
    </div>
    <div class="cf-calc__field">
      <label for="calc-ops">Operations / second</label>
      <input type="number" id="calc-ops" value="100000000" min="1" step="1">
    </div>
    <div class="cf-calc__field">
      <label for="calc-mem">Memory Limit (MB)</label>
      <input type="number" id="calc-mem" value="256" min="1" step="1">
    </div>
    <div class="cf-calc__field">
      <label for="calc-tests">Number of Test Cases (t)</label>
      <input type="number" id="calc-tests" value="1" min="1" step="1">
    </div>
    <div class="cf-calc__field">
      <label for="calc-n">Max Input Value (n)</label>
      <input type="number" id="calc-n" value="100" min="1" step="1">
    </div>
    <div class="cf-calc__field cf-calc__field--checkbox">
      <label for="calc-sum">
        <input type="checkbox" id="calc-sum">
        Sum of n over all test cases is guaranteed (bounded by n above)
      </label>
    </div>
  </div>

  <div class="cf-calc__result" id="calc-result"></div>

  <table class="cf-calc__table">
    <thead>
      <tr><th>Complexity</th><th>Estimated operations</th><th>Status</th></tr>
    </thead>
    <tbody id="calc-table-body"></tbody>
  </table>
</div>

!!! note "How the budget is computed"
    - **Per-test budget** (checkbox off): `TL x ops/sec / t` - each of the
      `t` test cases gets an equal share of the total time.
    - **Total budget** (checkbox on): `TL x ops/sec` - used as-is, since
      `n` already represents the sum across all test cases.
    - Memory hint is a rough guideline (`memory / 4 bytes` per `int`,
      `memory / 8 bytes` per `long`/`double`), not an exact bound.
