---
title: 'Code-Behind for ResourceDictionary in WPF'
date: '2016-10-29'
---

As any WPF developer knows, XAML can get messy due to all the nested elements and indentation. One common problematic area is data templates — they are naturally decoupled from the surrounding layout but are still nested quite deeply in the hierarchy.

To deal with it, you can refactor some of the commonly used objects as resources into a `ResourceDictionary`, which can be self-contained in its own separate XAML file. Dictionaries can later be referenced using the `Source` property or by including them in a `MergedDictionary`.

Sometimes the XAML you want to refactor may also contain some logic in code-behind, such as event handlers. By default, when you create a new resource dictionary, it comes without a code-behind class, but it's possible to add it. Let's see how we can do it.

## Linking a resource dictionary to a class

Let's assume we already have a resource dictionary created and it's in a file called `MyResourceDictionary.xaml`.

To add some code-behind to it, we just need to create a new _partial_ class. Conventionally, the code-behind file should be in the same directory as the dictionary and have the same file name. For that reason we will name this class `MyResourceDictionary` and save it as `MyResourceDictionary.xaml.cs`.

```csharp
namespace MyProject
{
    public partial class MyResourceDictionary
    {

    }
}
```

Now, in order to link the XAML to our newly created code-behind, we simply need to add the `x:Class` attribute, like so:

```xml
<ResourceDictionary x:Class="MyProject.MyResourceDictionary"
                    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:i="http://schemas.microsoft.com/expression/2010/interactivity">
<!-- ... -->
</ResourceDictionary>
```

The value in `x:Class` should be equal to the fully qualified name of the code-behind class that we've just created. Once you set it up, Visual Studio will be able to register event handlers directly in your code-behind, the same way it does for Windows, Pages, etc.
