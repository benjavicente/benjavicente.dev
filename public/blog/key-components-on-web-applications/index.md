---
title: "28 concepts of frontend development"
date: "2025-07-28"
description: "A compilation of core concepts that you will probably encounter in frontend development."
---

As a mainly frontend developer who is writing a frontend development blog,
I must say, maybe with a small bias, that frontend development starts harder than most of
backend development. It's an unavoidable distributed problem!

But honestly, one of the biggest paint points is that frontend tooling and concepts are usually lack documentation, and are often intermingled with each other. Usually, there are guides and documentation about specific tools, and not really about the concepts around them.

So, as any software developer, here I will present you my own convention of concepts and tools that I believe are important for frontend development. This post doesn't intend to cover historical context or libraries, but I highly recommend you to explore on your own.

## Reusing pieces

### 1. Rendering frameworks

**A library, tool, or language that renders UI to a screen.**

There are many approaches to rendering with different underlying implementations, but what you will see most is the API difference:

- Templating engines, like [mustache](https://mustache.github.io/) or [handlebars](https://handlebarsjs.com/), usually compile raw strings with placeholders into HTML (or any other string), and do nothing more.
- Component languages, like [marko](https://markojs.com/), [angular](https://angular.dev/), [vue](https://vuejs.org/), [svelte](https://svelte.dev/), [astro](https://astro.build/), that have their own syntax and provide additional features, like reactivity, style encapsulation, and more.
- JSX, a subset of JavaScript, which is used by libraries like [react](https://react.dev/), [preact](https://preactjs.com/), and [solid](https://solidjs.com/), which has a minimal transformation step to convert XML-like syntax into JavaScript function calls that the framework expects.
- Native web components, which integrate horizontally with the underlying technology instead of building on top, providing a more portable solution.

Rendering solutions are usually integrated with other tools, but usually provide at minimum **composability and reusability of UI**, along with protection against XSS attacks.

### 2. Behavioral elements

**Foundational pieces used to build UI.**

- Native HTML elements, like the anchor, button, input, and select tags, provide a set of built-in behaviors that are accessible and can be composed to build complex UIs. While HTML elements alone aren't always enough, there are efforts to expand and improve them, like [OpenUI](https://open-ui.org/).
- JS libraries that inject behaviors into HTML elements without a rendering framework, like [bootstrap](https://getbootstrap.com/) or web component libraries.
- Libraries built on top of rendering frameworks with styles included, like [mui](https://mui.com/), [ant-design](https://ant.design/), and [chakra-ui](https://chakra-ui.com/).
- Headless or style-less libraries, like [react-aria](https://react-spectrum.adobe.com/react-aria/) and [baseui](https://base-ui.com/), which build on top of rendering frameworks but only provide behaviors and accessibility, leaving the styling to the developer.

The main goal of behavioral elements is to provide advanced UI primitives that can be used in different contexts while providing great accessibility and usability out of the box.

### 3. State systems

**Systems to build reactive UIs.**

- Manually tracking state, which can be done with simple variables and functions, or with lightweight frameworks like [alpine.js](https://alpinejs.dev/). This is usually recommended for small, server-first applications, since it's harder to scale in large applications.
- Some type of “dirty checking”, which re-runs a function when some state changes and updates based on those changes. For example, Angular with [zone.js](https://github.com/angular/angular/tree/main/packages/zone.js), Svelte 3 with its compiler, or even React with its virtual DOM. Some implementations add significant runtime overhead.
- Store or event-based, where a push-based subscription model is used to update parts of the UI when it changes. This may require manual handling of subscriptions when chaining stores, but can be integrated into the underlying rendering framework. The implementation is usually lightweight and doesn't require globals. For example, [rxjs](https://rxjs.dev/) on Angular and Svelte, and Svelte's [store contract](https://svelte.dev/docs/svelte/stores).
- Signals, which provide [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming)-like state management where the underlying algorithm for tracking updates is global and indirectly given. Many frameworks use it, like [solid](https://docs.solidjs.com/concepts/intro-to-reactivity), [vue](https://vuejs.org/guide/extras/reactivity-in-depth), [angular](https://angular.dev/guide/signals), [svelte](https://svelte.dev/docs/svelte/what-are-runes), and more. There is an effort to standardize signals, for example, with the [tc39 signals proposal](https://github.com/tc39/proposal-signals), but since some frameworks are still experimenting (see async signals in [solid](https://www.youtube.com/live/xnmvxWEK25I?t=839) and [angular](https://angular.dev/guide/signals/resource)), it may be too early for a standard.

The main goal of state systems should be to provide **composable primitives that allow UI reactivity**, ideally in a performant way. While manually tracking subscriptions or dependencies works, the developer experience and performance of implicit tracking tends to be superior in most cases.

### 4. Global state

**Sharable and debuggable state at scale.**

Some state systems can be used globally in apps. In the case of React, it isn't, and since it's the biggest rendering framework, it requires an external library. While a library isn't necessary on other frameworks, some concepts and tools can still be useful.

- [redux](https://redux.js.org/) provides a shared global store, operated by reducers of dispatched actions. It is usually used with [redux toolkit](https://redux-toolkit.js.org) for simpler APIs. While running every reducer to compute the new state sounds slow, it isn't. The global aspect allows better debugging tools, like time traveling.
- With [zustand](https://zustand.docs.pmnd.rs/), multiple stores can be defined, each one with its own state and methods to set them. It has an integration with the [redux devtools](https://zustand.docs.pmnd.rs/middlewares/devtools), but its integration isn't as ergonomic. [@xstate/store's stores](https://stately.ai/docs/xstate-store#quick-start) are similar, but use action dispatching instead of methods.
- [recoil](https://recoiljs.org/), [jotai](https://jotai.org/), [valtio](https://valtio.dev/), and [@xstate/store's atoms](https://stately.ai/docs/xstate-store#atoms) provide a more atomic approach, similar to signal state management, where there isn't a concept of actions, there's only state. Some have devtools that provide time-traveling functionality, like [jotai](https://jotai.org/docs/tools/devtools) and [recoil](https://recoiljs.org/docs/guides/dev-tools), but these are more limited than redux's.

The main difference of these state systems is that this type of state management provides better tooling for debugging complex applications thanks to devtools and, in libraries that use stores, a framework for modeling state changes.

## Server-client communication

### 5. Communication protocols

**Underlying protocol of how messages are passed between the client and the server.**

One could try to organize communication protocols by layer, but since they're usually **hidden by an abstraction layer** (the messaging protocol), I would argue that it doesn't matter. The only thing that matters is understanding the limitations of each protocol.

- HTTP is a stateless request-response model where each message contains key information about the request or response, headers as key-value pairs, and a blob of data. Caching, sessions, and how the data should be parsed are handled by a client that follows HTTP conventions for the headers. A message can be streamed and remain open for a long time, properties that are used in Server-Sent Events (SSE) and long polling, respectively.
- WebSockets, WebRTC, and WebTransport implement [full-duplex](https://en.wikipedia.org/wiki/Duplex_(telecommunications)) communication. WebSockets is a single ordered stream between server and client, WebRTC is peer-to-peer, and WebTransport is a cutting-edge protocol that can handle multiple streams and out-of-order messages.

You can read a [great comparison of protocols in the RxDB blog](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html#what-is-the-webtransport-api).

### 6. Messaging protocols

**How data sent between the client and the server is structured.**

- REST is a common messaging strategy for applications, where the path identifies resources and responses are given in JSON plus HTTP metadata like status codes. To establish a contract, standards like [OpenAPI](https://www.openapis.org/) are used, which can generate automatic documentation and client libraries. There are extensions.
- [json:api](https://jsonapi.org/) can be considered an extension of REST, but with a strict contract of how data should be structured, including relationships, pagination, and multiple references.
- [graphql](https://graphql.org/) uses HTTP as the transport layer but doesn't adopt REST's semantics. A schema is defined that allows clients to request only the data they need, with relations and pagination. It's more flexible than json:api, because the schema isn't necessarily associated with resources; it could be pages, for example. GraphQL also supports mutations and subscriptions. The full benefits of GraphQL can be used with libraries like [relay](https://relay.dev/).
- RPC-like protocols abstract the communication by defining function calls as messages. Some small shared context is injected, like authentication. While more ergonomic, they usually lack the flexibility to handle relations. Some examples are [trpc](https://trpc.io/) and [convex functions](https://docs.convex.dev/functions).
- Local queries allow the client to create its own custom queries. This is usually done in full-featured backends that expose part of the database to the client, like [firebase firestore](https://firebase.google.com/docs/firestore/query-data/queries), [supabase](https://supabase.com/docs/reference/javascript/select), and [zero](https://zero.rocicorp.dev/docs/reading-data#select).
- For frontend applications with a JS backend-for-frontend, protocols that allow complex object serializations can be used to stream data efficiently without multiple requests or round-trips. For example, the mostly undocumented [react server component wire protocol](https://www.plasmic.app/blog/how-react-server-components-work#the-rsc-wire-format), or alternative standalone libraries like 
[seroval](https://github.com/lxsmnsyc/seroval) used in tanstack router and solid router. Usually they're part of the framework, but could also be used in an RPC-like way.

While RPC is closest to native function calling, all messaging protocols could be thought of as function calls and callbacks, with specific interfaces, that the end developer uses to abstract away the underlying communication protocol.

### 7. External state management

**How server-side data is managed in the client.**

While data can be fetched by the messaging protocol, for a better experience for the developer and user, an additional layer can be added in between, that can handle:

- Caching, cache invalidation, and garbage collection
- Deduplication of requests
- Retries and pooling
- Background updates of stale data
- Optimistic updates
- Prefetching utilities
- Integration with the underlying rendering framework

While those can be implemented manually, it's better to use an external library which receives a function to fetch data and provides all of those utilities.

Some messaging libraries like relay manage those internally. The common agnostic libraries are [tanstack query](https://tanstack.com/query/latest) and [redux toolkit query](https://redux-toolkit.js.org/rtk-query/overview).

### 8. View routing

**How the client navigates different views.**

Data is only half of the equation; the client should also load the necessary assets and render the UI. Some SPAs can load the entire code like native applications, but in large applications, there is a need to gradually load only the necessary code and assets. Router frameworks usually provide:

- Mapping an external state, like the URL, to a view
- Smart navigation where only the changed parts of the UI are updated
- Splitting assets and code to load only the necessary views
- Preloading of assets
- Preloading of data
- Layouts, fragments, parallel routes, and other mechanisms to reuse code
- Context management, like for the usage of meta tags and scroll restoration

Usually, routing frameworks are used with a router. Examples are [nextjs](https://nextjs.org/), [react router](https://reactrouter.com/), [tanstack router](https://tanstack.com/router/latest), [nuxt](https://nuxt.com/), [sveltekit](https://kit.svelte.dev/), and [angular router](https://angular.dev/guide/routing).

## Styling

### 9. Naming and grouping styles (atomic, etc)

**How class names are defined.**

Naming CSS classes has historically been a large problem, since classes are global and can conflict with each other in a large application. To address this, different methodologies to name and group styles can be used.

- [OOCSS](https://github.com/stubbornella/oocss/wiki) treats page elements as objects and references them by class names. [BEM](https://getbem.com/) is a naming methodology for class names. [SMACSS](https://smacss.com/) is a way to organize the CSS code. All three can be used together to write modular CSS code at scale. But, with current tooling, the overhead of following those methodologies isn't worth it anymore.
- [Atomic CSS](https://www.smashingmagazine.com/2013/10/challenging-css-best-practices-atomic-approach/) solves the problem by writing a large set of thin, utility-first classes instead of big and component-first classes, making the naming more explicit and simple. This moves the styling _bloat_ to the HTML instead of the CSS file. Since creating those utility classes by hand is a lot of work, it's usually used with generators like [atomizer](https://acss-io.github.io/atomizer/) and, the modern and popular option, [tailwindcss](https://tailwindcss.com/).
- For simpler sites, one could use the styles provided by CSS frameworks like [bootstrap](https://getbootstrap.com) and [bulma](https://bulma.io/), and write custom CSS only when necessary.

Some options use a preprocessor to parse a custom syntax or extension of CSS, reducing the style complexity by adding compiled variables, nesting, and other features. Some examples are [sass](https://sass-lang.com/) and the tailwindcss pre-processor.

### 10. Scoped styles (css modules, in-frameworks)

**How class names are automatically scoped.**

The naming problem is currently solved by automatically scoping classes in component systems and compilers.

- Component frameworks like [vue](https://vuejs.org/api/sfc-css-features.html#scoped-css), [svelte](https://svelte.dev/docs/svelte/scoped-styles), and [angular](https://angular.dev/guide/components/styling#style-scoping) automatically scope styles by adding a unique identifier to the selector.
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), used by web components, scopes the entire DOM tree, including styles.
- [CSS modules](https://github.com/css-modules/css-modules) provide a general solution that can be integrated with any bundler and JS framework.
- CSS-in-JS libraries like [emotion](https://emotion.sh/docs/introduction) and [styled-components](https://styled-components.com/) add the specified styles to the component at runtime. More modern solutions, like [stylex](https://stylex.dev/), [panda](https://github.com/chakra-ui/panda), [pigment](https://github.com/mui/pigment-css), and [linaria](https://github.com/callstack/linaria) are available, most with different APIs.

While one could avoid using any of those solutions and rely on naming conventions, when building a component system or any component with complex CSS, it's better to have automatic scoping and the full power of CSS.

### 11. Style precedence

**How styles are applied and overridden.**

Sometimes, styles of class names could be reused across the application. For example, a button that has default styles.

```css
.my-button {
  border: 1px solid black;
  height: 40px;
}
```

We might want to allow certain styles to be overridden, but others we might want to make it non-overridable. To do that, there are mainly 3 options:

- Fight with specificity: Creating less or more specific selectors to define the precedence of styles, and using `!important` when we need to make a style unwritable (or we lost the precedence battle).
- Custom class appliance algorithm: Having an algorithm that applies classes as one would expect. A common utility for this is [tailwind-merge](https://www.npmjs.com/package/tailwind-merge). Note that the order of classes in HTML doesn't matter, but in CSS it does. So the algorithm could remove conflicting classes or apply them in specific conditions.
- [CSS layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer): The new modern way to define style precedence, used in a lot of modern CSS frameworks. Layers are usually defined upfront, and define the precedence of styles based on the layer they are in.

### 12. Theming (css variables, user preferences)

**How we can personalize the application's look.**

Apps that use a relatively large set of styles and components need a way to declare [design tokens](https://spectrum.adobe.com/page/design-tokens/) to be the source of truth for the styles, allowing reusability and maintainability. Usually, behavioral elements with styles include mechanisms to overwrite their styles with a preprocessor or variables.

There are usually 3 ways of defining design tokens:

- Compiled approach via a preprocessor like sass, where styles can be used in more complex scenarios, for example, with functions, and then compiled to simple CSS values. Usually done when the underlying framework styles via the same preprocessor. For example, [angular material](https://material.angular.dev/guide/theming#getting-started) and [bulma](https://bulma.io/documentation/customize/concepts/).
- JS approach, where the tokens are passed at runtime or compile time to the component solution. For example, [mui](https://mui.com/material-ui/customization/theming/).
- CSS variables, the native way to define tokens. The only disadvantage is that names could clash, but this is rare since variables are scoped on their element tree (instead of being global like classes), and usually they follow a stricter naming convention than component styles. Now with modern CSS, including the [light-dark](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) function, [color mixing](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix), and even the [if function](https://developer.mozilla.org/en-US/docs/Web/CSS/if), native styling is usually the best option if available.

Tokens serve as the foundation to build component and design systems that can be reusable and consistent across applications.

## Bundling

### 13. Scope hoisting or module concatenation

**Reducing the number of files downloaded.**

Web applications usually have dependencies and file imports. If those file imports are sent as-is to the browser, there would be a request waterfall, where each import would send a request to the server for each imported module. To avoid this, code is joined into the same file, using different strategies like:

- [Immediately Invoked Function Expressions](https://en.wikipedia.org/wiki/Immediately_invoked_function_expression), an old approach that didn't have a standard to declare dependencies between code.
- [UMD](https://github.com/umdjs/umd) and webpack's module concatenation, where modules, defined as functions, are registered with a unique id in a global object, so they can be loaded on demand and with dependency resolution without code pollution.
- Native ES module usage, like with [rollup](https://rollupjs.org/) (used by Vite). While this is limited to what the browser supports, proposals like [module declarations](https://github.com/tc39/proposal-module-declarations) might bring more flexibility in the future.

The tradeoff to consider is that concatenating modules means every modification of a single file causes the bundled module to change, so it would need to be downloaded again and rerun in development. For example, it might be better not to concatenate a rendering framework like React to the main bundle, since it's large and changes to it are infrequent.

### 14. Dead code elimination (tree shaking)

**Reducing downloaded code.**

Applications might need utilities from other libraries, but not all. Dead code elimination deletes code that isn't used by the application.

The rules for code elimination vary through each bundler, but usually you should know that:

- Side effects make the entire file non-tree-shakable.
  ```ts
  // counter.ts
  let counter = 0;   // "side effect"
  export function increment() {
    counter++;
  }
  export function getCounter() {
    return counter;
  }
  export function largeFunction() {
    console.log('I have a lot of code, just trust me');
  }
  // main.ts (entry file)
  import { increment } from './counter';
  increment();
  ```
  Even though `largeFunction` is never used, the entire file will be included in the bundle, since it's much harder to determine if the function will modify the state of the module or not.
- Grouped variables and functions can't be tree-shaken, and a more functional approach should be used when tree-shaking is desired.
  ```ts
  // not ok, we can't tree-shake this (this could also be a class)
  export const math = {
    sum(a, b) {
      return a + b;
    },
    subtract(a, b) {
      return a - b;
    },
  };
  // ok, we can safely tree-shake this
  function sum(a, b) {
    return a + b;
  }
  function subtract(a, b) {
    return a - b;
  }
  ```
- Barrel files pollute the heuristics that bundlers use to determine if a file is tree-shakable or not. A barrel file is a file that re-exports other files, like:
  ```ts
  // my-library.ts
  export * from './math';
  export * from './counter';
  ```
  This makes the entire file non-tree-shakable if any of the files has side effects.

### 15. Code splitting

**Splitting code into pieces and loading them when needed.**

One could load the entire application as a single file, but that isn't efficient when the user only needs a small part of the web application. The idea of code splitting is creating multiple nodes, each one a hoisted module, of the flattened dependency tree. So instead of having a single file or the same source files, the output is a set of entry points that can be loaded on demand.

Frameworks usually include those strategies by default and integrate them with the organization of the application's code. If it needs to be added manually, bundlers usually understand dynamic imports with a static path, like:

```ts
// main.ts
const module = await import('./module-that-will-be-considered-as-an-entry-point.js')
```

Note that a lot of code splitting might cause waterfalls that the bundlers try to avoid with module hoisting in the first place. Ideally, code splitting should be per page (navigating) or per action (running an expensive operation), and not be more than 1 node deep considering the currently loaded code.

### 16. Static assets management

**Only downloading changed assets.**

One big benefit of bundling is that all assets, including images, fonts, CSS, and JavaScript, can have a unique hash in their path. With that, the browser can skip making a request to fetch the asset if it hasn't changed. This allows applications to launch faster on subsequent visits, since only the HTML (or any app entry point, like the service worker) needs to be downloaded.

With that, a cache for a large amount of time can be added without problems:

```make
# every file in the _assets directory will have a static hash
/_assets/*
  Cache-Control: public, max-age=31536000, immutable
```

One problem with native ES modules is that since they rely on the path of the code to import it, if the path of a file changes, it will also change the content of the file that imports it, invalidating the cache of every file that imports it and its parents. Ideally, a solution could be integrated with a mapping of non-hashed names to hashed names, like what [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) do for only JavaScript modules.

## Debugging

### 17. JS native debugging tools

**Inspecting code execution without the hassle.**

Just add the `debugger` statement for pausing the execution on an event:

```ts
debugger;
```

Note that the entire application will pause, so you can make modifications to parts of the application (that don't require code execution) or run code in the console at that break point.

For console logging, don't just use `console.log`. Try incorporating:

```ts
// Only logs when the condition is true
console.assert(condition, message)
// For tables and objects
console.table(data);
// trace to get where the function is being called without stopping the execution
console.trace();
```

### 18. Overwrites

**Changing the code locally.**

Most of the application can be modified locally. You can change the DOM or styles, [overwrite headers of requests or the response contents](https://developer.chrome.com/docs/devtools/overrides), change device information like viewport, user agent, geolocation, preferred color theme, and more. You can modify application storage like localStorage, cookies, and IndexedDB.

Here it doesn't make sense to go in detail about how it works, since it would be like starting a tutorial, but I suggest that you explore how you can debug an application without the need to change the source code directly.

With the integration of [workspaces](https://developer.chrome.com/docs/devtools/workspaces) and bundler plugins to include necessary metadata (for example, with this [vite plugin](https://github.com/ChromeDevTools/vite-plugin-devtools-json)), part of the changes can be saved directly back to the source code.

### 19. Accessibility

**Check what you probably can't see.**

The base tools that Chrome provides are the accessibility audit of Lighthouse, to see general issues of the web page, and the accessibility elements sub-tab, which allows you to see (or enable) the accessibility tree, and check the accessibility properties of each element. You can also emulate vision deficiencies on the rendering tab.

This is the topic where I know the least of this list, but I suggest using behavioral elements and libraries that provide accessibility out of the box, and shout at you if you forgot to define them in an accessible way. Keep it simple.

### 20. Chrome performance panel

**The place to check performance.**

The performance panel of Chrome has most of the information you need to understand the timeline of your application. With a recording, you can see a timeline with information on:

- Requests being made and the relations between them
- Frames painted to the screen
- Task execution, and the flamegraph of the executed code
- User interactions
- Layout shifts
- Displayed animations
- (optional, and recommended to keep off until needed) memory usage and CSS selectors performance
- Getting performance insights from [recordings](https://developer.chrome.com/docs/devtools/recorder)

You can add annotations to the profile and save it to use later or to share it with others.

See [their documentation for the full reference](https://developer.chrome.com/docs/devtools/performance/reference), and use it to understand the performance of your applications.

## Preparing code

### 21. Package managers

**How dependencies are installed**

The base package manager is [npm](https://www.npmjs.com/), which comes with Node. [yarn](https://yarnpkg.com/) started as a faster alternative to npm, but now npm has caught up. [pnpm](https://pnpm.io/) was created to solve the problem of `node_modules` disk space, and now has expanded to include more interesting features. Other honorable mentions are [bun](https://bun.sh/) and [deno](https://docs.deno.com/runtime/fundamentals/modules/#adding-dependencies-with-deno-add), both tailored to work with their own ecosystems. Some other features besides package installation are:

- Lock files
- Updating dependencies (sometimes with an interactive tool)
- [Package isolation](https://pnpm.io/settings#nodelinker) (to avoid dependency conflicts or undeclared dependencies)
- Overriding dependencies and aliases
- [Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) and [catalogs](https://pnpm.io/catalogs)

Note that I'm talking about the package manager and not the [registry](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Package_management#package_registries). Registries can be the [npm registry](https://docs.npmjs.com/about-npm), [yarn registry](https://yarnpkg.com/), [GitHub packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#publishing-a-package), [JSR](https://jsr.io/), or any other that supports the npm package format.

Also, some solutions might manage the runtime version, like [pnpm](https://pnpm.io/next/settings#nodejs-settings).

### 22. Linting

**Analyzing code before running it.**

Static analysis of code has many use cases, like formatting with [prettier](https://prettier.io/), checking for code quality with [eslint](https://eslint.org/), or checking for type errors with [typescript](https://www.typescriptlang.org/). Formatters usually don't provide a lot of customization options, type checkers have limited plugin support, and code quality tools usually have a lot of plugins to check for specific code patterns.

Some integrations exist, for example, [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) with [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) and [typescript-eslint](https://typescript-eslint.io/), but usually with a big overhead compared to running those tools separately.

One problem is that these tools are configured separately and can clash with each other. There are attempts to unify this toolchain, like [biome](https://biomejs.dev/), [oxc](https://oxc.rs/), and [deno](https://docs.deno.com/runtime/reference/cli/lint/). One big challenge is reducing scope, for example, working on non-JS files or type-aware rules. Biome has the problem that it implements its own toolchain from scratch, so it can misalign with the native tools, and oxc isn't as mature, but is experimenting with native integrations like tsgo.

### 23. Testing

**Ensuring test coverage.**

The most common testing library used is [jest](https://jestjs.io/). [vitest](https://vitest.dev/) is a newer alternative that incorporates similar APIs, but has a modern architecture that is integrated natively with Vite. Both provide:

- Mocking and spying functions ([jest](https://jestjs.io/docs/mock-functions) vs [vitest](https://vitest.dev/api/vi.html#mock-modules) API)
- Test grouping (`describe`, although it's usually not recommended)
- Code coverage
- Snapshot testing
- Test matchers/assertions/expectations

Vitest provides additional tools like running only changed tests in developer mode and testing types. Jest also has great underlying strategies, like smarter scheduling which runs first the test files that fail most often, and then the ones that take a long time.

So when talking about unit testing, vitest is the best option when using Vite, and jest is a great option for other cases that don't require Vite. Runtimes have recently started including their own lightweight testing libraries, like [node](https://nodejs.org/api/test.html#test-runner), [bun](https://bun.com/docs/cli/test), and [deno](https://docs.deno.com/runtime/fundamentals/testing/).

Another strategy in frontend testing is end-to-end testing or component tests.
- End-to-end tests run the application with optionally mocked APIs, and test in a browser. A popular tool is [playwright](https://playwright.dev/), which uses native DevTools integrations to run commands in the browser. An alternative is [cypress](https://www.cypress.io/), which has a more opinionated API and a different custom architecture.
- Component tests focus on testing components in isolation in the browser. The common tool is [storybook](https://storybook.js.org/), which provides a UI to document components, interaction tests, visual regression tests, and accessibility tests. Its primary interface is web-based, but it can [run mostly on CI with vitest](https://storybook.js.org/docs/writing-tests/in-ci) (visual tests might require more setup).

### 24. Mono-repo managers

**Sharing packages with ease.**

Even when package managers allow sharing packages without manual versioning via the workspace feature, managing a [monorepo](https://monorepo.tools) (a repository with multiple packages) can be painful. The main problem is **speeding up tasks, mainly through task caching**. Running all tasks like builds, linting, and testing can be sped up considerably by caching the results of previous runs, and with a task scheduler that understands the dependencies between tasks.

Some monorepo managers for JS are [nx](https://nx.dev/), [turbo](https://turbo.build/), and [rush](https://rushjs.io/). They vary a lot in complexity: nx is complex with a plugin architecture that provides generators and additional tools, turbo is simple because it focuses mainly on caching, and monorepo tools like rush integrate enterprise features like package policies, committer email validation, and dependency approval.

The biggest impact of these tools can be obtained when they're integrated with the rest of the toolchain around publishing changes to the code, mainly for remote caching with a CI integration (usually requires an external service) and merge flow (only running tasks that the PR updates). Add these tools only when the integrated ones of the package manager aren't enough.

## Other goodies

### 25. Hot module replacement

**Fast development iteration.**

HMR updates only the parts of the code that have changed in a running application. This works when the changed part doesn't have any side effects, so it can be added or removed safely. Common code that supports HMR includes components, styles, and real-time functions without side effects.

Since the runtime needs to update specific code, and each library might have its own way of mounting and unmounting code, HMR is handled by plugins in the bundler that add special code to each file that is HMR-compatible. For example, [Vite](https://vitejs.dev/guide/api-hmr.html) and [Webpack](https://webpack.js.org/concepts/hot-module-replacement/).

Note that HMR plugins have rules. For the [React plugin](https://www.npmjs.com/package/@vitejs/plugin-react) for Vite, you can see [the refresh rules here](https://www.gatsbyjs.com/docs/reference/local-development/fast-refresh/#how-it-works). In summary, for HMR to work correctly, each module should ideally only export components, and components shouldn't be defined inside functions or objects.

### 26. Complex primitives

**Thinking with more than just blocks.**

While the UI is mostly composed of boxes and elements that can be easily composed through the box component model, there are complex scenarios where that doesn't work as nicely or has complex interactions. For example:

- Tables, while representable in HTML, when combined with pagination, sorting, filtering, column ordering, row selection, and more, need a complex system that can handle all of that in a composable way. Libraries like [TanStack Table](https://tanstack.com/table/latest), [AG Grid](https://www.ag-grid.com/react-table/), and [MUI X Data Grid](https://mui.com/x/react-data-grid/) help with this.
- Plots are another example, since they're usually a function of data that returns complex SVG or canvas elements. There are plain JS libraries like [D3](https://d3js.org/) and [Observable Plot](https://observablehq.com/@observablehq/plot) (built on D3), and libraries that integrate with frameworks like [Recharts](https://recharts.org/en-US) in React.
- Maps usually require an external service to serve map or vector tiles. Libraries and services like [Leaflet](https://leafletjs.com/), [Mapbox](https://www.mapbox.com/), [Google Maps](https://developers.google.com/maps/documentation/javascript), [MapKit from Apple](https://developer.apple.com/documentation/mapkitjs/), and [Azure Maps](https://azure.microsoft.com/en-us/products/azure-maps) are common choices.
- There are other, rarer elements, like 3D elements (with [Three.js](https://threejs.org/)), video players, image previews, and more.

The main consideration here is that, in a company, there should ideally be guidelines and a default theming or configuration for these components to provide the same consistency across applications as the rest of the UI.

### 27. Animations

**Adding motion and dynamism to the UI.**

Animations are another aspect that can be documented and standardized in a company or application, but with a big difference: the browser has multiple built-in solutions, and extending those solutions in a composable way usually requires a library.

- CSS animations are the simplest way to animate specific elements in the DOM. New APIs like [@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) allow simple entry animations, and transitions on [properties](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) allow for complex effects.
- The [View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions) is a newer API that allows animating between two states of the DOM, working in cross-document navigations and transitions between different elements. There can be problems with elements that clip or overflow, since the transition happens on a different component (or image) tree.
- For advanced use cases, the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) or custom animation engines are used—often via easy-to-use libraries like [Motion](https://motion.dev/), [GSAP](https://greensock.com/gsap/), and [anime.js](https://animejs.com/).

The best way to start is to learn by example: see code that interests you and try to replicate it (you can use DevTools to see the implementation). For more advanced knowledge, I recommend checking out Emil Kowalski and his [animation course](https://animations.dev/), and [Josh Comeau's](https://www.joshwcomeau.com/) blogs and courses.

### 28. Cleanup and maintenance

**Keeping the codebase clean.**

Over time, dependencies might be deprecated, simpler or faster alternatives might become available, bugs might be found, and code practices might change. While code is static, a software company or any active software project is not, and should prioritize maintenance of the underlying codebase.

One of the most interesting tools, outside of those provided by package managers to update dependencies, is [Knip](https://knip.dev/), a tool that can be used to clean unused code across the codebase with minimal configuration. The initiative [e18e](https://e18e.dev/) is an effort to simplify and modernize libraries, so check them out to learn about other tools or information on the topic.

Besides cleaning the list of all dependencies, there are also tools to help upgrade the codebase when migrating versions or libraries. These are usually written with [jscodeshift](https://github.com/facebook/jscodeshift), and some frameworks provide their own library of codemods to update versions, like [Next.js](https://www.npmjs.com/package/@next/codemod) and [Storybook](https://www.npmjs.com/package/@storybook/codemod).

If you need to change your own codebase, you can use **generative AI to build codemods**, so you can have reproducible scripts that can be applied to large codebases without problems.

---

## Items that didn't make the cut for this post

- Security
- Internalization
- Transpilation
- Persistent data storages on the client
- JS Runtimes (node, deno, bun, workerd)
- Router server strategies (backend-based vs frontend-based)

I might cover some of those in a detailed post in the future, but I had to leave it like that for my sanity and to match the 28/07 date :)

