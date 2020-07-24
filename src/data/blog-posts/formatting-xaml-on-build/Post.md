---
title: Formatting XAML Files on Build with XAMLStyler
date: 2020-01-09
cover: Cover.png
---

![cover](Cover.png)

Recently, I've decided to switch from Visual Studio to Rider as my default .NET development environment. The main problem with Visual Studio was that it was too slow when paired with ReSharper and, unfortunately, too useless when not. Rider offered me the best of both worlds.

However, one of the things that made the jump really difficult was the absence of [XAMLStyler extension](https://marketplace.visualstudio.com/items?itemName=TeamXavalon.XAMLStyler) in Rider. It's an incredibly useful plugin that automatically formats your XAML files on save, letting you completely forget about sorting attributes, maintaining indentation, and other mundane things like that. After using it for three years, the idea of writing XAML without it was unbearable.

The problem is that .NET, historically, has been a rather closed ecosystem. If you wanted to extend the development experience, that typically meant installing a custom Visual Studio extension or writing your own. Everything revolved around the same IDE, same workflow, same stack, same set of tools, and there wasn't much of a choice.

With the advent of .NET Core the situation started changing. We are now seeing a mentality shift where everything is evolving towards more modular and portable components, with even .NET SDK itself being shipped as a command line tool. Overall, .NET development experience is starting to resemble that of Node.js, which I personally think is a great thing.

Among other things, .NET Core also introduced the concept of [.NET Core Global Tools](https://aka.ms/global-tools). This feature enables any .NET developer to quickly download, install and run custom command line tools without leaving the terminal.

[Since recently](https://github.com/Xavalon/XamlStyler/issues/218), XAMLStyler is also available as a .NET custom tool, which means you can run it as a CLI instead of relying on the Visual Studio extension. In this article I will show you how I integrated it into my build process, ensuring all XAML files are always properly formatted, regardless of which IDE I'm using.

Although I will be talking about XAMLStyler in particular, the approach described here can easily be extrapolated to any other tool.

## What is XAMLStyler?

Given that I've praised it so much, it makes sense to say a few words about what is it that XAMLStyler actually does.

If you've worked with either WPF, UWP or Xamarin, chances are you already know how annoying it is to maintain good formatting in your XAML files. As developers, we like when everything is symmetrical, tidy and consistent. As developers, we also like when everything is automated.

Let's say we have the following piece of XAML that renders some UI:

```xml
<Grid>
  <Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" /><ColumnDefinition Width="Auto" />
  </Grid.ColumnDefinitions>

  <!-- Update notice -->
  <TextBlock Grid.Column="0" VerticalAlignment="Center" Foreground="{DynamicResource SecondaryTextBrush}">
    <Run Text="Update is available to version:" />
    <Run Text="v" /><Run Text="{Binding NewVersion}" FontWeight="SemiBold" />
  </TextBlock>

  <!-- Confirmation button -->
  <Button Margin="6" Grid.Column="1" Command="{Binding UpdateCommand}" Content="UPDATE NOW" ></Button>
</Grid>
```

At first glance it might look sufficiently clean as it is, but it's not. The attributes are not sorted, element declarations are far too long, the closing tag on the button is redundant. What's worse -- there is no consistency whatsoever.

Luckily, I can just run XAMLStyler on the code above and get something that looks like this:

```xml
<Grid>
  <Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="Auto" />
  </Grid.ColumnDefinitions>

  <!--  Update notice  -->
  <TextBlock
    Grid.Column="0"
    VerticalAlignment="Center"
    Foreground="{DynamicResource SecondaryTextBrush}">
    <Run Text="Update is available to version:" />
    <Run Text="v" /><Run FontWeight="SemiBold" Text="{Binding NewVersion}" />
  </TextBlock>

  <!--  Confirmation button  -->
  <Button
    Grid.Column="1"
    Margin="6"
    Command="{Binding UpdateCommand}"
    Content="UPDATE NOW" />
</Grid>
```

This is way better. Individual elements are now arranged vertically, long attribute declarations broken into separate lines, redundant code gone, even the comments are formatted as well.

Note how it didn't touch the two consecutive `Run` elements in my code. That's because splitting them into multiple lines would result in a different layout being rendered. XAMLStyler is aware of these nuances and doesn't make changes that could introduce unwanted side-effects.

Another thing I really like about it, is how it sorts attributes. They are not merely sorted alphabetically, but also in accordance with the categories to which they belong. For example, properties like `Margin` and `VerticalAlignment` are placed above most other attributes, which makes them easier to find.

This and all other aspects of the formatting behavior are [fully configurable](https://github.com/Xavalon/XamlStyler/wiki/External-Configurations) in settings or via an external configuration file.

## Using it as a .NET Core global tool

The release of .NET Core 2.1 introduced us with a feature that lets us use the so-called global tools. These are essentially console applications published as NuGet packages, that you can easily download and run.

To use XAMLStyler as a global tool, we just need to install it with the following command:

```c
> dotnet tool install XamlStyler.Console --global
```

This downloads the [corresponding NuGet package](https://www.nuget.org/packages/XamlStyler.Console), extracts its contents to a shared directory, then puts the executable on the system PATH.

Following that, we can now run `xstyler` from the command line. To process all XAML files in a directory, we can use:

```c
> xstyler --directory f:\Projects\Softdev\LightBulb\ --recursive

Processing: f:\Projects\Softdev\LightBulb\LightBulb\App.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\RootView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Components\AdvancedSettingsTabView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Components\WhitelistSettingsTabView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Components\GeneralSettingsTabView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Components\HotKeySettingsTabView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Components\LocationSettingsTabView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Dialogs\MessageBoxView.xaml
Processing: f:\Projects\Softdev\LightBulb\LightBulb\Views\Dialogs\SettingsView.xaml
Processed 9 of 9 files.
```

This is nice, but not ideal. As evident by the name, global tools are installed system-wide, which is convenient for some one-off utilities but doesn't work so well with tools that your project relies on. That's because the project repository is no longer self-contained -- other developers (or future you) will now have to also manually install this tool on their machines, which adds an an extra unnecessary step.

Having to take any additional steps after `git clone` makes the developer experience worse and introduces indeterminism, so we want to avoid that. After all, it's always nice to keep the repository as a single source of truth.

## Installing as a local tool

[.NET Core local tools](https://aka.ms/local-tools) weren't really a thing until .NET Core 3.0 came around. Previously, there was a way to install a global tool inside a directory to make it "local" but that was a hack more than anything. In earlier versions of .NET Core we also had `DotNetCliToolReference`, but it's [deprecated now](https://github.com/dotnet/announcements/issues/107) and can't be used in new projects.

With the latest SDK, however, we can now install local tools simply by dropping the `--global` option:

```c
> dotnet tool install XamlStyler.Console
```

Note that if we try to run this in our project's repository we will get the following error:

```c
Cannot find a manifest file.
For a list of locations searched, specify the "-d" option before the tool name.
If you intended to install a global tool, add `--global` to the command.
If you would like to create a manifest, use `dotnet new tool-manifest`,
  usually in the repo root directory.
```

As the message states, in order to install local tools we will first need to create a manifest file in the root of the project repository. We can do this using the suggested command:

```c
> dotnet new tool-manifest
```

That creates an empty manifest at `/.config/dotnet-tools.json`. We can now run the original command again, which will add a tool entry to this manifest file:

```c
> dotnet tool install XamlStyler.Console

You can invoke the tool from this directory using the following commands:
  'dotnet tool run xstyler' or 'dotnet xstyler'.

Tool 'xamlstyler.console' (version '3.2001.0') was successfully installed.
Entry is added to the manifest file f:\Projects\Softdev\LightBulb\.config\dotnet-tools.json.
```

As long as the manifest file is tracked by git, any developer who clones the repository can run a simple command to download and install all tools listed in the manifest file:

```c
> dotnet tool restore
```

Note that by installing XAMLStyler as a local tool, it is no longer added on the PATH, so we have to run it as `dotnet xstyler` instead of just `xstyler`. The name will be resolved anywhere in the repository or in any of its descendant directories.

In most cases, when working with .NET custom CLI tools, you will want to have them installed locally for your project. This provides a higher degree of portability as opposed to global tools.

## Integrating in the build process

Things are much better now that XAMLStyler is installed locally in our project, but we still have to perform manual actions. This is unacceptable.

We can go a step further and execute the tool during build by extending the default workflow. With MSBuild-based projects this is possible by adding a custom [target](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-targets).

A target is a set of tasks that can be either invoked manually or configured to run automatically after some other, usually built-in, target. As a trigger we can use the default `BeforeBuild` target which is executed right before the build starts.

Let's update our project file accordingly:

```xml
<Project Sdk="Microsoft.NET.Sdk.WindowsDesktop">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <UseWPF>true</UseWPF>
  </PropertyGroup>

  <!-- ... -->

  <Target Name="Format XAML" AfterTargets="BeforeBuild">
    <Exec Command="dotnet tool restore" />
    <Exec Command="dotnet xstyler -r -d &quot;$(MSBuildProjectDirectory)&quot;" />
  </Target>

</Project>
```

As you can see, this target will trigger automatically on each build, execute `dotnet tool restore` and then run XAMLStyler recursively on the project's directory.

By executing the restore first, we ensure that the tool is always available. Once it's downloaded and installed, running the restore again will just complete instantly so we don't have to worry about any performance issues. I've found this to be the most reliable approach after experimenting with a few different ones.

Now, when we run `dotnet build` on the project, it will also execute XAMLStyler to format all XAML files inside of it. The same will happen if we build the project in Visual Studio, Rider, VS Code, or anywhere else. Also, since the tool is installed locally and restored as part of the build, any developer who clones the repository won't have to take any additional steps to get up and running.

## Summary

XAMLStyler is an awesome tool that will make you forget about formatting in your XAML files once and for all. By integrating it into the build process, we ensure that all XAML files will adhere to a consistent and clean format, no matter who's working on it and where.

With .NET Core 3.0 we can now install locally scoped command line tools. This is better than the previously available global tool concept because it's more portable. By using local tools we can also easily integrate custom workflows into our project.

If you're interested to learn more about .NET Core global and local tools, check out [this article by Andrew Lock](https://andrewlock.net/new-in-net-core-3-local-tools) and [another one by Stuart Lang](https://stu.dev/dotnet-core-3-local-tools). There's also a [curated list of .NET custom tools](https://github.com/natemcmaster/dotnet-tools) maintained by Nate McMaster.
