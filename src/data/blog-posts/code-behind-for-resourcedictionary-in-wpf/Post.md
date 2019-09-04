---
title: Code-behind for ResourceDictionary in WPF
date: 2016-10-29
---

As any WPF developer knows, XAML can get messy due to all the nested elements and tabulation. One common problematic area is data templates -- they are naturally decoupled from the surrounding layout but typically nested quite deep in the hierarchy.

To deal with it, you can refactor some of the commonly used objects as resources into a `ResourceDictionary`, which can also be self-contained in its own separate XAML file. Dictionaries can later be referenced using the `Source` property or by including them in a `MergedDictionary`.

Sometimes the XAML you want to refactor out can also contain some logic in code-behind, such as event handlers. Turns out resource dictionary, just like everything else, can actually have its own code-behind class as well.

## Step 1: create a partial C# class

To create a code-behind class, you just need to add any class to the project and link it with the XAML file. Conventionally, the code-behind file should be in the same namespace as the dictionary and have the same file name, ending with _.cs_ -- _MyResourceDictionary.xaml.cs_.

The only requirement is that the class is declared as partial:

```csharp
namespace MyProject
{
    public partial class MyResourceDictionary
    {

    }
}
```

## Step 2: reference the code-behind class

To link the XAML definition to code-behind, use the `x:Class` attribute, just like so:

```xml
<ResourceDictionary x:Class="MyProject.MyResourceDictionary"
                    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:i="http://schemas.microsoft.com/expression/2010/interactivity">
<!-- ... -->
</ResourceDictionary>
```

The value in `x:Class` should be equal to the fully-qualified name of the code-behind class that you've just created. Once you set it up, Visual Studio will be able to register event handlers directly in your code-behind, the same way it does for Windows, Pages, etc.
