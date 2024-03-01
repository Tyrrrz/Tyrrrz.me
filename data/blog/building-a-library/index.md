---
title: 'Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, we also need to consider the infrastructure behind it — how the code is built, tested, packaged, and deployed — and how to leverage the tools and services available to us to make these processes as efficient as possible.

Although none of these things are inherently complicated, the abundance of different approaches and technical options can make it difficult to make the right decisions. And while there is no true one-size-fits-all solution, there are still a few common patterns that can be applied to most .NET library projects out there.

In this article, we will explore the current lay of the land when it comes to building a .NET library, covering everything from project settings and build tooling to testing and deployment workflows. Hopefully, this will provide a decent starting point if you're looking to build your own library, and help avoid some of the common pitfalls along the way.

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
