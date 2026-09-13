---
title: The path to great Angular subscriptions
date: 2026-09-13
description: How to properly subscribe to an external store in Angular
---

This was the path I took while learning about how to properly do subscriptions in Angular, for adapting external libraries. You can see my full explorations in [this repository](https://github.com/benjavicente/angular-sub). While that code was made with the help of AI, the general exploration and this post are not (exluding finding typos).

---

Web applications mostly rely on subscriptions, like state management changes or keyboard events. Usually that is easy to integrate when the system only relies on event propagation, which is usually not the case.

For example, listening to the bounding box of an element:

```ts
// Get value
const rect = element.getBoundingClientRect();
console.log(rect.width);

// Subscribe
const observer = new ResizeObserver(() => {
  const newRect = element.getBoundingClientRect();
  console.log("changed to:", newRect.width);
});
observer.observe(element);

// Unsubscribe
observer.disconnect();
```

To generalize, we can declare a `Store` interface that includes what matters for this post:

```ts
// Generic types
type CallbackFn = () => void;
type UnsubscribeFn = () => void;

interface Store<T> {
  get(): T;
  subscribe(callback: CallbackFn): UnsubscribeFn;
}

// The store depends on a given element
function createElementRectStore(element: HTMLElement): Store<Rect> {
  return {
    get: () => element.getBoundingClientRect(),
    subscribe: (callback) => {
      const observer = new ResizeObserver(() => void callback());
      observer.observe(element);
    },
  };
}
```

## How do we connect this in Angular?

### Direct subscription & Update

A simple first approach one could take to integrate that store into Angular would be to subscribe directly and update a signal when the value changes:

```ts
function injectElementRect(element: HTMLElement) {
  const store = createElementRectStore(element);
  const rectSignal = signal(store.get());
  store.subscribe(() => {
    rectSignal.set(store.get());
  });
  return rectSignal;
}
```

### Direct subscription & Derive

In some cases, like rects, we usually care about a _slice_ of the state, not the entirety of it. We could add a second parameter that is a function that transforms the rect into the shape we want, like this:

```ts
function injectElementRect<T>(
  element: HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  const store = createElementRectStore(element);
  const valueSignal = signal(select(store.get()));
  store.subscribe(() => {
    valueSignal.set(select(store.get()));
  });
  return valueSignal;
}
```

Works great if the select function is like this:

```ts
injectElementRect(el, (rect) => rect.width);
```

But what if it depended on a reactive value?

```ts
injectElementRect(el, (r) => (useWidth() ? r.width : r.height));
```

There, `useWidth` is a signal that could change.
Since we call that function during construction and in the subscription callback, changing the value of `useWidth` will not update the signal our helper returns.

We can use `computed` to do the transformation while tracking the dependencies, like this:

```ts
function injectElementRect<T>(
  element: HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  const store = createElementRectStore(element);
  const rectSignal = signal(store.get());
  store.subscribe(() => {
    rectSignal.set(store.get());
  });
  return computed(() => select(rectSignal()));
}
```

### Effect subscription & Derive

One limitation Angular has is around when some things are initialized.
If you look at a component with some required attributes:

```ts
@Component(...)
export class Example {
  elementRef = viewChild.required<ElementRef>('el');
  value = input.required()

  constructor() {
    console.log(this.elementRef(), this.value())  // Throws!
  }
}
```

With a class-based architecture, Angular can't know beforehand the values of `elementRef` and `value`, so it throws if those are read during construction.
The trick is to use the reactive system, like with computed or effects, or with lifecycle hooks like `ngOnInit` (but the latter is usually discouraged today).

So instead of subscribing on initialization, an effect can be used:

```ts
function injectElementRect<T>(
  // Element is now a function that returns the element,
  // since now it supports signals that are initialized later
  element: () => HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  // Trick to create the store on first read
  const storeSignal = computed(() =>
    createElementRectStore(untracked(element)),
  );

  // Linked signals can be set and are initialized
  // with a function, so we can safely call storeSignal
  // without initializing element too early
  const rectSignal = linkedSignal(() => storeSignal().get());

  effect((onCleanup) => {
    // The values are initialized by Angular before effects run
    const store = storeSignal();
    const unsubscribe = store.subscribe(() => {
      rectSignal.set(store.get());
    });
    onCleanup(unsubscribe);
  });

  return computed(() => select(rectSignal()));
}
```

### Effect subscription & Invalidate

One readability issue with the last implementation is that we have 2 places where `get` is called, and the select is in another place even though it is heavily related to the obtained store value. An alternative approach is to invalidate instead of update and derive, like this:

```ts
function injectElementRect<T>(
  element: () => HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  // Store declaration
  const storeSignal = computed(() =>
    createElementRectStore(untracked(element)),
  );

  // Subscription management
  const currentVersion = signal(0);
  effect((onCleanup) => {
    const store = storeSignal();
    const unsubscribe = store.subscribe(() => {
      currentVersion.update((v) => v + 1);
    });
    onCleanup(unsubscribe);
  });

  // Obtaining the current value
  return computed(() => {
    currentVersion();
    return select(storeSignal().get());
  });
}
```

That also gets us a small benefit: `store.get()` is only called when the returned signal is read, not when the store changes.

### Subscribe on read

I wanted to push subscriptions further by supporting subscribe-on-read. For example, this use case, where the store and subscription depend on an input signal, and there are methods with side effects:

```ts
@Component(...)
export class Example {
  multiplier = input.required<number>() // Starting at 2

  // { count: Signal, next: () => void }
  counter = injectCounter(this.multiplier)

  ngOnInit() {
    // Internal value (1) * multiplier (2) = 2
    console.log(this.counter.count())
    // Calls subscriptions, internal value changes to 2
    this.counter.next()

    // Should be 2 * 2, but we haven't subscribed yet!
    // It does not know that the internal value has changed
    console.log(this.counter.count())
  }
}
```

In the explorations I did, I managed to create a nice API for it. The core idea is to use signal pulls to see when the subscription should be initialized. The important part of the code was:

```ts
function injectCounter(multiplier: (n: number) => number) {
  const counterStore = createCounterStore();

  // Subscription management
  const currentVersion = signal(0);
  let cleanup: undefined | Cleanup = undefined;
  function retire() {
    cleanup?.();
  }
  // The real code for this is larger,
  // mainly for handling edge cases,
  // but the core idea is the same
  function reconcile() {
    const store = counterStore();
    const cleanup = store.subscribe(() => {
      currentVersion.update((v) => v + 1);
    });
  }
  owner.onDestroy(() => {
    retire();
  });
  const connected = computed(() => {
    untracked(() => reconcile());
  });

  const count = computed(() => {
    // Pull connection, it will not run again if it isn't dirty,
    // so it's safe to call it unconditionally
    connected();

    currentVersion();
    return select(counterStore.get());
  });

  return { count, next: counterStore.next() };
}
```

The DX of how this ends up working is amazing, since the signal returned is in complete sync with the value from the store, making it feel like it is using native Angular signals for the state source. And it can go beyond that, like syncing extra information into the store immediately instead of waiting for synchronization with effects (like with `setOptions`-like APIs).

The issue is that subscriptions usually imply side effects. For example, for data fetching, this might involve starting a request on the first subscriber. So in computed signals, you can end up with incorrect state:

```ts
// Whether any query is fetching
const anyFetching = injectIsFetching();
// Subscribes to a query, starting a fetch
const myQuery = injectQuery();

computed(() => {
  return {
    // Will indicate that it is NOT fetching
    isFetching: anyFetching(),
    // Will indicate that it IS fetching
    queryState: myQuery().state,
  };
});
```

This happens because the `myQuery()` call will initialize the fetch after the value of `anyFetching()` was read, creating inconsistent state, especially considering that both of those helpers might consume the same state underneath.

So while the DX is great for 90% of use cases that I see, producing invalid state for the rest is not acceptable.

### Invalidate on initialization

One of the improvements that subscribe-on-read has is that the subscription happens before the value is read, so those values can't get out of sync.
If we consider the effect alternative, we can end up in a case like this:

```ts
@Component(...)
export class Example {
  multiplier = input.required<number>() // Starting at 2

  #prevEffect = effect(() => {
    this.counter.next()
  })

  // { count: Signal, next: () => void }
  counter = injectCounter(this.multiplier)

  ngOnInit() {
    // Assuming we read the value somewhere before the effect,
    // so the signal was pulled before the last effect
    this.counter.count()

    this.counter.next()
  }

  constructor() {
    effect(() => {
      // Internal value is correctly updated to 3, but
      // the subscription wasn't connected when those 2
      // updates happened, leaving the signal out of date
      console.log(this.counter.count())
    })
  }
}
```

There is a gap between when the signal is first read and when the subscription happens, and if the value changes there, the signal gets out of sync.

The trick is to invalidate when the subscription initializes, making the signal dirty if it has been read before.

```ts
function injectElementRect(...) {
  // ...

  const currentVersion = signal(0);
  effect((onCleanup) => {
    const store = storeSignal()
    const unsubscribe = store.subscribe(() => {
      currentVersion.update(v => v + 1)
    })
    onCleanup(unsubscribe)

    // Invalidate immediately
    currentVersion.update(v => v + 1)
  })

  return computed(() => {
    // Computed will be marked as dirty, so next
    // pulls will get the updated value if it changed
    currentVersion()
    return select(storeSignal().get())
  });
}
```

This will not generate a flash in the template since the template reads the values after all effects have run.

### Reactive stores and a generic API

The remaining step was to find a generic API that doesn't feel weird. The clear inspiration for it was React's `useSyncExternalStore`, which has the following arguments:

- `getSnapshot`, called to get the initial value or whenever the subscription notifies a change with the callback.
- `subscribe`, which registers the subscription and calls the callback when it changes.

The function detects if `subscribe` is a different function in each render, and if so, it cleans up the past subscription and creates a new one with the new passed function. In Angular, that would look like this:

```ts
function injectSyncExternalStore<T>(
  subscribe: () => (callback: CallbackFn) => UnsubscribeFn,
  getSnapshot: () => T,
) {}

injectSyncExternalStore(
  () => storeSignal().subscribe,
  () => storeSignal().get(),
);
```

There you can see that we are repeating the call to `storeSignal` in each argument, and that `subscribe` might be harder to follow, especially if you consider the case when the store changes, or if you include a way to deactivate the subscription.

```ts
injectSyncExternalStore(
  () => (isActive() ? storeSignal().subscribe : noop),
  () => storeSignal().get(),
);
```

Since the store signal is shared, and we can assume that if the store itself changes, it should change the subscription, we can do something like this:

```ts
function injectExternalStore<T>(
  binding: () => {
    getSnapshot: () => T;
    subscribe: (callback: CallbackFn) => UnsubscribeFn;
  },
) {}

injectExternalStore(() => {
  const store = storeSignal();
  return {
    getSnapshot: () => store.get(),
    subscribe: (callback) => store.subscribe(callback),
  };
});
```

The effect that subscribes will clean up the past subscription and invalidate to get the new value:

```ts
const invalidate = () => untracked(() => version.update((v) => v + 1));

effect((onCleanup) => {
  const current = binding();
  untracked(() => {
    const unsubscribe = current.subscribe?.(invalidate);
    onCleanup(unsubscribe);
    invalidate();
  });
});

const value = computed(() => {
  version();
  return binding().getSnapshot();
});
```

### One or many helpers?

The API is great, but it is only really necessary if the subscription needs to be delayed.
In the cases where that isn't necessary, should we use that helper or subscribe directly?

This isn't as direct as the correctness issue with subscribe-on-read, and my opinion of it is that subscriptions should all behave consistently in the same library, so while it might be simpler not to use that helper and maybe more performant, having the same timing for all subscriptions would be preferred in a library.

## Main learnings for Angular subscriptions

1. To consume stores that might depend on required input signals or view queries, **the store should be accepted as a function** (signal) to lazily initialize it on first read.
2. Transformation of the subscription can't happen on change since those would miss reactivity, so **invalidation or an extra computed** is needed.
3. **Subscribe-on-read can introduce incorrect behaviour** in computed signals with subscriptions that generate side effects, which is unacceptable.
4. Subscribe-on-effects needs to **invalidate immediately on subscription** if there is a change between the signal creation and the effect subscription.
5. **Effects give us subscription swapping for free**, for example, if we want to stop the subscription or change the store dynamically.
6. **The same subscription mechanism** is preferred over a case-by-case implementation, to maintain consistency of the timing.
