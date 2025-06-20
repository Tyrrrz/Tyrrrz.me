---
title: '(The Unglamorous Side of) Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, you also have to consider many operational concerns, such as how it is built, tested, and released — and how those processes should be automated in an efficient and reliable way. These aspects may not be as prominent on the surface, but they still have significant implications both on your own productivity as the author, as well as the experience of the library's consumers.

Even in such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution. The tooling landscape — both within the platform and the wider software world — is vast and constantly evolving, so with lots of different knobs to turn and approaches to evaluate, it can be difficult to know where to start.

I have been maintaining [several open-source libraries in .NET](/projects) for over a decade, and through extensive trial and error, I have come to develop a set of practices that I find to be both effective and sustainable. These practices are not necessarily "best" in any absolute sense, but they have worked well for me and my projects, and I believe they can be a good starting point for others as well.

In this article, I will outline a typical .NET library setup, covering build settings, productivity extensions, testing and publishing workflows, and the services that help automate and tie everything together. We will go over different strategies, discuss the trade-offs between them, and see how they can be combined to establish a solid foundation for your library project.

## Bootstrapping the project

Much like everything else in life, a .NET project has a beginning — and that beginning is the `dotnet new` command. It's safe to assume that, if you're reading this article, you've probably set up a fair share of .NET solutions and don't need any introduction to the process. However, since we'll be relying on certain expectations about the project structure going forward, let's use this opportunity to establish a common ground.

Generally speaking, there are two main ways to organize a solution in .NET: _the simpler way_ — where all projects are placed in their respective directories within the repository root, and _the more scalable way_ — where projects are further grouped by their type and nested within the corresponding directories (`src/`, `tests/`, `samples/`, etc.). Both approaches are valid and have their place, but since we'll not be focusing on the actual codebase in this article, we'll go with the first option to keep things simple:

```
├── MyLibrary
│   ├── MyLibrary.csproj
│   └── (...)
├── MyLibrary.Tests
│   ├── MyLibrary.Tests.csproj
│   └── (...)
└── MyLibrary.sln
```

Here we have a bare-bones setup, consisting of the `MyLibrary` project that houses the library code, and the `MyLibrary.Tests` project which contains the corresponding automated tests. Both of them are unified within a single solution scope using a file named `MyLibrary.sln`, which provides a centralized entry point for the .NET tooling to discover and manage these projects.

To achieve the structure visualized above, we can either create the solution from an IDE, or simply run the following `dotnet` commands in the terminal:

```bash
dotnet new classlib -n MyLibrary -o MyLibrary
dotnet new xunit -n MyLibrary.Tests -o MyLibrary.Tests
dotnet new sln -n MyLibrary
dotnet sln add MyLibrary/MyLibrary.csproj MyLibrary.Tests/MyLibrary.Tests.csproj
```

Besides that, our solution also needs to be integrated with a version control system and, ideally, a code hosting platform. When it comes to the former, things are quite simple: [Git](https://git-scm.com) is essentially the de facto standard of version control in the software world, and .NET is no exception. However, choosing a platform to host your Git repositories is a bit more nuanced, as there are many viable options available and — if you are planning to use them beyond their basic functionality — they all come with some form of vendor lock-in.

That said, unless you have a specific reason to use something else, I strongly recommend going with the obvious combination of Git and [GitHub](https://github.com) due to its wide adoption, generous free tier, and rich ecosystem of tools and integrations. This is especially relevant if you are planning to publish your library as an open-source project, as GitHub is home to the largest community of developers, which helps with discoverability and collaboration.

With all that in mind, let's assume we've created a new remote repository over at `https://github.com/Tyrrrz/MyLibrary`. Now we can also initialize the repository locally and synchronize the two together:

```bash
git init
git remote add origin https://github.com/Tyrrrz/MyLibrary.git
dotnet new gitignore
```

This set of commands does a few things: it creates the `.git` directory with all the repository-specific metadata, adds a remote named `origin` that points to the GitHub repository we've created earlier, and generates a comprehensive [`.gitignore`](https://git-scm.com/docs/gitignore) file that is tailored for common file and directory patterns used within the .NET ecosystem. Once executed, the resulting file structure should look like this:

```
├── .git
│   └── (...)
├── MyLibrary
│   ├── MyLibrary.csproj
│   └── (...)
├── MyLibrary.Tests
│   ├── MyLibrary.Tests.csproj
│   └── (...)
├── .gitignore
└── MyLibrary.sln
```

At this point, we can consider our library solution to be fully bootstrapped. Since we don't really care about the inner workings of the library, we will assume that its functionality has been fully implemented, and that the associated tests are also in place and running correctly. To close this part off, let's commit our existing codebase and push it to the remote repository:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Baseline configuration

Any individual .NET project is essentially a (massive) set of instructions that direct the toolchain how to parse, compile, and package the code contained within it. These instructions are inherited through various internal `props` and `targets` files and, for the most part, pose no particular interest to you as the developer. However, there are a few key aspects that you may want to configure — even if solely to establish a set of reasonable defaults.

I call these defaults the "baseline configuration", as their purpose is not so much to alter the build process, but rather to ensure a consistent behavior across unpredictable environments. This can be achieved with the help of the following three optional files:

- [`global.json`](https://learn.microsoft.com/dotnet/core/tools/global-json) — specifies the version of the .NET SDK required for the solution and instructs how to roll forward to higher versions. Very often a project may depend on certain language, compiler, or tooling features that are not available in older versions of the SDK — so this file is useful for enforcing that requirement. It also provides better developer experience by showing a coherent message when the right version is missing, instead of failing with a cryptic error deep within the build chain.
- [`nuget.config`](https://learn.microsoft.com/nuget/reference/nuget-config-file) — defines, among other things, which NuGet feeds are used to resolve external package dependencies for projects in the solution. Even if you're not relying on any custom NuGet registries, this file is useful to ensure that the default sources are not overridden by higher level configuration files that may be present on the machine.
- [`Directory.Build.props`](https://learn.microsoft.com/visualstudio/msbuild/customize-by-directory) — is a file that can be used to specify cross-cutting settings that should be applied to all projects in the solution. Once created, .NET tooling will automatically include the contents of this file when processing project files in the same directory or any of its subdirectories. This is useful for configuring common properties such as language version, warning levels, compiler features, and so on.

To get started, we can create boilerplates for all three of these files by using the `dotnet new` command:

```bash
dotnet new globaljson
dotnet new nugetconfig
dotnet new buildprops
```

Usually, as new versions of the .NET SDK are released, you want to update your local installation to the latest version. SDK versions are incremental and backwards-compatible, so you can always use the latest version of the SDK to build your projects, even if they target older versions of the framework.

## Target frameworks and compatibility

- https://github.com/Tyrrrz/PolyShim
- https://github.com/SimonCropp/Polyfill
- https://github.com/Sergio0694/PolySharp

## Testing workflow

```yml
# Friendly name of the workflow
name: main

# Events that trigger the workflow
# (push and pull_request events with default filters)
on:
  push:
  pull_request:

# Workflow jobs
jobs:
  # ID of the job
  test:
    # Operating system to run the job on
    runs-on: ubuntu-latest

    # Steps to run in the job
    steps:
      # Check out the repository
      - uses: actions/checkout@v4 # note that you'd ideally pin versions to hashes, read on to learn more

      # Run the dotnet test command
      - run: dotnet test --configuration Release
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Setup .NET SDK
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: dotnet test --configuration Release
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Matrix defines a list of arguments to run the job with,
    # which will be expanded into multiple jobs by GitHub Actions.
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    # We can reference the matrix arguments using the `matrix` context object
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - - run: dotnet test --configuration Release
```

Reporting test results

- https://github.com/dorny/test-reporter
- https://github.com/Tyrrrz/GitHubActionsTestLogger

Dorny:

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: >
          dotnet test
          --configuration Release
          --logger "trx;LogFileName=test-results.trx"

      - uses: dorny/test-reporter@v1
        # Run this step even if the previous step fails
        if: success() || failure()
        with:
          name: Test results
          path: '**/*.trx'
          reporter: dotnet-trx
          fail-on-error: true
```

![Test results using dorny/test-reporter](dorny-test-results.png)

```yml
# Testing workflow
name: main

on:
  push:
  pull_request:

jobs:
  test:
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: >
          dotnet test
          --configuration Release
          --logger "trx;LogFileName=test-results.trx"

      # Upload test result files as artifacts, so they can be fetched by the reporting workflow
      - uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: '**/*.trx'
```

```yml
# Reporting workflow
name: Test results

on:
  # Run this workflow after the testing workflow completes
  workflow_run:
    workflows:
      - main
    types:
      - completed

jobs:
  report:
    runs-on: ubuntu-latest

    steps:
      # Extract the test result files from the artifacts
      - uses: dorny/test-reporter@v1
        with:
          name: Test results
          artifact: test-results
          path: '**/*.trx'
          reporter: dotnet-trx
          fail-on-error: true
```

GitHub Actions Test Logger:

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: >
          dotnet test
          --configuration Release
          --logger GitHubActions
```

![Test results using Tyrrrz/GitHubActionsTestLogger](ghatl-test-results.png)

Coverage

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: >
          dotnet test
          --configuration Release
          --logger GitHubActions
          --collect:"XPlat Code Coverage"
          --
          DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover

      # Codecov will automatically merge coverage reports from all jobs
      - uses: codecov/codecov-action@v3
```

![Code coverage using codecov/codecov-action](codecov-graph.png)

## Releasing workflow

## Security considerations

```yml
jobs:
  test:
    permissions:
      contents: read
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    runs-on: ${{ matrix.os }}

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: >
          dotnet test
          --configuration Release
          --logger GitHubActions
          --collect:"XPlat Code Coverage"
          --
          DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover

      - uses: codecov/codecov-action@v3
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    matrix:
      os:
        - windows-latest
        - ubuntu-latest
        - macos-latest

    runs-on: ${{ matrix.os }}

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: |
            8.0.x
            6.0.x

      - run: >
          dotnet test
          --configuration Release
          --logger GitHubActions
          --collect:"XPlat Code Coverage"
          --
          DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover
      - uses: codecov/codecov-action@eaaf4bedf32dbdc6b720b63067d99c4d77d6047d # v3.1.4
```

## Changelog

## Formatting

## GitHub issue forms

## Summary

You can reference [`https://github.com/Tyrrrz/MyLibrary`](https://github.com/Tyrrrz/MyLibrary) to see the complete solution that we have built throughout this article. You can also use it a repository template to quickly bootstrap your own library project.
