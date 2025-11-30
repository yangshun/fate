# Is this serious software?

**_fate_** is an ambitious React data library that tries to blend Relay-style ideas with tRPC, held together by equal parts vision and vibes. It aims to fix problems you definitely wouldn't have if you enjoy writing the same fetch logic in three different places with imperative loading state and error handling. fate promises predictable data flow, minimal APIs, and “no magic,” though you may occasionally suspect otherwise.

80% of the code was written by Codex – four versions per task, carefully curated by a human. The remaining 20% was written by [@cnakazawa](https://x.com/cnakazawa). You get to decide which parts are the good ones. The README was 100% written by a human. _Maybe._

**_fate_** is almost certainly worse than actual sync engines, but it will eventually be better than existing React data-fetching libraries. Use it if you have a high tolerance for pain and want to help shape the future of data fetching in React.

## Is fate better than Relay?

Absolutely not.

## Is fate better than using GraphQL?

Probably. One day. _Maybe._

# Future

We welcome contributions and ideas to improve fate. Here are some features we'd like to add:

- Support for Drizzle.
- Support backends other than tRPC.
- Better code generation and less type repetition.
- Support for live views and real-time updates via `useLiveView` and SSE.
- Implement garbage collection for the cache.
- Add persistent storage for offline support.

# Acknowledgements

- [Relay](https://relay.dev/), [Isograph](https://isograph.dev/) & [GraphQL](https://graphql.org/) for inspiration
- [Rick Hanlon](https://x.com/rickyfm) for guidance on Async React
