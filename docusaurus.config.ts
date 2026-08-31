import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// ── Where the site is published ──────────────────────────────────────────────
// GitHub Pages, project site:      SITE_URL=https://<org>.github.io
//                                  BASE_URL=/<repo-name>/
// GitHub Pages, custom domain:     SITE_URL=https://help.linkiir.com
//                                  BASE_URL=/            (+ add static/CNAME)
// The defaults below assume the custom domain. Override them in CI rather than
// editing this file, so the same commit can build for either target.
// GitHub Actions passes an unset `vars.FOO` through as an empty string, and `??`
// only catches null/undefined, so read env vars through this instead.
function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

const siteUrl = env('SITE_URL') ?? 'https://help.linkiir.com';
const baseUrl = env('BASE_URL') ?? '/';

// ── Algolia DocSearch ────────────────────────────────────────────────────────
// `@docusaurus/theme-search-algolia` already ships inside preset-classic, so
// search needs credentials rather than a new dependency. This block stays
// undefined until all three variables are present, which keeps the build green
// before the index exists and avoids shipping a search box that queries a
// non-existent index. Set these as repository secrets once DocSearch is
// provisioned; only the *search-only* API key belongs here, never the admin key.
const algoliaAppId = env('ALGOLIA_APP_ID');
const algoliaApiKey = env('ALGOLIA_SEARCH_API_KEY');
const algoliaIndexName = env('ALGOLIA_INDEX_NAME');

const algolia =
  algoliaAppId && algoliaApiKey && algoliaIndexName
    ? {
        appId: algoliaAppId,
        apiKey: algoliaApiKey,
        indexName: algoliaIndexName,
        // Keeps results scoped to the current version/language when those exist.
        contextualSearch: true,
        searchPagePath: 'search',
      }
    : undefined;

const config: Config = {
  title: 'Linkiir Help Center',
  tagline: 'Build, deploy, and operate healthcare interfaces',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: siteUrl,
  baseUrl,

  // Used by GitHub Pages deployment and by `docusaurus deploy`.
  organizationName: 'linkiir',
  projectName: 'linkiir-help-center',
  deploymentBranch: 'gh-pages',
  // GitHub Pages serves directory URLs from <dir>/index.html, which is what
  // Docusaurus emits by default. Leaving trailingSlash unset keeps that working;
  // setting it to false would emit <page>.html and break the absolute links in
  // docs/index.md that end in a slash.

  // Fail the build on any dead internal link, dead heading anchor, or
  // unresolvable relative Markdown link. This is what keeps the 56 pages honest.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          docItemComponent: '@theme/ApiItem', // Renders Web API pages via docusaurus-theme-openapi-docs
          // No editUrl: this package is published documentation, not a repo
          // the reader can send pull requests to. Set one here if that changes.
        },
        // The help center has no blog.
        blog: false,
        theme: {
          // custom.css is an unmodified copy of the Linkiir theme stylesheet
          // so it stays replaceable; local fixes live in site-overrides.css.
          customCss: ['./src/css/custom.css', './src/css/site-overrides.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  // Generates docs/api/web-api/**  from web_api.json — run `npm run gen-api-docs`
  // after editing that spec, then commit the regenerated files.
  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          webApi: {
            // Built from web_api.json by `npm run gen-api-docs`, which layers on
            // a "Linkiir" code sample per operation (see scripts/gen-web-api-spec.js)
            // without touching the source spec.
            specPath: '.generated/web_api.json',
            outputDir: 'docs/api/web-api',
            // No `servers` in the spec and no fixed base URL a public docs site
            // could sensibly send requests to (Linkiir is self-hosted per
            // customer) — so this documents the API rather than executing it.
            hideSendButton: true,
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/linkiir-social-card.png',
    colorMode: {
      // Dark-first experience, per the Linkiir theme design guide.
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    api: {
      // Web API pages get a per-operation "Linkiir" code sample (see
      // scripts/gen-web-api-spec.js). Once a language has one of those, this
      // hides its separately-generated snippet tab so there's one obvious
      // "Linkiir" tab instead of a Linkiir tab plus an empty generated one.
      hideGeneratedSnippets: true,
    },
    // Only these three: `linkiir` is a real entry (its snippet comes from
    // x-codeSamples, see scripts/gen-web-api-spec.js); `curl` and `http` are
    // bare `{language: '<id>'}` so they pick up their icon/highlighting from
    // the theme's built-in defaults.
    languageTabs: [
      {
        highlight: 'lua',
        language: 'linkiir',
        codeSampleLanguage: 'Linkiir',
        logoClass: 'linkiir',
        variant: 'Linkiir',
        variants: ['Linkiir'],
      },
      {language: 'curl'},
      {language: 'http'},
    ],
    navbar: {
      title: 'Linkiir',
      logo: {
        alt: 'Linkiir',
        src: 'img/linkiir-logo.svg',
        srcDark: 'img/linkiir-logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'linkiirSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/docs/getting-started/', label: 'Getting Started', position: 'left'},
        {to: '/docs/api/', label: 'API', position: 'left'},
        {
          // Jira Service Management customer portal. External on purpose: the
          // help center explains the process, the portal is where a ticket is
          // actually raised. Release Notes, FAQ, and Support stay reachable via
          // the Documentation sidebar rather than crowding the navbar.
          href: 'https://linkiir.atlassian.net/servicedesk/customer/portals',
          label: 'Submit a Ticket',
          position: 'right',
        },
      ],
    },
    // No `footer` key: src/theme/Footer supplies the linkiir.com footer, so the
    // content lives in that component rather than being split across both.
    ...(algolia ? {algolia} : {}),
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      // Code fences in these docs use: lua, bash, text, powershell, json, mermaid.
      // bash and json ship with prism-react-renderer; lua and powershell do not.
      additionalLanguages: ['lua', 'powershell'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
