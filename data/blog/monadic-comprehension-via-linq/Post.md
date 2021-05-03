---
title: 'Monadic Comprehension Syntax via LINQ in C#'
date: '2021-05-11'
tags:
  - 'dotnet'
  - 'csharp'
  - 'tricks'
---

// Outline:
- LINQ via extension methods
- LINQ via query syntax
- How to enable query syntax
- Using LINQ for Tasks
- Using LINQ for Option
- Using LINQ for Task of Option

LINQ is a...

Comprehension syntax let us express happy path scenarios, with implicit failure.

## LINQ with Collections

```csharp
var collection = new[] {1, 2, 3, 4, 5};
var oddNumbers = collection.Where(i => i % 2 != 0);
```

```csharp
var collection = new[] {1, 2, 3, 4, 5};
var oddNumbers =
    from i in collection
    where i % 2 != 0
    select i;
```

```csharp
var directories = Directory.EnumerateDirectories("foo/");
var subdirectories = directories.SelectMany(d => Directory.EnumerateDirectories(d));
```

```csharp
var directories = Directory.EnumerateDirectories("foo/");
var subdirectories =
    from dir in directories
    from subdir in Directory.EnumerateDirectories(dir)
    select subdir;
```

The query syntax works by looking for `Where(...)`, `Select(...)`, `SelectMany(...)` and similar methods.

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
var subdirectories =
    from dir in directories
    from subdir in Directory.EnumerateDirectories(dir)
    from subdirOfSubdir in Directory.EnumerateDirectories(subdir)
    select subdirOfSubdir;

// Equivalent to:
var subdirectories = directories
    .SelectMany(dir => Directory.EnumerateDirectories(dir), (dir, subdir) => new {dir, subdir})
    .SelectMany(o => Directory.EnumerateDirectories(o.subdir));
```

```csharp
public static class TaskComprehensionExtensions
{
    public static async Task<TOut> SelectMany<TFirst, TSecond, TResult>(
        this Task<TFirst> first,
        Func<TFirst, Task<TSecond>> getSecond,
        Func<TFirst, TSecond, TResult> getResult)
    {
        var firstResult = await first;
        var secondResult = await getSecond(firstResult);
        return getResult(firstResult, secondResult);
    }
}
```

```csharp
public static async Task Main()
{
    var task =
        from first in Task.Run(() => 1 + 1)
        from second in Task.Run(() => 2 + 2)
        select first + second;

    var result = await task;

    // Prints "6"
    Console.WriteLine(result);
}
```

Think of `from x in y` as "from result x of y" and `select` as "return".

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
public static class OptionComprehensionExtensions
{
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
}
```

Think of `from x in y` as "using value x of y" and `select` as "combine".

```ini
[ Match first operand ]
      |
      +--- < Has value? > --- ( no ) --- [ Exit ]
                 |
                 |
              ( yes )
                 |
                 |
        [ Get second operand ]
                 |
                 |
       [ Match second operand ]
                 |
                 +--- < Has value? > --- ( no ) --- [ Exit ]
                            |
                            |
                         ( yes )
                            |
                            |
           [ Compute result from both values ]
                            |
                            |
                  [ Return the result ]
```

```csharp
private static Option<int> ParseInt(string str) =>
    int.TryParse(str, out var result)
        ? Option<int>.Some(result)
        : Option<int>.None();

public static void Main()
{
    var result1 =
        from first in ParseInt("5")
        from second in ParseInt("2")
        select first + second;

    // Prints "7"
    result1.Match(
        value => Console.WriteLine(value),
        () => Console.WriteLine("Parsing error")
    );

    // ------------------------------

    var result2 =
        from first in ParseInt("foo") // this will fail
        from second in ParseInt("2")
        select first + second;

    // Prints "Parsing error"
    result2.Match(
        value => Console.WriteLine(value),
        () => Console.WriteLine("Parsing error")
    );
}
```

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
static async Task<Option<string>> GetIbanAsync(string userEmail)
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

static async Task<Option<Guid>> SendPaymentAsync(string ibanFrom, string ibanTo, decimal amount)
{
    // Again, sending payments through a very real payment gateway
    await Task.Delay(1000);

    // This method doesn't have any checks, just to show that the
    // execution won't even reach it in case one of the earlier
    // steps have failed.
    return Option<Guid>.Some(Guid.NewGuid());
}

static async Task Main(string[] args)
{
    var result1 = await
        from leviIban in GetIbanAsync("levi@gmail.com")
        from olenaIban in GetIbanAsync("olena@hotmail.com")
        from paymentId in SendPaymentAsync(leviIban, olenaIban, 100)
        select paymentId;

    // Prints "d56a5b86-f55b-4707-be4f-138a19272f47"
    result1.Match(
        value => Console.WriteLine(value),
        () => Console.WriteLine("Failed to send payment")
    );

    // ------------------------------

    var result2 = await
        from joshIban in GetIbanAsync("josh@yahoo.com") // this will fail
        from olenaIban in GetIbanAsync("olena@hotmail.com")
        from paymentId in SendPaymentAsync(joshIban, olenaIban, 100)
        select paymentId;

    // Prints "Failed to send payment"
    result2.Match(
        value => Console.WriteLine(value),
        () => Console.WriteLine("Failed to send payment")
    );
}
```

## Summary
