---
title: 'Building a library in .NET'
date: '2024-10-28'
---

Developing a .NET library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, we also need to consider the infrastructure and the tooling behind it — how the code is built, packaged, tested, and deployed — and how to optimize those processes to make them as efficient as possible.

Although none of these aspects are particularly complicated, the abundance of different approaches and strategies to consider can be overwhelming, especially when you're starting out. And while there is no one-size-fits-all solution, there are still a few common approaches that can be applied to most .NET library projects out there.

In this article, we will explore the current lay of the land when it comes to building a .NET library, covering everything from fine-tuning the project settings to setting up a continuous integration and delivery pipeline. If you're planning to start a new .NET library project, hopefully this can serve as a starting point for you to build upon.

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
