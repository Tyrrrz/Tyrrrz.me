---
title: 'Additional NuGet Files in New Project Format'
date: '2017-11-05'
---

[The new `csproj` format](https://docs.microsoft.com/en-us/dotnet/core/tools/csproj), among other things, has an option to generate a NuGet package on every successful build. It resolves dependencies, target frameworks, and documentation automatically and doesn't require a predefined `nuspec` file as all metadata is now also part of the `csproj` file.

Sometimes NuGet packages may require additional files to work — a native library or a CLI executable, for example. These dependencies are not resolved automatically but still need to be somehow included in the package.

When defining a `nuspec` file manually, you can include such files by listing them in the `<Files>` section. To instruct the referencing project to copy these files to the output folder, you can add a `.targets` file which will extend the build with additional steps.

You can still resort to using a manually defined `nuspec` file in the new `csproj` format by setting the `<NuspecFile>` property, however that's not very fun.

At the time of writing, the new `csproj` format is barely covered in documentation. My challenge-driven friend and coworker **Ihor Nechyporuk** spent multiple hours scavenging the Internet for clues and finally found a way to get it working.

Let's take look at some solutions.

## Solution for new project formats only

The problem is really easy to solve if you, for some reason, don't intend to support older project formats. All you need to do is include the following snippet in your `csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <!-- ... -->

  <Content Include="SOME_NATIVE_LIBRARY.dll">
    <Pack>true</Pack>
    <PackageCopyToOutput>true</PackageCopyToOutput>
  </Content>
</Project>
```

This will make sure the file is copied to the output directory when building or when referencing this project either directly or as a package.

It will, however, not work if your package is referenced by a project using the older format.

## Solution for all project formats

To make it work for both old and new project formats, we can use an alternative approach that involves a custom `.targets` file that links the additional dependencies.

This file should have the same name as the NuGet package. Let's pretend our project and package are both named `Example`, which means the targets file should be named `Example.targets`.

The content of the file should look like this:

```xml
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <ItemGroup>
    <None Include="$(MSBuildThisFileDirectory)SOME_NATIVE_LIBRARY.dll">
      <Link>SOME_NATIVE_LIBRARY.dll</Link>
      <CopyToOutputDirectory>Always</CopyToOutputDirectory>
    </None>
  </ItemGroup>
</Project>
```

We can include the targets file in our project by simply adding an `<Import>` element to the `<Project>` node:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <!-- ... -->

  <Import Project="Example.targets" />
</Project>
```

This will cause MSBuild to copy `SOME_NATIVE_LIBRARY.dll` to the output directory on every build.

However, to make sure the external file and targets are included in the NuGet package we also need to add the following item group:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <!-- ... -->

  <Import Project="Example.targets" />

  <ItemGroup>
    <None Include="SOME_NATIVE_LIBRARY.dll;Example.targets">
      <Pack>true</Pack>
      <PackagePath>build</PackagePath>
    </None>
  </ItemGroup>
</Project>
```
