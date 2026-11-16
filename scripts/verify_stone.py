#!/usr/bin/env python3
"""
Stone Base v1.1.2 — Automated Static Token/Doc Gate & Headless Chromium Suite

Usage:
  python scripts/verify_stone.py --static
  python scripts/verify_stone.py --browser
  python scripts/verify_stone.py            # runs both static and browser gates
"""

from __future__ import annotations

import argparse
import functools
import http.server
import math
import os
import re
import socketserver
import sys
import threading
from pathlib import Path
from typing import Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parent.parent

CSS_FILES = [
    ROOT / "css" / "stone-tokens.css",
    ROOT / "css" / "stone-base.css",
    ROOT / "css" / "stone-components.css",
    ROOT / "css" / "stone-shells.css",
    ROOT / "css" / "stone-patterns.css",
    ROOT / "css" / "stone-compat-v1_1.css",
    ROOT / "css" / "reference-docs.css",
]

HTML_FILES = [
    ROOT / "index.html",
    ROOT / "examples" / "compact-utility.html",
    ROOT / "examples" / "workspace-app.html",
    ROOT / "examples" / "reservations.html",
    ROOT / "examples" / "automation-runs.html",
]

DOC_FILES = [
    ROOT / "README.md",
    ROOT / "llms.txt",
    ROOT / "STONE-SYSTEM-PORTABLE.md",
    ROOT / "spec" / "01-foundations-and-tokens.md",
    ROOT / "spec" / "02-boxes-and-surfaces.md",
    ROOT / "spec" / "03-typography-and-layout.md",
    ROOT / "spec" / "04-interactions-and-motion.md",
    ROOT / "spec" / "05-suite-shell-and-copy.md",
    ROOT / "spec" / "06-domain-patterns.md",
    ROOT / ".agents" / "skills" / "stone-base" / "SKILL.md",
    ROOT / ".agents" / "skills" / "stone-base" / "references" / "tokens-and-tailwind.md",
    ROOT / ".agents" / "skills" / "stone-base" / "references" / "domains-v1_1_2.md",
]


def extract_vars(block: str) -> Dict[str, str]:
    return {
        m.group(1): m.group(2).strip()
        for m in re.finditer(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", block)
    }


def resolve_var(val: str, env: Dict[str, str], depth: int = 0) -> str:
    if depth > 10:
        return val
    return re.sub(
        r"var\((--[a-z0-9-]+)(?:,\s*([^)]+))?\)",
        lambda m: resolve_var(env.get(m.group(1), m.group(2) or m.group(0)), env, depth + 1),
        val,
    )


def oklch_to_linear_srgb(L: float, C: float, h_deg: float) -> Tuple[float, float, float]:
    h = math.radians(h_deg)
    a = C * math.cos(h)
    b = C * math.sin(h)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l = l_ ** 3
    m = m_ ** 3
    s = s_ ** 3
    return (
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )


def lin_to_srgb(c: float) -> float:
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1.0 / 2.4)) - 0.055


def srgb_to_lin(u: float) -> float:
    return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4


def parse_color_srgb(val: str, env: Dict[str, str]) -> Optional[Tuple[float, float, float, float]]:
    v = resolve_var(val, env).strip()
    if v in ("#fff", "#ffffff"):
        return (1.0, 1.0, 1.0, 1.0)
    if v in ("#000", "#000000"):
        return (0.0, 0.0, 0.0, 1.0)
    m = re.match(r"oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*/\s*([\d.]+))?\s*\)", v)
    if m:
        r_l, g_l, b_l = oklch_to_linear_srgb(float(m.group(1)), float(m.group(2)), float(m.group(3)))
        alpha = float(m.group(4)) if m.group(4) else 1.0
        return (lin_to_srgb(r_l), lin_to_srgb(g_l), lin_to_srgb(b_l), alpha)
    return None


def wcag_ratio(fg: Tuple[float, float, float, float], bg: Tuple[float, float, float, float]) -> float:
    a = fg[3]
    if a < 1.0:
        fr = fg[0] * a + bg[0] * (1.0 - a)
        fg_c = fg[1] * a + bg[1] * (1.0 - a)
        fb = fg[2] * a + bg[2] * (1.0 - a)
    else:
        fr, fg_c, fb = fg[0], fg[1], fg[2]
    l_fg = 0.2126 * srgb_to_lin(fr) + 0.7152 * srgb_to_lin(fg_c) + 0.0722 * srgb_to_lin(fb)
    l_bg = 0.2126 * srgb_to_lin(bg[0]) + 0.7152 * srgb_to_lin(bg[1]) + 0.0722 * srgb_to_lin(bg[2])
    hi, lo = max(l_fg, l_bg), min(l_fg, l_bg)
    return (hi + 0.05) / (lo + 0.05)


def run_static_checks() -> List[str]:
    failures: List[str] = []

    tokens_css = (ROOT / "css" / "stone-tokens.css").read_text(encoding="utf-8")
    root_m = re.search(r":root\s*\{(.*?)\n  \}", tokens_css, re.S)
    dark_m = re.search(r"\.dark\s*\{(.*?)\n  \}", tokens_css, re.S)
    if not root_m or not dark_m:
        return ["Could not locate :root or .dark token block in css/stone-tokens.css"]

    lv = extract_vars(root_m.group(1))
    dv = dict(lv)
    dv.update(extract_vars(dark_m.group(1)))

    # 1. 100% sRGB gamut check on all oklch() declarations in :root and .dark
    for mode_name, env in (("Light :root", lv), ("Dark .dark", dv)):
        for k, raw in env.items():
            resolved = resolve_var(raw, env)
            m = re.match(r"oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*/\s*([\d.]+))?\s*\)", resolved)
            if not m:
                continue
            L, C, h = float(m.group(1)), float(m.group(2)), float(m.group(3))
            r, g, b = oklch_to_linear_srgb(L, C, h)
            if min(r, g, b) < -0.0005 or max(r, g, b) > 1.0005:
                failures.append(f"[GAMUT] {mode_name} {k}={resolved} out of sRGB: {(r, g, b)}")

    # 2. Light Surface vs Raised distinct elevation + monotonic neutrals
    def l_of(var_name: str, env: Dict[str, str]) -> float:
        v = resolve_var(f"var({var_name})", env)
        m = re.match(r"oklch\(\s*([\d.]+)", v)
        return float(m.group(1)) if m else -1.0

    if not (l_of("--stone-well", lv) < l_of("--stone-1", lv) < l_of("--stone-surface", lv) < l_of("--stone-raised", lv)):
        failures.append("[ELEVATION] Light --stone-well < --stone-1 < --stone-surface < --stone-raised violated")
    if not (l_of("--stone-well", dv) < l_of("--stone-1", dv) < l_of("--stone-surface", dv) < l_of("--stone-raised", dv)):
        failures.append("[ELEVATION] Dark --stone-well < --stone-1 < --stone-surface < --stone-raised violated")

    # 3. Contrast floors across Light & Dark
    checks = [
        ("primary on surface", "--color-text-primary", "--color-bg-surface", 7.0, 7.0),
        ("secondary on well", "--color-text-secondary", "--color-bg-well", 4.5, 4.5),
        ("secondary on surface", "--color-text-secondary", "--color-bg-surface", 4.5, 4.5),
        ("placeholder on raised", "--color-text-placeholder", "--color-bg-raised", 4.5, 4.5),
        ("on-accent on solid", "--color-text-on-accent", "--color-accent-solid", 4.5, 4.5),
        ("on-accent on hover", "--color-text-on-accent", "--color-accent-solid-hover", 4.5, 5.2),
        ("on-accent on active", "--color-text-on-accent", "--color-accent-solid-active", 4.5, 5.2),
        ("on-danger on solid", "--color-danger-on-solid", "--color-danger-solid", 4.5, 4.5),
        ("on-danger on hover", "--color-danger-on-solid", "--color-danger-solid-hover", 4.5, 5.2),
        ("on-danger on active", "--color-danger-on-solid", "--color-danger-solid-active", 4.5, 5.2),
        ("on-success on solid", "--color-success-on-solid", "--color-success-solid", 4.5, 4.5),
        ("on-success on hover", "--color-success-on-solid", "--color-success-solid-hover", 4.5, 5.2),
        ("border-control on surface", "--color-border-control", "--color-bg-surface", 3.0, 3.0),
        ("border-focus on surface", "--color-border-focus", "--color-bg-surface", 3.0, 3.0),
        ("chart-1 on surface", "--color-chart-1", "--color-bg-surface", 3.0, 3.0),
        ("chart-2 on surface", "--color-chart-2", "--color-bg-surface", 3.0, 3.0),
        ("chart-3 on surface", "--color-chart-3", "--color-bg-surface", 3.0, 3.0),
        ("chart-4 on surface", "--color-chart-4", "--color-bg-surface", 3.0, 3.0),
        ("chart-5 on surface", "--color-chart-5", "--color-bg-surface", 3.0, 3.0),
        ("chart-6 on surface", "--color-chart-6", "--color-bg-surface", 3.0, 3.0),
        ("chart-1 on well", "--color-chart-1", "--color-bg-well", 3.0, 3.0),
        ("chart-2 on well", "--color-chart-2", "--color-bg-well", 3.0, 3.0),
        ("chart-6 on well", "--color-chart-6", "--color-bg-well", 3.0, 3.0),
    ]
    for label, fgk, bgk, min_l, min_d in checks:
        for mode_name, env, floor in (("Light", lv, min_l), ("Dark", dv, min_d)):
            fg = parse_color_srgb(f"var({fgk})", env)
            bg = parse_color_srgb(f"var({bgk})", env)
            if fg is None or bg is None:
                failures.append(f"[PARSE] Could not parse {label} ({fgk} on {bgk}) in {mode_name}")
                continue
            ratio = wcag_ratio(fg, bg)
            if ratio < floor:
                failures.append(f"[CONTRAST] {mode_name} {label}: {ratio:.2f}:1 < {floor:.2f}:1")

    # Ceramic glass over worst-case white backdrop (#ffffff) for secondary ink
    for glass_var in ("--color-glass-topbar", "--color-glass-dock", "--color-glass-toast"):
        for mode_name, env in (("Light", lv), ("Dark", dv)):
            glass = parse_color_srgb(f"var({glass_var})", env)
            ink2 = parse_color_srgb("var(--color-text-secondary)", env)
            white_worst = (1.0, 1.0, 1.0, 1.0)
            composited = (
                glass[0] * glass[3] + white_worst[0] * (1.0 - glass[3]),
                glass[1] * glass[3] + white_worst[1] * (1.0 - glass[3]),
                glass[2] * glass[3] + white_worst[2] * (1.0 - glass[3]),
                1.0,
            )
            r_glass = wcag_ratio(ink2, composited)
            if r_glass < 4.5:
                failures.append(f"[GLASS CONTRAST] {mode_name} secondary ink on {glass_var} over white: {r_glass:.2f}:1 < 4.50:1")

    # 4. @charset, reduced-transparency/contrast overrides, and undefined var() checks
    defined_vars = set(lv.keys()) | set(dv.keys())
    for cpath in CSS_FILES:
        defined_vars.update(re.findall(r"(--[a-z0-9-]+)\s*:", cpath.read_text(encoding="utf-8")))

    hook_vars = {
        "--icon-size", "--icon-style-alt", "--icon-style-size", "--icon-style-color",
        "--icon-style-voffset", "--icon-style-spacing", "--icon-start", "--icon-end",
        "--icon", "--transform-origin", "--anchor-top", "--anchor-left",
        "--series-color", "--swatch-color", "--demo-outer-r", "--demo-pad", "--demo-inner-r",
    }
    all_known = defined_vars | hook_vars

    for css_path in CSS_FILES:
        text = css_path.read_text(encoding="utf-8")
        if not text.lstrip().startswith('@charset "UTF-8";'):
            failures.append(f"[CSS] {css_path.name} missing leading @charset \"UTF-8\";")

        for m in re.finditer(r"var\((--[a-z0-9-]+)", text):
            vname = m.group(1)
            if vname not in all_known and not vname.startswith("--tw-"):
                failures.append(f"[VAR] {css_path.name} references undefined variable {vname}")

        # Tier-1 leaks & raw hex/oklch inside core non-token component stylesheets
        if css_path.name in ("stone-base.css", "stone-components.css", "stone-shells.css", "stone-patterns.css"):
            stripped_comments = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
            for tier1 in re.finditer(r"var\((--(?:stone|accent)-(?:\d+|well|surface|raised|disabled|skeleton))", stripped_comments):
                failures.append(f"[TIER-1 LEAK] {css_path.name} uses Tier-1 primitive {tier1.group(1)}")
            for raw_lit in re.finditer(r"#[0-9a-fA-F]{3,8}\b|oklch\(", stripped_comments):
                failures.append(f"[RAW COLOR] {css_path.name} contains raw color literal '{raw_lit.group(0)}'")

    if "@media (prefers-reduced-transparency: reduce)" not in tokens_css:
        failures.append("[A11Y] css/stone-tokens.css missing @media (prefers-reduced-transparency: reduce)")
    if "@media (prefers-contrast: more)" not in tokens_css:
        failures.append("[A11Y] css/stone-tokens.css missing @media (prefers-contrast: more)")

    # 5. HTML CSP / inline handler / copy hygiene / link checks
    for html_path in HTML_FILES:
        html = html_path.read_text(encoding="utf-8")
        if "viewport-fit=cover" not in html:
            failures.append(f"[HTML] {html_path.name} missing viewport-fit=cover")
        if re.search(r'\bon[a-z]+\s*=', html, re.I):
            failures.append(f"[CSP] {html_path.name} contains inline event handler attribute (on*=)")
        if re.search(r"<script(?![^>]*\bsrc=)[^>]*>", html, re.I):
            failures.append(f"[CSP] {html_path.name} contains inline <script> tag")
        if re.search(r"<style\b", html, re.I):
            failures.append(f"[CSP] {html_path.name} contains inline <style> tag")
        for ban in ("effortless", "effortlessly", "seamless", "robust"):
            if re.search(rf"\b{ban}\b", html, re.I):
                failures.append(f"[COPY] {html_path.name} contains banned copy word '{ban}'")

        for link_m in re.finditer(r'(?:href|src)="([^"#?]+)', html):
            target = link_m.group(1)
            if target.startswith(("http://", "https://", "mailto:", "data:")):
                continue
            resolved_path = (html_path.parent / target).resolve()
            if not resolved_path.exists():
                failures.append(f"[LINK] {html_path.name} broken path: {target}")

    # 6. Doc size, links & obsolete term checks
    portable_path = ROOT / "STONE-SYSTEM-PORTABLE.md"
    if portable_path.stat().st_size >= 24000:
        failures.append(f"[DOC SIZE] STONE-SYSTEM-PORTABLE.md is {portable_path.stat().st_size} bytes (>= 24000 limit)")

    for doc_path in DOC_FILES:
        doc = doc_path.read_text(encoding="utf-8")
        for ban in ("effortless", "effortlessly", "seamless", "robust"):
            if re.search(rf"\b{ban}\b", doc, re.I):
                failures.append(f"[COPY] {doc_path.name} contains banned word '{ban}'")
        for stale in ("--density-scale", "stone-pressable", "data-starting-style", "corner-shape: inherit"):
            if stale in doc:
                failures.append(f"[DOC PARITY] {doc_path.relative_to(ROOT)} references removed v1.1.1 symbol '{stale}'")
        for link_m in re.finditer(r"\[[^\]]+\]\(([^)#?\s]+)\)", doc):
            target = link_m.group(1)
            if target.startswith(("http://", "https://", "mailto:")):
                continue
            resolved_path = (doc_path.parent / target).resolve()
            if not resolved_path.exists():
                failures.append(f"[DOC LINK] {doc_path.relative_to(ROOT)} broken link: {target}")

    return failures


def run_browser_checks() -> List[str]:
    from playwright.sync_api import sync_playwright

    failures: List[str] = []

    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):  # noqa: A002
            pass

    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    pages = [
        ("index.html", "Stone Base"),
        ("examples/compact-utility.html", "Stone Converter"),
        ("examples/workspace-app.html", "Worker Operations"),
        ("examples/reservations.html", "Studio Reservations"),
        ("examples/automation-runs.html", "Automation Runs"),
    ]

    try:
        with sync_playwright() as p:
            browser = None
            for launch_kw in ({"channel": "chrome"}, {"channel": "msedge"}, {}):
                try:
                    browser = p.chromium.launch(**launch_kw)
                    break
                except Exception:
                    continue
            if browser is None:
                return ["[BROWSER] Could not launch Chromium, Chrome, or Edge via Playwright"]

            # 1. Responsive HTTP check across Desktop (1440), Tablet (768), and Mobile Touch (320)
            for vp_w, vp_h, is_touch in ((1440, 900, False), (768, 900, False), (320, 640, True)):
                ctx = browser.new_context(viewport={"width": vp_w, "height": vp_h}, has_touch=is_touch)
                page = ctx.new_page()
                for rel, expected_title in pages:
                    errors: List[str] = []
                    page.on("pageerror", lambda err: errors.append(str(err)))
                    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

                    page.goto(f"http://127.0.0.1:{port}/{rel}", wait_until="networkidle")
                    if expected_title not in page.title():
                        failures.append(f"[BROWSER {vp_w}] {rel} unexpected title: {page.title()}")

                    overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
                    if overflow:
                        failures.append(f"[OVERFLOW {vp_w}] {rel} has horizontal scroll")

                    # Check ceramic topbar blur & alpha
                    topbar_bg = page.evaluate("getComputedStyle(document.querySelector('.stone-topbar')).backgroundColor")
                    if "rgba" not in topbar_bg and "0.94" not in topbar_bg and "/" not in topbar_bg:
                        failures.append(f"[CERAMIC {vp_w}] {rel} topbar background unexpected: {topbar_bg}")

                    # Mobile 44px hit-height audit on visible interactive buttons/calendar/slots
                    if vp_w == 320:
                        small_targets = page.evaluate("""() => {
                            const bad = [];
                            document.querySelectorAll('main .stone-btn, .stone-segmented__btn, .stone-calendar__cell, .stone-slot').forEach(el => {
                                const r = el.getBoundingClientRect();
                                if (r.width === 0 || r.height === 0) return;
                                if (r.height < 43.5) bad.push({ cls: el.className, h: r.height });
                            });
                            return bad;
                        }""")
                        if small_targets:
                            failures.append(f"[TOUCH 44px] {rel} has targets < 44px on 320px touch: {small_targets[:3]}")

                    if errors:
                        failures.append(f"[CONSOLE {vp_w}] {rel}: {errors[:3]}")
                ctx.close()

            # 2. Functional Suite Behavior (Dark Mode, RTL Floating Bar Centering, Modal Suppression, Visible-Row Scope)
            ctx = browser.new_context(viewport={"width": 1280, "height": 860})
            page = ctx.new_page()
            page.goto(f"http://127.0.0.1:{port}/examples/workspace-app.html", wait_until="networkidle")

            # Check Dark Toggle
            page.click("[data-theme-toggle]")
            if not page.evaluate("document.documentElement.classList.contains('dark')"):
                failures.append("[THEME] Dark toggle failed on workspace-app.html")

            # Check Interactive Chart Tabs + Tooltip
            page.click('[data-chart-metric="completed"]')
            if page.locator("#legend-s1").text_content() != "Field Work Orders":
                failures.append("[CHART] Chart tab switch did not update legend")
            page.locator("#worker-chart-series g").first.focus()
            if page.locator("#worker-chart-tooltip").is_hidden():
                failures.append("[CHART] Tooltip did not appear on focused SVG series group")

            # Check Select-All + Filter Visible Rows + Floating Bar Centering (LTR & RTL) + Modal Suppression
            page.click("[data-select-all]")
            bar = page.locator("#worker-floating-bar")
            if bar.is_hidden():
                failures.append("[DOCK] Floating bar remained hidden after select-all")

            # Filter to 'field' (hides 2 dispatch rows) -> count should update strictly to 2 visible items
            page.click('[data-role-filter="field"]')
            count_text = page.locator("#worker-floating-bar [data-floating-count]").text_content()
            if "2 items" not in (count_text or ""):
                failures.append(f"[DOCK FILTER] Expected '2 items selected' for filtered roster, got: {count_text}")

            # Verify LTR centering
            center_diff_ltr = page.evaluate("""() => {
                const r = document.getElementById('worker-floating-bar').getBoundingClientRect();
                return Math.abs((r.left + r.width / 2) - window.innerWidth / 2);
            }""")
            if center_diff_ltr > 3.5:
                failures.append(f"[DOCK LTR] Floating bar off-center by {center_diff_ltr:.1f}px")

            # Verify RTL centering
            page.click("[data-dir-toggle]")
            center_diff_rtl = page.evaluate("""() => {
                const r = document.getElementById('worker-floating-bar').getBoundingClientRect();
                return Math.abs((r.left + r.width / 2) - window.innerWidth / 2);
            }""")
            if center_diff_rtl > 3.5:
                failures.append(f"[DOCK RTL] Floating bar off-center in RTL by {center_diff_rtl:.1f}px")

            # Verify modal suppression hides floating bar
            page.click("[data-cmdk-open]")
            if not bar.is_hidden():
                failures.append("[DOCK MODAL] Floating bar did not hide while Cmd+K dialog was open")
            page.keyboard.press("Escape")
            page.wait_for_timeout(50)
            if bar.is_hidden():
                failures.append("[DOCK MODAL] Floating bar did not restore after Cmd+K closed")

            # 3. Check Reservations 5-state & conflict resolve
            page.goto(f"http://127.0.0.1:{port}/examples/reservations.html", wait_until="networkidle")
            if page.locator(".stone-slot[data-state]").count() != 5:
                failures.append("[RESERVATIONS] Expected 5 slot state examples on reservations.html")
            page.click("[data-resolve-conflict]")
            if page.locator(".stone-slot[data-state='conflict']").count() != 0:
                failures.append("[RESERVATIONS] Conflict resolve button did not transition slot state")

            # 4. Check Automation Runs 6 lifecycle pills & expandable inline log
            page.goto(f"http://127.0.0.1:{port}/examples/automation-runs.html", wait_until="networkidle")
            expand_btn = page.locator('[aria-controls="log-run_0850a"]')
            expand_btn.click()
            if page.locator("#log-run_0850a").is_hidden():
                failures.append("[AUTOMATION] Expandable log row did not open")

            # 5. Direct file:// zero-console-error check (critical zero-build promise)
            for rel in ("index.html", "examples/workspace-app.html"):
                file_errs: List[str] = []
                f_page = ctx.new_page()
                f_page.on("pageerror", lambda err: file_errs.append(str(err)))
                f_page.on("console", lambda msg: file_errs.append(msg.text) if msg.type == "error" else None)
                f_uri = (ROOT / rel).as_uri()
                f_page.goto(f_uri, wait_until="load")
                if file_errs:
                    failures.append(f"[FILE://] {rel} console errors on direct file:// open: {file_errs}")
                f_page.close()

            ctx.close()
            browser.close()
    finally:
        httpd.shutdown()

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify Stone Base v1.1.2 specs, tokens, HTML & live browser rendering.")
    parser.add_argument("--static", action="store_true", help="Run static token/contrast/CSS/HTML/doc checks only")
    parser.add_argument("--browser", action="store_true", help="Run headless Chromium checks only")
    args = parser.parse_args()

    run_static = args.static or not args.browser
    run_browser = args.browser or not args.static

    all_failures: List[str] = []
    if run_static:
        sf = run_static_checks()
        all_failures.extend(sf)
        print(f"Static gate: {'PASS (0 issues)' if not sf else f'FAIL ({len(sf)} issues)'}")
        for msg in sf:
            print("  -", msg)

    if run_browser:
        bf = run_browser_checks()
        all_failures.extend(bf)
        print(f"Browser gate: {'PASS (0 issues)' if not bf else f'FAIL ({len(bf)} issues)'}")
        for msg in bf:
            print("  -", msg)

    return 1 if all_failures else 0


if __name__ == "__main__":
    sys.exit(main())
