---
title: Hello world!
date: 2024-01-22
description: First post of the blog
---

## Update (03/11/2024):

I probably will end up doing my _blog again_, but with a even more simpler focus: writing notes instead of full blog posts. I like how the structure of this blog ended up, but both the source code needs a refresh and how I write too.

The main things that I want to update from the source code is the (use Tailwind V4 and CVA, plus simplify the styling), bump some dependencies, and separate the content of this page from utilities (like AutoRefresh and auto-refresh).

For the content side, I want to separate notes and blog posts.
Notes will be unstructured thoughts, while blog posts will try to go deep on a subject, using multiple sources and examples.

## Hi!

I have created a lot of personal blogs for a while now, but nothing really stuck.
Making past personal websites and blogs was an excuse to learn new technologies.
I can't say that I didn't do the same this time, but this result seems to be more promising.

This attempt of a blog is built with NextJS, MDXRemote, TailwindCSS, and Shikiji.
I was between NextJS and Astro, but Astro not embracing JS is a deal breaker.
Thanks to JS (via React SSC), posts can show interactive components and generate an image for social media.

```js
<Confetti />
```

```js eval
<Confetti />
```

For inspiration, I checked out [Dan Abramov's blog](https://overreacted.io/).
Initially, I didn't know how that blog was made and mainly followed the [KISS](https://en.wikipedia.org/wiki/KISS_principle) approach that Dan shows on his web pages.
When I started programming this blog, I found on GitHub Issues Dan's solutions to problems that I had, which landed me on his blog [source code](https://github.com/gaearon/overreacted.io), where most of the code of this blog is based.

## What now?

As I started exploring in more detail how JS Frameworks work, I will try to write some thoughts and explanations about them here.
It's not intended to be a reference, since I don't have the experience to back it up, but it might be a good place to learn something, as well as a time capsule to show my progression in this JS framework madness.
