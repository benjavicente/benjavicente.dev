---
title: Context in Web Frameworks
date: 2024-02-12
description: "Understanding how context is implementet, with a dependency injection approach."
---

## What is a “context”?


Context refers to information in witch something exists or occurs.
Usually, in web frameworks, it refers to information from the request or shared state, but also can be the general concept of how information is passed arround application components.

The specifics of how context is provided to users is usually different between frameworks, but exploring diferent frameworks, two pattens can be identified: wich I will be refering to as context bucket, and context injection.


## Context Bucket

ADD ANALOGY HERE

Here, the request context if passed directly as a handler **function arguments**, for more functional frameworks, or controller **entity attributes**, for more object oriented ones.
The framework build a context, and passs it as parameters to a user defined function or class.


For example, Express follows the functional approach.
It passes the `req` and `res` objects to the handler, each with their properties and utility methods.
Shared variables are [assigned to the `req` object directly][express-h].
Other frameworks, like [Fastify][fastify-h], [Koa][koa-h] and [Hono][hono-h] follow the same or similar pattern.

[express-h]: https://expressjs.com/en/guide/writing-middleware.html
[fastify-h]: https://fastify.dev/docs/latest/Reference/Hooks/#using-hooks-to-inject-custom-properties
[koa-h]: https://koajs.com#ctx-state
[hono-h]: https://hono.dev/api/context#var

```js
app.use((req, res, next) => {
  res.user = User.find(req.params.id);  // [!code highlight]
  next();
});

app.get("/<id>", (req, res) => {
  res.send(`Hello ${res.user}`)
});
```

Even a batteries-included framework, like [Django][django-h], follows that pattern, getting the `request` as an argument.
On the other side, in Rails, `request` and `response` (and derived objects like `params`) are [passed as  methods][rails-h] to the controller created for the request.

[django-h]: https://docs.djangoproject.com/en/5.0/topics/http/views/
[rails-h]: https://guides.rubyonrails.org/action_controller_overview.html#the-request-and-response-objects

```rb
class SomeController < ApplicationController
  before_action :get_user

  def index
    render plain: "Hello, #{@user.name}"
  end

  private

  def get_user
    @user = User.find(params[:userId])  # [!code highlight]
  end
end
```


---

It's not diferent on the UI component framework land.
A page component behaves as a handler, and the context is passed as props.
But here, some **problems of this type of context passing can be easily seen**.

One of them is **prop (or argument) drilling**, where a component needs to pass down props down multiple layers of components.
The equivalent in a request handler,
would be an utility function deep down the call stack that need information about the request.

```tsx
// [!code word:user]
export default function Page({ user }) {
  return (
    <main>
      <WelcomeMessage to={user.name} />
      <Menu for={user}/>
    </main>
  )
}
```

The page component in the previous example doesn't use the user prop.
But since it's needed somewhere else down `WelcomeMessage` and `Menu`, it needs to be passed down.
The deeper the dependency, the more coupling is created between components.


A second problem arrises because the bucket is shared.
Code interacting with it might endup with **multple unrelated responsabilities**.
For example, frameworks might provide a build step for the bucket, like Vue Options API's [`data`][vue-data], NextJS Pages's [`getServerSideProps`][getServerSideProps], and React Class Components's [`constructor`][react-constructor].

:::note
    In [Vue docs][vue-options], its mentioned that the old Options API provides "guard rails" that guide you to put your code into respective **buckets**. The `data` method could be considered a bucket in that sense.
:::

[vue-options]: https://vuejs.org/guide/extras/composition-api-faq.html#trade-offs


[getServerSideProps]: https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props
[vue-data]: https://vuejs.org/api/options-state.html#data
[react-constructor]: https://reactjs.org/docs/react-component.html#constructor

```tsx
export async function getStaticProps({ params }) {
  return {
    props: {
      user: User.find(params.userId),
      // ... other unrelated props
    }
  }
}
```

In this case, data is loaded in a single place.
That means, that every component that requires data (like the user) will need to register an apropiate loader in the same function as every other loader. So the `getStaticProps` wil end up been responsible for loading multiple unrelated things.

**Typing arguments** is a derived pain point caused by the shared bucket. When there's prop drilling, the prop should be types for all components in the middle. And when the bucket is shared,
the type is mixed with other unrelated types.



---

The cause of those problems **originates from composition and pipeline patterns** that surge naturally when processing information, specially in more funcitonal programing languages or frameworks.


For example, if a handle function calls A, A calls B, B calls C, and C needs context from A, the context needs to be passed from A to B, and from B to C. In this simple and more direct pipeline, the context is unecessary passed 2 times. In large and more complex pipelines, that number increases by a lot.

![Boxes showing a context been passed aroud like previouslly described](./ctx-bucket-pipeline.png)

```py
# [!code word:req]
def helper_c(req):
  print(f"Hello {req.user.name}")

def helper_b(req):
  return helper_c(req)

def helper_a(req):
  return helper_b(req)

def handler(req):
  req.user = User.find(req.params.userId)
  helper_a(req)
```

Note that **class based frameworks like Rails don't suffer from this**.
That's because those can take advantage of class based design patterns. The controller class could extend helpers classes (mixin) or use private methods, so the context would be available to helpers methods without manually passing it.

```rb
module ModuleC
  def helper_c
    puts "Hello, #{@user.name}"  # [!code highlight]
  end
end

module ModuleB
  include ModuleC

  def helper_b
    helper_c
  end
end

class Controller
  include ModuleB

  def initialize
    # Here, the context is added to the class instance # [!code highlight]
    @user = User.find(params[:userId]) # [!code highlight]
  end

  def index
    helper_a
  end

  @private

  def helper_a
    helper_b
  end
end
```

The code above feels more verbose, but assuming the helpers follow an opinated and predictable pattern for the entire application, the end result provides cleaner and more maintainable code thanks to lower coupling.

So the question is: **In functional based frameworks, is it posible to pass a the context arround without the problems mentioned before, and the depeloper experience that class based frameworks might provide?**

## Context Injection

The really stupid and more unmaintainable anwser would be to create a global variable and set it before calling the helper functions. It's easy, will not fail in traditional functions, and if it is only used in one place, it's secure enough.

```py
g = SimpleNamespace() # like a dict but with dot access

def helper_c():
  print(f"Hello {g.user.name}") # [!code highlight]

def helper_b():
  return helper_c()

def helper_a():
  return helper_b()

def handler(req):
  # Inyect the context (user) # [!code highlight]
  g.user = User.find(req.params.userId) # [!code highlight]
  helper_a()
  del g.user
```

![Boxes shiwing the Handler inyecting the context to a global store, and helper c consuming it](./ctx-global.png)

Somewhere, a function will be responsable for setting the context that other context might need. Here, it's the `handler` function, and inyects the `user` into a global variable.
This leads to less coupling, bacause helperdon't have the context as argument, and with more flexibility thanks to **function composition**:

```py {11,16}
from flask import Flask, request, r

app = Flask(__name__)

def get_user_id_from_path():  # [!code focus]
  return request.view_args["userId"]  # [!code focus]

def get_user():  # [!code focus]
  "Get the user, memoize it, and return it."  # [!code focus]
  if not g.user:  # [!code focus]
    g.user = User.find(get_user_id_from_path())  # [!code focus]
  return g.user  # [!code focus]

@app.route("/<userId>")
def handle():  # [!code focus]
  user = get_user()  # Just a function call # [!code focus]
  return f"Hello, {user.name}"  # [!code focus]
```

The previous example uses [Flask Context](https://flask.palletsprojects.com/en/3.0.x/appcontext/). The `get_user_id_from_path` function reads from the request, and `get_user` calls `get_user_id_from_path` (without arguments) and uses `g` for memoization.
Both function request to the context what they need, without having to pass it as an argument.

Using a global variable fels like an anti-pattern, that can easselly fall apart. The trick for this to work is to make it an accesor of a context that can be only be inyected by a specific, more private function. This is how Flask does it, with [contextvars][python-contextvars] and [proxy helper from werkzeug][werkzeug-proxy].

[python-contextvars]: https://werkzeug.palletsprojects.com/en/3.0.x/local/#werkzeug.local.LocalProxy
[werkzeug-proxy]: https://werkzeug.palletsprojects.com/en/3.0.x/local/#werkzeug.local.LocalProxy


In frontend land, the classic example is React's hooks.
Hooks works thanks to a context, to tracks hooks calls, that is inyected when the component is rendered and re-rendered (you can see [how that works here][how-react-hooks-works]).
This pattern makes decoupling more natural, because state works puerly by function composition.


[how-react-hooks-works]: https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e

```tsx
import { useState } from "react";

function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```



---

To understand how do build a system that can inyect the context in a secure way, a helfull exersice could be to try to replicate React's [`cache`][react-cache] function.
Thas function **memoizes the given function for the request** in server components.

[react-cache]: https://react.dev/reference/react/cache

```ts
type Fn<A, R> = (...a: A) => R;
const work = (message: number | string) => console.log(message);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
```

Ignoring considering arguments for memoization because it requires a tree structure out of the scope of this article for this problem.
The objective would be to make **memoize `work` by request** per request.
Implementing global memoization can be done easily with:


```ts
function once<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  let v: R | Symbol = Symbol();
  // If v is the sentry value, asign v to the result value
  // of the function, and return v. Otherwise, return v.
  return (...a) => (v === onceSentryValue ? (v = fn(...a)) : v);
}

const onceWork = once(work);
onceWork("this runs");
onceWork("but this doesn't");
```

The next step is to implement a mechanism to inyect before and clean the context
after a given request. Bacause the context should allways be cleaned, it's necesary to use `try`/`finally`. And since this would need to be repeated for every function, it better to wrap it in a function.

```ts
// Global store, to store the sentry value for each context
const contextStore: WeakMap<Symbol, any>[] = [];

function withCtx<R>(fn: () => R): R {
  // Inyect the necesary context to the global store
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

The inyect and cleanup steps could do something diferent.
In this case, a map is pushed to a global store stack when `withCtx` is called.
In the following `onceCtx` function, the map on top of the context store stack is used to store the memoized values.

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
  onceWorkPerContext(1);   // Will show 1
  otherWork();             // Memoized, will not show anything
  withCtx(() => {
    onceWorkPerContext(2); // Will show 2
  });
});

withCtx(() => {
  onceWorkPerContext(3);   // Will show 3
  withCtx(() => {
    otherWork();           // Will show "other"
    onceWorkPerContext(4); // Memoized, will not show anything
  });
});
```

---


This works in fully synchronous code, but real applications usuallly have callback patterns, async code and, in other languajes, threads.
Working with async or threads would require hooking into the event loop or the thread scheduler, so a build-in solution is the best option.

In Python, the `contextvars` module is build in in Python 3.7, and supports async code, threads and the avility to copy the context to be used in callbacks.
In the JS land, node version 16 and up exposes **`AsyncLocalStorage`** from the `async_hooks` module, that can be used to fix the async problem.

```ts
const asyncCtxStore = new AsyncLocalStorage<WeakMap<Symbol, any>>();
function withAsyncCtx<R>(callback: () => R): R {
  return asyncCtxStore.run(new WeakMap(), callback);  // [!code highlight]
}

function onceACtx<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  const key = Symbol();
  return (...args) => {
    const store = contextStore.at(-1);  // [!code --]
    const store = asyncCtxStore.getStore();  // [!code ++]

    if (!store) return fn(...args);

    if (store.has(key)) return store.get(key);

    const value = fn(...args);
    store.set(key, value);
    return value;
  };
}

const onceWorkPerAsyncContext = onceACtx(work);

await withAsyncCtx(async () => {
  onceWorkPerAsyncContext(1);  // This will show 1
  await wait(100);
  onceWorkPerAsyncContext(2);  // Memoized, will not show anything
});
```

This solution is dependant of this Node API, some other runtimes might implement it for compatibility, but it's not guaranteed. The [tc39 Async Context proposal][tc39-acp] (stage 2) will bring a standar API for the ecosistem, if the proposal is accepted to the ECMAScript standard.
Right now, the solution is not fully stable.


[tc39-acp]: https://github.com/tc39/proposal-async-context


---

For a more real-world example, imagine a handler should not be able to access the request directly, so getter functions like `headers` should be exported publicly. The private request object could be stored in the async context, and the getter functions could access it.


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
  formData.append("example", "formdata")

  const path = "random-path-generated-at-build-time";
  const r = new Request(`https://example.com/_rpc/${path}`, {
    headers: { example: "header" },
    body: formData,
  });

  requestStore.run(r, async () => action(await r.formData()));
}
```

Then, functions can be defined in userland code using the public getters.
The framework will inyect the request context before running the action.


```ts
import { headers } from "framework";

async function serverAction(form: FormData) {
  console.log(form);
  const headersStore = headers();
  console.log(headersStore);
}

run(serverAction); // Automatically handler by the framework
```

That's [how NextJS handles server actions][nextjs-sa]. NextJS uses stores to detect the context of where the `headers` getter is called, like the type of page or in a server action, and return the headers inyected by the mechanism that rendered the page.

[nextjs-sa]: https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/headers.ts#L36

This patter is available also in Nitro framework (used in Nuxt) with the [`experimental.asyncContext` flag, providing an workflow that matches Vue's Composition API][vue-ac] or signal based solutions.

[vue-ac]: https://nitro.unjs.io/guide/utils#experimental-composition-api

```ts
export default defineEventHandler(async () => {
  const user = await useAuth()
})

export function useAuth() {
  return useSession(useEvent())
}
```


## A third way?

There's a couple of frameworks that don't really fit the explicit context pattern mentioned above: FastAPI and NestJS. Both have in common an extremlly handy (and cursed) feature, that is, that those frameworks can detect what values the funcions need to be inyected from types.

```py
from fastapi import FastAPI, Path, Depends
from typing import Annotated
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str

def get_user(name: Annotated[str, Path(alias="userId")]):
    return User(name=name)

@app.get("/{userId}")
def handle(user: Annotated[User, Depends(get_user)]):
    return f"Hello, {user.name}"
```

```ts
import { Controller, Get, Injectable, Param } from '@nestjs/common';

@Injectable()
export class UserService {
  getUser(name: string) {
    return { name };
  }
}

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Get('/:userId')
  getHello(@Param('userId') userId: string): string {
    return `Hello, ${this.userService.getUser(userId).name}`;
  }
}
```





### Other Examples

#### Dependency Injection - FastAPI

```py
# FastAPI
@app.get("/")
def say_hello(name: str):
    return  {"message": f"Hello, {name}"}
```

#### Dependency Injection - VueJS


### Aditional material and references

- [Stack Overflow: The term “Context” in programing?](https://stackoverflow.com/q/6145091)
