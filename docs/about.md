---
title: About
---

# About

This site contains my personal solutions to [Codeforces](https://codeforces.com) problems,
explained step-by-step with diagrams, complexity analysis and runnable code.

## How solutions are structured

Each problem page contains:

- **Problem summary** - key constraints and what we need to find.
- **Intuition** - the core insight that unlocks the solution.
- **Step-by-step approach** - algorithm walkthrough, often with a Mermaid diagram.
- **Complexity analysis** - time and space in Big-O notation.
- **Code** - Python and C++17 implementations with a ▶ Run button.
- **Test cases** - table of sample inputs / expected outputs.

## Adding a new problem

1. Copy `docs/problems/1A-theatre-square.md` as a template.
2. Fill in the YAML frontmatter (`problem_id`, `difficulty`, `tags`, …).
3. Write the explanation.
4. `git push` - GitHub Actions auto-builds and deploys.

The `problems.json` dashboard data is regenerated automatically on every build.

## Tech stack

| Tool | Role |
|------|------|
| [MkDocs](https://www.mkdocs.org/) | Static site generator |
| [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) | Theme |
| [Mermaid](https://mermaid.js.org/) | Diagrams |
| [Chart.js](https://www.chartjs.org/) | Dashboard charts |
| [Pyodide](https://pyodide.org/) | In-browser Python runtime |
| [Wandbox](https://wandbox.org/) | Online C++ compiler |
| [GitHub Actions](https://github.com/features/actions) | CI/CD |
| [GitHub Pages](https://pages.github.com/) | Hosting |
