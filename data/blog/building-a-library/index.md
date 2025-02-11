---
title: 'Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, there are important operational concerns to consider, such as how the library is built, tested, and released — and also how to keep those processes automated in an efficient way. These aspects may not be as prominent on the surface, but they still have significant implications both on your own productivity as the author, as well as the experience of the library's consumers.

Even in such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution. The tooling landscape — both from Microsoft and the community — is vast and constantly evolving, so between the various options available it can be hard to know which tech and strategies to choose.

I have been maintaining [several open-source libraries in .NET](/projects) over the past decade and a half, and my journey has been a mix of trial and error, learning from others, and adapting to the demands of the ecosystem. I have learned a lot along the way, and I want to share some of that knowledge with you.

In this article, we will take a look at how to setup a modern .NET library project, covering everything from the local build infrastructure down to the CI/CD automation pipelines. We'll go over various approaches and their trade-offs, and I'll share my personal recommendations based on my own experiences.

## Local environment

## Targeting and polyfills

## Testing workflow

## Releasing workflow

## Security considerations

## Changelog

## Formatting

## GitHub issue forms

## Summary
