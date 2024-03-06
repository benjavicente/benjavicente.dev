---
title: Context in Web Frameworks
date: 2024-03-05
description: "Exploring different patterns of context passing in web frameworks"
---

## Some _context_

I was developing a simple API that responds to GitHub and Telegram webhooks, and I landed in code that looks like this:

```ts
import { Hono } from "hono";
import { Bot } from "grammy";
import { Webhooks } from "@octokit/webhooks";

const api = new Hono(...);
const telegram = new Bot(...);
const github = new Webhooks(...);

// Attach the handlers for every action
api.on("GET", "/", (ctx) => ...)
telegram.on("message", (ctx) => ...)
github.on("push", (ctx) => ...)
```

Developing each one separately was easy, with even great TypeScript support!
But when the time came to integrate them, it felt like a mess.
And annoyingly, the problem lied in the assumption of how each component is called and how the context is passed.

```ts
api.on("POST", "/telegram", (ctx) => {
	// This method is marked as internal
	telegram.handleUpdate(await ctx.req.json());

	// Bindings to the ctx can't be passed
	// directly, so a middleware is needed
	telegram.use((telegramCtx) => {
		ctx.env = telegramCtx.env;
	});
	// for simplicity, the middleware is
	// added on every request (don't do this)
});

api.on("POST", "/github", (ctx) => {
	// The GitHub Webhooks library doesn't
	// support passing values to the handler!
	github.receive({ id, name, payload });
});
```

The 3 libraries, that map an input to a handler, differ in how they create and integrate the context to the handler! Even though they share similar router APIs or patterns.
I ended building my own GitHub webhook utility, and programming hacky workaround for connecting the Telegram bot to the API.

This led me to explore standards or patterns for passing context in web frameworks.
It's common to heard patterns from object oriented programming, the intricacies of functional programming, or principles in software development.
**But what about patterns for passing “context” around?**

Passing information around in a application is a basic common need in software development, an it surprises me that nowhere I have seen different patterns categorized or explored in my (little) years of software development.

Here a write my thoughts and findings of weeks of research and exploration of different web frameworks, trying to categorize, explain, and show some notorious advantages and disadvantages.

Note that I'm not an expert: I learned programming 5 years ago, and haven't started working professionally yet.
Don't expect me to mention your favorite framework back in the day, or a non popular language.

:::note
This post isn't as ordered as it could be, and I will leave it as is, because, it's an exploration post ‾\\\_(ツ)\\\_/‾
:::

## What is a context?

Context can be interpreted as information in witch something exists or occurs.
It can be information about a request, shared state, or the general concept of information that is shared between components. Information can be
implicit or explicit, derived from other information or be on it's own.

For example, when reserving a sports court, one will have the date and time, the facilities will have the available courts, and there's the weather forecast to check if it is appropriate to play. That's context for making the action of reserving a court.

In code, the specifics of what it is or how is it implemented differs between frameworks. The general idea is that **it's just values used in components**, like values in some sort of handler to make an action.

It's important to note that it's different from a router and a handler or controller.
A router maps keys, like a request path, to a handler, a function that can access a context to do something. Example of context in programming are:

- Function arguments
- Global values like environment variables
- The current request
- User's configuration

Also note that values of those contexts can be derived, like a database connection from environment variables, or the current user from the request.

:::note
I will consider arguments as context, even when there aren't really contextual
:::

## Patterns

With that in mind, let's explore some different patterns that web frameworks use to pass context to handlers. Patterns are not mutually exclusive, a framework can use more than one. In the beginning of each one, is a minimal Python example that encapsulates the idea of the pattern.

### Context as a parameter (bucket)

```py
def handler(ctx: Ctx):
    print(ctx.value)
```

This is the simpler one: it's just function arguments, a fundamental building block of programming.

Web frameworks, must of the time, have some type of handler tightly coupled to the router or underlying framework, using a namespace of object to store everything that is needed.
This is done on [Express][express], [Fastify][fastify], [Koa][koa], [Hono][hono] and [Django][django].

```js
const router = new Router();

router.get("/", (ctx) => {
	console.log(ctx.req.value);
});
```

[express]: https://expressjs.com/en/starter/hello-world.html
[fastify]: https://fastify.dev/docs/latest/Guides/Getting-Started/#your-first-server
[koa]: https://koajs.com/#application
[hono]: https://hono.dev/top#hono
[django]: https://docs.djangoproject.com/en/4.0/intro/tutorial01/#write-your-first-view

The common decoupled version in JavaScript uses the [Request][request-wa] & [Response][response-wa] Web APIs, in web frameworks aimed to run in web-interoperable runtime (following [WinterCG] standards), like [NextJS][nextjs] or [SvelteKit][sveltekit] on [Cloudflare's Workers][cloudflare] or [Bun][bun] runtimes.

[request-wa]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[response-wa]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[wintercg]: https://wintercg.com/standards
[nextjs]: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
[sveltekit]: https://kit.svelte.dev/docs/routing#server
[cloudflare]: https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/
[bun]: https://bun.sh/docs/api/http

```js
function fetch(request: Request) {
  console.log((await request.json()).value);
}
```

The advantage is that it's a standard, so it's a common interface that can be used by dirent runtime or frameworks. The drawback is missing utilities commonly integrated with the context, like for working with headers or cookies.

The pattern also applies to user interface **component** libraries, like [React][react], [Vue][vue] and [Svelte][svelte], where context is passed as **props** to the component.

[react]: https://react.dev/learn/passing-props-to-a-component#step-2-read-props-inside-the-child-component
[vue]: https://vuejs.org/guide/components/props.html
[svelte]: https://svelte.dev/docs/svelte-components#script-1-export-creates-a-component-prop

```jsx
function MyComponent({ value }) {
	console.log(value);
}
```

Another area where this patter applies is to <span id="data-loading">data loading or initialization</span>, like in [`getServerSideProps`][getServerSideProps] in NextJS Pages Router, Vue Option API's [`data`][vue-data], and React Class Components [`constructor`][react-constructor].
In each of the previous examples, the context is builded to be passed to a handler.

[getServerSideProps]: https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props
[vue-data]: https://vuejs.org/api/options-state.html#data
[react-constructor]: https://reactjs.org/docs/react-component.html#constructor

```ts
export async function getStaticProps({ params }) {
	return {
		props: {
			user: User.find(params.userId),
			// ... other unrelated props
		},
	};
}
```

The context as arguments can be considered as a **bucket** in all examples above. A bucket where every important value is put into it, and the handler can take what it needs.
The context can be passed to other components that need some values from it.

:::note

In [Vue docs][vue-options], its mentioned that _the old Options API provides "guard rails" that guide you to put your code into respective **buckets**_. The `data` method in the could be considered a bucket builder in that sense, that initialized everything for the bucket.

[vue-options]: https://vuejs.org/guide/extras/composition-api-faq.html#trade-offs

:::

---

This type of context passing is ideal for simple functions and medium applications, where the parameters are few and coupled with the responsibility of the component that receives it.

The drawbacks of this pattern arriases when the application grows, and more context passing is needed to create the desired handler.

**Argument or prop drilling**, is where a value of a context if needed in a deeply nested function, it must be passed through all the intermediate functions. Passing values that aren't used in a function couples more the function to the context, making it more complex.

```ts
// [!code word:ctx]
// Helper C only needs name
function helperC(ctx: { name: string }) {
  console.log(ctx.name);
}

// Helper B and C might need other values from
// the context, but not name
function helperB(ctx: { name: string, ... }) {
  helperC(ctx);
}

function handlerA(ctx: { name: string, ... }) {
  helperB(ctx);
}

function handler(ctx: { name: string, ... }) {
  helperA(ctx);
}
```

Imagine if a database connection, user preferences, a logger instance, or other more general available value is needed deep in the application.
Passing those values with this pattern would be far from ideal.

**Unrelated and coupled initialization or loading**, is where multiple, unrelated responsibilities, need's to be passed to the same bucket representing the context. This can be caused by a bottleneck, that is, when multiple things need to be passed thought as the same context object.

The examples mentioned in [data loading](#data-loading) all migrated out of this problem. NextJS uses Server Components, Vue the Composition API, and React uses functional components and hooks, to decouple different unrelated data loading or state initialization.

**Typing the context** inherits the problems mentioned above. Different unrelated types could be coupled to the context, witch might be required in deeply nested functions. Libraries with more Typescript support, like [tRPC](https://trpc.io/), try to give the best DX around that, but one might still end with the problems mentioned above.

### Context as an instance (controller)

```py
class Controller(BaseController):
    def handler(self):
        print(self.value)
```

Called usually by controller, this pattern **creates a instance that will hold the context**, and a method that will use it.

[rails]: https://rubyonrails.org/

[Rail's Action Controller][rails-ac] and other class based frameworks like [AdomisJS][adonis-c] use this pattern, where class based techniques are used to compose steps that will be executed in a request. For example:

[rails-ac]: https://guides.rubyonrails.org/action_controller_overview.html#methods-and-actions
[adonis-c]: https://docs.adonisjs.com/guides/controllers

```rb
class AppController
  @before_all_methods = []

  def initialize req
    @req = req
    before_all_methods.each do |method|
      send method
    end
  end

  def self.before_all *methods
    # This should create or override a method
    # https://github.com/rails/rails/blob/main/actionpack/lib/abstract_controller/callbacks.rb#L228
    @before_all_methods = methods
  end

  private

  # Private methods only used by this class
  def before_all_methods
    self.class.instance_variable_get(:@before_all_methods)
  end
end

module Auth
  def user_name
    @req[:name]
  end

  def require_username
    raise "No username" unless @req[:name]
  end
end

class ExampleController < AppController
  # Mixin or concern pattern (include methods)
  include Auth

  # Class macro pattern (dynamic method generation)
  before_all :require_username

  # Template method pattern
  def index
    say_hi
    say_welcome
  end

  def say_hi
    puts "Hi!"
  end

  def say_welcome
    puts "Welcome #{user_name}!"
  end
end

req = {name: "John"}
controller = ExampleController.new(req)
response = controller.index
```

Excluding the controller code, that would be hidden in a framework, the code is incredibly simple and readable. Patterns like mixins, class macros, and template methods help to create **clear, reusable and uncoupled code**.

The limits of this pattern are the limits of OOP in the language.
Rails shines thanks to Ruby, while JavaScript lacks good OOP support, specially with TypeScript (see for example [mixins in TS][ts-mixins]).

[ts-mixins]: https://www.typescriptlang.org/docs/handbook/mixins.html

One important consideration, is the OOP requires discipline. I believe that it isn't coincidence that the creator ot Rails, [DHH][dhh], is known for his strong and sometimes radical opinions in software development. OOP is a path to hell if not used with knowledge (design patterns) and responsibility (SOLID).

[dhh]: https://dhh.dk/

### Context as a global (singleton, event)

```py
from lib import ctx

def handler():
    print(ctx.value)
```

Here, some global value, object or function is used to hold context.

The common use case for this type of pattern is in **singleton-like objects**, like database connections, environment variables, loggers, or other sort of global state.

Another use case is **event and state management**. Most UI frameworks store a global variable hidden from the user, and exposes functions to work with it.
For example, React's `useState`, that works by using a private global variable to determine the current component, and the `use*` functions to work with it.

```jsx
import { useState, useCallback } from "react";

function useCounter() {
	const [count, setCount] = useState(0);
	const increment = () => setCount(count + 1);
	return [count, increment];
}

function Counter() {
	const [count, increment] = useCounter();
	return <button onClick={() => increment()}>The current count is {count}</button>;
}
```

In backend frameworks, a popular example is [Flask]. Flask uses a request context to track request-level data during a request, that is accessed by using a proxy. This works works with the same principles as showed in the React example, the request information is added to a global variable, and then, the handler is called.

[flask]: https://flask.palletsprojects.com/en/2.0.x/

```py
from flask import request

app = Flask(__name__)

def get_username():
    return request.args.get('username')

@app.route('/')
def index():
    return f"Hello, {get_username()}!"
```

This allows **high levels of composition without coupling**.
With primitives like hooks in react, and the request context in flask, values can be accessed without coupling the caller to the callee, like in the context as a parameter pattern.

As mentioned before, multiple frameworks, like React and Vue, migrated data loading or initialization, to this pattern for better composability and decoupling.

The mix of this pattern with some sort of dependency injection, **can solve argument or prop drilling**.
That is, providing a “context”, that uses techniques in this pattern, that can be injected deep in the call or component tree, without passing it through all the intermediate functions.

---

A good implementation of this pattern might require **advanced language features** not commonly used. Sure, a simple implementation could use a simple global variable, but that will not scale or work for complex use cases.

To understand this, let's implement a function similar to React's [`cache`][react-cache], that memoizes the result of a function in a given request. I will ignore the arguments in the memoization, since it's out of the scope of what I want to show.

[react-cache]: https://react.dev/reference/react/cache

```ts
type Fn<A, R> = (...a: A) => R;
const work = (message: number | string) => console.log(message);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function once<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
	let v: R | Symbol = Symbol();
	// If v is the sentry value, assign v to the result value
	// of the function, and return v. Otherwise, return v.
	return (...a) => (v === onceSentryValue ? (v = fn(...a)) : v);
}

const onceWork = once(work);
onceWork("this runs");
onceWork("but this doesn't");
```

The `once` functions memoizes the result of the function, so it's only called once. The next step is to add a mechanism to inject context when a function is called and clean it after. To avoid `try`/`finally` repetition, a wrapper (or decorator) is needed.

```ts
// Global store, to store the sentry value for each context
const contextStore: WeakMap<Symbol, any>[] = [];

function withCtx<R>(fn: () => R): R {
	// Inject the necessary context to the global store
	contextStore.push(new WeakMap());
	try {
		// Run the given function
		return fn();
	} finally {
		// Clean the context even if the function throws
		contextStore.pop();
	}
}
```

This uses a call stack store, similar to the call stack in a programming language, to store the context for each function call, but could use other mechanisms.
Now, a memoization with that context can be implemented.

```ts
function onceCtx<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
	// Unique key per call to once
	const key = Symbol();
	return (...args) => {
		// Get the last ctx pushed to the global store
		const store = contextStore.at(-1);
		// Run the function if there's no ctx
		if (!store) return fn(...args);
		// If the ctx has has the key, it's memoized, return it
		if (store.has(key)) return store.get(key);
		// Otherwise, memoize the result and return it
		const value = fn(...args);
		store.set(key, value);
		return value;
	};
}

const onceWorkPerContext = onceCtx(work);

const otherWork = () => onceWorkPerContext("other");

withCtx(() => {
	onceWorkPerContext(1); // Will show 1
	otherWork(); // Memoized, will not show anything
	withCtx(() => {
		otherWork(); // Will show "other"
		onceWorkPerContext(2); // Memoized
		onceWorkPerContext(3); // Memoized
	});
});
```

This works with fully synchronous code, but it's not enough for asynchronous code or threads in another languages.
When an async function is called, it's added to a queue to be executed in a new call stack, so the context is lost.

The solution is to hook into runtime APIs. In Python, the stdlib [contextvars][contextvars], used by Flask, supports threads and async code, and in JavaScript, [AsyncLocalStorage][als] from node and the [AsyncContext][acontext] tc39 proposal. Using AsyncLocalStorage, to solution would be:

[contextvars]: https://docs.python.org/3/library/contextvars.html
[als]: https://nodejs.org/api/async_context.html#class-asynclocalstorage
[acontext]: https://github.com/tc39/proposal-async-context

```ts
const asyncCtxStore = new AsyncLocalStorage<WeakMap<Symbol, any>>();
function withAsyncCtx<R>(callback: () => R): R {
	return asyncCtxStore.run(new WeakMap(), callback); // [!code highlight]
}

function onceACtx<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
	const key = Symbol();
	return (...args) => {
		const store = asyncCtxStore.getStore(); // [!code highlight]

		if (!store) return fn(...args);

		if (store.has(key)) return store.get(key);

		const value = fn(...args);
		store.set(key, value);
		return value;
	};
}

const onceWorkPerAsyncContext = onceACtx(work);

await withAsyncCtx(async () => {
	onceWorkPerAsyncContext(1); // This will show 1
	await wait(100);
	onceWorkPerAsyncContext(2); // Memoized, will not show anything
});
```

For a more real-world example, imagine that in a framework, request handlers should not access the request directly, so getter functions like `headers` should be available. The request object could be stored in an async context, and the getter functions could access it.

```ts
const requestStore = new AsyncLocalStorage<Request>();

// Public getter functions
export function headers(): Headers {
	const store = requestStore.getStore();
	if (!store) return new Headers();
	return store.headers;
}

// Internal for the framework
function run(action) {
	const formData = new FormData();
	formData.append("example", "formdata");

	const path = "random-path-generated-at-build-time";
	const r = new Request(`https://example.com/_rpc/${path}`, {
		headers: { example: "header" },
		body: formData,
	});

	requestStore.run(r, async () => action(await r.formData()));
}
```

Then, functions in userland code can be defined as:

```ts
import { headers } from "framework";

async function serverAction(form: FormData) {
	console.log(form);
	const headersStore = headers(); // [!code highlight]
	console.log(headersStore);
}

run(serverAction); // Automatically called by the framework
```

That's [how NextJS handles server actions][nextjs-sa]! NextJS uses stores to detect the context of where the `headers` getter is called, like the type of page or in a server action, and return the headers injected by the mechanism that rendered the page.

[nextjs-sa]: https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/headers.ts#L36

The [experimental feature][nitro-ac] in [Nitro][nitro], the web server that powers [Nuxt][nuxt] and [Solid Start][solid-start] (via [Vinxi][vinxi]), follows this pattern and has similar implementaron. The stable version needs to pass around an event object to provide the same functionality.

[nitro]: https://nitro.unjs.io
[nitro-ac]: https://nitro.unjs.io/guide/utils#experimental-composition-api
[nuxt]: https://nuxtjs.org/
[solid-start]: https://solidstart.dev/
[vinxi]: https://vinxi.vercel.app/

This pattern work similar to the context as a instance pattern. The `self` or `this` are implicit thanks to a global store, and some of the same patterns, like template method, can be used. So this pattern might as well require discipline and sufficient knowledge to be used properly.

### Context as dependencies (injection)

```py
def handler(value: Annotated[Value, getValue]):
    print(value)
```

This might seem as the same as the context as a parameter pattern. The difference is that here, there's an underlying mechanism that gives only values that the handler declares as needed.

```py
required_values = inspect(handler)
values = ctx.only(required_values)
handler(values)
```

This pattern powers [FastAPI][fastapi-di], and is used in frameworks like [NestJS][nestjs-di].

[fastapi-di]: https://fastapi.tiangolo.com/tutorial/dependencies/
[nestjs-di]: https://docs.nestjs.com/providers#dependency-injection

:::note

I find funny that FastAPI in Python, and NextJS in TypeScript, both read type annotations **at runtime**, event thought they aren't typed languages.

- Python annotations [started as a way to document a function](pep-3107) and now used to **inject dependencies** and other metaprogramming magic.
- TypeScript types aren't supposed to be read in runtime, but when certain conditions are met ([`emitDecoratorMetadata`][ts-dec-meta]), the type is available, so NestJS and [TypeORM][type-orm] took advantage.

[pep-3207]: https://peps.python.org/pep-3107/
[ts-dec-meta]: https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata
[type-orm]: https://typeorm.io/

:::

The implementation of this pattern is complex and out of scope of this article.
It might require specific languages features or a complex annotation system, and to build a dependency graph to analyze and provide the values.

One of the main advantages that I observed was **static analysis**.
At declaring the required types, FastAPI and NestJS will inject them, and even provide utilities thanks to that information, like OpenAPI documentation in FastAPI and NestJS Devtools.

The disadvantage come from the limits of the injection mechanism.
The order of execution could be more implicit that desired.
Also, there might be limits on where this smart dependency injection can be used,
for example, in FastAPI, it can only be usen in path operations and it's dependencies.

## Conclusion

I found 4 types of patterns of passing context:

- As a **parameter**, like in most express-like frameworks, where most of information is passed thought a `ctx` object. The main problems are argument drilling and unrelated and coupled initialization.
- As an **instance**, like in Rails. It allows clear, reusable and uncoupled code, with the limitations been the limits of OOP in the language.
- As a **global-like**, like global singletons or frameworks like Flask, React and Nitro. The implementation is usually complex, but it's hidden complexly from the user. Has similar capabilities to the instance pattern.
- As **dependencies**, like in FastAPI. Might provide great DX thanks to static analysis and utilities, but might have stricter limits on how it can be used.

Passing as information as arguments is a fundamental part of programming, but when applications grows, it's important to consider alternatives for key information.

Instance based with OOP frameworks has thrived along the years, like Rails, and the showed advantages show why.
Modern JS frameworks might opt to new and, more experimental, global-like patterns thanks to limitations in JS OOP and the raise of function based composability.

Declaring the required dependencies can provide solutions and utilities. Like `useContext` in React, where the values are injected thanks to a global-like mechanism. Or FastAPI automatic OpenAPI documentation.
Used in conjunction with other patterns, it could be powerful.

I had joy making the Rails-like example, using Flask as it where some sort of React component or hook, thanks to the global-like context pattern, and making the React `cache`-like function.

Steeping outside of what a framework provides, or the usual argument passing for every function, led me to see other posibilites to pass context around a complex application, without been to tied to a router or framework.

## Adicional notes

- While Django has [class-based views](https://docs.djangoproject.com/en/5.0/topics/class-based-views/intro/), and Nest uses [class based-controllers](https://docs.nestjs.com/controllers#request-object), the request is not passed to the instance by default, so I don't consider them as context as an instance.
- I read Keaton Brandt's [“Context: The missing feature of Programming Languages”](https://medium.com/source-and-buggy/context-the-missing-feature-of-programming-languages-7c1095fe8d32). It's focus is more on compiled languages and the global context that I mentioned. The linked articles and research focus more on programming language theory.
