---
title: How are polyfills and shims different?
slug: polyfills-and-shims
date: 2016-07-28
tags: [html5, shims, polyfills]
---

### tl;dr:

A polyfill is a shim that makes browsers work like they should have in the
first place.

<!--short-->

### polyfill : shim :: square : rectangle

All polyfills are shims, not all shims are polyfills

### wait, what's a shim again?

A shim is a piece of code that enables an API or fixes a broken implementation,
whether it be in development or already standardized, and often requires its
presence to be known and reckoned with.  For instance transparent gifs used
to aid certain layout situations.

### then what's a poly-fill?

A polyfill is a shim that works transparently to enable a standard while
backward browsers catch up.  Critically, a polyfill allows the developer to
write code against a modern standard api, with no regard to which browser it
will run in, past the basic requirement that the polyfill supports the browser
in question

### says who?

That Remy Sharp Guy:

https://remysharp.com/2010/10/08/what-is-a-polyfill

### mixing metaphors

If you have read that article, you may be trying to reconcile the metaphors
of wooden shims used to snug construction work in, and spackling / joint
compound from which term polyfill is partially inspired (Polyfilla).

My advice is to keep the metaphors separate, their real-life relationship
does not play into their web development relationship outside of both of them
being used to make construction easier.

Instead, I think of the _poly_ in polyfill as polymorphic, as the polyfill
applies to each browser differently (ideally not at all), yet results in
consistent behavior.

But then again, I have probably given this way more thought than is necessary.
