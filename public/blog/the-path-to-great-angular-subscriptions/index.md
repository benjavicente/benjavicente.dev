---
title: The path to great Angular subscriptions
date: 2026-09-13
description: How to properlly subscribe to an external store in Angular
---

# The path to great Angular subscriptions

Web applications mostly relly on subscriptions, like changes state management or keyboard events. Usually that is easy to integrate when the system only relies in event propagation, wich is usually not the case.

Lets looks at listening to the bounding box of an element for example:

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
type CallbackFn = () => void
type UnsubscribeFn = () => void;

interface Store<T> {
  get(): T;
  subscribe(callback: Callback): UnsubscribeFn;
}

function createElementRectStore(element: HTMLElement): Store<React> {
  return {
    get: () => element.getBoundingClientRect(),
    subscribe: (callback) => {
      const observer = new ResizeObserver(() => void callback());
      observer.observe(element);
    }
  }
}
```

## How do we connect this in Angular?

### Direct subscription & Update

A simple and first aproach one could do to integrate taht store into angular would be to subscribe directly and update a signal when the value changes:

```ts
function injectElementRect(element: HTMLElement) {
  const store = createElementRectStore(element);
  const rectSignal = signal(store.get());
  store.subscribe(() => {
    rectSignal.set(store.get())
  })
  return rectSignal;
}
```

### Direct subscription & Derivate 

In some cases, like rects, we usually care about part of the state, not the entirity of it. We could add second parameter that is a function that transform the rect in the shape we want, like this:


```ts
function injectElementRect<T>(
  element: HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  const store = createElementRectStore(element);
  const valueSignal = signal(select(store.get()));
  store.subscribe(() => {
    valueSignal.set(select(store.get()))
  })
  return valueSignal;
}
```

Works great if the select function is like this:

```ts
injectElementRect(el, (rect) => react.width)
```

But what if it depended on a reactive value?

```ts
injectElementRect(el, (r) => useWidth() ? r.width : r.height)
```

There, `useWidth` is a signal that could change.
Since we call that function inside the construction and subscription callback, chainigng  the value of `useWidth` will not update the signal our helper returns.

We can use computes to do the transformation while tracking the dependencies, like this:

```ts
function injectElementRect<T>(
  element: HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  const store = createElementRectStore(element);
  const rectSignal = signal(store.get());
  store.subscribe(() => {
    rectSignal.set(store.get())
  })
  return computed(() => select(rectSignal));
}
```

### Effect subscription & Derivate

One limit Angular has is arround when some things are initialized.
If you look at a component with some required attribues:

```ts
@Component(...)
export class Example {
  elementRef = viewChild.required<ElementRef>('el');
  value = input.required()

  constructor() {
    console.log(this.elementRef(), this.value())  // Thows!
  }
}
```

With a class based architecture, Angular can't known before hand the values of `element` and `value`, so it thows if those are read during construction.
The trick is to use the reactive system, like with computed or effects, or with lifecicle hooks like `ngOnInit` (but the later is usually discouraged today).

So instead of subscribing on initialization, an effect can be used:


```ts
function injectElementRect<T>(
  // Element is now a function that returns the element,
  // since now it supports signals that are initiazed later
  element: () => HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  // Trick to create the store on first read
  const storeSignal = computed(
    () => createElementRectStore(untracked(element))
  );

  // Linked signals can be set and are initialed
  // with a function, so we can safelly call storeSignal
  // without initializing element to early
  const rectSignal = linkedSignal(() => storeSignal().get());
  
  effect((onCleanup) => {
    // The values are initialized by Angular before effects run
    const store = storeSignal()
    const unsubscribe = store.subscribe(() => {
      rectSignal.set(store.get())
    })
    onCleanup(unsubscribe)
  })

  return computed(() => select(rectSignal));
}
```

### Effect subscription & Invalidate

One readivility issue with the last implementation is that we have 2 places where the get is called, and the select is in another place when it is heavelly related to the obtained store value. An alternative aproach is to invalidate instead of update and derivate, like this:


```ts
function injectElementRect<T>(
  element: () => HTMLElement,
  select: (rect: Rect) => T,
): Signal<T> {
  // Store declaration
  const storeSignal = computed(
    () => createElementRectStore(untracked(element))
  );

  // Subscription management
  const currentVersion = signal(0);
  effect((onCleanup) => {
    const store = storeSignal()
    const unsubscribe = store.subscribe(() => {
      currentVersion.update(v => v + 1)
    })
    onCleanup(unsubscribe)
  })

  // Obtaining the current value
  return computed(() => {
    version() // Track version
    return select(store.get()) // Get current transformed
  });
}
```

That also gets us a small benefit: `store.get()` is only called when the returned signal is read.

### Susbcribe on read

I wanted to push subscriptions further by supporting susbcribe on read. For example, this use case, where the store and subscription depends on a input signal, and has methods with side effects:

```ts
@Component(...)
export class Example {
  multipliyer = input.required<number>() // Starting at 2

  // { count: Signal, next: () => void }
  counter = injectCounter(multipliyer)

  ngOnInit() {
    // Internal value (1) * multipliyer (2) = 2
    console.log(this.count())
    // Calls subscriptions, internal value changes to 2
    counter.next()

    // Should be 2 * 2, but we haven't subscribed yet!
    // It does not known that the internal value has changed
    counter.log(this.count())
  }
}
```

In the explorations I did, I managed to create a nice API for it. The core idea is to use signal pulls to see when the subscription should be initialized, where the important code idea was:

```ts
function injectCounter(multipliyer: (n: number) => number) {
  const counterStore = createCounterStore()

  // Subscription management
  const currentVersion = signal(0);
  let cleanup: undefined | Cleanup = undefined
  function retire() {
    previous?.cleanup?.();
  }
  function reconcile() {
    const store = counterStore();
    // The real code for this is larger,
    // mainly for handeling edge cases,
    // but the core idea is the same
    const cleanup = store.subscribe(() => {
      currentVersion.update(v => v + 1)
    });
  }
  owner.onDestroy(() => {
    retire();
  });
  const connected = computed(() => {
    untracked(() => reconcile());
  })

  const count = computed(() => {
    // Pull connection, it will not run again if it isn't dirty,
    // so it's safe to call it unconditionally
    connected()

    version()
    return select(counterStore.get())
  });

  return { count, next: store.next() }
}
```

The DX of how this endups working is amazing, since it the signal returned is in complete sync with the value from the store. And it can go beyond like syncing extra information into the store inmedial instead of waiting for sinscronization with effects (like with `setOptions`-like APIs).

The issue is that subscriptions usually implies side effects. For example, for data fetching, this might invole starting a request on a first subscriber. So in computeds, you can end up with incorrect state:

```ts
// Injects if any query is fetching
const anyFetching = injectIsFetching()
// Subscibes to a query, starting a fetch
const myQuery = injectQuery()

computed(() => {
  isFetching: anyFetching(), // Will indicate that is NOT fetching
  queryState: myQuery().state  // Will indicate that it IS fetching
})
```

This happens because the `myQuery()` call will initialize the fetch after the value of `anyFetching()` was read, creating inconsistant state, specially cosnidering that both of those helpers might consume the same state underneath.

So while the DX is great for 90% of usecases that I see, producing invalid state for the rest is not aceptable.

### Invalidate on initialization

One of the improvementa that subscribe on read has is that the subsription happens before the value is read, so there is no way those values can't get out of sync.
If we consider the effect alternative, we can end up in a case like this:

```ts
@Component(...)
export class Example {
  multipliyer = input.required<number>() // Starting at 2

  #prevEffect = effect(() => {
    count.next()
  })

  // { count: Signal, next: () => void }
  counter = injectCounter(multipliyer) 

  ngOnInit() {
    // Assuming we read the value on a template or here,
    // so the signal was pulled before the last effect
    counter.value()

    counter.next()
  }

  constructor() {
    effect(() => {
      // Internal value is correcly updated to 3, but
      // the subscription wasn't conected when those 2
      // updates happeneds, leaving the signal out of date
      console.log(counter.value())
    })
  }
}
```

There is a gap betwen when the signal is first read and when the subscription happens, and if the value chanegs there, the signal gets out of sync.

The trick is to invalidate when the subscription initializes, making the signal disty if it has been read before.

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

    // Invalidate inmediatly
    currentVersion.update(v => v + 1)
  })

  return computed(() => {
    // Computed will be marked as dirty, so next
    // pulls will get the updated value if it changed
    version()
    return select(store.get())
  });
}
```

### Reactive stores and a generic API

The remaining step was to find a generic API that doesn't feel weird. The clear inspiration for it was React's `useSyncExternalStore`, that have the following arguments:

- `getSnapshot`, called to get the initial value or whenever the subcription notifies a change with the callback.
- `subscribe`, that registers the subscriptions and calls the callback when it changes.

The function detects if `subscribe` is a different function en each render, and if so, it cleans the past subscription and creates a new one with the new passed function. In Angular, that would look like this:

```ts
function injectSyncExternalStore<T>(
  subscibre: () => (callback: CallbackFn) => UnsubscribeFn
  getSnapshot: () => T
) {}

injectSyncExternalStore(
  () => storeSignal().subscribe,
  () => storeSignal().get()
)
```

There you can see that we are repating the call of `storeSignal` in each, and that `subscribe` might be harder to follow, specially if you consider the case when the store changes of if you include a way to |deactivate the subscription.

```ts
injectSyncExternalStore(
  () => isActive() ? storeSignal().subscribe : noop,
  () => storeSignal().get()
)
```

Since the store signal is shared, and that we can asume that if the store itself changes it should change the subscription, we can do something like this:

```ts
function injectExternalStore<T>(binding: () => {
  getSnapshot: () => T,
  subscibre: (callback: CallbackFn) => UnsubscribeFn
}) {}

injectExternalStore(() => {
  const store = storeSignal();
  return {
    getSnapshot: () => store.get(),
    subscibre: (callback) => store.subscribe(callback),
  }
})
```

The effect that subscribes will cleanup the past subscription and invalidate to get the new value:

```ts
const invalidate = () => untracked(() => version.update((v) => v + 1))

effect((onCleanup) => {
  const current = binding()
  untracked(() => {
    const unsubscribe = current.subscribe?.(invalidate)
    onCleanup(unsubscribe)
    invalidate()
  })
})

const value = computed(() => {
  revision()
  return requested().getSnapshot()
})
```

### One or many helpers?


The API is great, but it is only really necesary if the subscription needs to be delayed.
In the cases where that isn't necesary, should we use that helper or susbcribe directly?

This isn't as direct as correctness issue with subscribe on read, and my opinion of it is that subcriptions should all behave cosnsitenly in the same library, so while it might be simpler to not use that helper and maybe more performant, having the same timing in all susbcriptions would be prefered in a library.

## Main learnings from Angular subscriptions

- To consume stores that might depend on required input signals or view queries, the store should be acepted as a function (signal) to lazy initilaize it on first read.
- Transformation of the subscription can't happen on change since those would miss reactivity, so invalidation or an extra computed is needed.
- Subscribe-on-read might introduce incorrect behaviour on computeds, witch is incorrect behaviour that a library can't allow.
- Subscribe-on-effects needs to invalidate inmedially if there is a change betwen the signal creation and the effect subscription.
- Effects gives us free subscription swaping, for example, if we want to stop the subscription or change the store dinamically.
- Same susbcription mechanisms is prefered that a case-by-case implementation.
