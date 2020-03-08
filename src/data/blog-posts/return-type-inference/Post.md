---
title: Simulating Return Type Inference in C#
date: 2020-03-09
cover: Cover.png
---

![cover](Cover.png)

I really like building frameworks that enable other developers to make something cool. Sometimes, when chasing down the perfect API you have in mind, you may need to push the language to the very limit.

One such limit is the lack of return type inference in C#. The compiler fares well when it needs to return the type of an argument to a method, either when resolving the current signature among many overloads, or when determining the type of generic. But return type inference is something C# lacks.

In this article I will introduce you to a simple pattern that I've been using in some cases to simulate return type inference.

## Type inference

Type inference is the ability of a compiler to automatically detect the type of a particular expression, without having the programmer explicitly specify it. This feature works by analyzing the context in which the expression is evaluated, as well as the constraints imposed by the flow of data in the program.

By being able to detect the type automatically, languages that support type inference allow writing more succinct code, while still maintaining the full benefits of a static type system. This is why most mainstream statically-typed languages have type inference, in one form or another.

C#, being one of those languages, has type inference as well. The simplest possible example of it is the `var` keyword:

```csharp
var x = 5;              // int
var y = "foo";          // string
var z = 2 + 1.0;        // double
var g = Guid.NewGuid(); // Guid
```

When doing a combined declaration and assignment operation with the `var` keyword, you don't need to specify the type of the variable. The compiler is able to detect it on its own based on the expression on the right side.

In a similar vein, C# also allows initializing an array without having to manually specify its type:

```csharp
var array = new[] {"Hello", "world"}; // string[]
```

In this case, the compiler can see that we're initializing the array with two string elements so it can safely conclude that the resulting array is of type `string[]`. In some (very rare) cases, it can even infer the type of the array based on the most specific common type among the individual elements:

```csharp
var array = new[] {1, 2, 3.0}; // double[]
```

However, the most interesting aspect of type inference in C# is, of course, generic methods. When calling a method with a generic signature, we can omit type arguments as long as they can be deduced from the values passed to the method parameters.

For example, we can define a generic method `List.Create<T>` that creates a list from a sequence of elements:

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

In the above scenario we could've specified the type explicitly by writing `List.Create<int>(...)` but we didn't have to. The compiler is able to detect it automatically based on the parameters we passed into the method, which are constrained by the same type as the returned list itself.

Interestingly enough, all of the examples shown above are in fact based on the same form of type inference, which works by analyzing the constraints imposed by other expressions, whose type is already known. In other words, it examines the flow of data that _goes in_ and draws conclusions about the data that _goes out_.

There are scenarios, however, when we may want the type inference to work in the opposite direction. Let's see where that could be useful.

## Option type

If you're writing C# code in a functional style, it's very likely that you have an `Option<T>` type defined. It's a container type that may or may not have a single value inside.

It could look like this:

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

Here we have

```csharp
public static class Option
{
    public static Option<T> Some<T>(T value) => new Option<T>(value);

    public static Option<T> None<T>() => new Option<T>();
}
```

```csharp
public static Option<int> Parse(string number)
{
    return int.TryParse(number, out var value)
        ? Option.Some(value)
        : Option.None<int>();
}
```

```csharp
public readonly struct NoneOption { }

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

public static class Option
{
    public static Option<T> Some<T>(T value) => new Option<T>(value);

    public static NoneOption None { get; } = new NoneOption();
}
```

```csharp
public static Option<int> Parse(string number)
{
    return int.TryParse(number, out var value)
        ? Option.Some(value)
        : Option.None;
}
```

## Result type

```csharp
public readonly struct Result<TResult, TError>
{
    private readonly TResult _result;
    private readonly TError _error;
    private readonly bool _isError;

    private Result(TResult result, TError error, bool isError)
    {
        _result = result;
        _error = error;
        _isError = isError;
    }

    public Result(TResult result)
        : this(result, default, false)
    {
    }

    public Result(TError error)
        : this(default, error, true)
    {
    }
}

public static class Result
{
    public static Result<TResult, TError> Ok<TResult, TError>(TResult result) =>
        new Result<TResult, TError>(result);

    public static Result<TResult, TError> Error<TResult, TError>(TError error) =>
        new Result<TResult, TError>(error);
}
```

```csharp
public static Result<int, string> Parse(string input)
{
    return int.TryParse(input, out var value)
        ? Result.Ok<int, string>(value)
        : Result.Error<int, string>("Invalid value");
}
```

```csharp
public readonly struct Result<TResult, TError>
{
    private readonly TResult _result;
    private readonly TError _error;
    private readonly bool _isError;

    private Result(TResult result, TError error, bool isError)
    {
        _result = result;
        _error = error;
        _isError = isError;
    }

    public Result(TResult result)
        : this(result, default, false)
    {
    }

    public Result(TError error)
        : this(default, error, true)
    {
    }

    public static implicit operator Result<TResult, TError>(DelayedResult<TResult> ok) =>
        new Result<TResult, TError>(ok.Value);

    public static implicit operator Result<TResult, TError>(DelayedResult<TError> error) =>
        new Result<TResult, TError>(error.Value);
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
    public static DelayedResult<TResult> Ok<TResult>(TResult result) =>
        new DelayedResult<TResult>(result);

    public static DelayedResult<TError> Error<TError>(TError error) =>
        new DelayedResult<TError>(error);
}
```

```csharp
public static Result<int, string> Parse(string input)
{
    if (int.TryParse(input, out var value))
        return Result.Ok(value);

    return Result.Error("Invalid value");
}
```

```csharp
public static Result<int, string> Parse(string input)
{
    return int.TryParse(input, out var value)
        ? (Result<int, string>) Result.Ok(value)
        : Result.Error("Invalid value");
}
```

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

```ini
Cannot convert expression type 'DelayedResult<string>' to return type 'Result<string,string>'
```

```csharp
public readonly struct Result<TResult, TError>
{
    private readonly TResult _result;
    private readonly TError _error;
    private readonly bool _isError;

    private Result(TResult result, TError error, bool isError)
    {
        _result = result;
        _error = error;
        _isError = isError;
    }

    public Result(TResult result)
        : this(result, default, false)
    {
    }

    public Result(TError error)
        : this(default, error, true)
    {
    }

    public static implicit operator Result<TResult, TError>(DelayedOk<TResult> ok) =>
        new Result<TResult, TError>(ok.Value);

    public static implicit operator Result<TResult, TError>(DelayedError<TError> error) =>
        new Result<TResult, TError>(error.Value);
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
    public static DelayedOk<TResult> Ok<TResult>(TResult result) =>
        new DelayedOk<TResult>(result);

    public static DelayedError<TError> Error<TError>(TError error) =>
        new DelayedError<TError>(error);
}
```

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

If you're particularly savvy, you may point out that a compound type such as `Result<TOk, TError>` is not actually isomorphic to a union type.

## Dependent anonymous type inference

```csharp
public class Store<TState, TAction>
{
    private readonly Func<TState, TAction, TState> _reduce;

    public TState State { get; private set; }

    public Store(Func<TState, TAction, TState> reduce, TState initial)
    {
        _reduce = reduce;
        State = initial;
    }

    public void Apply(TAction action) => State = _reduce(State, action);
}

public static class Store
{
    public static Store<TState, TAction> Create<TState, TAction>(
        TState initial, Func<TState, TAction, TState> reduce) =>
        new Store<TState, TAction>(reduce, initial);
}
```

```csharp
public enum Action
{
    Increment,
    Decrement
}

public static void Init()
{
    var store = Store.Create(
        // Initial state
        new
        {
            Counter = 0
        },
        // Reducer
        (state, act) => act switch
        {
            Action.Increment => new
            {
                Counter = state.Counter + 1
            },
            Action.Decrement => new
            {
                Counter = state.Counter - 1
            }
        });
}
```

```ini
The type arguments for method
  'Store<TState,TAction> Store.Create<TState,TAction>(TState, Func<TState,TAction,TState>)'
  cannot be inferred from the usage. Try specifying the type arguments explicitly.
```

```csharp
public class StoreRecipe<TState>
{
    public TState InitialState { get; }

    public StoreRecipe(TState initialState)
    {
        InitialState = initialState;
    }

    public Store<TState, TAction> Create<TAction>(Func<TState, TAction, TState> reduce) =>
        new Store<TState, TAction>(reduce, InitialState);
}

public static class Store
{
    public static StoreRecipe<TState> Initial<TState>(TState initial) =>
        new StoreRecipe<TState>(initial);
}
```

```csharp
public static void Init()
{
    var store = Store
        .Initial(new
        {
            Counter = 0
        })
        .Create<Action>((state, act) => act switch
        {
            Action.Increment => new
            {
                Counter = state.Counter + 1
            },
            Action.Decrement => new
            {
                Counter = state.Counter - 1
            }
        });

    var valueBeforeApply = store.State.Counter; // 0

    store.Apply(Action.Increment);
    var valueAfterApply = store.State.Counter; // 1
}
```
