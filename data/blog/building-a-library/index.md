---
title: '(The Unglamorous Side of) Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, you also have to consider many operational concerns, such as how the library is built, tested, and released — and how those processes should be automated in an efficient and reliable way. These aspects may not be as prominent on the surface, but they still have significant implications both on your own productivity as the author, as well as the experience of the library's consumers.

Even in such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution. The tooling landscape — both within the platform and the wider software world — is vast and constantly evolving, so with lots of different knobs to turn and approaches to evaluate, it can be difficult to know where to start.

I have been maintaining [several open-source libraries in .NET](/projects) for over a decade, and through extensive trial and error, I have come to develop a set of practices that I find to be both effective and sustainable. These practices are not necessarily "best" in any absolute sense, but they have worked well for me and my projects, and I believe they can be a good starting point for others as well.

In this article, I will outline a typical .NET library setup, covering build settings, productivity extensions, testing and publishing workflows, and the services that help automate and tie everything together. We will go over different strategies, discuss the trade-offs between them, and see how they can be combined to establish a solid foundation for your library project.

## Bootstrapping the project

Much like everything else in life, a .NET project has a beginning — and that beginning is the `dotnet new` command. It's safe to assume that, if you're reading this article, you've probably set up a fair share of .NET solutions and don't need any introduction to the process. However, since we'll be relying on certain assumptions about the project structure going forward, let's use this opportunity to establish a common ground.

When it comes to libraries, there are two main ways to organize the directory layout:

- **The simple way**: All projects, regardless of their purpose, are placed in their respective directories within the repository root.
- **The more scalable way**: Projects are further grouped by their type (library, test, samples, etc.) and nested within the corresponding directories (`src/`, `tests/`, `samples/`, etc.).

Both approaches are valid and have their place, depending on the size and the complexity of the solution. Since we'll not be focusing on the actual codebase in this article, we'll be keeping things simple and go with the first option. The layout we'll be using is as follows:

```
├── MyLibrary
│   ├── MyLibrary.csproj
│   └── (...)
├── MyLibrary.Tests
│   ├── MyLibrary.Tests.csproj
│   └── (...)
└── MyLibrary.sln
```

As you can see, the layout we adopted here is quite simple: the library code is in the `MyLibrary` project, the tests are in the `MyLibrary.Tests` project, and the solution file `MyLibrary.sln` ties them together. The solution file is not strictly required as you can still just build and test the projects individually, but it does makes things a lot easier when using the `dotnet` CLI or managing the project in an IDE. Also, while I have chosen `xunit` as the template for the test project, you are free to pick whichever testing framework you're comfortable with. Beyond this point, we will just assume that both the library code and the tests have already been written.

The above set can be achieved by running the following `dotnet` commands:

```bash
dotnet new classlib -n MyLibrary -o MyLibrary
dotnet new xunit -n MyLibrary.Tests -o MyLibrary.Tests
dotnet new sln -n MyLibrary
dotnet sln add MyLibrary/MyLibrary.csproj MyLibrary.Tests/MyLibrary.Tests.csproj
```

Next step is to integrate the project with a version control system. Technically, you do have some options in this regard, but for this article we'll assume that you'll be using [Git](https://git-scm.com) as the version control system, since it's the undisputable standard within the industry. To initialize a Git repository in the root directory, you can run:

```bash
git init
```

```
├── .git
│   └── (...)
├── MyLibrary
│   ├── MyLibrary.csproj
│   └── (...)
├── MyLibrary.Tests
│   ├── MyLibrary.Tests.csproj
│   └── (...)
└── MyLibrary.sln
```

Finally, we'll also assume that we'll be using [GitHub](https://github.com) as the code hosting platform for the project. This is not a strict requirement either, but it's a choice that will make the rest of our job easier, as we'll see later on. For the sake of simplicity, we'll assume that the above repository is synchronized with a GitHub repository at `https://github.com/SpaghettiCoder/MyLibrary`.

## Targeting and polyfills

## Testing workflow

## Releasing workflow

## Security considerations

## Changelog

## Formatting

## GitHub issue forms

## Summary
