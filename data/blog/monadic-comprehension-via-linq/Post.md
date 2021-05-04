---
title: 'Monadic Comprehension Syntax via LINQ in C#'
date: '2021-05-11'
tags:
  - 'dotnet'
  - 'csharp'
  - 'tricks'
---

If you ask a C# developer to list all the reasons why they enjoy working with the language, they will probably put LINQ somewhere at the top. LINQ is a set of language tools that, in combination with the `IEnumerable<T>` and `IQueryable<T>` interfaces, enable developers to query data from arbitrary data sources in a fluent and (mostly) efficient manner.

As far as the language feature is concerned, LINQ comes in two forms: extension methods from `System.Linq` namespace and the actual language-integrated query syntax that they power. Interestingly enough, the query syntax is rarely used in practice as most developers prefer extension methods due to their flexibility and overall homogeneity with the rest of the language.

That said, I believe the query syntax is a particularly interesting feature because it allows us to think about operations on data in a clearer way. Some operations, especially those involving collections embedded inside other collections, can appear rather convoluted in their method form, but much more legible when written using query syntax.

However, few developers are aware of this, but C#'s query syntax is not actually tied to `IEnumerable<T>` -- it can be extended to work with any other type as well, by implementing a few specific methods. This presents an interesting opportunity where we can use this feature to enhance our own types with custom domain specific language, similar to [https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/computation-expressions](computation expressions in F#) or [`do` notation in Haskell](https://en.wikibooks.org/wiki/Haskell/do_notation).

In this article, I will explain how LINQ's query syntax works and what it takes to enable it for custom types. We will look at some real world scenarios that can benefit from custom query syntax.

## LINQ with collections

To understand how the internals of LINQ's query syntax, let's start by taking a look at how it works with regular collections. For example, given an array of numbers, we can filter and reorder it using the following expression:

```csharp
var source = new[] {1, 2, 3, 4, 5};

var result =
    from i in source
    where i % 2 != 0
    orderby i descending
    select i;
```

This is effectively identical to the code below, which uses method syntax instead:

```csharp
var source = new[] {1, 2, 3, 4, 5};

var result = source
    .Where(i => i % 2 != 0)
    .OrderByDescending(i => i);
```

When comparing the two approaches in the above examples, the difference is rather minimal and, in fact, the method syntax probably looks a bit cleaner.

However the query syntax shines in certain scenarios, such as when dealing with sequences nested within other sequences:

```csharp
var dirs =
    from dir in Directory.EnumerateDirectories("/some/dir/")
    from subdir in Directory.EnumerateDirectories(dir)
    from subdirOfSubdir in Directory.EnumerateDirectories(subdir)
    select subdirOfSubdir;
```

```csharp
var dirs = Directory.EnumerateDirectories("/some/dir/")
    .SelectMany(dir => Directory.EnumerateDirectories(dir))
    .SelectMany(subdir => Directory.EnumerateDirectories(subdir));
```

The query syntax works by looking for `Where(...)`, `OrderBy(...)`, `Select(...)`, `SelectMany(...)` and similar methods.

Below is .NET's implementation of `SelectMany(...)` which is used by the query syntax:

```csharp
// https://source.dot.net/#System.Linq/System/Linq/SelectMany.cs,bc79a642e00b8681
public static IEnumerable<TResult> SelectMany<TSource, TCollection, TResult>(
    this IEnumerable<TSource> source,
    Func<TSource, IEnumerable<TCollection>> collectionSelector,
    Func<TSource, TCollection, TResult> resultSelector)
{
    foreach (var element in source)
    {
        foreach (var subElement in collectionSelector(element))
        {
            yield return resultSelector(element, subElement);
        }
    }
}
```

## Query syntax for Task type

Can be generalized to this signature:

```csharp
public static Container<TResult> SelectMany<TFirst, TSecond, TResult>(
    this Container<TFirst> first, // first operand
    Func<TFirst, Container<TSecond>> getSecond, // resolve second operand (based on first)
    Func<TFirst, TSecond, TResult> getResult) // resolve result (based on both operands, unwrapped)
{
    // ...
}

/*
    from {TFirst} in {Container<TFirst>}
    from {TSecond} in {TFirst -> Container<TSecond>}
    select {TFirst + TSecond -> TResult}
*/
```

```csharp
public static async Task<TOut> SelectMany<TFirst, TSecond, TResult>(
    this Task<TFirst> first,
    Func<TFirst, Task<TSecond>> getSecond,
    Func<TFirst, TSecond, TResult> getResult)
{
    var firstResult = await first;
    var secondResult = await getSecond(firstResult);
    return getResult(firstResult, secondResult);
}
```

```csharp
var task =
    from first in Task.Run(() => 1 + 1)
    from second in Task.Run(() => 2 + 2)
    select first + second;

var result = await task;

// Prints "6"
Console.WriteLine(result);
```

Think of `from x in y` as "from result x of y" and `select` as "return".

## Query syntax for Option type

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

    public Option(T value) : this(value, true) {}

    public TOut Match<TOut>(Func<T, TOut> some, Func<TOut> none) =>
        _hasValue ? some(_value) : none();

    public void Match(Action<T> some, Action none)
    {
        if (_hasValue)
            some(_value);
        else
            none();
    }

    public static Option<T> Some(T value) => new Option<T>(value);

    public static Option<T> None() => default;
}
```

```csharp
public static Option<TResult> SelectMany<TFirst, TSecond, TResult>(
    this Option<TFirst> first,
    Func<TFirst, Option<TSecond>> getSecond,
    Func<TFirst, TSecond, TResult> getResult)
{
    return first.Match(

        // First operand has value - continue to the second operand
        firstValue => getSecond(firstValue).Match(

            // Second operand has value - get the result from the first and second operands
            secondValue => Option<TResult>.Some(getResult(firstValue, secondValue)),

            // Second operand is empty - exit
            () => Option<TResult>.None()
        ),

        // First operand is empty - exit
        () => Option<TResult>.None()
    );
}
```

Think of `from x in y` as "using value x of y" and `select` as "combine".

```ini
[ Match first operand ]
          |
          +--- < Has value? > --- ( no )
                     |              |
                     |              |
                  ( yes )        [ Exit ]
                     |
                     |
            [ Get second operand ]
                     |
                     |
           [ Match second operand ]
                     |
                     +--- < Has value? > --- ( no )
                                |              |
                                |              |
                             ( yes )        [ Exit ]
                                |
                                |
               [ Compute result from both values ]
                                |
                                |
                      [ Return the result ]
```

```csharp
public static Option<int> ParseInt(string str) =>
    int.TryParse(str, out var result)
        ? Option<int>.Some(result)
        : Option<int>.None();
```

```csharp
var result =
    from first in ParseInt("5")
    from second in ParseInt("2")
    select first + second;

// Prints "7"
result.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Parsing error")
);
```

```csharp
var result =
    from first in ParseInt("foo") // this will fail
    from second in ParseInt("2")
    select first + second;

// Prints "Parsing error"
result.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Parsing error")
);
```

Comprehension syntax let us express happy path scenarios, with implicit failure.

## Query syntax for Option inside a Task

```csharp
public static class OptionTaskComprehensionExtensions
{
    public static async Task<Option<TResult>> SelectMany<TFirst, TSecond, TResult>(
        this Task<Option<TFirst>> first,
        Func<TFirst, Task<Option<TSecond>>> getSecond,
        Func<TFirst, TSecond, TResult> getResult)
    {
        var firstOption = await first;

        return await firstOption.Match(
            async firstValue =>
            {
                var secondOption = await getSecond(firstValue);

                return secondOption.Match(
                    secondValue => Option<TResult>.Some(getResult(firstValue, secondValue)),
                    () => Option<TResult>.None()
                );
            },
            () => Task.FromResult(Option<TResult>.None())
        );
    }
}
```

```csharp
public class PaymentProcessor
{
    public async Task<Option<string>> GetIbanAsync(string userEmail)
    {
        // Pretend that we are talking to some external server or database here
        await Task.Delay(1000);

        var userIbans = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["levi@gmail.com"] = "NL18INGB9971485915",
            ["olena@hotmail.com"] = "UA131174395738584578471957518"
        };

        if (userIbans.TryGetValue(userEmail, out var iban))
        {
            return Option<string>.Some(iban);
        }

        return Option<string>.None();
    }

    public async Task<Option<Guid>> SendPaymentAsync(
        string ibanFrom,
        string ibanTo,
        decimal amount)
    {
        // Again, sending payments through a very real payment gateway
        await Task.Delay(1000);

        // This method doesn't have any checks, just to show that the
        // execution won't even reach here in case one of the earlier
        // steps have failed.
        return Option<Guid>.Some(Guid.NewGuid());
    }
}
```

```csharp
var paymentProcessor = new PaymentProcessor();

// Note the `await` in the beginning of the expression
var result = await
    from leviIban in paymentProcessor.GetIbanAsync("levi@gmail.com")
    from olenaIban in paymentProcessor.GetIbanAsync("olena@hotmail.com")
    from paymentId in paymentProcessor.SendPaymentAsync(leviIban, olenaIban, 100)
    select paymentId;

// Prints "d56a5b86-f55b-4707-be4f-138a19272f47"
result.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Failed to send payment")
);
```

```csharp
var paymentProcessor = new PaymentProcessor();

var result = await
    from joshIban in paymentProcessor.GetIbanAsync("josh@yahoo.com") // this will fail
    from olenaIban in paymentProcessor.GetIbanAsync("olena@hotmail.com")
    from paymentId in paymentProcessor.SendPaymentAsync(joshIban, olenaIban, 100)
    select paymentId;

// Prints "Failed to send payment"
result.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Failed to send payment")
);
```

## Summary

Failure short-circuiting without using exceptions.
