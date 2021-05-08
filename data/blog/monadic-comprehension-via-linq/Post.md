---
title: 'Monadic Comprehension Syntax via LINQ in C#'
date: '2021-05-11'
tags:
  - 'dotnet'
  - 'csharp'
  - 'tricks'
---

If you ask a C# developer to list the reasons why they enjoy working with the language, they will most likely put LINQ somewhere at the top. LINQ is an extremely convenient set of language tools that provide ways to query and transform data sequences of arbitrary shapes and origins, in a fluent, lazy, and efficient manner.

LINQ itself is made up of multiple pieces, but from the consumer perspective it mainly comes in two forms: extension methods for `IEnumerable<T>` and `IQueryable<T>` interfaces, and the language-integrated query syntax which is built upon them. Interestingly enough, despite arguably being the most important part of the feature as a whole, query syntax sees very little use in practice, as most developers prefer to rely on extension methods directly due to their flexibility and overall homogeny with the rest of the language.

However, there is one aspect of query syntax that makes it particularly intriguing in my opinion, and that's the fact that **its usage is actually not limited to collections**. As long as a specific type implements a few key methods required by the compiler, C#'s query notation can be enabled on virtually any type.

This presents a very interesting opportunity where we can use this feature to enhance other types (including our own) with a special comprehension syntax that can help express certain operations in a more concise and clear way. In practice, it allows us to achieve something similar to [F#'s computation expressions](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/computation-expressions) or [Haskell's `do` notation](https://en.wikibooks.org/wiki/Haskell/do_notation).

In this article we will see how the LINQ query syntax works under the hood, how to make it work with custom types, and look at some practical scenarios where that can actually be useful.

## Query syntax internals

To understand how to repurpose LINQ query syntax for other types, let's start by taking a look at how it already works with regular collections. For example, imagine we have a sequence of numbers that we want to filter, reorder, and transform. Using LINQ we can do it like this:

```csharp
var source = new[] {1, 2, 3, 4, 5};

var results =
    from i in source
    where i % 2 != 0
    orderby i descending
    select i * 10;

// results = [50,30,10]
```

The query notation above works by lazily enumerating the `source` collection, applying a predicate function to filter out some of the elements, and then ordering and projecting out the results. When compiled, this expression gets converted to the following chain of method calls:

```csharp
var source = new[] {1, 2, 3, 4, 5};

var results = source
    .Where(i => i % 2 != 0)
    .OrderByDescending(i => i)
    .Select(i => i * 10);
```

Now, if we were to compare the two approaches, there's not much that can be said in favor of the query syntax. It looks rather foreign amidst the rest of C# code and doesn't really accomplish anything beyond what extension methods can already do.

However, there are also some cases where writing LINQ operations using query syntax may actually lead to more appealing code. As an example, consider a scenario where we need to get a list of subdirectories inside a specific directory and then enumerate the files within them in a single sequence:

```csharp
var files =
    from dir in Directory.EnumerateDirectories("/some/dir/")
    from file in Directory.EnumerateFiles(dir)
    select file;
```

Note how the query notation allows us to express derived sequences (which are essentially nested iterations) in a naturally comprehensible serial form. This is possible to do by simply combining multiple `from` operators together.

For comparison, an equivalent code relying on method syntax lends to a somewhat less legible structure:

```csharp
var files = Directory.EnumerateDirectories("/some/dir/")
    .SelectMany(dir => Directory.EnumerateFiles(dir));
```

In this case, the query notation form doesn't just present another way of writing the same thing, but **offers an alternative mental model for approaching the problem**. Interestingly enough, such mental model can be useful in many different domains, not just when dealing with collections.

Fundamentally, all query operators function based on simple mapping rules which decide how they get translated to their equivalent extension methods. Nested `from` clauses, in particular, are evaluated by calling a specific overload of `SelectMany(...)` that accepts a collection selector and a result selector. For `IEnumerable<T>`, this method is defined in the standard library as follows:

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

As mentioned in the beginning, LINQ query syntax is not restricted to types implementing `IEnumerable<T>`. The same notation we've seen earlier can also be applied to any other type as long as there is a corresponding `SelectMany(...)` method defined for it. Generally speaking, the compiler expects a method that looks like this:

```csharp
public static Container<TResult> SelectMany<TFirst, TSecond, TResult>(
    // First operand
    this Container<TFirst> first,
    // Function to resolve the second operand (based on first)
    Func<TFirst, Container<TSecond>> getSecond,
    // Function to resolve the result (based on both operands)
    Func<TFirst, TSecond, TResult> getResult)
{
    /*
        from {TFirst} in {Container<TFirst>}
        from {TSecond} in {TFirst -> Container<TSecond>}
        select {TFirst * TSecond -> TResult}
    */
}
```

In academic terms, this method signature actually represents a slightly more elaborate version of the [_monadic bind function_](https://en.wikipedia.org/wiki/Monad_(functional_programming)#Overview), which is used to sequence monadic operations together. Knowing that is not very important, but it helps us understand that LINQ query syntax (specifically the part involving multiple `from` clauses) is effectively a general-purpose monadic comprehension notation.

Consequentially, any type for which an appropriate `SelectMany(...)` may be defined, can benefit from the alternative mental model provided by LINQ that we've noted earlier. Moving on, let's take a look at some practical examples of where that can be useful.

## Query syntax for the Task type

```csharp
public static async Task<TResult> SelectMany<TFirst, TSecond, TResult>(
    this Task<TFirst> first,
    Func<TFirst, Task<TSecond>> getSecond,
    Func<TFirst, TSecond, TResult> getResult)
{
    var firstResult = await first;
    var secondResult = await getSecond(firstResult);
    return getResult(firstResult, secondResult);
}
```

The extension method we implemented allows us to use query syntax with tasks to write code like this:

```csharp
var task =
    from first in Task.Run(() => 1 + 1)
    from second in Task.Run(() => 2 + 2)
    select first + second;

var result = await task;

// Prints "6"
Console.WriteLine(result);
```

All this does is create two tasks and combine them into a third task.

This is not particularly useful because we already have `async`/`await` which already fulfills the role of comprehension syntax for `Task<T>`. If all we had was `ContinueWith(...)` then this would have been a different story.

That said, let's look at how we can utilize query syntax for something a bit more interesting.

## Query syntax for Option type

Different programming paradigms utilize different ways of handling and representing failures. Object-oriented languages traditionally employ exceptions and `try`/`catch` blocks for this purpose.

However, exceptions are not encoded in method signatures in C# which makes them impractical in certain scenarios. As an alternative, it's a common approach to use an `Option<T>` type to represent a container that may or may not contain a value.

This is how we may design a simple but safe option type in C#:

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

Note that this container does not expose a way to retrieve the value directly, but instead provides the `Match(...)` method that can be used to unwrap the value by handling both of its potential states. This makes the design safe as it prevents accidental misuse where a user may attempt to get the value when it does not actually exist.

That said, using `Match(...)` like that is not entirely pleasant when dealing with multiple instances of `Option<T>`. For example, let's imagine we have the following method that tries to parse an integer with a potential failure:

// TODO: add more than just ParseInt()

```csharp
public static Option<int> ParseInt(string str) =>
    int.TryParse(str, out var result)
        ? Option<int>.Some(result)
        : Option<int>.None();
```

```csharp
var sum = ParseInt("5").Match(
    // Success (continue)
    firstValue => ParseInt("2").Match(
        // Success (finish)
        secondValue => Option<int>.Some(firstValue + secondValue),

        // Failure (short-circuit)
        () => Option<int>.None()
    ),

    // Failure (short-circuit)
    () => Option<int>.None()
);

// Prints "7"
sum.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Parsing error")
);
```

We can make this a lot simpler if we enable query syntax:

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

Above logic may be better explained with a flowchart:

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
var sum =
    from first in ParseInt("5")
    from second in ParseInt("2")
    select first + second;

// Prints "7"
sum.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Parsing error")
);
```

```csharp
var sum =
    from first in ParseInt("foo") // this will fail
    from second in ParseInt("2")
    select first + second;

// Prints "Parsing error"
sum.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Parsing error")
);
```

Think of `from x in y` as "using value x of y" and `select` as "combine".

Comprehension syntax let us express happy path scenarios, with implicit failure.

## Query syntax for Option inside a Task

```csharp
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
var paymentId = await
    from leviIban in paymentProcessor.GetIbanAsync("levi@gmail.com")
    from olenaIban in paymentProcessor.GetIbanAsync("olena@hotmail.com")
    from paymentId in paymentProcessor.SendPaymentAsync(leviIban, olenaIban, 100)
    select paymentId;

// Prints "d56a5b86-f55b-4707-be4f-138a19272f47"
paymentId.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Failed to send payment")
);
```

```csharp
var paymentProcessor = new PaymentProcessor();

var paymentId = await
    from joshIban in paymentProcessor.GetIbanAsync("josh@yahoo.com") // this will fail
    from olenaIban in paymentProcessor.GetIbanAsync("olena@hotmail.com")
    from paymentId in paymentProcessor.SendPaymentAsync(joshIban, olenaIban, 100)
    select paymentId;

// Prints "Failed to send payment"
paymentId.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Failed to send payment")
);
```

## Summary

Failure short-circuiting without using exceptions.

More in depth: https://weblogs.asp.net/dixin/Tags/Category%20Theory

[parsing in C#](/blog/monadic-parser-combinators)