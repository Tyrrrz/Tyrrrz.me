---
title: Creative use of extension methods
date: 2019-01-26
cover: Cover.png
---

![cover](Cover.png)

I'm sure everyone with at least some background in C# is aware of extension methods -- a nice feature that lets developers extend existing classes with new methods.

This is extremely convenient in cases where you want to add functionality to types you don't have control over -- I think everyone at some point authored extensions for the base class library just to make some things more accessible.

But besides the more obvious use cases, there are a few interesting patterns that directly rely on extension methods, showing how they can used in a slightly less conventional way.

## Adding methods to enums

An enum is simply a set of constant numeric values with names uniquely assigned to them. Even though all enums in C# inherit from the `Enum` abstract class, they are not really treated as classes. This limitation, among other things, prevents them from having methods.

There are some cases where having logic on an enum may be helpful. One of those cases is where a value of an enum can have multiple different representations and you want to be able to easily convert to one of them.

For example, imagine the following type in a generic application that can save files in various formats:

```csharp
public enum FileFormat
{
    PlainText,
    OfficeWord,
    Markdown
}
```

This enum defines a list of formats the application supports and is probably used in various places in code to invoke branching logic depending on its value.

Since each file format can also be represented by its file extension, it would be nice if `FileFormat` contained a method to get it. This is where we can use an extension method to do it like this:

```csharp
public static class FileFormatExtensions
{
    public static string GetFileExtension(this FileFormat fileFormat)
    {
        if (fileFormat == FileFormat.PlainText)
            return "txt";

        if (fileFormat == FileFormat.OfficeWord)
            return "docx";

        if (fileFormat == FileFormat.Markdown)
            return "md";

        // This will be thrown if we add a new file format but forget to add corresponding file extension
        throw new ArgumentOutOfRangeException(nameof(fileFormat));
    }
}
```

Which makes it possible to do the following:

```csharp
var format = FileFormat.Markdown;
var fileExt = format.GetFileExtension(); // "md"
var fileName = $"output.{fileExt}"; // "output.md"
```

## Refactoring model classes

There are cases where you may not want to add a method directly to a class, for example when it's a model.

Models typically represent a set of public get-only immutable properties, so adding methods to a model class may make it look impure or may give off a suspicion that the methods are accessing some private state. Extension methods don't have that problem because they can't access model's private members and, by nature, aren't part of the model itself.

So consider this example of two models -- one represents a closed caption track for a video, and another represents an individual caption:

```csharp
public class ClosedCaption
{
    // Text that gets displayed
    public string Text { get; }

    // When it gets displayed relative to beginning of the track
    public TimeSpan Offset { get; }

    // For how long does it get displayed
    public TimeSpan Duration { get; }

    public ClosedCaption(string text, TimeSpan offset, TimeSpan duration)
    {
        Text = text;
        Offset = offset;
        Duration = duration;
    }
}

public class ClosedCaptionTrack
{
    // Language of the closed captions inside
    public string Language { get; }

    // Collection of closed captions
    public IReadOnlyList<ClosedCaption> Captions { get; }

    public ClosedCaptionTrack(string language, IReadOnlyList<ClosedCaption> captions)
    {
        Language = language;
        Captions = captions;
    }
}
```

In the current state, if someone wanted to get a closed caption displayed at specific point in time, they would have to run a LINQ like this one:

```csharp
var time = TimeSpan.FromSeconds(67); // 1:07
var caption = track.Captions.FirstOrDefault(cc => cc.Offset <= time && cc.Offset + cc.Duration >= time);
```

This is error-prone and really calls for a helper method of some sorts -- it can be implemented either as a member method or an extension method, but I personally prefer the latter.

```csharp
public static class ClosedCaptionTrackExtensions
{
    public static ClosedCaption GetByTime(this ClosedCaptionTrack track, TimeSpan time)
        => track.Captions.FirstOrDefault(cc => cc.Offset <= time && cc.Offset + cc.Duration >= time);
}
```

An extension method here achieves the same thing as a normal method, but it provides a few subtle benefits:

1. It's clear that this method only works with public members of the class and doesn't mutate its private state in some obscure way.
2. It's obvious that this method simply provides a shortcut and it's there only for convenience.
3. The method is part of an entirely separate class (or even assembly) which helps keep the code cleaner.

Overall, using an extension method approach here helps draw a line between what's _necessary_ and what's _helpful_.

## Making interfaces more versatile

When designing an interface you always want to keep the contract minimal in order to make it easier to implement. It helps a lot when your interface exposes the most generic type of functionality so that others (or you) can build on top of it and cover more specific cases.

If that didn't make any sense, here's an example of a typical interface that saves some model to a file:

```csharp
public interface IExportService
{
    FileInfo SaveToFile(Model model, string filePath);
}
```

It works just fine, but a few weeks later you come back to it with a new requirement -- classes implementing `IExportService`, on top of exporting to a file, should now also be able to write to memory.

In order to satisfy that requirement, you need to add a new method to the contract:

```csharp
public interface IExportService
{
    FileInfo SaveToFile(Model model, string filePath);

    byte[] SaveToMemory(Model model);
}
```

This change just made all existing implementations of `IExportService` invalid and now all of them have to be updated to support writing to memory as well.

Instead of doing all that, we could have designed the initial version of the interface slightly differently:

```csharp
public interface IExportService
{
    void Save(Model model, Stream output);
}
```

This way, the interface enforces writing to the most generic destination -- `Stream`. Now we are no longer limited to a file output and can effectively write to almost anything.

The only downside of this approach is that the more basic operations are not as straightforward as they used to be -- now you need to set up a concrete instance of a `Stream`, wrap it in a `using` statement, and pass it as a parameter.

Fortunately, this downside can be completely eliminated with the use of extension methods:

```csharp
public static class ExportServiceExtensions
{
    public static FileInfo SaveToFile(this IExportService exportService, Model model, string filePath)
    {
        using (var output = File.Create(filePath))
        {
            exportService.Save(model, output);
            return new FileInfo(filePath);
        }
    }

    public static byte[] SaveToMemory(this IExportService exportService, Model model)
    {
        using (var output = new MemoryStream())
        {
            exportService.Save(model, output);
            return output.ToArray();
        }
    }
}
```

By refactoring the initial interface we made it a lot more versatile and maintainable, and, thanks to extension methods, we didn't have to sacrifice usability in any way.

I believe this is a good example of [Alan Kay's](https://en.wikiquote.org/wiki/Alan_Kay) famous quote -- "Simple things should be simple, complex things should be possible".
