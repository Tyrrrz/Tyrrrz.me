---
title: '(The Uninteresting Side of) Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, there are also the operational concerns, such as how the library is built, tested, and released — and how those processes should be automated in an efficient and reliable way. These aspects may not be as prominent on the surface, but they still have significant implications both on your own productivity as the author, as well as the experience of the library's consumers.

Even in such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution. The tooling landscape — both within the SDK and the wider software world — is vast and constantly evolving, so with many different knobs to turn and approaches to consider, it can be difficult to know where to start.

I have been maintaining [several open-source libraries in .NET](/projects) for a decade and a half, and through a lot of trial and error, I have come to develop a set of practices that I find to be both effective and sustainable. These practices are not necessarily "best" in any absolute sense, but they have worked well for me and my projects, and I believe they can be a good starting point for others as well.

In this article, I will outline a typical .NET library setup, covering build settings, productivity extensions, testing, publishing workflows, and the services that help automate and tie everything together. We will go over different strategies, discuss the trade-offs between them, and see how they can be combined to establish a solid foundation for your library project.

## Local environment

## Targeting and polyfills

## Testing workflow

## Releasing workflow

## Security considerations

## Changelog

## Formatting

## GitHub issue forms

## Summary
