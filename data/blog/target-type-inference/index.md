---
title: 'Simulating Target-Type Inference in C#'
date: '2020-03-10'
---

Above everything else in software development, I really enjoy building frameworks that enable other developers to create something cool. Sometimes, when chasing that perfect design I have in mind, I find myself coming up with weird hacks that push the C# language to the limit.

One such case happened not so long ago, when I was trying to figure out how to make the compiler determine the generic type of a method based on its expected return type. Seeing as C# can only infer generics from method arguments, this initially seemed impossible, however I was able to find a way to make it work.

In this article I will show a little trick I came up with to simulate target-type inference, as well as some examples of where that can be useful.

## Type inference

Type inference, in general, is the ability of the compiler to automatically detect the type of a particular expression, without having the programmer explicitly specify it. This feature works by analyzing the context in which the expression is evaluated, as well as the constraints imposed by the flow of data in the program.

By being able to detect the type automatically, languages that support type inference allow writing more succinct code, while still maintaining the full benefits of a static type system. This is why most mainstream statically typed languages have type inference, in one form or another.

C#, being one of those languages, has type inference as well. The simplest possible example of it is the `var` keyword:

```csharp
var x = 5;              // int
var y = "foo";          // string
var z = 2 + 1.0;        // double
var g = Guid.NewGuid(); // Guid
```

When doing a combined declaration and assignment operation with the `var` keyword, you don't need to specify the type of the variable. The compiler is able to figure it out based on the expression on the right side.

In a similar vein, C# also allows initializing an array without having to manually specify its type:

```csharp
var array = new[] {"Hello", "world"}; // string[]
```

Here, the compiler can see that we're initializing the array with two string elements, so it can safely conclude that the resulting array is of type `string[]`. In some (very rare) cases, it can even infer the type of an array based on the most specific common type among the individual elements:

```csharp
var array = new[] {1, 2, 3.0}; // double[]
```

However, the most interesting aspect of type inference in C# is, of course, generic methods. When calling a method with a generic signature, we can omit type arguments if they can be deduced from the values passed to the method parameters.

For example, we can define a generic method `List.Create<T>(...)` that creates a list from a sequence of elements:

```csharp
public static class List
{
    public static List<T> Create<T>(params T[] items) => new List<T>(items);
}
```

Which in turn can be used like this:

```csharp
var list = List.Create(1, 3, 5); // List<int>
```

In the above scenario we could've specified the type explicitly by writing `List.Create<int>(...)`, but we didn't have to. The compiler was able to detect it automatically based on the arguments passed to the method, which are constrained by the same type as the returned list itself.

Interestingly enough, all the examples shown above are in fact based on the same form of type inference, which works by analyzing the constraints imposed by other expressions, whose type is already known. In other words, it examines the flow of data that _goes in_ and draws conclusions about the data that _comes out_.

There are scenarios, however, where we may want type inference to work in the opposite direction. Let's see where that could be useful.

## Type inference for option containers

If you have been writing code in a functional style before, it's very likely that you're intimately familiar with the `Option<T>` type. It's a container that encapsulates a single value (or absence thereof) and allows us to perform various operations on the content without actually observing its state.

In C#, an option type is usually defined by encapsulating two fields — a generic value and a flag that indicates whether that value is actually set. It could look something like this:

```csharp
public readonly struct Option<T>
{
    private readonly T _value;
    private readonly bool _hasValue;

    private Option(T value, bool hasValue)
    {
        _value = value;
        _hasValue = hasValue;
    }

    public Option(T value)
        : this(value, true)
    {
    }

    public TOut Match<TOut>(Func<T, TOut> some, Func<TOut> none) =>
        _hasValue ? some(_value) : none();

    public void Match(Action<T> some, Action none)
    {
        if (_hasValue)
            some(_value);
        else
            none();
    }

    public Option<TOut> Select<TOut>(Func<T, TOut> map) =>
        _hasValue ? new Option<TOut>(map(_value)) : new Option<TOut>();

    public Option<TOut> Bind<TOut>(Func<T, Option<TOut>> bind) =>
        _hasValue ? bind(_value) : new Option<TOut>();
}
```

This API design is fairly basic. The implementation above hides the underlying value away from the consumers, surfacing it only through the `Match(...)` method, which unwraps the container by handling both of its potential states. Additionally, there are `Select(...)` and `Bind(...)` methods that can be used to safely transform the value, regardless of whether it's actually been set or not.

Also, in this example, `Option<T>` is defined as a `readonly struct`. Seeing as it's mainly returned from methods and referenced in local scopes, this decision makes sense from a performance point of view.

Just to make things convenient, we may also want to provide factory methods that help users construct new instances of `Option<T>` more naturally:

```csharp
public static class Option
{
    public static Option<T> Some<T>(T value) => new Option<T>(value);

    public static Option<T> None<T>() => new Option<T>();
}
```

Which can be used like this:

```csharp
public static Option<int> Parse(string number)
{
    return int.TryParse(number, out var value)
        ? Option.Some(value)
        : Option.None<int>();
}
```

As you can see, in case with `Option.Some<T>(...)`, we were able to drop the generic argument because the compiler could infer it from the type of `value`, which is `int`. On the other hand, the same wouldn't work with `Option.None<T>(...)` because it doesn't have any parameters, hence why the type needed to be specified manually.

Even though the type argument for `Option.None<T>(...)` seems to be inherently obvious from the context, the compiler is not able to deduce it. This is because, as mentioned earlier, type inference in C# only works by analyzing the data that flows in and not the other way around.

Of course, ideally, we would want the compiler to figure out the type of `T` in `Option.None<T>(...)` based on the _return type_ this expression is _expected_ to have, as dictated by the signature of the containing method. If not, we would want it to at least get the `T` from the first branch of the conditional expression, where it was already inferred from `value`.

Unfortunately, neither of these is possible with C#'s type system because it would need to work out the types in reverse, which is something it can't do. That said, we can help it a little.

We can simulate _target-type inference_ by having `Option.None()` return a special non-generic type, representing an option with deferred initialization that can be coerced into `Option<T>`. Here's how that would look:

```csharp
public readonly struct Option<T>
{
    private readonly T _value;
    private readonly bool _hasValue;

    private Option(T value, bool hasValue)
    {
        _value = value;
        _hasValue = hasValue;
    }

    public Option(T value)
        : this(value, true)
    {
    }

    // ...

    public static implicit operator Option<T>(NoneOption none) => new Option<T>();
}

public readonly struct NoneOption
{
}

public static class Option
{
    public static Option<T> Some<T>(T value) => new Option<T>(value);

    public static NoneOption None { get; } = new NoneOption();
}
```

With these changes, `Option.None` now returns a dummy `NoneOption` object, which is essentially an empty option whose type hasn't been decided yet. Because `NoneOption` is not generic, we were also able to drop the generics from the corresponding factory method and turn it into a property.

Additionally, we made it so `Option<T>` implements an implicit conversion from `NoneOption`. Although operators themselves can't be generic in C#, they still retain type arguments of the declaring type, allowing us to define this conversion for _every possible_ variant of `Option<T>`.

All of this lets us write `Option.None` and have the compiler coerce it automatically to the destination type. From the consumer's point of view, it looks as though we've successfully implemented target-type inference:

```csharp
public static Option<int> Parse(string number)
{
    return int.TryParse(number, out var value)
        ? Option.Some(value)
        : Option.None;
}
```

## Type inference for result containers

Just like we did with `Option<T>`, we may want to apply the same treatment to `Result<TOk, TError>`. This type fulfills a similar purpose, except that it also has a fully fledged value that represents the negative case, providing additional information about the error.

Here's how we could implement it:

```csharp
public readonly struct Result<TOk, TError>
{
    private readonly TOk _ok;
    private readonly TError _error;
    private readonly bool _isError;

    private Result(TOk ok, TError error, bool isError)
    {
        _ok = ok;
        _error = error;
        _isError = isError;
    }

    public Result(TOk ok)
        : this(ok, default, false)
    {
    }

    public Result(TError error)
        : this(default, error, true)
    {
    }

    // ...
}

public static class Result
{
    public static Result<TOk, TError> Ok<TOk, TError>(TOk ok) =>
        new Result<TOk, TError>(ok);

    public static Result<TOk, TError> Error<TOk, TError>(TError error) =>
        new Result<TOk, TError>(error);
}
```

And here's how it would then be used:

```csharp
public static Result<int, string> Parse(string input)
{
    return int.TryParse(input, out var value)
        ? Result.Ok<int, string>(value)
        : Result.Error<int, string>("Invalid value");
}
```

As you can see, the situation regarding type inference is even more dire here. Neither `Result.Ok<TOk, TError>(...)` nor `Result.Error<TOk, TError>(...)` have enough parameters to infer both generic arguments, so we are forced to specify them manually in both cases.

Having to write out these types every time leads to visual noise, code duplication, and bad developer experience in general. Let's try to rectify this using the same technique from earlier:

```csharp
public readonly struct Result<TOk, TError>
{
    private readonly TOk _ok;
    private readonly TError _error;
    private readonly bool _isError;

    private Result(TOk ok, TError error, bool isError)
    {
        _ok = ok;
        _error = error;
        _isError = isError;
    }

    public Result(TOk ok)
        : this(ok, default, false)
    {
    }

    public Result(TError error)
        : this(default, error, true)
    {
    }

    public static implicit operator Result<TOk, TError>(DelayedResult<TOk> ok) =>
        new Result<TOk, TError>(ok.Value);

    public static implicit operator Result<TOk, TError>(DelayedResult<TError> error) =>
        new Result<TOk, TError>(error.Value);
}

public readonly struct DelayedResult<T>
{
    public T Value { get; }

    public DelayedResult(T value)
    {
        Value = value;
    }
}

public static class Result
{
    public static DelayedResult<TOk> Ok<TOk>(TOk ok) =>
        new DelayedResult<TOk>(ok);

    public static DelayedResult<TError> Error<TError>(TError error) =>
        new DelayedResult<TError>(error);
}
```

Here we've similarly defined `DelayedResult<T>` that represents the initialized part of `Result<TOk, TError>`. Again, we're using implicit conversion operators to coerce the delayed instance into the destination type.

Doing all that enables us to rewrite our code like this:

```csharp
public static Result<int, string> Parse(string input)
{
    return int.TryParse(input, out var value)
        ? (Result<int, string>) Result.Ok(value)
        : Result.Error("Invalid value");
}
```

This is a bit better but not ideal. The problem here is that the conditional expression in C# doesn't coerce its branches directly to the expected type, but instead tries to first convert the type of the negative branch into the type of the positive branch. Because of that, we need to explicitly cast the positive branch into `Result<int, string>` to specify the common denominator.

However, this issue can be completely avoided if we just use a conditional statement instead:

```csharp
public static Result<int, string> Parse(string input)
{
    if (int.TryParse(input, out var value))
        return Result.Ok(value);

    return Result.Error("Invalid value");
}
```

I'm much more satisfied with this setup. We were able to drop the generic arguments entirely, while maintaining the same signature and type safety as before. Again, from a high-level perspective this may look as if the generic arguments were somehow inferred from the expected return type.

However, you may have noticed that there's a bug in the implementation. If the types of `TOk` and `TError` are the same, there's an ambiguity as to which state `DelayedResult<T>` actually represents.

For example, imagine we were using our result type in the following scenario:

```csharp
public interface ITranslationService
{
    Task<bool> IsLanguageSupportedAsync(string language);

    Task<string> TranslateAsync(string text, string targetLanguage);
}

public class Translator
{
    private readonly ITranslationService _translationService;

    public Translator(ITranslationService translationService)
    {
        _translationService = translationService;
    }

    public async Task<Result<string, string>> TranslateAsync(string text, string language)
    {
        if (!await _translationService.IsLanguageSupportedAsync(language))
            return Result.Error($"Language {language} is not supported");

        var translated = await _translationService.TranslateAsync(text, language);
        return Result.Ok(translated);
    }
}
```

Here `Result.Error<TError>(...)` and `Result.Ok<TOk>(...)` both return `DelayedResult<string>`, so the compiler struggles to figure out what to do with it:

```ini
Cannot convert expression type 'DelayedResult<string>' to return type 'Result<string,string>'
```

Luckily, the fix is simple — we just need to represent each of the individual states separately:

```csharp
public readonly struct Result<TOk, TError>
{
    private readonly TOk _ok;
    private readonly TError _error;
    private readonly bool _isError;

    private Result(TOk ok, TError error, bool isError)
    {
        _ok = ok;
        _error = error;
        _isError = isError;
    }

    public Result(TOk ok)
        : this(ok, default, false)
    {
    }

    public Result(TError error)
        : this(default, error, true)
    {
    }

    public static implicit operator Result<TOk, TError>(DelayedOk<TOk> ok) =>
        new Result<TOk, TError>(ok.Value);

    public static implicit operator Result<TOk, TError>(DelayedError<TError> error) =>
        new Result<TOk, TError>(error.Value);
}

public readonly struct DelayedOk<T>
{
    public T Value { get; }

    public DelayedOk(T value)
    {
        Value = value;
    }
}

public readonly struct DelayedError<T>
{
    public T Value { get; }

    public DelayedError(T value)
    {
        Value = value;
    }
}

public static class Result
{
    public static DelayedOk<TOk> Ok<TOk>(TOk ok) =>
        new DelayedOk<TOk>(ok);

    public static DelayedError<TError> Error<TError>(TError error) =>
        new DelayedError<TError>(error);
}
```

Going back to the code from earlier, it will now work exactly as expected:

```csharp
public class Translator
{
    private readonly ITranslationService _translationService;

    public Translator(ITranslationService translationService)
    {
        _translationService = translationService;
    }

    public async Task<Result<string, string>> TranslateAsync(string text, string language)
    {
        if (!await _translationService.IsLanguageSupportedAsync(language))
            return Result.Error($"Language {language} is not supported");

        var translated = await _translationService.TranslateAsync(text, language);
        return Result.Ok(translated);
    }
}
```

## Summary

Although type inference in C# has its limits, we can push them a bit further with the help of implicit conversion operators. Using a simple trick shown in this article, we can simulate target-type inference, enabling some potentially interesting design opportunities.
