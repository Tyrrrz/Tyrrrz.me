---
title: Refactoring C# Code Using Partial Classes
date: 2020-02-03
cover: Cover.png
---

![cover](Cover.png)

As our code grows, we regularly find ourselves seeking new ways to keep it well structured and organized. Systematic refactoring is a necessity but often doesn't come very easily.

One of the challenges we often face is deciding how to group different parts of a bigger class together. Even with a good degree of separation, sometimes we end up with classes that might be a bit too much to reason about.

From the earliest versions of the language, C# provided a construct called [regions](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/preprocessor-directives/preprocessor-region). Although it can be helpful when trying to organize code, most seem to agree that using regions is [generally an anti-pattern](https://softwareengineering.stackexchange.com/questions/53086/are-regions-an-antipattern-or-code-smell). Even if their usage can be justified, their benefits often come at a rather steep cost in terms of readability.

I do believe that being able to group code to form logical blocks is useful, however I agree that regions cause more problems than they solve. For that reason, I've been actively using _partial classes_ instead, which in many ways can be used for a similar purpose without suffering from the same drawbacks.

[Partial classes](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/partial-classes-and-methods) is a C# feature that lets you split the definition of a type into multiple parts, each potentially in its own file. During the build, compiler collects all of the parts and combines them together to produce a single class, as if it was defined in one place. It's enabled by adding the `partial` keyword in the definition.

In this article I will show you how I typically utilize partial classes when refactoring my own code.

## Extracting static members

One thing that I like to do nearly all the time is separate static properties and methods from the rest of the class. That might seem like an arbitrary criteria, but I find it makes sense because we do reason about static and non-static members in different ways.

Let's have a look at an example. Imagine we're working on an abstraction called `PartitionedTextWriter` that implements the _rolling file_ concept -- it acts as a streaming text writer that automatically switches to a new file after reaching a certain character threshold in the previous one.

The class is initialized with a base path and it needs to use that to generate file names for each partition. Because that's pure business logic without side effects, it makes perfect sense to put it into a static helper method.

Usually, mixing static and non-static members can be quite confusing. Let's see how that looks when we use partial classes instead:

```csharp
public partial class PartitionedTextWriter : TextWriter
{
    private readonly string _baseFilePath;
    private readonly long _partitionLimit;

    private int _partitionIndex;
    private TextWriter _innerWriter;
    private long _partitionCharCount;

    public override Encoding Encoding { get; } = Encoding.UTF8;

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

Note that in this example both partial definitions of the class are placed in the same file. Since our primary goal is to group code rather than shred it to pieces, keeping things close makes more sense. I would consider moving the partitions to separate files only if they get too big to keep in one place.

---

This idea works especially well when combining with the ["Resource acquisition is initialization"](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization) pattern. Using partial classes we can group methods responsible for initialization and separate them from the rest of the class.

In the following example we have a class called `NativeDeviceContext` which is a wrapper for a device context resource in the Windows operating system. The class can be constructed by providing a handle to the native resource, but the consumers will not be doing this manually. Instead they will be calling one of the available static methods such as `FromDeviceName(...)` that will take care of the initialization for them.

Again, let's see how it looks when we split out the static methods:

```csharp
// Resource management concerns
public sealed partial class NativeDeviceContext : IDisposable
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
public partial class NativeDeviceContext
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

Similarly to the previous example, this makes the code a lot more readable by visually separating two unrelated (albeit coupled) concerns -- resource initialization and resource management.

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
    public IEnumerator<HtmlNode> GetEnumerator() => Children.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// Implementation of ICloneable
public partial class HtmlElement : ICloneable
{
    public object Clone() => new HtmlElement(this);
}
```

Putting interface implementations in partial classes can help us reduce the "routing noise" caused by methods that forward calls upstream. Additionally, since C# allows us to specify the class signature on each partition separately, we can conveniently group members that belong to the same interface.

---

This approach is also very useful when combined with conditional compilation. Occasionally, we may want to introduce API that depends on features available in a specific version of the framework. To do that, we have to use the `#if` directive which acts similarly to regions, making our code less readable.

Partial classes can help us make things tidier. Let's take a look at an example where we override `DisposeAsync` but only if we're building the assembly against .NET Standard 2.1:

```csharp
public partial class SegmentedHttpStream : Stream
{
    private readonly HttpClient _httpClient;
    private readonly string _url;
    private readonly long _segmentSize;

    private Stream? _currentStream;

    public SegmentedHttpStream(HttpClient httpClient,
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
    public override async ValueTask DisposeAsync()
    {
        if (_currentStream != null)
            await _currentStream.DisposeAsync();

        await base.DisposeAsync();
    }
}
#endif
```

The clear benefit of using partial classes in such cases is that we are able to completely mitigate the noise caused by the conditional blocks. It looks much better when they are pushed outwards instead of being in between code.

## Organizing private classes

It's not all that uncommon to have private classes. These are convenient when we want to avoid namespace pollution while defining a type that's only used within one place. Typical case for this is when we need to implement a custom interface to override certain behavior in a third party library or a framework.

As an example, imagine we're exporting a sales report as an HTML document and we're using the [Scriban](https://github.com/lunet-io/scriban) engine to do it. In this particular scenario, we need to configure it so that templates can be resolved from the resources embedded in the assembly rather than from the file system. In order to do that, the framework expects us to provide a custom implementation of `ITemplateLoader`.

Seeing as our custom loader is going to be used only within this class, it makes perfect sense to define it as private class. However, with C# being as verbose as it is, private classes may introduce unwanted noise into our code.

Using partial classes, though, we can clean it up like this:

```csharp
public partial class HtmlReportRenderer : IReportRenderer
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

        templateContext.PushGlobal(model);

        return await template.RenderAsync(templateContext);
    }
}

public partial class HtmlReportRenderer
{
    // This type is only used within HtmlReportRenderer
    private class CustomTemplateLoader : ITemplateLoader
    {
        private static readonly string ResourceRootNamespace =
            $"{typeof(HtmlReportRenderer).Namespace}.Templates";

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

We don't always need a special case to decide to use partial classes. In fact, sometimes it just feels right to split parts of our code into some logical blocks.

In this example we have a command line application that formats files. Both the options and the command behavior are defined as part of a single class, which may be a little confusing.

By using partial classes, we can split and group different parts of the class like so:

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

## Summary

Partial classes can be used for more than just auto-generated code. It's a powerful language feature that enables creative ways to arrange code into smaller logically independent units. This can be very helpful when we want to reduce cognitive load or to simply keep things a bit more organized.

Since we're on the topic of refactoring, consider also checking out [a few interesting ways we can use extension methods](/blog/creative-use-of-extension-methods) to write cleaner code. Similarly to partial classes, they might have more uses than you thought.
