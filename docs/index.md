---
layout: home

hero:
  text: A modern data client for React
  tagline: fate is a modern data client for React and tRPC inspired by Relay and GraphQL. It combines view composition, normalized caching, data masking, Async React features, and tRPC's type safety.
  image:
    dark: /fate-logo-dark.svg
    light: /fate-logo.svg
    alt: VitePress
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Documentation
      link: /api
    - theme: alt
      text: View on GitHub
      link: https://github.com/nkzw-tech/fate
features:
  - title: View Composition
    icon: 🎑
    details: Components declare their data requirements using co-located "views". Views are composed into a single request per screen, minimizing network requests and eliminating waterfalls.
    link: /guide/views
    linkText: Thinking in Views
  - title: Normalized Cache
    icon: 🗄️
    details: fate maintains a normalized cache for all fetched data. This enables efficient data updates through actions and mutations and avoids stale or duplicated data.
    link: /guide/server-integration#conventions-object-identity
    linkText: Conventions & Object Identity
  - title: Data Masking & Strict Selection
    icon: 🥽
    details: fate enforces strict data selection for each view, and masks (hides) data that components did not request. This prevents accidental coupling between components and reduces overfetching.
    link: /guide/views#type-safety-and-data-masking
    linkText: Data Masking
  - title: Async React
    icon: ⚛️
    details: fate uses modern Async React features like Actions, Suspense, and `use` to support concurrent rendering and enable a seamless user experience.
    link: /guide/actions
    linkText: Actions in fate
  - title: Lists & Pagination
    icon: 📜
    details: fate provides built-in support for connection-style lists with cursor-based pagination, making it easy to implement infinite scrolling and "load-more" functionality.
    link: /guide/views#pagination-with-uselistview
    linkText: Lists & Pagination
  - title: Optimistic Updates
    icon: 🚅
    details: fate supports declarative optimistic updates for mutations, allowing the UI to update immediately while the server request is in-flight. If the request fails, the cache and its associated views are rolled back to their previous state.
    link: /guide/actions#optimistic-updates
    linkText: Optimistic Updates
  - title: AI-Ready
    icon: ✨
    details: fate's minimal, predictable API and explicit data selection enable local reasoning, allowing AI tools to generate stable, type-safe data-fetching code.
    link: /api
    linkText: AGENTS.md
  - title: Open Source
    icon: 🛠️
    details: fate is an MIT-licensed open-source project developed and maintained by Nakazawa Tech.
    link: https://github.com/nkzw-tech/fate
    linkText: GitHub
---
