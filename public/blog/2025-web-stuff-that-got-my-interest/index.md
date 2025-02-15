---
title: Web stuff that got my interest
date: 2025-02-25
description: "Patterns, tools and emerging web technologies that I believe will be important in the future of the JS ecosystem"
---


I started writing about patterns, tools, and opinions I would consider if I were to build a framework, since I don't have the time or knowledge to do it.

But I realized that covering opinions, key patterns, and tools, and how that all comes together, is a monumental task for my personal and non active blog 😅

So here is a small part of it: patterns, tools and emerging web technologies that I believe will be important in the future of the JS ecosystem.


## Server Components

[NextJS introduced React Server Components](https://nextjs.org/blog/next-13#server-components), making it the only mainstream frontend framework with a backend-first approach made for apps.


```tsx
import { FancyAnnouncement, Navigation } from "./client-components.tsx";

async function ServerComponent() {
  const announcement = await db.announcements.findFirst();

  return (
    <>
      {announcement ? (
        <FancyAnnouncement announcement={announcement} />
      ) : null}
      <Navigation />
    </>
  );
}
```

To understand them, I recommend [Josh Comeau's Making Sense of RSC](https://www.joshwcomeau.com/react/server-components/), the [RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md), and the [video introduction](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components). In short, RSC is to UI as GraphQL is to data.

The debate over whether RSC are worth it has likely exhausted many people over the past year. RSC is great for requests that cascade. RSC is bad for client data invalidation. And so on, a long list of poorly documented tradeoffs.

I believe that Server Components have a future because they provide control on what is server (only) rendered and what is client rendered, while “traditional” client first frameworks only give control on what is client rendered. This while keeping an application-like model that does not really depend on HTML.

One could mount client-first apps made with client components (for example, an old React Router app) on a monolith made of server components (for example, any RSC framework). Old assumptions and current tooling might degrade the experience, but it isn't a limitation of the server component pattern.

Now, we are missing best practices and tools that help enforce them. Like “move client boundaries higher” or “hydrate streamed server data in client components”.
And also, new frameworks with different takes on that pattern.

Checkout Vercel ideas in [NextJS docs](https://nextjs.org/learn/react-foundations/server-and-client-components), [Nuxt Server Components](https://nuxt.com/docs/guide/directory-structure/components#server-components), [Fresh Island Architecture](https://fresh.deno.dev/docs/getting-started/adding-interactivity) (Deno + Preact) and [Waku](https://waku.gg/) (minimal RSC compatible framework).

## Fine grained reactivity with signals

[SolidJS](https://docs.solidjs.com/concepts/intro-to-reactivity) shows that it is possible to provide top notch reactivity without a templating language, with JSX and function-based components like React. They're even experimenting with [fine grained async and error recovering](https://www.youtube.com/watch?v=xnmvxWEK25I).

```tsx
function Component() {
  const [amount, setAmount] = createSignal(0);
  const price = queryCurrentPrice();  // async signal

  return (
    <div>
      <Suspense fallback={<div>$...</div>}>
        <div>${price()}</div>
      </Suspense>
      <div>
        <button onClick={() => setAmount(a => a + 1)}>Add more</button>
        <div>{amount()}</div>
      </div>
      <div>
        Total:
        <Suspense fallback={<div>$...</div>}>
          <div>${price() * amount()}</div>
        </Suspense>
      </div>
    </div>
  );
}
```


Svelte switched from compiler-based reactivity to a runtime-based reactivity with [runes](https://svelte.dev/blog/runes). Vue [improved its reactivity performance](https://github.com/vuejs/core/pull/12349) thanks to research done in [alien-signals](https://github.com/stackblitz/alien-signals). Angular added signals in [version 16](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d).

There are attempts to provide a shared signal primitive. The alien-signals library, Preact with their [signal libraries](https://github.com/preactjs/signals), [Solid signals](https://github.com/solidjs/signals), and even the [TC39 signal proposal](https://github.com/tc39/proposal-signals). The idea is to provide a minimal, performant and standard primitive to build reactivity in JS, without requiring framework or library adapters.

Signals isn't a new concept, but it's becoming a core primitive.
It's simpler than [observable](https://github.com/tc39/proposal-observable). Instead of doing been a multiple-push collection (see [RxJS guides](https://rxjs.dev/guide/observable)) with some [railway pattern](https://fsharpforfunandprofit.com/rop/) on top, signals focus on fine grained reactivity, independent and without exposing the underlying reactive algorithm.

Checkout [Ryan Carniato's blog](https://dev.to/ryansolid). [The React vs Signals: 10 years later post](https://dev.to/this-is-learning/react-vs-signals-10-years-later-3k71) is a good start with great linked resources. Also, read Dan Abramov's [responses](https://dev.to/this-is-learning/react-vs-signals-10-years-later-3k71#comment-256g9) talking about the tradeoff that React made with reactivity: treating "computed" as an optimization, not a requirement, for reactive components.

## Streaming objects

Streaming is fundamental to the web. Data transfer from one device to another isn't instantaneous. Sections of pages could require data that is slower to fetch.

The main benefit of streaming is possible thanks to [out-of-order flushing of async fragments](https://innovation.ebayinc.com/tech/engineering/async-fragments-rediscovering-progressive-html-rendering-with-marko/#:~:text=the%20next%20section.-,Out%2Dof%2Dorder%20flushing%20of%20async%20fragments,-Marko%20achieves%20out). Some frameworks like Marko focus on HTML-first based solutions, and now, some JS-based solutions are gaining a lot of traction.

```tsx
// server
define("getTodos", async () => {
  return {
    fetchedAt: new Date(),
    data: db.todos.find() // find is a promise
  }
});

// client
const response = call("getTodos")
console.log(response.fetchedAt) // the date object
const todos = await response.data
console.log(todos) // the todos
```


Mainly, React Server Components with it's streaming solution: RSC wire format. There isn't documentation specifically about it, so read about [Alvar Lagerlöf's RSC Devtoll](https://www.alvar.dev/blog/creating-devtools-for-react-server-components). Another great solutions are [Seroval](https://github.com/lxsmnsyc/seroval), [used by Solid](https://github.com/lxsmnsyc/seroval/network/dependents?dependent_type=PACKAGE), and [Turbo Stream](https://github.com/jacob-ebey/turbo-stream), [used by Remix](https://github.com/jacob-ebey/turbo-stream/network/dependents?dependent_type=PACKAGE) and in experiments like [Preact Server Components](https://github.com/jacob-ebey/preact-server-components).

Promises are becoming a core primitive for streaming data between client and server in frameworks, from [Remix](https://reactrouter.com/how-to/suspense#1-return-a-promise-from-loader), [NextJS](https://nextjs.org/docs/app/getting-started/fetching-data#with-the-use-hook), [TanStack's Router](https://tanstack.com/router/latest/docs/framework/react/guide/deferred-data-loading), [SvelteKit](https://svelte.dev/docs/kit/load#Streaming-with-promises), and more.

A lot of frameworks implement their own internal implementation due to the need for specific features and optimizations.
A primitive way to stream objects could be the “JSON 2” for frameworks, providing an interface to send complex JS primitives like promises across the wire.

## Better backed primitives

[AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) is an Node API that allows to create stores (or context) that persists across async calls, that has been stable since [Node 16.4](https://nodejs.org/es/blog/release/v16.4.0).

```ts
import { request } from "flask-js";

async function getUser() {
  return db.users.getByHeader((await request.headers()).Authorization);
}

handler("/users/me", async () => {
  const user = await getUser();
  return { user };
});
```

Stores allow passing values implicitly. A popular framework that does that pattern is [Flask](https://flask.palletsprojects.com/en/stable/quickstart/#the-request-object), that has a global request proxy that is set to the current request implicitly. In JS, NextJS has started using AsyncLocalStorage to provide dynamic request APIs thought RSC, like with the [`headers()` function](https://nextjs.org/docs/app/api-reference/functions/headers).

This pattern allows creating primitives for a complex and composable system, somehow like React Hooks or Vue's Composition API. Nitro has [experimental support](https://nitro.build/guide/utils#async-context-experimental) to avoid passing the event thought utilities. Even in the browser, React is waiting for the [Async Context TC39 proposal](https://github.com/tc39/proposal-async-context) to [improve state transitions](https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition).

---

There is also a surge of server functions. React has [Server Functions](https://react.dev/reference/rsc/server-functions) included in their framework. SolidStart follows a similar pattern, adding a [single-flight strategy](https://docs.solidjs.com/solid-start/reference/server/use-server#single-flight-actions). TansStack goes for an [different, more personalizable approach](https://tanstack.com/start/latest/docs/framework/react/server-functions#what-are-server-functions). There probably are going to be standar vite plugins in the future to build them.

```tsx
// server (create a referenceable function post bundle)
export async function saveTodo({ text }: {text: string}) {
  "use server";
  await db.todos.save({ text });
}

// client (references a server function post bundle)
await saveTodo({ text: "Finish this post" })
```

The main advantage of server functions is the deep integration with the framework, like form [submission without JS in React](https://react.dev/reference/react-dom/components/form#handle-form-submission-with-a-server-function) and single-flight queries to avoid cascades in SolidStart.
But I don't thing that we have clear primitives yet to build on top, like the other primitives and patterns mentioned in this post.

---

On the more BaaS side, I want to shout out [Convex](https://docs.convex.dev/home), that has a imperative primitives following the [command-query separation model](https://martinfowler.com/bliki/CommandQuerySeparation.html) with real time and consistent queries and ACID transitions. There are also great innovations in Cloudflare: [SQL DOs](https://blog.cloudflare.com/sqlite-in-durable-objects/) and the soon to be released [container platform](https://blog.cloudflare.com/container-platform-preview/).

## Advancements on tooling

In the same way [Astral](https://astral.sh/), launched at 2022, with VC money, from the development of amazing and rusty tools for Python (Ruff, and then uv at 2024),
[void0](https://voidzero.dev/) launched at 2024, for the JS ecosystem, from tools like Vite and Oxc.

Vite released the [environment API](https://vite.dev/guide/api-environment), breaking the constrain of having only client and SSR modes, allowing to target different environments, from different runtimes like node and [workerd](https://github.com/cloudflare/workerd), and different targets like server, SSR, and client builds (like [RSC](https://react.dev/reference/rsc/server-components#:~:text=renders%20ahead%20of%20time%2C%20before%20bundling%2C%20in%20an%20environment%20separate%20from%20your%20client%20app%20or%20SSR%20server.)). This will make frameworks to be _“just a vite plugin”_.

```ts
// Example configuration file on React Router
export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  tests: { browser: { enabled: true }}
});
```

Besides new capabilities, Vite is expected to have [a performance boost](https://github.com/rolldown/benchmarks?tab=readme-ov-file#apps1000) soon thanks to [Rolldown](https://rolldown.rs/), a new bundler designed for the future of Vite. It [replaced the dual bundling strategy](https://rolldown.rs/about#why-we-are-building-rolldown) with a simpler, performant and powerful one. Rolldown also is the [fastest bundler for JS in the _browser_](https://bsky.app/profile/evanyou.me/post/3ldn4js36hs2k).

[Oxc](https://oxc.dev/) is the toolchain that powers Rolldown. Besides the build tools, it has a [Linter (oxlint)](https://oxc.rs/docs/guide/usage/linter.html) and an prototype of a [formatter (Prettier port)](https://oxc.rs/docs/contribute/formatter.html#formatter-prettier). Also, it its really fast [parser](https://github.com/oxc-project/bench-javascript-parser-written-in-rust?tab=readme-ov-file#cpu), [tranformer](https://github.com/oxc-project/bench-transformer) and [linter](https://github.com/oxc-project/bench-javascript-linter).

[Vitest](https://vitest.dev/) replaces Jest, thanks to been tightly integrated to the Vite toolchain. It has a [lot of features included](https://vitest.dev/guide/features.html), including an experimental [Browser Mode](https://vitest.dev/guide/browser/) to run tests on a browser.

The importance of this tools is greater looking at the ecosystem around them.
For example, Storybook has [first class Vite support](https://storybook.js.org/blog/first-class-vite-support-in-storybook) from 2022, and in 2024, [partnered with Vitest](https://storybook.js.org/blog/storybook-8-3/) to add great testing capabilities to their component isolation tool. Vite's commitment to [an active ecosystem](https://vite.dev/guide/philosophy#an-active-ecosystem) is admirable.

## Local-first

Our devices are _fast_. Many tasks that previously required a server can be done on the client. And even if some stuff requires a server, it could be synced later.

Google Chrome is pushing to have [AI on the browser](https://developer.chrome.com/docs/ai). Last year we got the really experimental [`window.ai`](https://news.ycombinator.com/item?id=40834600), that didn't event get an announcement, yet it had the same philosophy of [Apple Intelligence](https://developer.apple.com/apple-intelligence/): AI Should be build-in.

Now, Chrome has some [AI API experiments](https://developer.chrome.com/docs/ai/built-in-apis), multiple on witch are available on Origin Trials (can be tested on browsers without users changing features flags). Even [Firefox is doing some experiments](https://blog.mozilla.org/en/products/firefox/firefox-ai/running-inference-in-web-extensions/). There are initial drafts of standards in the [Web Machine Learning Working Group](https://webmachinelearning.github.io/), for example, the [Prompt API](https://github.com/webmachinelearning/prompt-api).

---

The other side of local-first that I'm watching is sync engines. Sync engines are typically build on top of databases to sync data to clients, mostly in real time. [Firebase](https://firebase.google.com/) is the old giant in this space, and now there're solutions like [InstantDB](https://github.com/instantdb/instant) and [Zero](https://zero.rocicorp.dev/), both Open Source and with arguably better DX for DB interactions.

Where a lot of those systems fails is on the extendability of the backend. Most expose the database schema, and rely on implicit database triggers and limited permission rules to add business logic. Convex, that has plans to add a [object sync engine](https://stack.convex.dev/object-sync-engine) that looks promising. Checkout their [Map of Sync](https://stack.convex.dev/a-map-of-sync) post.

## Other, more concrete stuff

- The [TC39 Temporal Proposal](https://github.com/tc39/proposal-temporal)
- [`moveBefore`, move DOM with state preservation](https://github.com/whatwg/dom/issues/1255). See [React](https://github.com/facebook/react/pull/31596) and [HTMX](https://htmx.org/examples/move-before/)
- [Bun](https://bun.sh/)'s approach as an all-in-one JS toolkit
