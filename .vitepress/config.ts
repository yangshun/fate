import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vitepress';
import apiItems from '../docs/api/typedoc-sidebar.json';
import pkg from '../packages/fate/package.json' with { type: 'json' };
import dunkel from './theme/dunkel.json';
import licht from './theme/licht.json';

const nkzwLogo = readFileSync(join(import.meta.dirname, './nkzw-logo.svg'), 'utf8');

export default defineConfig({
  cleanUrls: true,
  description: 'A Modern React Data Framework',
  head: [['link', { href: '/icon.svg', rel: 'icon' }]],
  markdown: {
    theme: {
      dark: dunkel,
      // @ts-expect-error
      light: licht,
    },
  },
  rewrites: {
    'docs/:path*': ':path*',
  },
  srcExclude: ['docs/parts/**.', 'packages/**/README.md', 'scripts/**'],
  themeConfig: {
    footer: {
      copyright: `Copyright © 2025-present Nakazawa Tech`,
      message: `Released under the MIT License`,
    },
    logo: {
      dark: '/fate-logo-dark.svg',
      light: '/fate-logo.svg',
    },
    nav: [
      { link: '/', text: 'Home' },
      { link: '/guide/getting-started', text: 'Guide' },
      { link: '/api', text: 'API' },
      {
        items: [
          {
            link: 'https://github.com/nkzw-tech/fate/blob/main/CHANGELOG.md',
            text: 'Changelog',
          },
          {
            link: 'https://github.com/nkzw-tech/fate/blob/main/CONTRIBUTING.md',
            text: 'Contributing',
          },
        ],
        text: pkg.version,
      },
    ],
    outline: {
      label: 'On this page',
    },
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        collapsed: false,
        items: [
          {
            items: [
              { link: '/guide/getting-started#installation', text: 'Installation' },
              { link: '/guide/getting-started#core-concepts', text: 'Core Concepts' },
            ],
            link: '/guide/getting-started',
            text: 'Getting Started',
          },
          { link: '/guide/views', text: 'Views' },
          { link: '/guide/list-views', text: 'List Views' },
          { link: '/guide/actions', text: 'Actions' },
          { link: '/guide/server-integration', text: 'Server Integration' },
        ],
        text: 'Guide',
      },
      { collapsed: false, items: apiItems, text: 'API' },
    ],
    siteTitle: false,
    socialLinks: [
      {
        icon: {
          svg: nkzwLogo,
        },
        link: 'https://nakazawa.tech',
      },
      { icon: 'x', link: 'https://twitter.com/cnakazawa' },
      { icon: 'github', link: 'https://github.com/nkzw-tech/fate' },
    ],
  },
  title: 'fate',
});
