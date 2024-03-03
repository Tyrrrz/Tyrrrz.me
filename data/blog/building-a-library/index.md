---
title: 'Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, we also need to consider the infrastructure behind it — how the code is built and packaged, how it's tested and deployed — and how to leverage the tools and services available to us to make those processes as efficient as possible.

Although the .NET ecosystem has come a long way in the recent years, many aspects of library development are still somewhat confusing and under-documented.


In this article, we will explore the current lay of the land when it comes to developing a library in .NET, covering everything from project settings and build process tweaks to testing and deployment automation. We will go over the most popular strategies that are used in the community, discuss their trade-offs, and highlight some of the pitfalls to avoid.

## Project structure

The first thing you need to do when starting a new library is to decide on a project structure. This is important because it will affect how easy it is to work on and maintain your library in the future. A good project structure should be easy to understand and navigate, and it should make it clear where each piece of code belongs.

A common project structure for .NET libraries looks like this:

```
my-library/
├── src/
│   └── MyLibrary/
│       ├── MyLibrary.csproj
│       ├── MyLibrary.cs
│       └── ...
├── tests/
│   └── MyLibrary.Tests/
│       ├── MyLibrary.Tests.csproj
│       ├── MyLibrary.Tests.cs
│       └── ...
├── docs/
│   └── ...
└── ...
```

## Targeting and polyfills

## Testing workflow

## Releasing workflow

## Security considerations

## Changelog

## Formatting

## GitHub issue forms

## Summary
