---
title: 'Monadic Comprehension Syntax via LINQ in C#'
date: '2021-06-01'
---

If you ask a C# developer to list the reasons why they enjoy working with the language, they will most likely put LINQ somewhere at the top. LINQ is an extremely convenient set of language tools that provide ways to query and transform data sequences of arbitrary shapes and origins, in a fluent, lazy, and efficient manner.

LINQ itself is made up of multiple pieces, but from the consumer perspective it mainly comes in two forms: extension methods for `IEnumerable<T>` and `IQueryable<T>` interfaces, and the language-integrated query syntax which is built upon them. Interestingly enough, despite arguably being the most important part of the feature as a whole, query syntax sees very little use in practice, as most developers prefer to rely on extension methods directly due to their flexibility and overall homogeny with the rest of the language.

However, there is one aspect of the query syntax that makes it particularly intriguing in my opinion, and that's the fact that **its usage is actually not limited to collections**. As long as a specific type implements a few key methods required by the compiler, C#'s query notation can be enabled on virtually any type.

This presents a very interesting opportunity where we can use this feature to enhance other types (including our own) with a special comprehension syntax that helps express certain operations in a more concise and clear way. In practice, it allows us to achieve something similar to [F#'s computation expressions](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/computation-expressions) or [Haskell's `do` notation](https://en.wikibooks.org/wiki/Haskell/do_notation).

In this article we will see how the LINQ query syntax works under the hood, how to integrate it with custom types, and look at some practical scenarios where that can actually be useful.

## Query syntax internals

To understand how to repurpose the query syntax for other types, let's start by taking a look at how it already works with regular collections. For example, imagine we have a sequence of numbers that we want to filter, reorder, and transform. Using LINQ we can do it like this:

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

However, there are also some cases where writing LINQ operations using the query syntax may actually lead to more appealing code. As an example, consider a scenario where we need to get a list of subdirectories inside a specific directory, and then enumerate the files within them in a single sequence:

```csharp
var files =
    from dir in Directory.EnumerateDirectories("/some/dir/")
    from file in Directory.EnumerateFiles(dir)
    select file;
```

Note how the query notation allows us to express derived sequences (which are essentially nested iterations) in a naturally comprehensible serial form. This is possible to do by simply combining multiple `from` operators together.

For comparison, an equivalent code relying on the method syntax lends to a somewhat less legible structure:

```csharp
var files = Directory.EnumerateDirectories("/some/dir/")
    .SelectMany(dir => Directory.EnumerateFiles(dir));
```

In this case, the query notation form doesn't just present another way of writing the same thing, but **offers an alternative mental model for approaching the problem**. Interestingly enough, such mental model can be useful in many different domains, not just when dealing with collections.

Fundamentally, all query operators function based on simple mapping rules which decide how they get translated to their equivalent extension methods. Nested `from` clauses, in particular, are evaluated by calling a specific overload of `SelectMany(...)` that accepts a collection selector and a result selector. For `IEnumerable<T>`, this method is defined in the framework as follows:

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

As mentioned in the beginning, LINQ query syntax is not inherently restricted to just enumerable types. The same notation we've seen earlier can also be applied to any other type as long as there is a corresponding `SelectMany(...)` method defined for it. Generally speaking, the compiler expects a method that looks like this:

```csharp
// Container<T> is a generic abstract container that encapsulates value(s) of type T
public static Container<TResult> SelectMany<TFirst, TSecond, TResult>(
    // First operand
    this Container<TFirst> first,
    // Function to resolve the second operand (based on first)
    Func<TFirst, Container<TSecond>> getSecond,
    // Function to resolve the result (based on both operands)
    Func<TFirst, TSecond, TResult> getResult)
{
    /*
        In query syntax:

        from {firstValue} in {first}
        from {secondValue} in {getSecond(firstValue)}
        select {getResult(firstValue, secondValue)}
    */
}
```

In academic terms, this method signature actually represents a slightly more elaborate version of the [_monadic bind function_](<https://en.wikipedia.org/wiki/Monad_(functional_programming)#Overview>), which is used to sequence monadic operations together. Knowing that is not very important, but it helps us understand that the query syntax (specifically when it involves multiple `from` clauses) is effectively a general-purpose monadic comprehension notation.

Consequentially, any container type for which an appropriate `SelectMany(...)` may be reasonably defined, can benefit from the alternative mental model provided by LINQ. Moving on, let's explore some potential candidates.

## Chaining tasks

When it comes to container types, `Task<T>` is probably the most ubiquitous example that can be found in C# code. Conceptually, this type represents an operation that executes asynchronously and encapsulates its current state along with its eventual result. Additionally, it also provides a way to queue up continuation callbacks that will trigger once the task has completed.

An implementation of `SelectMany(...)`, in this case, can leverage the callback API to enable comprehension syntax for chaining tasks into pipelines of asynchronous operations. Following the shape we've established previously, here is how that method would look in practice:

```csharp
public static Task<TResult> SelectMany<TFirst, TSecond, TResult>(
    this Task<TFirst> first,
    Func<TFirst, Task<TSecond>> getSecond,
    Func<TFirst, TSecond, TResult> getResult)
{
    // Not using async/await deliberately to illustrate a point
    return first.ContinueWith(_ =>
    {
        // At this point the result has already been evaluated
        var firstResult = first.Result;

        // Chain second task
        var second = getSecond(firstResult);
        return second.ContinueWith(_ =>
        {
            // Unwrap the second task and assemble the result
            var secondResult = second.Result;
            return getResult(firstResult, secondResult);
        });
    }).Unwrap();
}
```

The usage of nested `ContinueWith(...)` callbacks allows us to sequence derived tasks and lazily compose their results without actually waiting for the entire process to complete. Calling `SelectMany(...)` will effectively produce a new higher-order task that has all the specified transformations encoded within it, and whose result can be observed once all of the underlying operations have finished.

Having that extension method defined, we can use the query syntax on tasks to write code similar to this:

```csharp
// Lazily compose tasks
var task =
    from sum in Task.Run(() => 1 + 1) // Task<int>
    from div in Task.Run(() => sum / 1.5) // Task<double>
    select sum + (int) div; // Task<int>

// Observe the actual result
var result = await task;

// Prints "3"
Console.WriteLine(result);
```

Although the syntax for the query operators remains the same, the semantics are a little different compared to what we're used to when dealing with collections. Here, the range variable (the part between `from` and `in`) only has a single possible value — the eventual result of the task on the right. The terminal `select` clause is then used to transform and aggregate results from individual operations to produce a single top-level task.

Just like the `SelectMany(...)` method that this notation internally relies on, every action is encoded in a lazy manner. To get the final result, the composed task needs to be awaited.

Of course, while it does look interesting, this comprehension syntax isn't particularly useful. After all, C# already has specialized syntax for this exact purpose in the form of the well-known `async` and `await` keywords. The code we wrote above is mostly equivalent to the following, more familiar snippet:

```csharp
var sum = await Task.Run(() => 1 + 1);
var div = await Task.Run(() => sum / 1.5);

var result = sum + (int) div;

// Prints "3"
Console.WriteLine(result);
```

Nevertheless, this example should hopefully highlight the primary use case for introducing custom LINQ notations: **expressing pipelines with types that have chainable semantics**. Going further, let's take a look at a few more complicated but also more practical scenarios.

## Chaining option containers

Different programming paradigms utilize different ways of representing and handling failures. Object-oriented languages, traditionally, employ exceptions and `try`/`catch` blocks for this purpose — a very convenient approach that helps keep the code focused on the happy path, while implicitly routing potential errors towards dedicated handlers at the top of the call stack.

When writing in a functional style, on the other hand, failures are typically encoded directly within the function signatures using container types such as `Option<T>` and `Result<TValue, TError>`. This makes the representation of error states explicit and forces the caller to properly account for each of them before proceeding further with the execution.

Even in primarily object-oriented environments, such as C#, optional types are still commonly used to communicate expected, predictable, or otherwise non-fatal errors, for which exceptions may often be impractical. For example, when building a web service, we can choose to express domain-level failures this way to ensure that they are correctly handled and mapped to the corresponding HTTP status codes upon reaching the system boundary.

One downside of the functional approach, however, is that it doesn't allow us to easily defer the responsibility of dealing with the error to upstream callers, which is something that exceptions provide in the form of their bubbling behavior. Being explicit means we have to always handle both the optimistic and pessimistic outcomes simultaneously, but that can be a bit cumbersome. After all, no one would want to write code where you're forced to [check and propagate errors every single step of the way](https://golang.org).

Luckily, this is the exact kind of problem that we can solve by introducing a custom query syntax. To illustrate, let's first imagine that we have an `Option<T>` type already implemented as shown below:

```csharp
// Encapsulates a single value or lack thereof
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

Since C# doesn't [yet](https://github.com/dotnet/csharplang/issues/113) offer a way to define unions directly, this type is implemented as a `struct` that encapsulates a value and a boolean flag used as a discriminator for its two potential states. Importantly, both the value and the flag are intentionally kept private, leaving the `Match(...)` method as the only way to observe the contents of an `Option<T>` instance from outside. This makes the design safer as it prevents possible run-time errors which would otherwise occur if the consumer tried to unwrap a container that didn't actually have a value.

In order to create new instances, we can use the `Some(...)` and `None()` factory methods, depending on which state we want to represent. For example, a simple function that parses an integer number from a string can then look like this:

```csharp
// Converts a string to integer, or returns 'none' in case of failure
public static Option<int> ParseInt(string str) =>
    int.TryParse(str, out var result)
        ? Option<int>.Some(result)
        : Option<int>.None();
```

And, subsequently, this is how we would interact with it:

```csharp
var someResult = ParseInt("123");

// Prints "123"
someResult.Match(
    // Parsed successfully -> handle the int value
    value => Console.WriteLine(value),

    // Parsing failed -> handle the error
    () => Console.WriteLine("Parsing error")
);
```

```csharp
var noneResult = ParseInt("foo");

// Prints "Parsing error"
noneResult.Match(
    // Parsed successfully -> handle the int value
    value => Console.WriteLine(value),

    // Parsing failed -> handle the error
    () => Console.WriteLine("Parsing error")
);
```

Overall, the `Match(...)` API works fairly well when we're dealing with isolated values, but it becomes noticeably more convoluted when there are multiple dependent operations involved. For example, let's imagine we also have a method called `GetEnvironmentVariable(...)` that returns an `Option<string>`:

```csharp
// Resolves an environment variable, or returns 'none' if it's not set
public static Option<string> GetEnvironmentVariable(string name)
{
    var value = Environment.GetEnvironmentVariable();
    if (value is null)
        return Option<string>.None();

    return Option<string>.Some(value);
}
```

Now if we wanted to combine it with our existing `ParseInt(...)` method to convert the value of an environment variable into a number, we'd have to write code like this:

```csharp
var maxInstances = GetEnvironmentVariable("MYAPP_MAXALLOWEDINSTANCES").Match(
    // Environment variable is set -> continue
    envVar => ParseInt(envVar).Match(
        // Parsing succeeded -> continue
        maxInstances =>
            // Finalize -> clamp the result to a reasonable value
            maxInstances >= 1 ? maxInstances : 1,

        // Parsing failed -> short-circuit
        () => Option<int>.None()
    ),

    // Environment variable is NOT set -> short-circuit
    () => Option<int>.None()
);

maxInstances.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Value not set or invalid")
);
```

It is clear that the chain of nested `Match(...)` calls above is not particularly readable. Instead of dealing with an optional container on each step, it would be more preferable if we could focus only on the transformations to the actual value, while propagating all the _none_ states implicitly.

There are a few different ways to achieve this, but as already mentioned before, this is an ideal use case for LINQ. Just like `Task<T>` in the earlier example, `Option<T>` represents a type with chainable semantics, meaning that it's a perfect candidate for a custom `SelectMany(...)` implementation:

```csharp
public static Option<TResult> SelectMany<TFirst, TSecond, TResult>(
    this Option<TFirst> first,
    Func<TFirst, Option<TSecond>> getSecond,
    Func<TFirst, TSecond, TResult> getResult)
{
    return first.Match(
        // First operand has value -> continue to the second operand
        firstValue => getSecond(firstValue).Match(
            // Second operand has value -> compose the result from the first and second operands
            secondValue => Option<TResult>.Some(getResult(firstValue, secondValue)),

            // Second operand is empty -> return
            () => Option<TResult>.None()
        ),

        // First operand is empty -> return
        () => Option<TResult>.None()
    );
}
```

Here we've essentially replicated the nested `Match(...)` structure from earlier, except in a more broad form. This method works by taking the first `from` operand, unwrapping its underlying value to resolve the second operand, and then finally assembling the result based on the values retrieved from both.

Graphically, the above implementation can also be illustrated with the following flowchart:

```ini
[ Match first operand ]
          |
          +--- < Has value? > --- ( no )
                     |              |
                     |              |
                  ( yes )   [ Return 'none' ]
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
                             ( yes )   [ Return 'none' ]
                                |
                                |
               [ Compute result from both values ]
                                |
                                |
                    [ Return result as 'some' ]
```

Now that we have the corresponding `SelectMany(...)` method defined, we can rewrite our original example to use the LINQ query syntax like this:

```csharp
var maxInstances =
    from envVar in GetEnvironmentVariable("MYAPP_MAXALLOWEDINSTANCES") // Option<string>
    from value in ParseInt(envVar) // Option<int>
    select value >= 1 ? value : 1; // Option<int>

maxInstances.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Value not set or invalid")
);
```

Or, if we wanted to, we could also wrap the expression in its own method as shown below:

```csharp
public Option<int> GetMaxInstances() =>
    from envVar in GetEnvironmentVariable("MYAPP_MAXALLOWEDINSTANCES")
    from value in ParseInt(envVar)
    select value >= 1 ? value : 1;
```

In this syntax, the range variable in the `from` clause refers to the underlying value within the optional container. The corresponding expression is only evaluated in case the value actually exists — if a _none_ result is returned at any stage of the pipeline, the execution short-circuits without proceeding further. Conceptually, this works very similarly to collections, seeing as `Option<T>` is really just a special case of `IEnumerable<T>` that can only have one or zero elements.

On the surface, using LINQ resulted in more succinct and readable code, but most importantly it provided us with a convenient comprehension model that allows us to express operations on optional values by treating them as if they are already materialized. This lets us more easily create execution chains while implicitly pushing the concern of unwrapping the container towards upstream callers.

## Extrapolating and combining

Of course, we can take things even further. Given that we've already implemented LINQ expressions for both `Task<T>` and `Option<T>`, the next logical step would be to do the same for the compound `Task<Option<T>>`.

It's not unusual that we need to deal with operations which are both asynchronous and return optional results, so a specialized syntax for such scenarios makes perfect sense. Following the same pattern from earlier, let's implement the corresponding `SelectMany(...)` method:

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

Because `Option<T>.Match(...)` has an overload that takes `Func<...>` delegates, we can simply mark the handler as `async` to have it return a task. Essentially, this implementation of `SelectMany(...)` looks the same as the one we wrote for the regular `Option<T>`, with an addition of a few `await` operators.

To illustrate a practical use case for this syntax, let's imagine we have a class named `PaymentProcessor` which can be used to resolve user payment information and send money between accounts:

```csharp
public class PaymentProcessor
{
    // List of registered users and their IBANs
    private readonly Dictionary<string, string> _userIbans = new(StringComparer.OrdinalIgnoreCase)
    {
        ["levi@gmail.com"] = "NL18INGB9971485915",
        ["olena@hotmail.com"] = "UA131174395738584578471957518"
    };

    // Try to get IBAN by registered user's email
    public async Task<Option<string>> GetIbanAsync(string userEmail)
    {
        // Pretend that we are talking to some external server or database here
        await Task.Delay(1000);

        if (_userIbans.TryGetValue(userEmail, out var iban))
            return Option<string>.Some(iban);

        return Option<string>.None();
    }

    // Try to send a payment from IBAN to IBAN
    public async Task<Option<Guid>> SendPaymentAsync(
        string ibanFrom,
        string ibanTo,
        decimal amount)
    {
        // Make sure IBANs exist
        if (!_userIbans.ContainsValue(ibanFrom) || !_userIbans.ContainsValue(ibanTo))
            return Option<Guid>.None();

        // Send the payment through a very real gateway
        await Task.Delay(1000);

        // Return the payment ID
        return Option<Guid>.Some(Guid.NewGuid());
    }
}
```

Both of the above methods are asynchronous and have potential error outputs: `GetIbanAsync(...)` fails if provided with an unknown email, while `SendPaymentAsync(...)` returns an error for invalid IBANs. With the query syntax we've just introduced, we can easily compose calls to these methods like so:

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

Here, just like in the previous examples, LINQ allows us to work directly on the underlying values by skipping layers of containers around it. In the end, the query expression evaluates to a task that represents a chain of composed asynchronous operations with an optional result.

Similarly, if any stage of the pipeline ends up failing (i.e. returning a _none_ option), the execution will terminate early with an error:

```csharp
var paymentProcessor = new PaymentProcessor();

var paymentId = await
    from joshIban in paymentProcessor.GetIbanAsync("josh@yahoo.com") // this will fail
    from olenaIban in paymentProcessor.GetIbanAsync("olena@hotmail.com") // this won't be executed
    from paymentId in paymentProcessor.SendPaymentAsync(joshIban, olenaIban, 100)
    select paymentId;

// Prints "Failed to send payment"
paymentId.Match(
    value => Console.WriteLine(value),
    () => Console.WriteLine("Failed to send payment")
);
```

## Summary

C#'s language integrated query syntax provides an alternative way to reason about and manipulate collections of data, but it may actually be used for more than just that. By implementing the corresponding extension methods, we can overload query operators with custom semantics and apply them to other types as well.

This is particularly beneficial for types whose instances can be naturally composed together in a sequential manner. In such scenarios, query notation can be leveraged to establish a dedicated comprehension syntax that makes working with these structures a lot easier.

In case you are curious about other situations where custom query syntax may be useful, see also [my older blog post](/blog/monadic-parser-combinators) that shows how [Sprache](https://github.com/sprache/Sprache) relies on this feature to create complex parsers from simple grammar rules. Alternatively, if you want to learn more about LINQ's application within the context of functional programming in general, check out Dixin Yan's excellent series of articles entitled [Category Theory via C#](https://weblogs.asp.net/dixin/Tags/Category%20Theory).
