---
title: Refactoring C# code using partial classes
date: 2020-02-01
cover: Cover.png
---

![cover](Cover.png)

As our code grows, we regularly find ourselves seeking new ways to keep it well structured and organized. Systematic refactoring is a necessity but often doesn't come very easily.

One of the challenges we often face is deciding how to group different parts of a bigger class together. Even with a good degree of separation, sometimes we end up with classes that might be a bit too much to reason about.

From the earliest version of the language, C# provided a construct called [regions](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/preprocessor-directives/preprocessor-region). Although it can be helpful when trying to organize code, most seem to agree that using regions is [generally an anti-pattern](https://softwareengineering.stackexchange.com/questions/53086/are-regions-an-antipattern-or-code-smell). Even if the use of regions can be justified, the seemingly foreign syntax and code folding often tends to make readability worse.

I do believe that being able to group code to form logical blocks is a good thing, however I agree that regions cause more problems than they solve. For that reason, I've been actively using _partial classes_ instead, which in many ways offer similar benefits without suffering from the same drawbacks.

[Partial classes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/partial-classes-and-methods) is a C# feature that lets you split the definition of a type into multiple parts, each potentially in its own file. During build, the compiler collects all of the parts and combines them together to produce a single  class as if it was defined in one place. It's enabled by adding the `partial` keyword in the definition.

In this article I will show you how I typically utilize partial classes when refactoring my own code.

## Extracting static members

One thing that I like to do nearly all the time is separate static properties and methods from the rest of the class. That might seem like an arbitrary criteria to base upon, but I find it makes sense because we do reason about static and non-static members in different ways.


Here's how that would look:

```csharp
public partial class PartitionedTextWriter : TextWriter
{
    private readonly string _baseFilePath;
    private readonly long _partitionLimit;

    private int _partitionIndex;
    private TextWriter _innerWriter;
    private long _partitionCharCount;

    public PartitionedTextWriter(string baseFilePath, long partitionLimit)
    {
        _baseFilePath = baseFilePath;
        _partitionLimit = partitionLimit;
    }

    private void InitializeInnerWriter()
    {
        // Get current file path by injecting partition identifier in the file name
        // E.g. MyFile.txt, MyFile [part 2].txt, etc
        var filePath = GetPartitionFilePath(_baseFilePath, _partitionIndex);

        _innerWriter = File.CreateText(filePath);
    }

    public override void Write(char value)
    {
        // Make sure the underlying writer is initialized
        if (_innerWriter == null)
            InitializeInnerWriter();

        // Write content
        _innerWriter.Write(value);
        _partitionCharCount++;

        // When the char count exceeds the limit,
        // start writing to a new file
        if (_partitionCharCount >= _partitionLimit)
        {
            _partitionIndex++;
            _partitionCharCount = 0;

            _innerWriter?.Dispose();
            _innerWriter = null;
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _innerWriter?.Dispose();

        base.Dispose(disposing);
    }
}

public partial class PartitionedTextWriter
{
    // Pure helper function
    private static string GetPartitionFilePath(string baseFilePath, int partitionIndex)
    {
        if (partitionIndex <= 0)
            return baseFilePath;

        // Inject "[part x]" in the file name
        var fileNameWithoutExt = Path.GetFileNameWithoutExtension(baseFilePath);
        var fileExt = Path.GetExtension(baseFilePath);
        var fileName = $"{fileNameWithoutExt} [part {partitionIndex + 1}]{fileExt}";

        var dirPath = Path.GetDirectoryName(baseFilePath);
        if (!string.IsNullOrWhiteSpace(dirPath))
            return Path.Combine(dirPath, fileName);

        return fileName;
    }
}
```

As a developer reading this code for the first time, you will most likely appreciate this separation. When we're dealing with the notions of creating new files, we don't really care as much about how `GetPartitionFilePath` is implemented. Similarly, if we wanted to know how `GetPartitionFilePath` works, the rest of the code would likely act as unrelated noise.

One could argue that we could've instead moved our helper method to a different static class. That could work in some cases, especially if that method is going to be reused in other places as well. However, that would also make the method less discoverable and I generally prefer to keep dependencies as close to the source as possible, in order to reduce cognitive overhead.

Note that in this example both partial definitions of the class are placed in the same file. Since our primary goal is to group code rather than shred it to pieces, keeping things close makes more sense. I would only consider moving the partitions to separate files only if they get too big to keep in a single file.

___

This idea works especially well when combining with the ["Resource acquisition is initialization"](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization) pattern. Using partial classes we can group methods responsible for initialization and separate them from the rest of the class.

In the following example we have a class called `NativeDeviceContext` which is a wrapper for a device context resource in the Windows operating system. The class can be constructed by providing a handle to the native resource, but the consumers will not be doing this manually. Instead they will be calling one of the available static methods such as `FromDeviceName(...)` that will take care of the initialization for them.

Here's how we can structure it:

```csharp
// Resource management concerns
public partial sealed class NativeDeviceContext : IDisposable
{
    public IntPtr Handle { get; }

    public NativeDeviceContext(IntPtr handle)
    {
        Handle = handle;
    }

    ~NativeDeviceContext()
    {
        Dispose();
    }

    public void SetGammaRamp(GammaRamp ramp)
    {
        // Call a WinAPI method via p/invoke
        NativeMethods.SetDeviceGammaRamp(Handle, ref ramp);
    }

    public void Dispose()
    {
        NativeMethods.DeleteDC(Handle);
        GC.SuppressFinalize(this);
    }
}

// Resource acquisition concerns
public partial sealed class NativeDeviceContext
{
    public static NativeDeviceContext? FromDeviceName(string deviceName)
    {
        var handle = NativeMethods.CreateDC(deviceName, null, null, IntPtr.Zero);

        return handle != IntPtr.Zero
            ? new NativeDeviceContext(handle)
            : null;
    }

    public static NativeDeviceContext? FromPrimaryMonitor() { /* ... */ }

    public static IReadOnlyList<NativeDeviceContext> FromAllMonitors() { /* ... */ }
}
```

Similarly to the previous example, this makes the code a lot more readable by visually separating two unrelated, albeit coupled, concerns -- resource initialization and resource management.

## Separating interface implementations

Another interesting thing we can do with partial classes is separate interface implementations. More often than not, members responsible for implementing interfaces don't really contribute to the core behavior of the class, so it makes sense to push them out.

For example, let's take a look at `HtmlElement`, a class that represents an element in the HTML DOM. It implements `IEnumerable<T>` for iterating over its children and `ICloneable` to facilitate deep copying.

Using partial classes we can arrange our code like this:

```csharp
// Core concerns
public partial class HtmlElement : HtmlNode
{
    public string TagName { get; }
    public IReadOnlyList<HtmlAttribute> Attributes { get; }
    public IReadOnlyList<HtmlNode> Children { get; }

    public HtmlElement(string tagName,
        IReadOnlyList<HtmlAttribute> attributes,
        IReadOnlyList<HtmlNode> children)
    {
        /* ... */
    }

    public HtmlElement(HtmlElement other)
    {
        /* ... */
    }

    public string? GetAttributeValue(string attributeName) { /* ... */ }

    public IEnumerable<HtmlNode> GetDescendants() { /* ... */ }
}

// Implementation of IEnumerable<T>
public partial class HtmlElement : IEnumerable<HtmlNode>
{
    public IEnumerator<string> GetEnumerator() => Attributes.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// Implementation of ICloneable
public partial class HtmlElement : ICloneable
{
    public object Clone() => new HtmlElement(this);
}
```

Putting interface implementations in partial classes is a convenient way to hide noise that doesn't contribute to the essence of the class. We are probably not going to be as much interested in how the class implements `IEnumerable<T>`, as opposed to its intrinsic methods. Similar to previous example, partial classes help us draw that visual distinction.

The cool thing is that C# doesn't enforce us to declare the full signature of the class straight away. This lets us split them around as we want to create these "extensions".

___

This approach is also very useful when combined with conditional compilation. When parts of your class are only available in a certain version of the framework, it can be very convenient to take them out into a partial class.

Here's an example where we override the `DisposeAsync` method, but only if we're building the assembly against .NET Standard 2.1:

```csharp
public partial class SegmentedHttpStream : Stream
{
    private readonly HttpClient _httpClient;
    private readonly string _url;
    private readonly long _segmentSize;

    private Stream? _currentStream;

    public class SegmentedHttpStream(HttpClient httpClient,
        string url, long length, long segmentSize)
    {
        /* ... */
    }

    /* Skipped overrides for Stream methods */

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _currentStream?.Dispose();

        base.Dispose(disposing);
    }
}

#if NETSTANDARD2_1
public partial class SegmentedHttpStream
{
    // This method is not available in earlier versions of the standard
    protected override async ValueTask DisposeAsync()
    {
        if (_currentStream != null)
            await _currentStream.DisposeAsync();

        await base.DisposeAsync();
    }
}
#endif
```

The clear benefit of using partial classes here is that the conditional blocks (`#if`/`#endif`) are left on the outside. Ironically, these blocks behave similarly to regions, so we use partial classes to avoid the noise that comes with them.

## Organizing private classes

Occasionally we may end up defining types that are used from within a single class. Usually it happens when we need to supply a custom implementation of some interface to a framework we're using.

In any case, it's perfectly normal avoid namespace pollution by embedding one class within another. That said, in a language as verbose as C#, class definitions can be quite noisy so, again, it makes sense to separate them.

For this example, let's pretend we're exporting a sales report as an HTML document and we're using the [Scriban](https://github.com/lunet-io/scriban) engine to do it. We also want to configure it so that templates can reference each other while being embedded in the assembly as resources instead of relying on file system. In order to do that, the framework expects us to provide a custom implementation of `ITemplateLoader`.

Seeing as our custom loader is only going to be used within this class, it makes perfect sense to have it as private class. To make things a bit more clear, we can separate it into a partial class:

```csharp
public partial class HtmlRenderer
{
    public async ValueTask<string> RenderReportAsync(SalesReport report, string templateCode)
    {
        var template = Template.Parse(templateCode);

        var templateContext = new TemplateContext
        {
            TemplateLoader = new CustomTemplateLoader(), // reference the private class
            StrictVariables = true
        };

        var model = new ScriptObject();
        model.SetValue("report", report, true);
        context.PushGlobal(model);

        return await template.RenderAsync(templateContext);
    }
}

public partial class HtmlRenderer
{
    // This type is only used within HtmlRenderer
    private class CustomTemplateLoader : ITemplateLoader
    {
        private static readonly string ResourceRootNamespace =
            $"{typeof(HtmlRenderer).Namespace}.Templates";

        private static StreamReader GetTemplateReader(string templatePath)
        {
            var resourceName = $"{ResourceRootNamespace}.{templatePath}";

            var assembly = Assembly.GetExecutingAssembly();

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
                throw new MissingManifestResourceException("Template not found.");

            return new StreamReader(stream);
        }

        public string GetPath(
            TemplateContext context,
            SourceSpan callerSpan,
            string templateName) => templateName;

        public string Load(
            TemplateContext context,
            SourceSpan callerSpan,
            string templatePath) => GetTemplateReader(templatePath).ReadToEnd();

        public async ValueTask<string> LoadAsync(
            TemplateContext context,
            SourceSpan callerSpan,
            string templatePath) => await GetTemplateReader(templatePath).ReadToEndAsync();
    }
}
```

## Grouping arbitrary code

As a matter of fact, we don't need a particular reason to decide to use partial classes. Sometimes it just _feels_ right to separate a class in two or more parts.

For example, let's say we're building a class that holds the list of options used in a CLI. There are a lot of options and some seem to be more logically related than others.

We can group them like so:

```csharp
// Core options
public partial class FormatCommand
{
    [CommandOption("files", 'f', IsRequired = true, Description = "List of files to process.")]
    public IReadOnlyList<FileInfo> Files { get; set; }

    [CommandOption("config", 'c', Description = "Configuration file.")]
    public FileInfo? ConfigFile { get; set; }
}

// Options related to formatting
public partial class FormatCommand
{
    [CommandOption("indent-size", Description = "Override: indent size.")]
    public int? IndentSize { get; set; } = 4;

    [CommandOption("line-length", Description = "Override: line length.")]
    public int? LineLength { get; set; } = 80;

    [CommandOption("insert-eof-newline", Description = "Override: insert new line at EOF.")]
    public bool? InsertEofNewLine { get; set; } = false;
}

// Command implementation
[Command("format", Description = "Format files.")]
public partial class FormatCommand : ICommand
{
    private readonly IFormattingService _formattingService;

    public FormatCommand(IFormattingService formattingService)
    {
        _formattingService = formattingService;
    }

    private Config LoadConfig() { /* ... */ }

    public async ValueTask ExecuteAsync(IConsole console)
    {
        var config = LoadConfig();

        foreach (var file in Files)
        {
            await _formattingService.FormatAsync(config, file.FullName);
            console.Output.WriteLine($"Formatted: {file.FullName}");
        }
    }
}
```

## How is this better than regions?

The most important advantage of partial classes over regions is the fact that they don't employ any additional language constructs. In fact, we're just defining classes like we normally would -- it just happens that they all share the same name.

Furthermore, regions are really noisy and often make the code even harder to read by hiding parts of it into collapsible sections like a Matroska doll. Partial classes are not used to hide code, instead they are meant to separate it into logical groups, making the process of reasoning about it easier.

In many ways, grouping code into partial classes feels somewhat like defining a _private namespace_ for types used within the same module. This is somewhat similar to F# where you can have types declared as private to a particular file.

On top of that, partial classes are also harder to abuse because, unlike regions, they can't be used within methods or other code blocks which can't contain a type declaration.

Finally, partial classes offer a bit more versatility because we can choose to split them into different files as we see fit. We can't do that with regions.

## Summary

Partial classes can be used for more than just auto-generated code. It's a powerful language feature that enables creative ways to arrange code into smaller logically-independent units. This can be very helpful when we want to reduce cognitive load or to simply keep things a bit more organized.

As an alternative to regions, this approach provides a viable refactoring solution when we can't or simply don't want to extract code into separate classes. Sometimes it's wise to avoid unnecessarily polluting namespaces and keep related code close. Partial classes let us do that while still maintaining a great degree of readability.

Since we're on the topic of refactoring, consider also checking out [a few interesting ways we can use extension methods](/blog/creative-use-of-extension-methods) to write cleaner code. Similarly to partial classes, they might have more uses than you thought.
