---
title: 'Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, there are important operational concerns to consider, such as how the library is built, tested, and released — and also how to keep those processes automated in an efficient way. These aspects may not be as prominent on the surface, but they still have significant implications both on your own productivity as the author, as well as the experience of the library's consumers.

Even in such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution for this. The tooling landscape — both from Microsoft and the community — is vast and constantly evolving, so between the various options available and different strategies to choose from, it can be hard to know where to start.

I have been maintaining [several open-source libraries in .NET](/projects) over the past decade and a half, and in my journey I have experimented

I have built and maintained several open-source libraries in .NET over the years, and in this article I will try to distill that experience into a set of common approaches and recommendations. We'll go over everything from project structure to compiler settings, explore how to maintain compatibility with various framework versions and runtime environments, cover important things to consider when publishing a NuGet package, and see how to use services such as GitHub Actions to help us streamline the operational aspects of the development workflow.

## Local environment

## Targeting and polyfills

## Testing workflow

## Releasing workflow

## Security considerations

## Changelog

## Formatting

## GitHub issue forms

## Summary
