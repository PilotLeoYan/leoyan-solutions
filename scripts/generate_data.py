"""
MkDocs hook: generate_data.py
-----------------------------
Runs automatically on `mkdocs build` / `mkdocs serve`.
Reads every .md in docs/problems/, extracts YAML frontmatter,
and writes docs/data/problems.json for the home-page dashboard.

Frontmatter keys used per problem file:
  title         : str   – display name
  problem_id    : str   – e.g. "1A"
  problem_url   : str   – CF link
  difficulty    : int   – numeric CF rating (800–3500)
  tags          : list  – topic tags
  date_solved   : str   – ISO date "YYYY-MM-DD" (optional)
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import yaml


_PROBLEMS_CACHE: list[dict[str, Any]] = []


# ── helpers ──────────────────────────────────────────────────────────────────

_FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def _parse_frontmatter(md_text: str) -> dict[str, Any]:
    m = _FM_RE.match(md_text)
    if not m:
        return {}
    try:
        return yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        return {}


def _difficulty_label(rating: int) -> str:
    if rating < 1200:
        return "Newbie"
    if rating < 1400:
        return "Pupil"
    if rating < 1600:
        return "Specialist"
    if rating < 1900:
        return "Expert"
    if rating < 2100:
        return "Candidate Master"
    if rating < 2400:
        return "Master"
    return "Grandmaster"


# ── MkDocs hook entry-point ───────────────────────────────────────────────────

def on_pre_build(config: dict) -> None:  # noqa: D401
    """Called by MkDocs before the build starts."""
    docs_dir = Path(config["docs_dir"])
    problems_dir = docs_dir / "problems"
    out_path = docs_dir / "data" / "problems.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    site_url: str = config.get("site_url", "")

    problems: list[dict[str, Any]] = []

    for md_path in sorted(problems_dir.glob("*.md")):
        if md_path.stem == "index" or md_path.stem.startswith("_"):
            continue

        fm = _parse_frontmatter(md_path.read_text(encoding="utf-8"))
        if not fm:
            continue

        title = fm.get("title", md_path.stem.replace("-", " ").title())
        problem_id = str(fm.get("problem_id", ""))
        difficulty = int(fm.get("difficulty", 0))
        tags = [str(t) for t in (fm.get("tags") or [])]

        # Build relative URL: /problems/1a-theatre-square/
        rel_url = f"problems/{md_path.stem}/"

        problems.append(
            {
                "id": problem_id,
                "title": title,
                "url": rel_url,
                "slug": md_path.stem,
                "problem_url": fm.get("problem_url", ""),
                "difficulty": difficulty,
                "difficulty_label": _difficulty_label(difficulty),
                "tags": tags,
                "date_solved": fm.get("date_solved", ""),
            }
        )

    # Sort by difficulty, then by id
    problems.sort(key=lambda p: (p["difficulty"], p["id"]))

    global _PROBLEMS_CACHE
    _PROBLEMS_CACHE = problems

    out_path.write_text(json.dumps(problems, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[generate_data] wrote {len(problems)} problems → {out_path}")


def _render_problems_table(problems: list[dict[str, Any]]) -> str:
    """Render the markdown table injected into docs/problems/index.md."""
    if not problems:
        return "_No solutions published yet — check back soon!_"

    rows = [
        "| ID | Title | Difficulty | Tags |",
        "|----|-------|:----------:|------|",
    ]
    for p in problems:
        title_link = f"[{p['title']}]({p['slug']}.md)"
        tags = ", ".join(f"`{t}`" for t in p["tags"]) if p["tags"] else "—"
        rows.append(f"| {p['id']} | {title_link} | {p['difficulty']} | {tags} |")
    return "\n".join(rows)


def on_page_markdown(markdown: str, page, config: dict, files) -> str:
    """Inject the auto-generated table into docs/problems/index.md."""
    if page.file.src_uri.replace("\\", "/") == "problems/index.md":
        table_md = _render_problems_table(_PROBLEMS_CACHE)
        markdown = markdown.replace("<!-- PROBLEMS_TABLE -->", table_md)
    return markdown
