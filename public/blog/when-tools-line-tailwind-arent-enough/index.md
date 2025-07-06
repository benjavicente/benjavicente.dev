---
title: When tools like Tailwind aren't enough
description: "A styling problem that's simple yet complex to solve right."
date: 2025-06-03
---


> Note: This post was written in June, but I published it one month later.

Composition is the key to building UIs. Styling and component libraries have evolved to provide great composition patterns while providing an incredible developer experience. However, there are ceilings where achieving compositions isn't clear.

Recently I bumped into that ceiling. Implementing a component that looks simple in principle took me down a rabbit hole of complexity to achieve the desired composition. While one could implement non-composable solutions in most cases, this problem was inside a design system, so composition is a must.

## The problem

A card that can have a divider.

```tsx
<Card.Root>
  <Card.Title>Card</Card.Title>
  {/* Here 👇 */}
  <Card.Divider />
  <Card.Content>
    ...
  </Card.Content>
</Card.Root>
```

```js eval
<Card.Root>
  <Card.Title>Card</Card.Title>
  <Card.Divider />
  <Card.Content>
    This is the card implemented as above.
  </Card.Content>
</Card.Root>
```

That's mainly it. The additional part that breaks the simplicity of it is that the card could be vertical or horizontal, depending on how the developer uses it. So the card provides a set padding, background, gap, and border; and whoever uses the card provides the direction plus additional styling.

```tsx
// Now it's horizontal!
<Card.Root horizontal>
  <Card.Title>Card</Card.Title>
  {/* With context, the divider can know to be a vertical line */}
  <Card.Divider />
  <Card.Content>
    ...
  </Card.Content>
</Card.Root>
```

```js eval
<Card.Root horizontal>
  <Card.Title>Card</Card.Title>
  <Card.Divider />
  <Card.Content>
    This is the card implemented as above.
  </Card.Content>
</Card.Root>
```


The direction could be responsive:


```tsx
const isHorizontal = useMediaQuery('(min-width: 768px)');

<Card.Root horizontal={isHorizontal}>
  <Card.Title>Card</Card.Title>
  <Card.Divider />
  <Card.Content>
    ...
  </Card.Content>
</Card.Root>
```

```js eval
<Responsive />
```


For styling solutions, like [PandaCSS](https://panda-css.com/docs/guides/dynamic-styling#runtime-values) and [StyleX](https://stylexjs.com/docs/learn/theming/using-variables/), that rely on minimal JS to attach compiled styling to components, it isn't _that_ much of a problem. Here is a solution with StyleX:

```tsx
import * as stylex from '@stylexjs/stylex';

const breakpoints = {
  md: "@media (min-width: 768px)" 
};

const styles = stylex.create({
  root: { 
    // Shadow only applied on horizontal cards
    shadow: { default: null, [breakpoints.md]: '0 4px 6px rgba(0, 0, 0, 0.1)' },
  }
});

function Example() {
  // Make the card horizontal based on the media query
  const isHorizontal = useMediaQuery(breakpoints.md);
  return (
    <Card.Root {...stylex.props(styles.root)} horizontal={isHorizontal}>
      <Card.Title>Card</Card.Title>
      <Card.Divider />
      <Card.Content>
        ...
      </Card.Content>
    </Card.Root>
  );
}
```

While it works, there is a small annoyance: where the styles overwrites are defined is separate from where the direction of the card is specified. The ideal solution would be to have something like this:

```tsx
// pseudo code
<Card.Root styles={{ 
  direction: { default: "col", md: "row" },
  shadow: { default: null, md: '0 4px 6px rgba(0, 0, 0, 0.1)' },
}}>
  <Card.Title>Card</Card.Title>
  <Card.Divider />
  <Card.Content>
    ...
  </Card.Content>
</Card.Root>
```

But that breaks the assumptions that those zero-cost CSS-in-JS have.
There isn't a way to cleverly compile the styles.

So what can we do?

## My solution with utility classes and cascade layers

TailwindCSS might be the most productive CSS framework for building applications, But at the other hand, TailwindCSS (alone) isn't great at building design systems that solve problems like this “fancy” card.

Lets check what component libraries like [Shadcn](https://ui.shadcn.com/) do in their card components:


```tsx
function Root({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col shadow-sm ...",
        className
      )}
      {...props}
    />
  )
}
```

Let's add the slot pattern and TailwindCSS variables as classes to allow the responsive divider:

```tsx
function Root({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col shadow-sm ...",
        "[--card-border:--color-slate-500]",
        "border border-(--card-border) ...",
        className
      )}
      {...props}
    />
  )
}

function Divider({ className, ...props }) {
  return (
    <div
      data-slot="card-divider"
      className={cn(
        "border-(--card-border) border-r border-b ...",
        className
      )}
      {...props}
    />
  )
}
```

It starts to get messy, and there's still missing how we can make it responsive.
The solution to that would be to create a couple of TailwindCSS utilities:

```css
@utility card-row {
  --card-direction: row;
  --card-divider-mx: calc(0.5 * var(--card-padding, 1rem));
  --card-divider-my: calc(-1 * var(--card-padding, 1rem));
}

@utility card-col {
  --card-direction: column;
  --card-divider-mx: calc(-1 * var(--card-padding, 1rem));
  --card-divider-my: calc(0.5 * var(--card-padding, 1rem));
}
```

With that, we can add those variables to the divider:


```jsx
function Divider({ className, ...props }) {
  return (
    <div
      data-slot="card-divider"
      className={cn(
        "border-(--card-border) border-r border-b ...",
        "mx-(--card-divider-mx) my-(--card-divider-my)", // [!code highlight]
        className
      )}
      {...props}
    />
  )
}
```

And apply those to the card:

```jsx
<Card.Root className="card-row lg:card-col {other-styles}">
  ...
</Card.Root>
```

This sort of works as one would expect. If you aren't really a fan of utility classes, seeing the resulting classes on the element might be a turn-off. If it is, _please_ don't inspect the [classes of a button on the Catalyst Design System](https://catalyst.tailwindui.com/docs/button), made by TailwindLabs.

P.S.: Also don't look at what `tailwind-merge` does, used internally by the `cn` function.

There is one problem that remains that in the CSS-in-JS was solved by being in JS: adding limitations to how the component might be styled.

Imagine a new developer starts using the card and does this:

```jsx
<Card.Root className="flex-row lg:flex-col border-red-500"> 
  <Card.Title>Card</Card.Title>
  {/* He doesn't use a divider */}
</Card.Root>
```

The component will not break the Design System yet, but if a divider is added, it will. The divider not using its spacing correctly would be a clear indication of it, so it's _not a big deal_.

**But we want Design Systems to never be in an undefined state (or style)**.

That's where the usage of cascade layers comes in.

We want to:
- Use more CSS variables without abusing the `-(--var)` syntax
- Define what styles can't be overwritten

CSS cascade allows us to define layers in which classes will be applied. So it's possible to define a system of (at least) 3 layers:
- `components`: the base styles and defaults of the design system
- `utilities`: utility classes that the developers use to write styles
- `fixed`: styles that shouldn't be overwritten

This will look like this:

```css
@layer components {
  .card {
    --card-border: var(--color-slate-500);
    --card-padding: 1rem;
  }
}
@layer fixed {
  .card {
    border: 1px solid var(--card-border);
    padding: var(--card-padding);
    display: flex;
    flex-direction: var(--card-direction, column);
  }
  .card-divider {
    @apply border-r-1 border-b-1;
    border: 1px solid var(--card-border);
    /* Using the values provided by the utility or default */
    margin-block: var(--card-divider-my);
    margin-inline: var(--card-divider-mx);
  }
}
```

With that, the `fixed` layer prevents overwriting its styles by `utility` classes, while allowing overriding styles defined in the `components` layer.

```tsx
<Card.Root className="card-row lg:card-col [--card-border:var(--color-red-500)]">
  <Card.Title>Card</Card.Title>
  <Card.Divider />
</Card.Root>
```

There it is, a card component that provides unwritable defaults, provides a responsive divider that is easy to use, and is fully composable 🧩

## Other improvements

### Variable naming

One neat thing that CSS variables have in comparison to clases is that CSS variables are “scoped” in the element tree. That means that only if the the element or it's descendants use the variable, it will be applied.

So we can abuse that and simplify the naming of the variables. Just use `--border-color` and `--padding` instad of prefixing it with `card-`. If those variables are set on the `card` class, it doesn't matter what values the ancestor elements have.

If those CSS variables aren't set on the `body` or layout div, it's unlikely that there will be weird collisions with other components.

### Scoped classes

In contrast, CSS classes are _global_. If a codebase has a lot of components, there needs to be a mechanism to avoid class name collisions. Even strategies like [BEM](https://getbem.com/) might fall short.

That's why it's mostly an industry standard to use a system to compile or scope classes, like CSS Modules, or the styling mechanisms present in Vue, Svelte, and Angular. The build system adds a unique prefix to the class names, so they are unique in the global scope.

### `if` function

This is relatively new, it's just a week after it landed it [Chrome 137](https://developer.chrome.com/blog/new-in-chrome-137)! The main benefit of the `if` function is to style elements based on context, sort of like style queries. 

The implementation `card-row` and `card-col` utilities has a “code-smell”: it defines styles at a distance. This isn't really a problem since it's doesn't leak to the rest of the code, but with the power of the `if` function, we can avoid that:


```css
/* We don't define styles here, only context that styles needs */
@utility card-row {
  --card-dir: "row";
}

@utility card-col {
  --card-dir: "col";
}

@layer components {
  .card {
    --card-border: var(--color-slate-500);
    --card-padding: 1rem;
  }
}

@layer fixed {
  .card {
    @apply flex;
    padding: var(--card-padding);
    border: var(--card-border) 1px solid;
    /* Now we use the defined context to apply real styles */
    flex-direction: if(style(--card-dir: "row"): row; else: column);  // [!code highlight]
  }
  .card-divider {
    @apply border-r-1 border-b-1;
    --p-add: calc(0.5 * var(--card-padding));
    --p-rm: calc(-1 * var(--card-padding));
    border-color: var(--card-border);
    margin-block: if(style(--card-dir: "row"): var(--p-rm) ; else: var(--p-add));  // [!code highlight]
    margin-inline: if(style(--card-dir: "row"): var(--p-add) ; else: var(--p-rm));  // [!code highlight]
  }
}
```
