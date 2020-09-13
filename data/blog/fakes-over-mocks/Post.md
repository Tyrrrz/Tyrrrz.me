---
title: 'Prefer Fakes Over Mocks'
date: '2020-09-08'
tags:
  - 'programming'
  - 'testing'
---

Software testing is an exercise where we validate certain assumptions about our code by running it in a controlled environment. The closer that environment resembles real-life conditions, the more confidence we can derive from such tests.

However, although confidence is the most important metric, it's not the only one that matters. As we integrate tests into the development pipeline, we want them to be fast, deterministic, and reasonably easy to run as well.

Modern software solutions tend to involve a lot of moving parts, which makes those goals quite difficult to achieve. A certain component may depend on external factors that cannot be controlled, forcing us replace it with a simpler version for usage in tests.

Doing so, of course, reduces their value, but it's a sacrifice we're often forced to make to ensure our tests are actually usable. Ultimately, designing a good test suite is a matter of finding the right balance, instead of chasing after any one of the extremes (which is also why [focusing on unit testing is a bad idea](/blog/unit-testing-is-overrated)).

While substituting components with [_test doubles_](https://en.wikipedia.org/wiki/Test_double) is a very well-known technique, it's usually applied mindlessly.
