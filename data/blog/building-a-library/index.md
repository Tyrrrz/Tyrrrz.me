---
title: '(The Unglamorous Side of) Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, you also have to consider many operational concerns, such as how it is built, tested, and released — and how those processes should be automated in an efficient and reliable way. These aspects may not be as prominent on the surface, but they still have significant implications both on your own productivity as the author, as well as the experience of the library's consumers.

Even in such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution. The tooling landscape — both within the platform and the wider software world — is vast and constantly evolving, so with lots of different knobs to turn and approaches to evaluate, it can be difficult to know where to start.

I have been maintaining [several open-source libraries in .NET](/projects) for over a decade, and through extensive trial and error, I have come to develop a set of practices that I find to be both effective and sustainable. These practices are not necessarily "best" in any absolute sense, but they have worked well for me and my projects, and I believe they can be a good starting point for others as well.

In this article, I will outline a typical .NET library setup, covering build settings, productivity extensions, testing and publishing workflows, and the services that help automate and tie everything together. We will go over different strategies, discuss the trade-offs between them, and see how they can be combined to establish a solid foundation for your library project.

## Scaffolding the project

Much like everything else in life, a .NET project has a beginning — and that beginning is the `dotnet new` command. It's safe to assume that, if you're reading this article, you've probably set up a fair share of .NET solutions and don't need any introduction to the process. However, since we'll be relying on certain expectations about the file structure going forward, let's use this opportunity to establish a common ground.

Generally speaking, there are two main ways to organize a solution in .NET: _the simpler way_ — where all projects are placed in their respective directories in the root of the codebase, and _the more scalable way_ — where projects are further grouped by their type and nested within the corresponding directories (`src/`, `tests/`, `samples/`, etc.). Both approaches are valid and have their place, but since we'll not be focusing on the actual codebase in this article, we'll go with the first option to keep things simple:

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

To achieve the structure visualized above, you can either create the solution from an IDE of choice, or simply run the following `dotnet` commands in the terminal:

```bash
dotnet new classlib -n MyLibrary -o MyLibrary
dotnet new xunit -n MyLibrary.Tests -o MyLibrary.Tests
dotnet new sln -n MyLibrary
dotnet sln add MyLibrary/MyLibrary.csproj MyLibrary.Tests/MyLibrary.Tests.csproj
```

Besides that, our solution also needs to be integrated with a version control system and, ideally, a code hosting platform. When it comes to the former, the choice is fairly simple: [Git](https://git-scm.com) is the absolute standard of version control in the software world, and .NET is no exception. However, choosing a platform to host your Git repositories is a bit more nuanced, as there are many viable options available and — if you are planning to use them beyond their basic functionality — they all come with some form of vendor lock-in.

That said, unless you have a specific reason to use something else, I strongly recommend going with the obvious combination of Git and [GitHub](https://github.com) due to its wide adoption, generous free tier, and rich ecosystem of tools and integrations. This is especially relevant if you are planning to publish your library as an open-source project, as GitHub's large community of developers lends to better discoverability and collaboration opportunities.

With all that in mind, let's assume we've created a new remote repository over at `https://github.com/Tyrrrz/MyLibrary`. Now we can also initialize the repository locally and synchronize the two together:

```bash
git init
git remote add origin https://github.com/Tyrrrz/MyLibrary.git
dotnet new gitignore
```

This set of commands does a few things: it creates the `.git` directory with all the repository-specific metadata, adds a remote named `origin` pointing to the GitHub repository we've created earlier, and generates a comprehensive [`.gitignore`](https://git-scm.com/docs/gitignore) file tailored for common file and directory patterns used within the .NET ecosystem. Once all the commands are executed, the resulting file structure should look like this:

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

At this point, we can consider the initial scaffolding of our solution to be complete. Since we don't really care about the inner workings of the library, we will simply assume that its functionality has been fully implemented, and that the associated tests are also in place and running correctly. To close this part off, let's commit our existing codebase and push it to the remote repository:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Baseline configuration

Any individual .NET project is essentially a (massive) set of instructions that direct the toolchain how to parse, compile, and package the code contained within it. These instructions are inherited through various internal `props` and `targets` files and, for the most part, pose no particular interest to you as the developer. However, there are a few aspects of the build process that you may want to configure — even if solely to establish a set of reasonable defaults.

I call these defaults the "baseline configuration", as their purpose is not to significantly alter the behavior of the build, but rather to ensure its consistency across unpredictable environments. This can be achieved with the help of the following three optional files:

- [`global.json`](https://learn.microsoft.com/dotnet/core/tools/global-json) — specifies the version of the .NET SDK that should be used for the solution and optionally instructs how to roll forward to higher versions.
- [`nuget.config`](https://learn.microsoft.com/nuget/reference/nuget-config-file) — configures settings related to the NuGet package manager, including the sources from which it should resolve package dependencies.
- [`Directory.Build.props`](https://learn.microsoft.com/visualstudio/msbuild/customize-by-directory) — defines custom MSBuild properties that are automatically applied to all projects in the solution.

Before we explore each of these files in detail, let's get started by generating boilerplates for all of them. We can do that by running the following `dotnet new` commands in the root of our solution directory:

```bash
dotnet new globaljson
dotnet new nugetconfig
dotnet new buildprops
```

### `global.json`

First off, we have the `global.json` file, whose purpose is to declare which version of the .NET SDK the solution is intended to work with. Normally, this information is not encoded in the solution file or anywhere else, so the .NET tooling relies on the default behavior of simply resolving the latest SDK that is available in the environment. This behavior is fine for local development — since you can reasonably guarantee that a compatible version of the SDK is installed on your machine — but it's a good idea to make that requirement explicit to communicate it clearly to other collaborators (and your future self) as well.

Naturally, in order to be considered compatible, the SDK must provide the capabilities that the codebase depends on, such as access to certain target frameworks, language features, compiler options, and so on. When it comes to the [.NET SDK versioning schema](https://learn.microsoft.com/dotnet/core/versions), these aspects are typically governed by the first two components of the version label (i.e. `9.0.***`), while the rest of the numbers indicate bug fixes and minor improvements (i.e. `*.*.307`). In other words, if a project is written with the C# 13 syntax and targets `net9.0`, you'd need the .NET 9.0 SDK in order to build it — but the exact version is not that important.

When you generate a `global.json` file via `dotnet new`, however, it defaults to the full version of the latest .NET SDK available on your machine. It means that anyone who wants to build the solution will also be required to have that _exact same_ SDK version installed, which is way too restrictive. To fix that, let's modify the file to look like this instead:

```json
{
  "sdk": {
    "version": "9.0.100",
    "rollForward": "latestFeature"
  }
}
```

At the time of writing, the current iteration of .NET is .NET 9.0, so we set the `version` property to `9.0.100` — the lowest SDK version within the `9.0` band. Together with the `rollForward` option set to `latestFeature`, this effectively creates a rule that allows the solution to be built by any feature or patch version of the .NET 9.0 SDK, but not by an SDK of another major or minor version (e.g. .NET 8.0 or .NET 10.0).

The reason for specifically choosing `latestFeature` instead of `latestMinor` or even `latestMajor` is to ensure runtime compatibility for executable projects in the solution, such as tests. Although .NET SDKs are generally backward-compatible between different major and minor versions, each SDK includes its corresponding version of the runtime, which is not. As a result, while a project targeting `net9.0` can still be built with the .NET 10.0 SDK, it can only be executed with the .NET 9.0 runtime — making the matching SDK version more preferable.

### `nuget.config`

Moving along, we also have `nuget.config` — a file that can configure how the NuGet package manager integrates with the build process and, most importantly, the locations it uses to restore and publish packages. By default, NuGet connects to the official [NuGet.org](https://nuget.org) registry, but this may vary between different environments due to user- and machine-specific overrides. To ensure a consistent (and secure) developer experience, we can create a solution-level configuration file that explicitly enforces the intended behavior and prevents other settings from interfering with it.

The `nuget.config` file generated by `dotnet new` provides a great starting point: it resets the list of allowed package sources to only include the official registry. This takes care of the package resolution aspect, but since we're working on a library project that we want to publish as a NuGet package too, it's also useful to set up the default push source as well. To do that, let's edit the configuration file like so:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>

  <packageSources>
    <clear />
    <add key="nuget" value="https://api.nuget.org/v3/index.json" />
  </packageSources>

  <config>
    <add key="defaultPushSource" value="https://api.nuget.org/v3/index.json" />
  </config>

</configuration>
```

Here we have the `<packageSources>` section that specifies the feeds from which NuGet should fetch dependencies. It's a list-based setting, so we start with the `<clear />` element to remove any previously defined sources, and then add a single item named `nuget` that points to the NuGet.org catalog. Doing so makes sure that all projects in the solution resolve packages from the official registry, regardless of any other sources that may be configured on the machine.

The following `<config>` section is reserved for key-value settings that control various aspects of the NuGet client behavior, and in our case, we use it to set `defaultPushSource` to match the package source specified earlier. Now, when we run the `dotnet nuget push` command to upload our own packages, it will also infer NuGet.org as the target location without requiring any additional arguments.

### `Directory.Build.props`

Finally, we have the `Directory.Build.props` file, which lets us define arbitrary MSBuild properties that should be applied to all projects in the solution. When running the build, the tooling automatically looks for this file (and `Directory.Build.targets`, if available) within the directory hierarchy, and implicitly includes its contents as if imported directly. This convention makes `Directory.Build.props` a great place to configure cross-cutting concerns that are common to all projects, such as assembly and package metadata, compiler options, build settings, and so on.

The file generated by `dotnet new` makes no assumptions about your intentions, so it simply starts off empty. Here's how I typically set it up for my library projects:

```xml
<Project>

  <!-- Compiler options -->
  <PropertyGroup>
    <LangVersion>latest</LangVersion>
    <Nullable>annotations</Nullable>
    <Nullable Condition="$([MSBuild]::IsTargetFrameworkCompatible('$(TargetFramework)', 'netstandard2.1'))">enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <CheckEolTargetFramework>false</CheckEolTargetFramework>
  </PropertyGroup>

  <!-- Toolchain options -->
  <PropertyGroup>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <!-- Assembly metadata -->
  <PropertyGroup>
    <Version>0.0.0-dev</Version>
    <Company>%YOUR_NAME</Company>
    <Copyright>Copyright (C) $(Company)</Copyright>
  </PropertyGroup>

  <!-- Package metadata -->
  <PropertyGroup>
    <Authors>$(Company)</Authors>
    <Description>Sample library</Description>
    <PackageTags>foo bar baz</PackageTags>
    <PackageProjectUrl>https://github.com/Tyrrrz/MyLibrary</PackageProjectUrl>
    <PackageReleaseNotes>https://github.com/Tyrrrz/MyLibrary/releases</PackageReleaseNotes>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
  </PropertyGroup>

</Project>
```

In the above snippet, we have a few different groups of properties that are used to configure various aspects of the build process. Each group is wrapped in a `<PropertyGroup>` element, which allows us to logically separate the properties based on their purpose. This is not strictly necessary, but it helps keep things organized and makes reading and maintaining the file easier.

Starting off with the compiler options, we set the `<LangVersion>` property to `latest`, instructing the C# (or F#, VB) compiler to use the most recent stable version of the language. Setting this explicitly is rather important because the default value of the property is not consistent — it varies based on the target framework, as some language features depend on APIs that are only available in certain frameworks. Although this is not an issue for application projects — where you typically only build for the latest available target framework — it can be problematic for libraries that target multiple frameworks at the same time to maximize compatibility. In such cases, the `latest` value ensures that the library can use a consistent language version, and relies on the compiler to figure out the availability of language features on an individual basis.

Following that, we also enable the [Nullable Reference Types](https://learn.microsoft.com/dotnet/csharp/nullable-references) feature of the C# compiler, as it is a great way to improve the safety and reliability of our code. Similar to the previous option, this feature is only enabled by default when targeting frameworks that provide nullability annotations for built-in types, such as .NET Standard 2.1 and .NET Core 3.0. To ensure the highest level of compatibility, we enable the NRT feature in its `annotations` mode for all frameworks, and in its `enable` mode only for those that support it fully. This way, our library will compile and contain nullability annotation on all APIs we provide, but we will only get warnings about nullability violations when building for frameworks that support it.

Note how the example above uses the `Condition="..."` attribute to validate framework compatibility. Instead of having a sequence of separate checks for each specific target framework, we can use the [`IsTargetFrameworkCompatible`](https://learn.microsoft.com/visualstudio/msbuild/property-functions#msbuild-property-functions) MSBuild function to determine whether the current target framework is compatible with .NET Standard 2.1, effectively also covering all versions of .NET Core starting with 3.0.

Next, building upon the NRT feature among other things, we also set the `TreatWarningsAsErrors` property to `true`, which means that any compiler warnings will be considered as errors and will fail the build. This forces us to address every potential issue in the codebase and explicitly decide whether it's a warning that we want to ignore or a genuine problem that needs to be fixed, reducing noise in the process. Combined with NRT, this will also make all nullability violations fail the build, which is a great way to ensure that the library is safe to use and doesn't contain any potential pitfalls.

## Target frameworks and compatibility

Which to target (minimal required and latest version (for analyzers))

How compat works between frameworks

IsTrimmable/IsAotCompatible

- https://github.com/Tyrrrz/PolyShim
- https://github.com/SimonCropp/Polyfill
- https://github.com/Sergio0694/PolySharp

`IsTargetFrameworkCompatible`

## Testing workflow

Let's summarize what we have so far.

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

## Releasing workflow

```
          -p:CSharpier_Bypass=true
          -p:ContinuousIntegrationBuild=true
          -p:PublishRepositoryUrl=true
          -p:EmbedUntrackedSources=true
          -p:DebugType=embedded
```

Don't resolve `<ContinuousIntegrationBuild>` in the props files directly.

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    # Operating system doesn't matter here, but Ubuntu-based GitHub Actions
    # runners are both the fastest and the cheapest.
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      # Clone the repository at current commit
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

      # Install the .NET SDK
      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      # Create NuGet packages
      - run: dotnet pack --configuration Release
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    runs-on: ubuntu-latest

    permissions:
      actions: write # this is required to upload artifacts
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      - run: dotnet pack --configuration Release

      # Upload all nupkg files as an artifact blob
      - uses: actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4.3.0
        with:
          name: packages
          path: '**/*.nupkg'
```

![artifacts](artifacts.png)

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    runs-on: ubuntu-latest

    permissions:
      actions: write
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      - run: dotnet pack --configuration Release

      - uses: actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4.3.0
        with:
          name: packages
          path: '**/*.nupkg'

  deploy:
    # Only run this job when a new tag is pushed to the repository
    if: ${{ github.event_name == 'push' && github.ref_type == 'tag' }}

    # We only want the deploy stage to run after both the test and pack stages
    # have completed successfully.
    needs:
      - test
      - pack

    runs-on: ubuntu-latest

    permissions:
      actions: read

    steps:
      # Download the packages artifact
      - uses: actions/download-artifact@6b208ae046db98c579e8a3aa621ab581ff575935 # v4.1.1
        with:
          name: packages

      # Install the .NET SDK
      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      # Upload the packages to NuGet
      - run: >
          dotnet nuget push "**/*.nupkg"
          --source https://api.nuget.org/v3/index.json
          --api-key ${{ secrets.NUGET_API_KEY }}
```

![secrets](secrets.png)

```xml
<Project>

  <PropertyGroup>
    <!-- ... -->

    <!-- Update this when making a new release -->
    <Version>1.2.3</Version>
  </PropertyGroup>

</Project>
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    runs-on: ubuntu-latest

    permissions:
      actions: write
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      # Set the package version to the tag name (on release)
      # or fall back to a placeholder value (on regular commits).
      - run: >
          dotnet pack
          --configuration Release
          -p:Version=${{ github.ref_name || '0.0.0-ci' }}

      - uses: actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4.3.0
        with:
          name: packages
          path: '**/*.nupkg'

  deploy:
    # Deploy job remains unchanged, but is omitted for brevity
    # ...
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    runs-on: ubuntu-latest

    permissions:
      actions: write
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      # Set the package version to the tag name (on release)
      # or fall back to an auto-generated value (on regular commits).
      - run: >
          dotnet pack
          --configuration Release
          -p:Version=${{ (github.ref_type == 'tag' && github.ref_name) || format('0.0.0-ci-{0}', github.sha) }}

      - uses: actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4.3.0
        with:
          name: packages
          path: '**/*.nupkg'

  # Deploy on all commits this time, not just tags
  deploy:
    needs:
      - test
      - pack

    runs-on: ubuntu-latest

    permissions:
      actions: read

    steps:
      - uses: actions/download-artifact@6b208ae046db98c579e8a3aa621ab581ff575935 # v4.1.1
        with:
          name: packages

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      - run: >
          dotnet nuget push "**/*.nupkg"
          --source https://api.nuget.org/v3/index.json
          --api-key ${{ secrets.NUGET_API_KEY }}
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    # Pack job remains unchanged, but is omitted for brevity
    # ...

  deploy:
    needs:
      - test
      - pack

    runs-on: ubuntu-latest

    permissions:
      actions: read

    steps:
      - uses: actions/download-artifact@6b208ae046db98c579e8a3aa621ab581ff575935 # v4.1.1
        with:
          name: packages

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      # Deploy to NuGet.org (only tagged releases)
      - if: ${{ github.ref_type == 'tag' }}
        run: >
          dotnet nuget push "**/*.nupkg"
          --source https://api.nuget.org/v3/index.json
          --api-key ${{ secrets.NUGET_API_KEY }}

      # Deploy to GitHub Packages (all commits and releases)
      - run: >
          dotnet nuget push "**/*.nupkg"
          --source https://nuget.pkg.github.com/${{ github.repository_owner }}/index.json
          --api-key ${{ secrets.GITHUB_TOKEN }}
```

![release notes](release-notes.png)

```console
$ gh release create 1.2.3 --repo my/repo --generate-notes
```

```yml
name: main

on:
  push:
  pull_request:

jobs:
  test:
    # Test job remains unchanged, but is omitted for brevity
    # ...

  pack:
    # Pack job remains unchanged, but is omitted for brevity
    # ...

  deploy:
    needs:
      - test
      - pack

    runs-on: ubuntu-latest

    permissions:
      actions: read
      contents: write # this is required to create releases

    steps:
      - uses: actions/download-artifact@6b208ae046db98c579e8a3aa621ab581ff575935 # v4.1.1
        with:
          name: packages

      - uses: actions/setup-dotnet@4d6c8fcf3c8f7a60068d26b594648e99df24cee3 # v4.0.0
        with:
          dotnet-version: 8.0.x

      - if: ${{ github.ref_type == 'tag' }}
        run: >
          dotnet nuget push "**/*.nupkg"
          --source https://api.nuget.org/v3/index.json
          --api-key ${{ secrets.NUGET_API_KEY }}

      - run: >
          dotnet nuget push "**/*.nupkg"
          --source https://nuget.pkg.github.com/${{ github.repository_owner }}/index.json
          --api-key ${{ secrets.GITHUB_TOKEN }}

      # Create a GitHub release with auto-generated release notes, and upload the packages as assets
      - if: ${{ github.ref_type == 'tag' }}
        run: >
          gh release create ${{ github.ref_name }}
          $(find . -type f -wholename **/*.nupkg -exec echo {} \; | tr '\n' ' ')
          --repo ${{ github.event.repository.full_name }}
          --title ${{ github.ref_name }}
          --generate-notes
          --verify-tag
```

## Changelog

## Formatting

CSharpier

## GitHub issue forms

## Summary

You can reference [`https://github.com/Tyrrrz/MyLibrary`](https://github.com/Tyrrrz/MyLibrary) to see the complete solution that we have built throughout this article. You can also use it a repository template to quickly bootstrap your own library project.
