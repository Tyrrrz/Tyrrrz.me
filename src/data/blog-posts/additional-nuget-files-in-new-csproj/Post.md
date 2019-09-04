---
title: Additional NuGet files in new csproj
date: 2017-11-05
---

[New csproj format](https://docs.microsoft.com/en-us/dotnet/core/tools/csproj), among other things, has an option to generate a NuGet package on every successful build. It resolves dependencies, target frameworks and documentation automatically and doesn't require a predefined nuspec file as all metadata is now also part of the csproj file.

Sometimes NuGet packages may require additional files to work -- a native library or a CLI executable, for example. These dependencies are not resolved automatically but still need to be somehow included in the package. When defining a nuspec file manually, you can include such files by listing them in the `<Files>` section. To instruct the referencing project to copy these files to output folder, you can add a targets file which will extend the project file with additional build steps.

You can still resort to using a manually defined nuspec file in the new csproj format by setting the `<NuspecFile>` property, however that's not very fun.

At the time of writing, this topic is barely covered in documentation and searching yields scarce results, if any. My challenge-driven friend and coworker **Ihor Nechyporuk** spent multiple hours scavenging internet for clues and finally found a way to get it properly working.

## Solution for new project formats only

The problem is really easy to solve if you, for some reason, don't intend to support older project formats. All you need to do is include the following snippet in your csproj:

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

## Solution for all project formats

### Step 1: create a targets file

You need to create a targets file that links your additional dependencies. This file should have the same name as the NuGet package. Let's pretend our project and package are both named _Example_, which means the targets file should be named _Example.targets_.

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

### Step 2: reference targets file in project

To include this targets file in the project, you need to add an `<Import>` element to the `<Project>` node.

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <!-- ... -->

  <Import Project="Example.targets" />
</Project>
```

This will cause MSBuild to copy _SOME_NATIVE_LIBRARY.dll_ to output directory on every build. However, to make sure the external file and targets are added into the NuGet package you also need to add an additional item group:

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
