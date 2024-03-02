---
title: Context in Web Frameworks
date: 2024-02-12
description: "Exploring diferent patterns of context passing in web frameworks"
---

## Some _context_

I was developing a API that responds to GitHub and Telegram webhooks, and I landed in code that looks like this:

```ts
import { Hono } from "hono";
import { Bot } from "grammy";
import { Webhooks } from "@octokit/webhooks";

const api = new Hono(...);
const telegram = new Bot(...);
const github = new Webhooks(...);

// Atach the handlers for every action
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
	// support passing valures to the handler!
	github.receive({ id, name, payload });
});
```

The 3 libraries, that map an input to a handler, differ in how they create and integrate the context to the handler! Even though they share similar router APIs.
I ended building my own GitHub webhook utility, and programing hacky workaround for connecting the Telegram bot to the API.

This led me to explore standars or patterns for passing context in web frameworks, and to write here my findings or thoughts about it.
Note that I'm not an expert, I learned JS in 2021.
Don't expect me to mention your favorite framework back in the day, or frameworks for every language.

## What is a context?

Context refers to information in witch something exists or occurs.
It can be information about a request, shared state, or the general concept of information that is shared between components.

The specifics of what it is or how is it implemented on code differs between frameworks. The general idea is that **it's just values used in components**.

It's important to note that it's diferent from a router and a handler or controller.
A router maps keys, like a request path, to a handler, a function that can access a context to do something. A controler can be considered a sigle or group of handlers.

Example of context can be:

- function arguments
- global values like environment variables
- the current request
- user's configuration

Also note that values of those decontexts can be derived, like a database connection from environment variables, or the current user from the request.

## Patterns

With that in mind, let's explore some different patterns that web frameworks use to pass context to handlers. Patterns are not mutually exclusive, a framework can use more than one.

### Context as a parameter (bucket)

```py
def handler(ctx: Ctx):
    print(ctx.value)
```

This is the simpler one: it´s just function parameters. Must of the time, this handler is tightly coupled to the router or underlying framework.

```js
const router = new Router();

router.get("/", (ctx) => {
	console.log(ctx.req.value);
});
```

This pattern is used on [ExpressJS][express], [Fastify][fastify], [Koa][koa], [Hono][hono] and [Django][django], where the context is passed as a parameter to the handler.

[express]: https://expressjs.com/en/starter/hello-world.html
[fastify]: https://fastify.dev/docs/latest/Guides/Getting-Started/#your-first-server
[koa]: https://koajs.com/#application
[hono]: https://hono.dev/top#hono
[django]: https://docs.djangoproject.com/en/4.0/intro/tutorial01/#write-your-first-view

The common decoupled version in JavaScript uses the [Request][request-wa] & [Response][response-wa] Web APIs, in web frameworks aimed to run in web-interopable runtimes (following [WinterCG] standards), like [NextJS][nextjs] or [SvelteKit][sveltekit] on [Cloudflare's Workers][cloudflare] or [Bun][bun] runtimes.

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

The avantage is that it's a standar, so it's a common interface that can be used by dirent runtimes or frameworks. The drawback is missing utilities commonly integrated with the context, like for working with headers or cookies.

The pattern also applies to user interface component libraries, like [React][react], [Vue][vue] and [Svelte][svelte], where context is passed as **props** to the component.

[react]: https://react.dev/learn/passing-props-to-a-component#step-2-read-props-inside-the-child-component
[vue]: https://vuejs.org/guide/components/props.html
[svelte]: https://svelte.dev/docs/svelte-components#script-1-export-creates-a-component-prop

```jsx
function MyComponent({ value }) {
	console.log(value);
}
```

{/* TODO: write *span with id* with directives */}

Another area where this patter applies is to <span id="data-loading">data loading or inicialization</span>, like in [`getServerSideProps`][getServerSideProps] in NextJS Pages Router, Vue Option API's [`data`][vue-data], and React Class Components [`constructor`][react-constructor].
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

The context as arguments can be considered as a **bucket**. Where every important value is put into it, and the handler can take what it needs.

:::note

In [Vue docs][vue-options], its mentioned that the old Options API provides "guard rails" that guide you to put your code into respective **buckets**. The `data` method could be considered a bucket in that sense.

[vue-options]: https://vuejs.org/guide/extras/composition-api-faq.html#trade-offs

:::

The drawbacks of using only this type of context passing are notoriuos, such that multiple frameworks even migrated to other patterns to provide better developer experience.

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

**Unrelated and coupled inicialization or loading**, is where multiple, unrelated responsabilities, need's to be passed to the same bucket representing the context. This can be caused by a bottleneck, that is, when multiple things need to be passed thought as the same context object.

The examples mentioned in [data loading](#data-loading) all migrated out of this problem. NextJS uses Server Components, Vue the Composition API, and React uses functional components and hooks, to decouple diferent unrelated data loading or state inicialization.

**Typing the context** inherits the problems mentioned above. Diferent unrelated types could be coupled to the context, witch might be required in deeply nested functions. Libaries with more support with Typescript, like [tRPC](https://trpc.io/) try to give a better DX around that, but without solving those problems.

### Context as an instance (controller)

```py
class Controller(BaseController):
    def handler(self):
        print(self.value)
```

Called usually by controller, this pattern creates a instance that will hold the context, and a method that will use it. Class based frameworks like [Rails][rails].
The gist of this patter is creating an instance that will hold the context, and a method that will use it.

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

    # Class macro pattern (dinamic method generation)
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

Excluding the controller code, that would be hidden in a framework, the code is incredibly simple and readable. Patterns like mixins, class macros, and template methods help to create a clear and reusable code.

The limits of this pattern are the limits of OOP in the language.
Rails shines thanks to Ruby, while JavaScript lacks good OOP support, specially with TypeScript (see [mixins in TS][ts-mixins]).

[ts-mixins]: https://www.typescriptlang.org/docs/handbook/mixins.html

One important consideration, is the OOP requires dicipline. I belive that it isn't considence that the creator ot Rails, [DHH][dhh], is known for his strong and sometimes radical opinions in software development. OOP is a path to hell if not used with knowledge (design patterns) and responsibility (SOLID).

[dhh]: https://dhh.dk/

### Context as a global (event)

```py
from global import ctx

def handler():
    print(ctx.value)
```

### Context as a dependency (inyection)

```py
def handler(value: Annotated[Value, getValue]):
    print(value)
```

## Conclusion

## Aditional notes

- While Django has [class-based views](https://docs.djangoproject.com/en/5.0/topics/class-based-views/intro/), and Nest uses [class based-controllers](https://docs.nestjs.com/controllers#request-object), the request is not passed to the instance by default, so i don't consider them as context as an instance.
