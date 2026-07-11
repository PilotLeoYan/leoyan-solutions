/**
 * extra.js — CF Solutions home-page dashboard
 * Runs only on the home page (template: home.html).
 * Fetches docs/data/problems.json → renders charts, tag filter, problem grid.
 */

(function () {
  "use strict";

  /* ── Difficulty helpers ──────────────────────────────────────────────── */
  const DIFF_THRESHOLDS = [
    { max: 1199, label: "Newbie",           cls: "diff-newbie",  color: "#808080" },
    { max: 1399, label: "Pupil",            cls: "diff-pupil",   color: "#008000" },
    { max: 1599, label: "Specialist",       cls: "diff-spec",    color: "#03a89e" },
    { max: 1899, label: "Expert",           cls: "diff-expert",  color: "#0000ff" },
    { max: 2099, label: "Candidate Master", cls: "diff-cm",      color: "#aa00aa" },
    { max: 2399, label: "Master",           cls: "diff-master",  color: "#ff8c00" },
    { max: Infinity, label: "Grandmaster",  cls: "diff-gm",      color: "#ff0000" },
  ];

  function diffInfo(rating) {
    return DIFF_THRESHOLDS.find((d) => rating <= d.max) || DIFF_THRESHOLDS.at(-1);
  }

  /* ── State ───────────────────────────────────────────────────────────── */
  let allProblems = [];
  let activeTags  = new Set();
  let searchQuery = "";

  /* ── Filtered view ───────────────────────────────────────────────────── */
  function filtered() {
    return allProblems.filter((p) => {
      const matchesTags =
        activeTags.size === 0 || [...activeTags].every((t) => p.tags.includes(t));
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTags && matchesSearch;
    });
  }

  /* ── Hero stats ──────────────────────────────────────────────────────── */
  function renderStats() {
    const allTags = new Set(allProblems.flatMap((p) => p.tags));
    const maxDiff = Math.max(...allProblems.map((p) => p.difficulty));

    document.getElementById("stat-total").textContent = allProblems.length;
    document.getElementById("stat-tags").textContent  = allTags.size;
    document.getElementById("stat-max-diff").textContent = maxDiff > 0 ? maxDiff : "–";
  }

  /* ── Tag filter bar ──────────────────────────────────────────────────── */
  function buildTagCounts() {
    const counts = {};
    allProblems.forEach((p) =>
      p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; })
    );
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function renderTagFilter() {
    const bar = document.getElementById("tag-filter");
    if (!bar) return;
    bar.innerHTML = "";

    const counts = buildTagCounts();

    // "All" chip
    const allChip = mkChip("All", "", activeTags.size === 0);
    allChip.addEventListener("click", () => {
      activeTags.clear();
      renderTagFilter();
      renderProblems();
    });
    bar.appendChild(allChip);

    counts.forEach(([tag, count]) => {
      const chip = mkChip(tag, count, activeTags.has(tag));
      chip.addEventListener("click", () => {
        if (activeTags.has(tag)) activeTags.delete(tag);
        else activeTags.add(tag);
        renderTagFilter();
        renderProblems();
      });
      bar.appendChild(chip);
    });
  }

  function mkChip(label, count, active) {
    const el = document.createElement("button");
    el.className = "cf-tag-chip" + (active ? " active" : "");
    el.type = "button";
    el.setAttribute("aria-pressed", active ? "true" : "false");
    el.innerHTML =
      `<span>${escHtml(label)}</span>` +
      (count ? `<span class="cf-tag-chip__count">${count}</span>` : "");
    return el;
  }

  /* ── Problems grid ───────────────────────────────────────────────────── */
  function renderProblems() {
    const grid  = document.getElementById("problems-grid");
    const empty = document.getElementById("cf-empty");
    if (!grid) return;

    const list = filtered();
    grid.innerHTML = "";

    if (list.length === 0) {
      empty && (empty.hidden = false);
      return;
    }
    empty && (empty.hidden = true);

    list.forEach((p) => grid.appendChild(mkCard(p)));
  }

  function mkCard(p) {
    const di   = diffInfo(p.difficulty);
    const card = document.createElement("a");
    card.className = `cf-problem-card ${di.cls}`;
    card.href = p.url;

    const tagsHtml = p.tags
      .map((t) => `<span class="cf-card__tag">${escHtml(t)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="cf-card__header">
        <span class="cf-card__id">${escHtml(p.id)}</span>
        <span class="cf-diff-badge" title="${di.label}">${p.difficulty || "?"}</span>
      </div>
      <h3 class="cf-card__title">${escHtml(p.title)}</h3>
      <div class="cf-card__tags">${tagsHtml}</div>
    `;
    return card;
  }

  /* ── Charts (Chart.js) ───────────────────────────────────────────────── */
  function renderCharts() {
    if (typeof Chart === "undefined") return;

    const isDark =
      document.body.getAttribute("data-md-color-scheme") === "slate";
    const textColor = isDark ? "#e5e7eb" : "#1f2937";
    const gridColor = isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";

    Chart.defaults.color        = textColor;
    Chart.defaults.borderColor  = gridColor;
    Chart.defaults.font.family  = "'JetBrains Mono', monospace";

    /* Difficulty donut */
    const diffCounts = {};
    DIFF_THRESHOLDS.forEach((d) => { diffCounts[d.label] = 0; });
    allProblems.forEach((p) => { diffCounts[diffInfo(p.difficulty).label]++; });

    const diffLabels = DIFF_THRESHOLDS.map((d) => d.label).filter((l) => diffCounts[l] > 0);
    const diffValues = diffLabels.map((l) => diffCounts[l]);
    const diffColors = DIFF_THRESHOLDS.filter((d) => diffCounts[d.label] > 0).map((d) => d.color);

    const diffCtx = document.getElementById("difficulty-chart");
    if (diffCtx) {
      new Chart(diffCtx, {
        type: "doughnut",
        data: {
          labels: diffLabels,
          datasets: [{ data: diffValues, backgroundColor: diffColors, borderWidth: 2 }],
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { padding: 12 } } },
          cutout: "62%",
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    /* Tags bar */
    const tagCounts = buildTagCounts().slice(0, 12);
    const tagsCtx   = document.getElementById("tags-chart");
    if (tagsCtx && tagCounts.length) {
      new Chart(tagsCtx, {
        type: "bar",
        data: {
          labels: tagCounts.map(([t]) => t),
          datasets: [
            {
              label: "Problems",
              data: tagCounts.map(([, c]) => c),
              backgroundColor: "rgba(79,70,229,.75)",
              borderRadius: 5,
            },
          ],
        },
        options: {
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { stepSize: 1 }, grid: { color: gridColor } },
            y: { grid: { display: false } },
          },
          maintainAspectRatio: false,
        },
      });
      tagsCtx.parentElement.style.height = `${Math.max(180, tagCounts.length * 28)}px`;
    }
  }

  /* ── Utilities ───────────────────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  let chartJSReady = null;
  function ensureChartJs() {
    if (typeof Chart !== "undefined") return Promise.resolve();
    if (!chartJSReady) {
      chartJSReady = loadScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js");
    }
    return chartJSReady;
  }

  /* ── Bootstrap ───────────────────────────────────────────────────────── */
  function init() {
    // Only run on home page (template: home.html has #hero-stats)
    if (!document.getElementById("hero-stats")) return;

    fetch("data/problems.json")
      .then((r) => r.json())
      .then((data) => {
        allProblems = Array.isArray(data) ? data : [];
        renderStats();
        renderTagFilter();
        renderProblems();
        return ensureChartJs();
      })
      .then(() => renderCharts())
      .catch((err) => {
        console.warn("[CF] Could not load dashboard:", err);
      });

    // Search input
    const searchEl = document.getElementById("cf-search");
    if (searchEl) {
      searchEl.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderProblems();
      });
    }

    // Re-render charts on theme toggle
    document.addEventListener("change", (e) => {
      if (e.target.closest(".md-header__option")) {
        setTimeout(renderCharts, 300);
      }
    });
  }

  // MkDocs Material fires this event on every page load (instant navigation)
  document.addEventListener("DOMContentLoaded", init);
  document$.subscribe(init);   // Material SPA hook
})();
