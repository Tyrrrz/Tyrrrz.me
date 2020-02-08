---
title: Expression trees in .NET
date: 2020-02-18
cover: Cover.png
---

![cover](Cover.png)

Expression trees is an obscure, although very interesting feature in .NET. Most people probably think of it as something synonymous with object-relational mapping frameworks, but despite being its most common use case, it's not the only one. There are a lot of creative things you can do with expression trees, including code generation, transpilation, metaprogramming, and more.

In this article I will give an overview of what expression trees are and how to work with them, as well as show some interesting scenarios where I've seen them used to great effect.

## What is an expression tree?

When it comes to programming languages, an expression describes some operation on data that produces a certain result. It's one of the foundational constructs of any language.

As an example of a very simple expression, consider `2 + 3`. It consists of a constant, a plus operator, and another constant. We can evaluate this expression and get the result, which is `5`.

Of course, expressions vary in complexity and can contain different combinations of constants, variables, operators and function calls. For example, the following piece of code is also an expression:

```csharp
!string.IsNullOrWhiteSpace(personName)
    ? "Greetings, " + personName
    : null;
```

Looking at the above expression, we can also consider two of its aspects: **what is does** and **how it does it**.

When it comes to the former, the answer is pretty simple -- it generates a greeting based on the person's name, or produces a `null`. If this expression was returned by a function, that would be the extent of information we could derive from its signature:

```csharp
string? GetGreeting(string personName) { /* ... */ }
```

As for how it does it, however, the answer is a bit more detailed. This expression consists of a ternary conditional operator, whose condition is evaluated by negating the result of a call to method `string.IsNullOrWhiteSpace` with parameter `personName`, whose positive clause is made up of a "plus" binary operator that works with a constant string expression `"Greetings, "` and the parameter expression, and whose negative clause consist of a sole `null` expression.

The description above may seem like a mouthful, but it outlines the exact syntactic structure of the expression. It is by this higher-order representation that we're able to tell how it works.

Although it's inherently obvious to us as humans, in order to use this representation programmatically, we need a special data structure. This data structure is what we call an _expression tree_.

Here's the visualization of the tree that represents our expression:

```csharp
 { Ternary conditional }
      |      |     |
    +-+      |     +-----+
    |        |           |
 (true)   (false)   (condition)
    |        |           |
    |        |           +---- { (!) }
    |        +------+             |
 { (+) }            |             |
   | |           { null }   { Method call }
   | |                         |      |
   | +---------+               |      |
   |           |               |      +------- { string.IsNullOrWhiteSpace }
   |           |               |
   |     { personName }        +-------- { personName }
   |
   +---- { "Greetings, " }
```

Now that we know that expression trees represent the logical structure of an expression, what can we do with it? Or, more importantly, how can we obtain it in the first place?

## Constructing expression trees manually

In C#, expression trees can be used in either of two directions: we can create them directly via an API and then compile them into runtime instructions, or we can disassemble them from supplied lambda expressions and analyze them. We will start by looking at the first one.

The framework offers us with an API to construct expression trees through the [`Expression`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.expressions.expression) class located in the `System.Linq.Expressions` namespace. It exposes various factory methods that can be used to produce expressions of different types.

Some of these methods are:

- `Expression.Constant(...)` -- creates an expression that represents a value.
- `Expression.Variable(...)` -- creates an expression that represents a variable.
- `Expression.New(...)` -- creates an expression that represents an initialization of a new instance.
- `Expression.Assign(...)` -- creates an expression that represents an assignment operation.
- `Expression.Equal(...)` -- creates an expression that represents an equality comparison.
- `Expression.Call(...)` -- creates an expression that represents a specific method call.
- `Expression.Condition(...)` -- creates an expression that represents branching logic.
- `Expression.Loop(...)` -- creates an expression that represents repeating logic.

As a simple exercise, we can recreate the expression we've looked into in the previous part of the article. Let's do that:

```csharp
public Expression ConstructGreetingExpression()
{
    var personNameParameter = Expression.Parameter(typeof(string), "personName");

    // Condition
    var isNullOrWhiteSpaceMethod = typeof(string)
        .GetMethod(nameof(string.IsNullOrWhiteSpace));

    var condition = Expression.Not(
        Expression.Call(isNullOrWhiteSpaceMethod, personNameParameter));

    // True clause
    var trueClause = Expression.Add(
        Expression.Constant("Greetings, "),
        personNameParameter);

    // False clause
    var falseClause = Expression.Constant(null, typeof(string));

    // Ternary conditional
    return Expression.Condition(condition, trueClause, falseClause);
}
```

First off, we're calling `Expression.Parameter` in order to construct a parameter expression. We can use this instance to resolve the value of a particular parameter.

Following that, we are relying on reflection to resolve a reference to the `string.IsNullOrWhiteSpace` method. We use `Expression.Call` to create a method invocation expression that calls `string.IsNullOrWhiteSpace` with the parameter resolved by the expression we created earlier. To perform a logical "not" operation on the result, we're calling `Expression.Not` to wrap the method call. This constitutes the condition part of the ternary expression we're building.

To compose the positive clause, we're constructing an "add" operation with the help of `Expression.Add`. As the operands to this binary expression, we're providing a constant expression for string `"Greetings, "` and the parameter expression from earlier.

As for the negative clause, we're using `Expression.Constant` to create a `null` constant expression. To ensure that the `null` value is typed correctly, we explicitly specify the type as the second parameter.

Finally, we're combining all of the above parts together to create our ternary conditional operator.

However, this expression isn't particularly useful on its own. Since we created it ourselves, we're not really interested in its structure -- we want to be able to evaluate it instead.

In order to do that, we have to create an entry point by wrapping everything in a lambda expression. To turn it into an actual lambda, we can call `Compile` which will produce a delegate that we can invoke.

Let's update the method accordingly:

```csharp
public Func<string, string?> ConstructGreetingFunction()
{
    var personNameParameter = Expression.Parameter(typeof(string), "personName");

    // Condition
    var isNullOrWhiteSpaceMethod = typeof(string)
        .GetMethod(nameof(string.IsNullOrWhiteSpace));

    var condition = Expression.Not(
        Expression.Call(isNullOrWhiteSpaceMethod, personNameParameter));

    // True clause
    var trueClause = Expression.Add(
        Expression.Constant("Greetings, "),
        personNameParameter);

    // False clause
    var falseClause = Expression.Constant(null, typeof(string));

    var conditional = Expression.Condition(condition, trueClause, falseClause);

    var lambda = Expression.Lambda<Func<string, string?>>(conditional, personNameParameter);

    return lambda.Compile();
}
```

As you can see, we were able to construct a lambda expression by specifying its body (which is our conditional expression) and the parameter that we defined earlier. We also indicated the exact type of the function this expression represents by supplying a generic argument.

By compiling an expression tree, we are able to convert the code it represents into runtime instructions. We can now use the delegate returned by this method to evaluate the expression we composed:

```csharp
var getGreeting = ConstructGreetingFunction();

var greetingForJohn = getGreeting("John");
```

However, if we try to run this, we will get an error:

```ini
The binary operator Add is not defined for the types 'System.String' and 'System.String'.
```

Hmm, that's weird. I'm pretty sure the `+` operator is defined for strings, otherwise how else would I be able to write `"foo" + "bar"`?

Well, actually the error message is correct, this operator is indeed not defined for `System.String`. Instead what happens is that the C# compiler automatically converts expressions like `"foo" + "bar"` into `string.Concat("foo", "bar")`. In cases with more than two strings this provides better performance because it avoids unnecessary allocations.

When dealing with expression trees, we're essentially writing the "final" version of the code. So instead of `Expression.Add` we need to call `string.Concat` directly.

Let's change our code to accommodate for that:

```csharp
public Func<string, string?> ConstructGreetingFunction()
{
    var personNameParameter = Expression.Parameter(typeof(string), "personName");

    // Condition
    var isNullOrWhiteSpaceMethod = typeof(string)
        .GetMethod(nameof(string.IsNullOrWhiteSpace));

    var condition = Expression.Not(
        Expression.Call(isNullOrWhiteSpaceMethod, personNameParameter));

    // True clause
    var concatMethod = typeof(string)
        .GetMethod(nameof(string.Concat), new[] {typeof(string), typeof(string)});

    var trueClause = Expression.Call(
        concatMethod,
        Expression.Constant("Greetings, "),
        personNameParameter);

    // False clause
    var falseClause = Expression.Constant(null, typeof(string));

    var conditional = Expression.Condition(condition, trueClause, falseClause);

    var lambda = Expression.Lambda<Func<string, string?>>(conditional, personNameParameter);

    return lambda.Compile();
}
```

Now, if we try to compile and run our function, it behaves as expected:

```csharp
var getGreetings = ConstructGreetingFunction();

var greetingsForJohn = getGreetings("John"); // "Greetings, John"
var greetingsForNobody = getGreetings(" ");  // <null>
```

That's pretty awesome! We've compiled some code dynamically at runtime and were able to execute it like any other function.

## Constructing statements

So far we've only talked about expressions, but what about statements? Can we dynamically compile code that contains multiple statements or are we limited to expressions?

The main difference between expressions and statements is that statements don't produce results. Instead, they typically facilitate some useful side-effects.

For example, consider the following two statements:

```csharp
Console.Write("Hello ");
Console.WriteLine("world!");
```

We know that these method calls don't produce results because their return type is `void`. Even though these are not expressions, we can still model them using expression trees. To do that, we need to put them inside a `Block` expression.

Here is how it works:

```csharp
public Expression CreateStatementBlock()
{
    var consoleWriteMethod = typeof(Console)
        .GetMethod(nameof(Console.Write), new[] {typeof(string)});

    var consoleWriteLineMethod = typeof(Console)
        .GetMethod(nameof(Console.WriteLine), new[] {typeof(string)});

    return Expression.Block(
        Expression.Call(consoleWriteMethod, Expression.Constant("Hello ")),
        Expression.Call(consoleWriteLineMethod, Expression.Constant("world!")));
}
```

We can similarly compile it to a delegate to invoke it at runtime:

```csharp
var block = CreateStatementBlock();
var lambda = Expression.Lambda<Action>(block).Compile();

lambda();

// Hello world!
```

Now, if we inspect the `block.Type` property, which denotes the result type of the expression, we will see that it's `System.Void`. Essentially the lambda expression we've built is just this:

```csharp
var lambda = () =>
{
    Console.Write("Hello ");
    Console.WriteLine("world!");
};
```

So despite the fact that we are building _expression_ trees, we can still represent blocks of statements just as well.

## Converting expressions to readable code

We know how to compile our expressions into runtime instructions, but what about readable C# code? It could be useful if we wanted to display it or just to have some visual aid while testing or debugging.

The good news is that all types that derive from `Expression` override the `ToString` method with a more specific implementation. That means we can do the following:

```csharp
var s1 = Expression.Constant(42).ToString(); // 42

var s2 = Expression.Multiply(
    Expression.Constant(5),
    Expression.Constant(11)).ToString();     // (5 * 11)
```

The bad news, however, is that it only works nicely with simple expressions like the ones above. For example, if we try to call `ToString` on the ternary expression we compiled earlier, we will get:

```csharp
var s = lambda.ToString();

// personName => IIF(Not(IsNullOrWhiteSpace(personName)), Concat("Greetings, ", personName), null)
```

While fairly descriptive, this is probably not the text representation you would hope to see.

Luckily, we can use the [ReadableExpressions](https://github.com/agileobjects/ReadableExpressions) NuGet package to get us what we want. By installing it, we should be able to call `ToReadableString` to get the actual C# code that represents the expression:

```csharp
var code = lambda.ToReadableString();

// personName => !string.IsNullOrWhiteSpace(personName) ? "Greetings, " + personName : null
```

As you can see, it even replaced the `string.Concat` call with the plus operator to make it closer to code that a developer would typically write.

Additionally, if you are using Visual Studio and want to inspect expressions by visualizing them as code, you can also install [this extension](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1232914.ReadableExpressionsVisualizers). It's very helpful when debugging large or really complex expressions.

## Optimizing reflection calls

When it comes to compiled expressions, one of the most common usage scenarios is reflection-heavy code. As we all know, reflection can be quite slow because of late binding, however by compiling the code at runtime we can achieve better performance.

Let's imagine we have a class which has a private method that we want to invoke from the outside:

```csharp
public class Command
{
    private int Execute() => 42;
}
```

With the help of reflection, this is quite simple:

```csharp
public static int CallExecute(Command command) =>
    (int) typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance)
        .Invoke(command, null);
```

Of course, calling the method like that can cause significant performance issues if we put it in a tight loop. Let's see if we can optimize it a bit.

One thing we can do straight away is separate the part that resolves `MethodInfo` from the part that invokes it. If we're going to call this method more than once, we don't have to use `GetMethod` every time:

```csharp
public static class ReflectionCached
{
    private static MethodInfo ExecuteMethod { get; } = typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance);

    public static int CallExecute(Command command) => (int) ExecuteMethod.Invoke(command, null);
}
```

That should make things better, but we can push it even further by using `Delegate.CreateDelegate`. This way we can create a re-usable delegate and avoid the overhead that comes with `MethodInfo.Invoke`. Let's update our code accordingly:

```csharp
public static class ReflectionDelegate
{
    private static MethodInfo ExecuteMethod { get; } = typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance);

    private static Func<Command, int> Impl { get; } =
        (Func<Command, int>) Delegate.CreateDelegate(typeof(Func<Command, int>), ExecuteMethod);

    public static int CallExecute(Command command) => Impl(command);
}
```

Alright, that's probably as good as it can get with reflection. Now let's try to do the same using compiled expressions:

```csharp
public static class ExpressionTrees
{
    private static MethodInfo ExecuteMethod { get; } = typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance);

    private static Func<Command, int> Impl { get; }

    static ExpressionTrees()
    {
        var instance = Expression.Parameter(typeof(Command));
        var call = Expression.Call(instance, ExecuteMethod);
        Impl = Expression.Lambda<Func<Command, int>>(call, instance).Compile();
    }

    public static int CallExecute(Command command) => Impl(command);
}
```

In all of these approaches I'm relying on static constructors to initialize the properties in a lazy and thread-safe manner. This ensures that all of the heavy-lifting happens only once, the first time the members of these classes are accessed.

Now let's pit all of these techniques against each other and compare their performance using [Benchmark.NET](https://github.com/dotnet/BenchmarkDotNet):

```csharp
public class Benchmarks
{
    [Benchmark(Description = "Reflection", Baseline = true)]
    public int Reflection() => (int) typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance)
        .Invoke(new Command(), null);

    [Benchmark(Description = "Reflection (cached)")]
    public int Cached() => ReflectionCached.CallExecute(new Command());

    [Benchmark(Description = "Reflection (delegate)")]
    public int Delegate() => ReflectionDelegate.CallExecute(new Command());

    [Benchmark(Description = "Expressions")]
    public int Expressions() => ExpressionTrees.CallExecute(new Command());

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|                Method |       Mean |     Error |    StdDev | Ratio |
|---------------------- |-----------:|----------:|----------:|------:|
|            Reflection | 197.052 ns | 2.8480 ns | 2.6640 ns |  1.00 |
|   Reflection (cached) | 125.365 ns | 2.0170 ns | 1.8867 ns |  0.64 |
| Reflection (delegate) |   6.445 ns | 0.1648 ns | 0.1962 ns |  0.03 |
|           Expressions |   5.540 ns | 0.2082 ns | 0.2986 ns |  0.03 |
```

As you can see, compiled expressions outperform reflection across the board, even though the approach with `CreateDelegate` comes really close. Note however that while the execution times are similar, `CreateDelegate` is more limited than compiled expressions -- for example, it cannot be used to call constructor methods.

This approach of using expression trees for dynamic method invocation is commonplace in various frameworks and libraries. For example:

- [AutoMapper](https://github.com/AutoMapper/AutoMapper) uses them to speed up object conversion
- [NServiceBus](https://github.com/Particular/NServiceBus) uses them to speed up its behavior pipeline
- [Marten](https://github.com/JasperFx/marten) uses them to speed up entity mapping

## Implementing generic operators

Something else you can do with compiled expressions is implement generic operators. These can be pretty useful if you're writing a lot of mathematical code and want to avoid repetition.

As you know, operators in C# are not generic. This means that every numeric type defines its own version of the, for example, multiply and divide operators. As a result, code that uses these operators also can't be generic either.

Imagine that you had a function that calculates three-fourths of a number:

```csharp
public int ThreeFourths(int x) => 3 * x / 4;

// ThreeFourths(18) -> 13
```

Defined as it is, it only works when used with numbers of type `int`. If we wanted to extend it to support other types, we'd have to add some overloads:

```csharp
public int ThreeFourths(int x) => 3 * x / 4;

public long ThreeFourths(long x) => 3 * x / 4;

public float ThreeFourths(float x) => 3 * x / 4;

public double ThreeFourths(double x) => 3 * x / 4;

public decimal ThreeFourths(decimal x) => 3 * x / 4;
```

This is suboptimal. We are introducing a lot of code duplication which only gets worse as this method is referenced from other places.

It would've been better if we could just do something like this instead:

```csharp
public T ThreeFourths<T>(T x) => 3 * x / 4;
```

But unfortunately that doesn't compile, seeing as the `*` and `/` operators are not available on every type that can be specified in place of `T`. Sadly, there's also no constraint we could use to limit the generic argument to numeric types.

However, by generating code dynamically with expression trees we can work around this problem:

```csharp
public T ThreeFourths<T>(T x)
{
    var param = Expression.Parameter(typeof(T));

    // Cast the numbers '3' and '4' to our type
    var three = Expression.Convert(Expression.Constant(3), typeof(T));
    var four = Expression.Convert(Expression.Constant(4), typeof(T));

    // Perform the calculation
    var operation = Expression.Divide(Expression.Multiply(param, three), four);

    var lambda = Expression.Lambda<Func<T, T>>(operation, param);

    var func = lambda.Compile();

    return func(x);
}

// ThreeFourths(18) -> 13
// ThreeFourths(6.66) -> 4.995
// ThreeFourths(100M) -> 75
```

That works well and we can reuse this method for numbers of any type. However, seeing as our generic operation doesn't have type safety, you may be wondering, "How is this approach any different from just using `dynamic`?".

Surely, we could just write our code like this and avoid all the trouble:

```csharp
public dynamic ThreeFourths(dynamic x) => 3 * x / 4;
```

Indeed, functionally these two approaches are the same. However, the main difference and the advantage of expression trees is the fact they are compiled, while `dynamic` isn't. Compiled code has the potential to perform much faster.

That said, in the example above we're not benefitting from this advantage at all because we're recompiling our function every time anyway. Let's try to change our code so that it happens only once.

In order to achieve that, we can apply the same pattern as the last time. Let's put the delegate inside a generic static class and have it initialized from the static constructor. Here's how that would look:

```csharp
public static class ThreeFourths
{
    private static class Impl<T>
    {
        public static Func<T, T> Of { get; }

        static Impl()
        {
            var param = Expression.Parameter(typeof(T));

            var three = Expression.Convert(Expression.Constant(3), typeof(T));
            var four = Expression.Convert(Expression.Constant(4), typeof(T));

            var operation = Expression.Divide(Expression.Multiply(param, three), four);

            var lambda = Expression.Lambda<Func<T, T>>(operation, param);

            Of = lambda.Compile();
        }
    }

    public static T Of<T>(T x) => Impl<T>.Of(x);
}

// ThreeFourths.Of(18) -> 13
```

Due to the fact that the compiler generates a version of the `Impl` class for each argument of `T`, we end up with an implementation of three-fourths for each type encapsulated in a separate class. This approach gives us a thread-safe lazy-evaluated generic dynamic function.

Now, with the optimizations out of the way, let's again use Benchmark.NET to compare the different ways we can calculate three-fourths of a value:

```csharp
public class Benchmarks
{
    [Benchmark(Description = "Static", Baseline = true)]
    [Arguments(13.37)]
    public double Static(double x) => 3 * x / 4;

    [Benchmark(Description = "Expressions")]
    [Arguments(13.37)]
    public double Expressions(double x) => ThreeFourths.Of(x);

    [Benchmark(Description = "Dynamic")]
    [Arguments(13.37)]
    public dynamic Dynamic(dynamic x) => 3 * x / 4;

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|      Method |     x |       Mean |     Error |    StdDev | Ratio | RatioSD |
|------------ |------ |-----------:|----------:|----------:|------:|--------:|
|      Static | 13.37 |  0.6164 ns | 0.0552 ns | 0.0516 ns |  1.00 |    0.00 |
| Expressions | 13.37 |  2.1350 ns | 0.0754 ns | 0.0705 ns |  3.48 |    0.29 |
|     Dynamic | 13.37 | 19.4831 ns | 0.3475 ns | 0.3251 ns | 31.80 |    2.47 |
```

As you can see, the expression-based approach performs about 9 times faster than when using `dynamic`.

## Compiling dictionary into a switch expression

Another fun way we can use expression trees is to create a dictionary with a compiled lookup. Even though the standard .NET `System.Collections.Generic.Dictionary` is insanely fast on its own, it's possible to outperform it in read operations by around three times.

While a typical dictionary implementation may be pretty complicated, a lookup can be represented in a form of a simple switch expression:

```csharp
// Pseudo-code
public TValue Lookup(TKey key) =>
    key.GetHashCode() switch
    {
        // No collisions
        9254 => value1,
        -101 => value2,

        // Collision
        777 => key switch
        {
            key3 => value3,
            key4 => value4
        },

        // ...

        // Not found
        _ => throw new KeyNotFoundException(key.ToString())
    };
```

The function above attempts to match the hash code of the specified key with the hash code of one of the keys contained within the dictionary. If it's successful, then the corresponding value is returned.

Even though hash codes are designed to be unique, inevitably there will be collisions. In such cases, when the same hash code matches with multiple different values, there is an inner switch expression that compares the actual key and determines which value to return.

Finally, if none of the cases matched, it throws an exception signifying that the dictionary doesn't contain the specified key.

The idea is that, since a switch is faster than a hash table, dynamically compiling all key-value pairs into a switch expression like the one above should result in a faster dictionary lookup.

Let's try it out. Here's how the code for that would look:

```csharp
public class CompiledDictionary<TKey, TValue> : IDictionary<TKey, TValue>
{
    private readonly List<KeyValuePair<TKey, TValue>> _pairs =
        new List<KeyValuePair<TKey, TValue>>();

    private Func<TKey, TValue> _lookup;

    public CompiledDictionary()
    {
        UpdateLookup();
    }

    public void UpdateLookup()
    {
        // Parameter for lookup key
        var keyParameter = Expression.Parameter(typeof(TKey));

        // Expression that gets the key's hash code
        var keyGetHashCodeCall = Expression.Call(
            keyParameter,
            typeof(object).GetMethod(nameof(GetHashCode)));

        // Expression that converts the key to string
        var keyToStringCall = Expression.Call(
            keyParameter,
            typeof(object).GetMethod(nameof(ToString)));

        // Expression that throws 'not found' exception in case of failure
        var exceptionCtor = typeof(KeyNotFoundException)
            .GetConstructor(new[] {typeof(string)});

        var throwException = Expression.Throw(
            Expression.New(exceptionCtor, keyToStringCall),
            typeof(TValue));

        // Switch expression with cases for every hash code
        var body = Expression.Switch(
            typeof(TValue), // expression type
            keyGetHashCodeCall, // switch condition
            throwException, // default case
            null, // use default comparer
            _pairs // switch cases
                .GroupBy(p => p.Key.GetHashCode())
                .Select(g =>
                {
                    // No collision, construct constant expression
                    if (g.Count() == 1)
                        return Expression.SwitchCase(
                            Expression.Constant(g.Single().Value), // body
                            Expression.Constant(g.Key)); // test values

                    // Collision, construct inner switch for the key's value
                    return Expression.SwitchCase(
                        Expression.Switch(
                            typeof(TValue),
                            keyParameter, // switch on actual key
                            throwException,
                            null,
                            g.Select(p => Expression.SwitchCase(
                                Expression.Constant(p.Value),
                                Expression.Constant(p.Key)
                            ))),
                        Expression.Constant(g.Key));
                }));

        var lambda = Expression.Lambda<Func<TKey, TValue>>(body, keyParameter);

        _lookup = lambda.Compile();
    }

    public TValue this[TKey key]
    {
        get => _lookup(key);
        set
        {
            _pairs.RemoveAll(p => EqualityComparer<TKey>.Default.Equals(p.Key, key));
            _pairs.Add(KeyValuePair.Create(key, value));
        }
    }

    // The rest of the interface implementation is omitted for brevity
}
```

The method `UpdateLookup` takes all of the key-value pairs contained within the current dictionary (`_pairs`) and groups them by the hash codes of their keys, which are then transformed into switch cases. If there is no collision for a particular hash code, then the switch case is made up of a single constant expression that produces the corresponding value. Otherwise, it contains an inner switch expression that further evaluates the key to determine which value to return.

Let's see how well this dictionary performs when benchmarked against the standard implementation:

```csharp
public class Benchmarks
{
    private readonly Dictionary<string, int> _normalDictionary =
        new Dictionary<string, int>();

    private readonly CompiledDictionary<string, int> _compiledDictionary =
        new CompiledDictionary<string, int>();

    [Params(10, 1000, 10000)]
    public int Count { get; set; }

    public string TargetKey { get; set; }

    [GlobalSetup]
    public void Setup()
    {
        // Seed the dictionaries with values
        foreach (var i in Enumerable.Range(0, Count))
        {
            var key = $"key_{i}";

            _normalDictionary[key] = i;
            _compiledDictionary[key] = i;
        }

        // Recompile lookup
        _compiledDictionary.UpdateLookup();

        // Try to get the middle element
        TargetKey = $"key_{Count / 2}";
    }

    [Benchmark(Description = "Standard dictionary", Baseline = true)]
    public int Normal() => _normalDictionary[TargetKey];

    [Benchmark(Description = "Compiled dictionary")]
    public int Compiled() => _compiledDictionary[TargetKey];

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|              Method | Count |      Mean |     Error |    StdDev | Ratio |
|-------------------- |------ |----------:|----------:|----------:|------:|
| Standard dictionary |    10 | 27.390 ns | 0.3176 ns | 0.2971 ns |  1.00 |
| Compiled dictionary |    10 |  9.618 ns | 0.0458 ns | 0.0406 ns |  0.35 |
|                     |       |           |           |           |       |
| Standard dictionary |  1000 | 26.035 ns | 0.2605 ns | 0.2437 ns |  1.00 |
| Compiled dictionary |  1000 | 14.897 ns | 0.2369 ns | 0.2216 ns |  0.57 |
|                     |       |           |           |           |       |
| Standard dictionary | 10000 | 29.724 ns | 0.1583 ns | 0.1481 ns |  1.00 |
| Compiled dictionary | 10000 | 18.824 ns | 0.0976 ns | 0.0913 ns |  0.63 |
```

We can see that the compiled dictionary performs lookups about 1.6-2.8 times faster. While the performance of the hash table is consistent regardless of how many elements are in the dictionary, the expression tree implementation becomes slower as the dictionary gets bigger. This can potentially be remedied by adding another switch layer for indexing.

## Parsing expressions

One other interesting usage scenario, that I'm personally really fond of, is parsing. The main challenge of writing an interpreter for a custom domain-specific language is turning the syntax tree into runtime instructions. By parsing the grammar constructs directly into expression trees, this becomes a solved problem.

As an example, let's write a simple program that takes a string representation of a mathematical expression and evaluates its result. To implement the parser, we will use the [Sprache](https://github.com/sprache/Sprache) library.

```csharp
public static class ExpressionDsl
{
    private static readonly Parser<Expression> Constant =
        Parse.DecimalInvariant
            .Select(n => double.Parse(n, CultureInfo.InvariantCulture))
            .Select(n => Expression.Constant(n, typeof(double)));

    private static readonly Parser<ExpressionType> Operator =
        Parse.Char('+').Return(ExpressionType.Add)
            .Or(Parse.Char('-').Return(ExpressionType.Subtract))
            .Or(Parse.Char('*').Return(ExpressionType.Multiply))
            .Or(Parse.Char('/').Return(ExpressionType.Divide));

    private static readonly Parser<Expression> Operation =
        Parse.ChainOperator(Operator, Constant, Expression.MakeBinary);

    private static readonly Parser<Expression> FullExpression =
        Operation.Or(Constant).End();

    public static double Run(string expression)
    {
        var operation = FullExpression.Parse(expression);
        var func = Expression.Lambda<Func<double>>(operation).Compile();

        return func();
    }

    public static void Main(string[] args)
    {
        var input = string.Concat(args);
        var result = Run(input);

        Console.WriteLine(result);
    }
}
```

As you can see, the parsers defined above (`Constant`, `Operator`, `Operation`, `FullExpression`) all yield objects of type `Expression` and `ExpressionType`, which are both defined in `System.Linq.Expressions`. The expression tree is essentially our syntax tree, so once we parse the input we have all the required information to compile the runtime instructions represented by it.

You can try it out by running the application:

```shell
> app 3.15 * 5 + 2
17.75
```

Note that this simple calculator is just an example of what you can do. If you want to see how a proper calculator like that would look, check out [Sprache.Calc](https://github.com/yallie/Sprache.Calc/blob/master/Sprache.Calc/SimpleCalculator.cs). Also, if you want to learn more about parsing, check out my blog posts about [parsing in C#](/blog/monadic-parser-combinators) and [parsing in F#](/blog/parsing-with-fparsec).

## Making things even faster

While compiled expressions execute really fast, compiling them can be relatively expensive.

In most cases that's completely fine, but you may want to take the performance even further by using [FastExpressionCompiler](https://github.com/dadhi/FastExpressionCompiler). This library provides a drop-in replacement for the `Compile` method called `CompileFast`, which executes much faster.

For example, here's a simple benchmark that shows the difference:

```csharp
public class Benchmarks
{
    private static Expression Body { get; } =
        Expression.Add(Expression.Constant(3), Expression.Constant(5));

    [Benchmark(Description = "Compile", Baseline = true)]
    public Func<int> Normal() => Expression.Lambda<Func<int>>(Body).Compile();

    [Benchmark(Description = "Compile (fast)")]
    public Func<int> Fast() => Expression.Lambda<Func<int>>(Body).CompileFast();

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|           Method |      Mean |     Error |    StdDev | Ratio |
|----------------- |----------:|----------:|----------:|------:|
|          Compile | 38.074 us | 0.2139 us | 0.1896 us |  1.00 |
|   Compile (fast) |  4.791 us | 0.0693 us | 0.0614 us |  0.13 |
```

As you can see, the performance improvement is pretty noticeable. The reason it runs so fast is because the `CompileFast` version skips all the verifications that normal `Compile` does to ensure that the expression tree is valid.

This library (as part of `FastExpressionCompiler.LightExpression`) also offers a drop-in replacement for `Expression` and all of its static factory methods. These alternative implementations construct expressions which may in some cases perform much faster than their default counterparts. I still recommend to benchmark it on your particular use cases to ensure that it actually provides an improvement.

## Generating expression trees from code

So far we've explored how to construct expression trees manually. The cool thing about expression trees in .NET though is that they can also be created automatically from a lambda. You're definitely familiar with this approach because that's what libraries like Entity Framework use to translate C# expressions into SQL queries.

The way this works is that you can simply specify a lambda expression like you would if you were to define a delegate. C# compiler will instead disassemble the lambda into an expression tree.

Consider this snippet of code:

```csharp
Func<int, int, int> div =
    (a, b) => a / b;

Expression<Func<int, int, int>> divExpr =
    (a, b) => a / b;
```

Both of these assignments look exactly the same, it's just that the actual value is different. While in the first case we will get a delegate which can be executed directly, the second will provide us with an expression tree that represents the structure of the supplied lambda expression. This is essentially the same `LambdaExpression` that we were creating earlier, only now it represents code written statically as opposed to dynamically.

Note, however, while the assignment above works, you can't do this:

```csharp
Func<int, int, int> div = (a, b) => a / b;

// Compile error
Expression<Func<int, int, int>> divExpr = div;
```

The expression must be defined in-place in order to work. Because the disassembly happens during compile time, not runtime, the compiler needs to know exactly what it's dealing with.

Although this approach is incredibly useful, it has certain limitations. In order for this to work, the lambda expression must not contain any of the following:

- Null-coalescing operator (`obj?.Prop`)
- Dynamic variables (`dynamic`)
- Asynchronous code (`async`/`await`)
- Default or named parameters (`func(a, b: 5)`, `func(a)`)
- Parameters passed by reference (`int.TryParse("123", out var i)`)
- Multi-dimensional array initializers (`new int[2, 2] { { 1, 2 }, { 3, 4 } }`)
- Assignment operations (`a = 5`)
- Increment and decrement (`a++`, `a--`, `--a`, `++a`)
- Base access (`base.Prop`)
- Dictionary initialization (`new Dictionary<string, int> { ["foo"] = 100 }`)
- Unsafe code (via `unsafe`)
- Throw expressions (`throw new Exception()`)
- Tuple literals (`(a, b)`)

On top of all that, you cannot use this method to construct expression trees from multi-line lambdas. That means this won't compile:

```csharp
// Compile error
Expression<Func<int, int, int>> divExpr = (a, b) =>
{
    var result = a / b;
    return result;
};
```

And, most importantly, this won't work either:

```csharp
// Compile error
Expression<Action> writeToConsole = () =>
{
    Console.Write("Hello ");
    Console.WriteLine("world!");
};
```

Most of these limitations come from the fact that this feature was designed with `IQueryable` in mind and the fact that some of the language constructs listed above don't really make sense when it comes to querying data. That said, there are a lot of other scenarios where they can be useful.

There is a suggestion to extend compile-time expression trees and it's tracked [by this issue on GitHub](https://github.com/dotnet/csharplang/issues/158). We'll see where it goes.

For now, let's move these limitations aside and explore some of the ways we can use expression trees constructed with this approach.

## Traversing expression trees

When analyzing expression trees, we often need to be able to traverse its hierarchy. Fortunately, we don't have to implement something like this ourselves because the framework already provides a special class called [`ExpressionVisitor`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.expressions.expressionvisitor).

It's an abstract class that you can inherit from. It contains methods that "visit" expressions of every type, all of which are virtual and can be overridden. Essentially this class allows you to do recursive pattern matching on an entire expression tree.

For example, if we wanted to

```csharp
public class Visitor : ExpressionVisitor
{
    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
        var newMethodCall = node.Method == typeof(Math).GetMethod(nameof(Math.Sin))
            ? typeof(Math).GetMethod(nameof(Math.Log10))
            : node.Method;

        Console.WriteLine($"Old method call: {node.Method.Name}(...)");
        Console.WriteLine($"New method call: {newMethodCall.Name}(...)");

        return Expression.Call(newMethodCall, node.Arguments);
    }
}
```

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    var newExpr = (Expression<Func<T>>) new Visitor().Visit(expr);

    Console.WriteLine($"Old expression: {expr}");
    Console.WriteLine($"New expression: {newExpr}");

    var oldResult = expr.Compile()();
    var newResult = newExpr.Compile()();

    Console.WriteLine($"Old result value: {oldResult}");
    Console.WriteLine($"New result value: {newResult}");
}

public static void Main()
{
    Analyze(() => 2 * Math.Sin(Math.PI / 2));
}
```

```x
Old method call: Sin(...)
New method call: Log10(...)
Old expression: () => (2 * Sin(1.5707963267948966))
New expression: () => (2 * Log10(1.5707963267948966))
Old result value: 2
New result value: 0.39223975406030526
```

## Providing context to assertions

Often when I'm writing test suites for my projects, I find myself spending time decorating my assertions with informational error messages. For example:

```csharp
[Test]
public void IntTryParse_Test()
{
    // Arrange
    const string s = "123";

    // Act
    var result = int.TryParse(s, out var value);

    // Assert
    Assert.That(result, Is.True, "Parsing was unsuccessful");
    Assert.That(value, Is.EqualTo(124), "Parsed value is incorrect");
}
```

If the assertion fails, I will get a more descriptive error message. After all, this is better than not having any idea what went wrong:

```ini
X IntTryParse_Test [60ms]
  Error Message:
    Parsed value is incorrect
  Expected: 124
  But was:  123
```

In a perfect world, however, it would be nice if the error message simply contained the code that specifies the assertion. Luckily, this is something we can do using expressions.

To do that, we can create a helper method that will wrap the assertion in an expression:

```csharp
public static class AssertEx
{
    public static void Express(Expression<Action> expression)
    {
        var act = expression.Compile();

        try
        {
            act();
        }
        catch (Exception ex)
        {
            throw new AssertionException(
                expression.Body.ToReadableString() +
                Environment.NewLine +
                ex.Message);
        }
    }
}
```

The extension method `ToReadableString` comes from the NuGet package [ReadableExpressions](https://github.com/agileobjects/ReadableExpressions) that I've talked about earlier in the article. This converts the expression to string that matches the C# code used to produce it.

So now we can wrap our assertions in this helper method like this:

```csharp
[Test]
public void IntTryParse_Test()
{
    // Arrange
    const string s = "123";

    // Act
    var result = int.TryParse(s, out var value);

    // Assert
    AssertEx.Express(() => Assert.That(result, Is.True));
    AssertEx.Express(() => Assert.That(value, Is.EqualTo(124)));
}
```

If we try to run this test, we will get the following error message:

```ini
X IntTryParse_Test [99ms]
  Error Message:
    Assert.That(value, Is.EqualTo(124))
  Expected: 124
  But was:  123
```

As you can see, the error message now specifies the exact assertion that failed. This gives us more context to determine what exactly went wrong.

___

With the advent of .NET Core 3.0, the .NET team has also added a new attribute, `CallerArgumentExpression`. This attribute was meant to be supported by a [language feature](https://github.com/dotnet/csharplang/issues/287) that was planned for C# 8 but didn't make it. Currently, the attribute doesn't do anything because the compiler doesn't support it yet, but we will hopefully see this change in a future version of the language.

The goal of this attribute is to provide the ability to "sniff" the expression passed to the specified parameter. For example, we should be able to define a method like this:

```csharp
public static void Assert(
    bool condition,
    [CallerArgumentExpression("condition")] string expression = "")
{
    if (!condition)
        throw new AssertionFailedException($"Condition `{expression}` is not true");
}
```

Which will then produce a detailed exception message if the assertion fails:

```csharp
Assert(2 + 2 == 5);

// Exception:
// Condition `2 + 2 == 5` is not true
```

Note that with this approach we will only be able to obtain the expression as string, which will be the same expression specified in the source code. This can be used to provide similar experience as described above.

## Transpile

## PropertyChanged

## Summary

Expression trees provide us with a formal structure of code that lets us analyze existing expressions or compile entirely new ones directly at runtime. This feature makes it possible to do a bunch of cool things, including writing transpilers, interpreters, code generators, optimize reflection calls, provide contextual assertions, and more. I think it's a really powerful tool that deserves a lot more attention.

Have you had an experience using expression trees in a way that made your life better? Share it with me in the comments or [on Twitter](https://twitter.com/tyrrrz).

Some other interesting articles on the topic:

- [Introduction to expression trees (Microsoft Docs)](https://docs.microsoft.com/en-us/dotnet/csharp/expression-trees)
- [10X faster execution with compiled expression trees (Particular Software)](https://particular.net/blog/10x-faster-execution-with-compiled-expression-trees)
- [AutoMapper 5.0 speed increases (Jimmy Bogard)](https://lostechies.com/jimmybogard/2016/06/24/automapper-5-0-speed-increases)
- [How we did (and did not) improve performance and efficiency in Marten 2.0 (Jeremy D. Miller)](https://jeremydmiller.com/2017/08/01/how-we-did-and-did-not-improve-performance-and-efficiency-in-marten-2-0)
- [Optimizing Just in Time with Expression Trees (Craig Gidney)](http://twistedoakstudios.com/blog/Post2540_optimizing-just-in-time-with-expression-trees)
