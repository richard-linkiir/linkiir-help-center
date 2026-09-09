import {useEffect} from 'react';
import type {ReactNode} from 'react';

/**
 * Mounts the ShipLog feedback widget (https://shiplog.ca) on every page of the
 * help center, so readers can file a feature request from wherever they are in
 * the docs instead of being sent to a separate site.
 *
 * The flow this supports:
 *   reader submits here -> item lands in `pending` (ShipLog project moderation
 *   must be ON) -> an owner approves it in the ShipLog dashboard -> it appears
 *   in this widget's list, where everyone else can vote on it.
 *
 * Approving in ShipLog *is* the publish step. Approved requests are not copied
 * into Markdown pages under docs/ — voting only works on the live ShipLog item,
 * so a hand-copied duplicate would be a dead end.
 *
 * ── Why this lives in a swizzled `Root` rather than in `Layout` ──────────────
 * `Root` is mounted once and survives client-side navigation, so the widget is
 * initialised a single time per visit. `Layout` remounts on every route change,
 * which would tear the widget down and re-fire its config + feedback requests
 * on each page view.
 *
 * That choice rules out `useColorMode()`, because `ColorModeProvider` is
 * installed by `@theme/Layout/Provider` and so is not in scope above `Layout`.
 * Docusaurus writes the resolved mode to `data-theme` on <html> (before first
 * paint, and again on every toggle or system-preference change), which is the
 * same signal one level down and is what this observes instead.
 */

const WIDGET_SRC = 'https://app.shiplog.ca/widget/shiplog-widget.js';

/** The `linkiir` project on ShipLog — same slug as https://shiplog.ca/p/linkiir-vyiihq. */
const PROJECT_SLUG = 'linkiir-vyiihq';

/**
 * What the launcher pill should read. `buildTrigger()` in the widget hardcodes
 * the string below it and takes no `launcherLabel` option, so this is applied by
 * `patchShadowRoot` rather than passed to `init`. Once the widget grows that
 * option, pass it there and delete the patch — the patch matches on the default
 * text, so it also goes quiet on its own.
 */
const LAUNCHER_LABEL = 'Feature Request';
const WIDGET_DEFAULT_LAUNCHER_LABEL = 'Feedback';

type ColorMode = 'light' | 'dark';

/**
 * The widget renders into a shadow root, so site CSS cannot reach inside it and
 * `var(--lnk-*)` is not resolvable there either. Colours have to be handed over
 * as literal values, and `alpha()` inside the widget only accepts 6-digit hex —
 * an `rgba()` string makes it emit an invalid declaration and drop the rule.
 * So the translucent Linkiir border tokens are flattened to their composited
 * hex equivalents here rather than passed through.
 */
type ShipLogTheme = {
  primaryColor: string;
  onPrimary: string;
  background: string;
  surface: string;
  text: string;
  textStrong: string;
  textMuted: string;
  textSubtle: string;
  textFaint: string;
  border: string;
  inputBorder: string;
  divider: string;
  codeBg: string;
  accent: string;
  dangerBg: string;
  dangerText: string;
};

/**
 * Mapped from the `--lnk-*` tokens in src/css/custom.css. `background` is the
 * panel itself, so it takes `--lnk-surface` (the card colour) rather than
 * `--lnk-bg`; `surface` styles the inner controls (inputs, vote buttons) and
 * takes the next step along the same ramp.
 *
 * `primaryColor` set here also overrides the brand colour configured in ShipLog
 * project settings (#6366f1), which is the point: the Linkiir theme is
 * monochrome, and indigo would be the one thing on the page that is not.
 *
 * `textSubtle` and `textFaint` are deliberately heavier than the widget's own
 * defaults (#9ca3af / #d1d5db) and heavier than the `--lnk-fg-faint` token they
 * would otherwise mirror. They paint the empty-state line and the "Powered by
 * ShipLog" footer — real 10-13px copy, so 4.5:1 applies. Straight from the
 * palette they measured 2.88:1 and 1.58:1 on the light panel. Every value below
 * clears 4.5:1 against the panel it sits on; check that again before nudging one
 * lighter for looks.
 */
const THEMES: Record<ColorMode, ShipLogTheme> = {
  light: {
    primaryColor: '#111111',
    onPrimary: '#ffffff',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#111111',
    textStrong: '#111111',
    textMuted: '#5b5b58', // 6.81:1 on #ffffff
    textSubtle: '#6b6a66', // 5.41:1
    textFaint: '#767471', // 4.66:1
    border: '#e6e6e6',
    inputBorder: '#cfcec9',
    divider: '#ededed',
    codeBg: '#f5f5f5',
    accent: '#ef4444',
    dangerBg: '#fef2f2',
    dangerText: '#dc2626',
  },
  dark: {
    primaryColor: '#ffffff',
    onPrimary: '#000000',
    background: '#1f1f1f',
    surface: '#2a2a2a',
    text: '#ffffff',
    textStrong: '#ffffff',
    textMuted: '#a7a7a7', // 6.85:1 on #1f1f1f
    textSubtle: '#949494', // 5.43:1
    textFaint: '#868686', // 4.53:1
    border: '#3a3a3a',
    inputBorder: '#4a4a4a',
    divider: '#2e2e2e',
    codeBg: '#171717',
    accent: '#f87171',
    dangerBg: '#2a1616',
    dangerText: '#fca5a5',
  },
};

/**
 * Border for the pagination buttons, which is the one control in the panel whose
 * outline the widget draws from `divider` — #ededed on white and #2e2e2e on the
 * dark panel, i.e. 1.17:1 and 1.21:1. WCAG 1.4.11 wants 3:1 for the boundary of
 * a control, so the patch below overrides it with these instead (3.54:1 and
 * 3.43:1). Not a ShipLog theme token, so it does not belong in `THEMES`.
 */
const PAGINATION_BORDER: Record<ColorMode, string> = {
  light: '#8a8884',
  dark: '#727272',
};

/**
 * Fixes in the widget's own stylesheet that no `init` option reaches.
 *
 * `.sl-pagination button` is declared `color: inherit` and the `<span>Page N</span>`
 * next to it is never given a colour at all. The shadow root opens with
 * `:host { all: initial }`, so an inherited colour resolves to black — 1.27:1 on
 * the dark panel, measured. There is no theme token in that code path, which is
 * why this is a stylesheet appended into the shadow root rather than a colour
 * passed to `init`.
 *
 * This is safe to graft on because `render()` only ever reassigns
 * `#sl-wrapper.innerHTML`; it never touches the shadow root's <style> children.
 * So one append survives every re-render, and because it lands after the
 * widget's own sheet it wins on order at equal specificity. Selectors are the
 * widget's, so if they change upstream these rules stop matching and the
 * built-in styling is what shows — a silent no-op, not a broken panel.
 *
 * Delete this once shiplog-widget.js sets `color: t.text` on those two rules.
 */
function shadowPatchCss(mode: ColorMode): string {
  const theme = THEMES[mode];
  return `
    .sl-pagination button,
    .sl-pagination span {
      color: ${theme.text};
    }
    .sl-pagination button {
      border-color: ${PAGINATION_BORDER[mode]};
    }
    ${mode === 'dark' ? DARK_BRAND_LOGO_CSS : ''}
  `;
}

/**
 * The project's ShipLog "Logo URL" points at static/img/linkiir-logo.svg, whose
 * rings are stroked #111111 — it is the light-background variant, the one the
 * navbar loads as `src` and swaps out via `srcDark`. ShipLog has a single Logo
 * URL field and renders it as `<img class="sl-brand-logo">` in the panel header,
 * so there is no second slot to point at linkiir-logo-dark.svg for dark mode.
 *
 * `invert(1)` turns those #111111 strokes into #eeeeee, which is what the dark
 * variant hardcodes anyway. It leaves the alpha channel alone, so the
 * transparent field around the rings stays transparent rather than filling in.
 *
 * Inverting here rather than changing the ShipLog setting is deliberate: that
 * same URL is what the public board at /p/linkiir-vyiihq renders against a light
 * background, where the dark-stroked file is the correct one. Same trade already
 * made for the Web API code-tab icon in src/css/site-overrides.css.
 */
const DARK_BRAND_LOGO_CSS = '.sl-brand-logo { filter: invert(1); }';

type ShipLogApi = {
  init(options: {
    projectSlug: string;
    position?: 'bottom-right' | 'bottom-left';
    display?: 'popup' | 'slideout';
    feedbackOnly?: boolean;
    hideBranding?: boolean;
    theme?: Partial<ShipLogTheme>;
    onFeedbackSubmitted?: (item: unknown) => void;
  }): void;
  open(): void;
  close(): void;
  identify(user: {email?: string; name?: string}): void;
  destroy(): void;
};

declare global {
  interface Window {
    ShipLog?: ShipLogApi;
  }
}

/**
 * Module-level so the <script> is fetched once even if this component is
 * remounted (React 18+ runs effects twice in development).
 */
let scriptPromise: Promise<void> | null = null;

function loadWidgetScript(): Promise<void> {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const fail = () =>
      reject(new Error(`[ShipLog] failed to load ${WIDGET_SRC}`));

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`,
    );
    if (existing) {
      if (window.ShipLog) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', fail);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', fail);
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function ShipLogWidget(): ReactNode {
  useEffect(() => {
    let cancelled = false;
    /** Last mode handed to `init`, so an unrelated <html> mutation is a no-op. */
    let applied: ColorMode | null = null;
    /** Watches the widget's re-renders to keep the launcher rename applied. */
    let launcherObserver: MutationObserver | null = null;

    // Docusaurus always writes `data-theme`, but if it somehow has not yet,
    // fall back to `colorMode.defaultMode` from docusaurus.config.ts ('dark').
    const currentMode = (): ColorMode =>
      document.documentElement.getAttribute('data-theme') === 'light'
        ? 'light'
        : 'dark';

    /**
     * `init` builds a fresh container and shadow root every time, so both the
     * supplemental stylesheet and the launcher label have to be reapplied after
     * each call, not just on first mount.
     */
    const patchShadowRoot = (mode: ColorMode) => {
      const root = document.getElementById('shiplog-widget-container')?.shadowRoot;
      if (!root) {
        return;
      }

      const style = document.createElement('style');
      style.textContent = shadowPatchCss(mode);
      root.appendChild(style);

      // The label is a bare text node inside `button.sl-trigger`, between the
      // icon and the optional unread badge, so replace just that node and leave
      // the element — and its `data-action="toggle"` binding — alone. Swapping
      // the text rather than overlaying a CSS `::after` keeps the button's
      // accessible name a single correct string.
      const relabel = () => {
        const label = [...(root.querySelector('.sl-trigger')?.childNodes ?? [])].find(
          (node) =>
            node.nodeType === Node.TEXT_NODE &&
            node.textContent?.trim() === WIDGET_DEFAULT_LAUNCHER_LABEL,
        );
        // No match once it has been renamed, which is also the loop guard: the
        // write below re-triggers the observer, and the second pass finds
        // nothing to do.
        if (label) {
          label.textContent = LAUNCHER_LABEL;
        }
      };

      relabel();

      // `render()` runs on open, close, fetch, vote, submit and page change, and
      // rebuilds the trigger from `buildTrigger()` each time — so the rename has
      // to be reapplied, not just set once.
      launcherObserver?.disconnect();
      launcherObserver = new MutationObserver(relabel);
      const wrapper = root.getElementById('sl-wrapper');
      if (wrapper) {
        launcherObserver.observe(wrapper, {childList: true, subtree: true});
      }
    };

    /**
     * The 16 theme colours are read once, when `init` builds the shadow root's
     * stylesheet — there is no `setTheme`. `init` destroys any live instance
     * first, though, so calling it again is the supported way to repaint, and
     * is what shiplog.ca/widget does for its own live preview.
     *
     * Cost of a mode switch: the panel closes and an unsent draft is cleared.
     * Toggling light/dark midway through typing a request is rare enough to be
     * the better trade against a wrong-mode panel.
     */
    const apply = () => {
      const mode = currentMode();
      if (cancelled || mode === applied || !window.ShipLog) {
        return;
      }
      applied = mode;
      window.ShipLog.init({
        projectSlug: PROJECT_SLUG,
        // A floating card, not `display: 'slideout'`. A full-height panel would
        // sit on top of the right-hand table of contents and part of the
        // article — the page a reader is most likely referencing while writing
        // a request. The public board at /p/linkiir-vyiihq is the full-width
        // view for anyone who wants one.
        display: 'popup',
        position: 'bottom-right',
        // No What's New tab: release notes are published in the docs sidebar,
        // and a second changelog here would only drift from it. Also skips the
        // changelog request on every page load.
        feedbackOnly: true,
        // Currently inert: the project is on the free plan, and the server — not
        // the host page — decides entitlement, so the "Powered by ShipLog"
        // footer stays either way. Passed anyway so the footer disappears the
        // moment the plan changes, with nothing to remember to edit here.
        hideBranding: true,
        theme: THEMES[mode],
      });
      patchShadowRoot(mode);
    };

    // Fires on the colour-mode toggle and on system-preference changes, since
    // `respectPrefersColorScheme` routes both through the same attribute.
    const observer = new MutationObserver(apply);

    loadWidgetScript()
      .then(() => {
        if (cancelled) {
          return;
        }
        apply();
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });
      })
      .catch((error: unknown) => {
        // A feedback launcher is not worth breaking a docs page over.
        console.error(error);
      });

    return () => {
      cancelled = true;
      observer.disconnect();
      launcherObserver?.disconnect();
      window.ShipLog?.destroy();
    };
  }, []);

  return null;
}
