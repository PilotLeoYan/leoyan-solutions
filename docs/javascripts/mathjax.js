window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

let mathJaxReady = null;
function loadMathJax() {
  if (mathJaxReady) return mathJaxReady;
  mathJaxReady = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return mathJaxReady;
}

document$.subscribe(() => {
  if (!document.querySelector(".arithmatex")) return;
  loadMathJax().then(() => {
    MathJax.startup.output.clearCache();
    MathJax.typesetClear();
    MathJax.textReset();
    MathJax.typesetPromise();
  });
});
