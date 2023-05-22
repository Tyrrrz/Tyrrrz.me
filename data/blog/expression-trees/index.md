---
title: 'Working with Expression Trees in C#'
date: '2020-02-17'
---

Expression trees is an obscure, although very interesting feature in .NET. Most people probably think of it as something synonymous with object-relational mapping frameworks, but despite being its most common use case, it's not the only one. There are a lot of creative things you can do with expression trees, including code generation, transpilation, meta-programming, and more.

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

Looking at the above expression, we can also consider two of its aspects: **what it does** and **how it does it**.

When it comes to the former, the answer is pretty simple — it generates a greeting based on the person's name, or produces a `null`. If this expression were returned by a function, that would be the extent of the information that we could derive from its signature:

```csharp
string? GetGreeting(string personName) { /* ... */ }
```

As for how it does it, however, the answer is a bit more detailed. This expression consists of a ternary conditional operator, whose condition is evaluated by negating the result of a call to the `string.IsNullOrWhiteSpace(...)` method with the `personName` parameter, and whose positive clause is made up of a "plus" binary operator that works with a constant string expression `"Greetings, "` and the parameter expression, and whose negative clause consists of a sole `null` expression.

The description above may seem like a mouthful, but it outlines the exact syntactic structure of the expression. It is by this higher-order representation that we're able to tell how exactly it's evaluated.

To make things more clear, we can also illustrate this representation with the following diagram:

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

As you can see, at the highest level we have the ternary conditional operator which is itself made up of other expressions, which are made up of other expressions, and so on. The relationship between individual components is hierarchical, resembling an upside-down tree.

Although it's inherently obvious to us as humans, in order to interpret this representation programmatically, we need a special data structure. This data structure is what we call an _expression tree_.

## Constructing expression trees manually

In C#, expression trees can be used in either of two directions: we can create them directly via an API and then compile them into run-time instructions, or we can disassemble them from supplied lambda expressions. In this part of the article we will focus on the first one.

The framework offers us with an API to construct expression trees through the [`Expression`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.expressions.expression) class located in the `System.Linq.Expressions` namespace. It exposes various factory methods that can be used to produce expressions of different types.

Some of these methods are:

- `Expression.Constant(...)` — creates an expression that represents a value
- `Expression.Variable(...)` — creates an expression that represents a variable
- `Expression.New(...)` — creates an expression that represents an initialization of a new instance
- `Expression.Assign(...)` — creates an expression that represents an assignment operation
- `Expression.Equal(...)` — creates an expression that represents an equality comparison
- `Expression.Call(...)` — creates an expression that represents a specific method call
- `Expression.Condition(...)` — creates an expression that represents branching logic
- `Expression.Loop(...)` — creates an expression that represents repeating logic

As a simple exercise, let's recreate the expression we've looked into in the previous part of the article:

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

Let's digest what just happened here.

First, we're calling `Expression.Parameter(...)` in order to construct a parameter expression. We will be able to use it to resolve the value passed to a particular parameter.

Following that, we are relying on reflection to resolve a reference to the `string.IsNullOrWhiteSpace(...)` method. We use `Expression.Call(...)` to create a method invocation expression that represents a call to `string.IsNullOrWhiteSpace(...)` with the parameter resolved by the expression we created earlier. To perform a logical "not" operation on the result, we're calling `Expression.Not(...)` to wrap the method call. Incidentally, this expression constitutes the condition part of the ternary expression we're building.

To compose the positive clause, we're constructing an "add" operation with the help of `Expression.Add(...)`. As the operands, we're providing a constant expression for string `"Greetings, "` and the parameter expression from earlier.

Then, for the negative clause, we're using `Expression.Constant(...)` to create a `null` constant expression. To ensure that the `null` value is typed correctly, we explicitly specify the type as the second parameter.

Finally, we're combining all the above parts together to create our ternary conditional operator. If you take a moment to trace what goes into `Expression.Condition(...)`, you will realize that we have essentially replicated the tree diagram we've seen earlier.

However, this expression isn't particularly useful on its own. Since we've created it ourselves, we're not really interested in its structure — we want to be able to evaluate it instead.

In order to do that, we have to create an entry point by wrapping everything in a lambda expression. To turn it into an actual lambda, we can call `Compile(...)` which will produce a delegate that we can invoke.

Let's update the method accordingly:

```csharp
public Func<string, string?> ConstructGreetingFunction()
{
    var personNameParameter = Expression.Parameter(typeof(string), "personName");

    // Condition
    var isNullOrWhiteSpaceMethod = typeof(string)
        .GetMethod(nameof(string.IsNullOrWhiteSpace));

    var condition = Expression.Not(
        Expression.Call(isNullOrWhiteSpaceMethod, personNameParameter)
    );

    // True clause
    var trueClause = Expression.Add(
        Expression.Constant("Greetings, "),
        personNameParameter
    );

    // False clause
    var falseClause = Expression.Constant(null, typeof(string));

    var conditional = Expression.Condition(condition, trueClause, falseClause);

    var lambda = Expression.Lambda<Func<string, string?>>(conditional, personNameParameter);

    return lambda.Compile();
}
```

As you can see, we were able to construct a lambda expression by specifying its body (which is our conditional expression) and the parameter that we defined earlier. We also indicated the exact type of the function this expression represents by supplying a generic argument.

By compiling the expression tree, we can convert the code it represents into run-time instructions. The delegate returned by this method can be used to evaluate the expression:

```csharp
var getGreeting = ConstructGreetingFunction();

var greetingForJohn = getGreeting("John");
```

However, if we try to run this, we will get an error:

```
The binary operator Add is not defined for the types 'System.String' and 'System.String'.
```

Hmm, that's weird. I'm pretty sure the `+` operator is defined for strings, otherwise how else would I be able to write `"foo" + "bar"`?

Well, actually the error message is correct, this operator is indeed not defined for `System.String`. Instead, what happens is that the C# compiler automatically converts expressions like `"foo" + "bar"` into `string.Concat("foo", "bar")`. In cases with more than two strings this provides better performance because it avoids unnecessary allocations.

When dealing with expression trees, we're essentially writing the "final" version of the code. So instead of `Expression.Add(...)` we need to call `string.Concat(...)` directly.

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
        personNameParameter
    );

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

I think this is pretty awesome. We built an expression tree, compiled it in-memory, and now we can evaluate it using a delegate.

## Constructing statements

So far we've only talked about expressions, but what about statements? Can we dynamically compile code that contains multiple statements or are we limited to expressions?

The main difference between expressions and statements is that statements don't produce results. That means we can't really string them into a single expression.

For example, consider the following two statements:

```csharp
// Two statements:
Console.Write("Hello ");
Console.WriteLine("world!");
```

There's no way for us to compose these into one expression, like we could have with `StringBuilder`, for instance:

```csharp
// Single expression:
new StringBuilder().Append("Hello ").AppendLine("world!");
```

Fortunately, the expression tree model allows us to represent statements as well. To do that, we need to put them inside a `Block(...)` expression.

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
        Expression.Call(consoleWriteLineMethod, Expression.Constant("world!"))
    );
}
```

We can then similarly compile a delegate and invoke it:

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

For more complex use cases, we may declare and reference variables from inside the block expression:

```csharp
public Expression CreateStatementBlock()
{
    var consoleWriteMethod = typeof(Console)
        .GetMethod(nameof(Console.Write), new[] {typeof(string)});

    var consoleWriteLineMethod = typeof(Console)
        .GetMethod(nameof(Console.WriteLine), new[] {typeof(string)});

    var variableA = Expression.Variable(typeof(string), "a");
    var variableB = Expression.Variable(typeof(string), "b");

    return Expression.Block(
        // Declare variables in scope
        new[] {variableA, variableB},

        // Assign values to variables
        Expression.Assign(variableA, Expression.Constant("Foo ")),
        Expression.Assign(variableB, Expression.Constant("bar")),

        // Call methods
        Expression.Call(consoleWriteMethod, variableA),
        Expression.Call(consoleWriteLineMethod, variableB)
    );
}
```

If we compile and evaluate this expression, we will see the following output in the console:

```csharp
var block = CreateStatementBlock();
var lambda = Expression.Lambda<Action>(block).Compile();

lambda();

// Foo bar
```

So despite the fact that we are building _expression_ trees, we are not actually limited only to expressions. We can just as easily model blocks of statements too.

## Converting expressions to readable code

We know how to compile our expressions into run-time instructions, but what about readable C# code? It could be useful if we wanted to display it or just to have some visual aid while testing.

The good news is that all types that derive from `Expression` override the `ToString()` method with a more specific implementation. That means we can do the following:

```csharp
var s1 = Expression.Constant(42).ToString(); // 42

var s2 = Expression.Multiply(
    Expression.Constant(5),
    Expression.Constant(11)
).ToString(); // (5 * 11)
```

The bad news, however, is that it only works nicely with simple expressions like the ones above. For example, if we try to call `ToString()` on the ternary expression we compiled earlier, we will get:

```csharp
var s = lambda.ToString();

// personName => IIF(Not(IsNullOrWhiteSpace(personName)), Concat("Greetings, ", personName), null)
```

While fairly descriptive, this is probably not the text representation one would hope to see.

Luckily, we can use the [ReadableExpressions](https://github.com/agileobjects/ReadableExpressions) NuGet package to get us what we want. By installing it, we should be able to call `ToReadableString()` to get the actual C# code that represents the expression:

```csharp
var code = lambda.ToReadableString();

// personName => !string.IsNullOrWhiteSpace(personName) ? "Greetings, " + personName : null
```

As you can see, it even replaced the `string.Concat(...)` call with the plus operator to bring it closer to the code that a developer would typically write.

Additionally, if you are using Visual Studio and want to inspect expressions by rendering them as code, you can install the [ReadableExpressions.Visualizers](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1232914.ReadableExpressionsVisualizers) extension. It's very helpful when debugging large or complicated expressions.

## Optimizing reflection calls

When it comes to compiled expressions, one of the most common usage scenarios is reflection-heavy code. As we all know, reflection can be quite slow because of late binding, however by compiling the code at run-time we can achieve better performance.

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

Of course, invoking the method like that can cause significant performance issues if we put it in a tight loop. Let's see if we can optimize it a bit.

Before we jump into expressions, we can first optimize the above code by separating the part that resolves `MethodInfo` from the part that invokes it. If we're going to call this method more than once, we don't have to use `GetMethod(...)` every time:

```csharp
public static class ReflectionCached
{
    private static MethodInfo ExecuteMethod { get; } = typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance);

    public static int CallExecute(Command command) => (int) ExecuteMethod.Invoke(command, null);
}
```

That should make things better, but we can push it even further by using `Delegate.CreateDelegate(...)`. This way we can create a re-usable delegate and avoid the overhead that comes with `MethodInfo.Invoke(...)`. Let's do that as well:

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

In all these approaches we're relying on static constructors to initialize the properties in a lazy and thread-safe manner. This ensures that all of the heavy-lifting happens only once — the first time the members of these classes are accessed.

Now let's pit these techniques against each other and compare their performance using [Benchmark.NET](https://github.com/dotnet/BenchmarkDotNet):

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

```markdown
| Method                |       Mean |     Error |    StdDev | Ratio |
| --------------------- | ---------: | --------: | --------: | ----: |
| Reflection            | 192.975 ns | 1.6802 ns | 1.4895 ns |  1.00 |
| Reflection (cached)   | 123.762 ns | 1.1063 ns | 1.0349 ns |  0.64 |
| Reflection (delegate) |   6.419 ns | 0.0646 ns | 0.0605 ns |  0.03 |
| Expressions           |   5.383 ns | 0.0433 ns | 0.0383 ns |  0.03 |
```

As you can see, compiled expressions outperform reflection across the board, even though the approach with `CreateDelegate(...)` comes really close. Note, however, that while the execution times are similar, `CreateDelegate(...)` is more limited than compiled expressions — for example, it cannot be used to call constructor methods.

This approach of using expression trees for dynamic method invocation is commonplace in various frameworks and libraries. For example:

- [AutoMapper](https://github.com/AutoMapper/AutoMapper) uses them to speed up object conversion
- [NServiceBus](https://github.com/Particular/NServiceBus) uses them to speed up its behavior pipeline
- [Marten](https://github.com/JasperFx/marten) uses them to speed up entity mapping

## Implementing generic operators

Something else we can do with compiled expressions is implement generic operators. These can be pretty useful if you're writing a lot of mathematical code and want to avoid duplication.

As you know, operators in C# cannot be generic. Every numeric type, among other things, has to define its own version of the multiply and divide operators. This also means that the code that uses these operators can't be generic either.

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

That works well and we can reuse this method for numbers of any type. Although, seeing as our generic operation doesn't have type safety, you may be wondering how is this approach any different from just using `dynamic`?

Surely, we could just write our code like this and avoid all the trouble:

```csharp
public dynamic ThreeFourths(dynamic x) => 3 * x / 4;
```

Indeed, functionally these two approaches are the same. However, the main difference and the advantage of expression trees is the fact they are compiled, while `dynamic` isn't. Compiled code has the potential to perform much faster.

That said, in the example above we're not benefitting from this advantage at all because we're recompiling our function every time anyway. Let's try to change our code so that it happens only once.

In order to achieve that, we can apply the same pattern as shown last time. Let's put the delegate inside a generic static class and have it initialized from the static constructor. Here's how that would look:

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

Due to the fact that the compiler generates a version of the `Impl` class for each argument of `T`, we end up with an implementation of three-fourths for each type encapsulated in a separate class.

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

```markdown
| Method      | x     |       Mean |     Error |    StdDev | Ratio | RatioSD |
| ----------- | ----- | ---------: | --------: | --------: | ----: | ------: |
| Static      | 13.37 |  0.6077 ns | 0.0176 ns | 0.0147 ns |  1.00 |    0.00 |
| Dynamic     | 13.37 | 19.3267 ns | 0.1512 ns | 0.1340 ns | 31.82 |    0.78 |
| Expressions | 13.37 |  1.9510 ns | 0.0163 ns | 0.0145 ns |  3.21 |    0.08 |
```

As you can see, the expression-based approach performs about nine times faster than when using `dynamic`. Considering that these are the only two options we can use to implement generic operators, this is a pretty good case for compiled expression trees.

## Compiling a dictionary into a switch expression

Another fun way we can use expression trees is to create a dictionary with a compiled lookup. Even though the standard `Dictionary<...>` is insanely fast on its own, it's possible to make its read operations even faster.

While a typical dictionary implementation may be pretty complicated, a lookup can be represented in a form of a simple switch expression:

```csharp
// Pseudo-code
public TValue Lookup(TKey key) => key.GetHashCode() switch
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

Finally, if none of the cases match, it throws an exception signifying that the dictionary doesn't contain the specified key.

The idea is that, since a switch is faster than a hash table, dynamically compiling all key-value pairs into a switch expression like the one above should result in a faster dictionary lookup.

Let's try it out. Here's how the code for that would look:

```csharp
public class CompiledDictionary<TKey, TValue> : IDictionary<TKey, TValue>
{
    private readonly IDictionary<TKey, TValue> _inner = new Dictionary<TKey, TValue>();

    private Func<TKey, TValue> _lookup;

    public CompiledDictionary() => UpdateLookup();

    public void UpdateLookup()
    {
        // Parameter for lookup key
        var keyParameter = Expression.Parameter(typeof(TKey));

        // Expression that gets the key's hash code
        var keyGetHashCodeCall = Expression.Call(
            keyParameter,
            typeof(object).GetMethod(nameof(GetHashCode))
        );

        // Expression that converts the key to string
        var keyToStringCall = Expression.Call(
            keyParameter,
            typeof(object).GetMethod(nameof(ToString))
        );

        // Expression that throws 'not found' exception in case of failure
        var exceptionCtor = typeof(KeyNotFoundException)
            .GetConstructor(new[] {typeof(string)});

        var throwException = Expression.Throw(
            Expression.New(exceptionCtor, keyToStringCall),
            typeof(TValue)
        );

        // Switch expression with cases for every hash code
        var body = Expression.Switch(
            typeof(TValue), // expression type
            keyGetHashCodeCall, // switch condition
            throwException, // default case
            null, // use default comparer
            _inner // switch cases
                .GroupBy(p => p.Key.GetHashCode())
                .Select(g =>
                {
                    // No collision, construct constant expression
                    if (g.Count() == 1)
                    {
                        return Expression.SwitchCase(
                            Expression.Constant(g.Single().Value), // body
                            Expression.Constant(g.Key) // test value
                        );
                    }

                    // Collision, construct inner switch for the key's value
                    return Expression.SwitchCase(
                        Expression.Switch(
                            typeof(TValue),
                            keyParameter, // switch on the actual key
                            throwException,
                            null,
                            g.Select(p => Expression.SwitchCase(
                                Expression.Constant(p.Value),
                                Expression.Constant(p.Key)
                            ))
                        ),
                        Expression.Constant(g.Key)
                    );
                })
        );

        var lambda = Expression.Lambda<Func<TKey, TValue>>(body, keyParameter);

        _lookup = lambda.Compile();
    }

    public TValue this[TKey key]
    {
        get => _lookup(key);
        set => _inner[key] = value;
    }

    // The rest of the interface implementation is omitted for brevity
}
```

The method `UpdateLookup()` takes all the key-value pairs contained within the inner dictionary and groups them by the hash codes of their keys, which are then transformed into switch cases. If there is no collision for a particular hash code, then the switch case is made up of a single constant expression that produces the corresponding value. Otherwise, it contains an inner switch expression that further evaluates the key to determine which value to return.

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

```markdown
| Method              | Count |      Mean |     Error |    StdDev | Ratio |
| ------------------- | ----- | --------: | --------: | --------: | ----: |
| Standard dictionary | 10    | 24.995 ns | 0.1821 ns | 0.1704 ns |  1.00 |
| Compiled dictionary | 10    |  9.366 ns | 0.0511 ns | 0.0478 ns |  0.37 |
|                     |       |           |           |           |       |
| Standard dictionary | 1000  | 25.105 ns | 0.0665 ns | 0.0622 ns |  1.00 |
| Compiled dictionary | 1000  | 14.819 ns | 0.1138 ns | 0.1065 ns |  0.59 |
|                     |       |           |           |           |       |
| Standard dictionary | 10000 | 29.047 ns | 0.1201 ns | 0.1123 ns |  1.00 |
| Compiled dictionary | 10000 | 17.903 ns | 0.0635 ns | 0.0530 ns |  0.62 |
```

We can see that the compiled dictionary performs lookups about 1.6-2.8 times faster. While the performance of the hash table is consistent regardless of how many elements are in the dictionary, the expression tree implementation becomes slower as the dictionary gets bigger. This can potentially be remedied by adding another switch layer for indexing.

## Parsing DSLs into expressions

One other interesting usage scenario, that I'm personally really fond of, is parsing. The main challenge of writing an interpreter for a custom domain-specific language is turning the syntax tree into run-time instructions. By parsing the grammar constructs directly into expression trees, this becomes a solved problem.

As an example, let's write a simple program that takes a string representation of a mathematical expression and evaluates its result. To implement the parser, we will use the [Sprache](https://github.com/sprache/Sprache) library.

```csharp
public static class SimpleCalculator
{
    private static readonly Parser<Expression> Constant =
        Parse.DecimalInvariant
            .Select(n => double.Parse(n, CultureInfo.InvariantCulture))
            .Select(n => Expression.Constant(n, typeof(double)))
            .Token();

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
}
```

As you can see, the parsers defined above (`Constant`, `Operator`, `Operation`, `FullExpression`) all yield objects of type `Expression` and `ExpressionType`, which are both defined in `System.Linq.Expressions`. The expression tree is essentially our syntax tree, so once we parse the input we have all the required information to compile the run-time instructions represented by it.

You can try it out by calling `Run(...)`:

```csharp
var a = SimpleCalculator.Run("2 + 2");        // 4
var b = SimpleCalculator.Run("3.15 * 5 + 2"); // 17.75
var c = SimpleCalculator.Run("1 / 2 * 3");    // 1.5
```

Note that this simple calculator is just an example of what you can do, it doesn't respect operator precedence and doesn't understand nested expressions. Implementing a parser for that would be out of scope of covering expression trees, but if you want to see how a proper calculator like that would look, check out [Sprache.Calc](https://github.com/yallie/Sprache.Calc/blob/master/Sprache.Calc/SimpleCalculator.cs). Also, if you want to learn more about parsing, check out my blog posts about [parsing in C#](/blog/monadic-parser-combinators) and [parsing in F#](/blog/parsing-with-fparsec).

## Making things even faster

While compiled expressions execute really fast, compiling them can be relatively expensive.

In most cases that's completely fine, but you may want to take the performance even further by using [FastExpressionCompiler](https://github.com/dadhi/FastExpressionCompiler). This library provides a drop-in replacement for the `Compile()` method called `CompileFast()`, which executes much faster.

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

```markdown
| Method         |      Mean |     Error |    StdDev | Ratio | Allocated |
| -------------- | --------: | --------: | --------: | ----: | --------: |
| Compile        | 38.435 us | 0.2131 us | 0.1889 us |  1.00 |   3.53 KB |
| Compile (fast) |  4.497 us | 0.0662 us | 0.0619 us |  0.12 |   1.21 KB |
```

As you can see, the performance improvement is pretty noticeable. The reason it runs so fast is that the `CompileFast()` version skips all the verifications that normal `Compile()` does to ensure that the expression tree is valid.

This library (as part of `FastExpressionCompiler.LightExpression`) also offers a drop-in replacement for `Expression` and all of its static factory methods. These alternative implementations construct expressions which may, in some cases, perform much faster than their regular counterparts. However, I still recommend benchmarking it on your particular use cases to ensure that it actually provides an improvement.

## Inferring expression trees from code

So far we've explored how to construct expression trees by hand. The cool thing about expression trees in .NET, though, is that they can also be obtained from existing code during compilation.

The way this works is that you can infer an expression tree by simply specifying a lambda expression like you would if you were to define a delegate. C# compiler will take care of the rest.

Consider this snippet of code:

```csharp
Func<int, int, int> div =
    (a, b) => a / b;

Expression<Func<int, int, int>> divExpr =
    (a, b) => a / b;
```

Both of these assignments look exactly the same, but the actual assigned value is different. While in the first case we get a delegate which can be executed directly, the second provides us with an expression tree that represents the structure of the supplied lambda expression. This is essentially the same `LambdaExpression` that we were creating ourselves, only now it's generated automatically by the compiler.

For example, we can inspect the expression tree produced by the compiler:

```csharp
Expression<Func<int, int, int>> divExpr =
    (a, b) => a / b;

foreach (var param in divExpr.Parameters)
    Console.WriteLine($"Param: {param.Name} ({param.Type.Name})");

// Param: a (Int32)
// Param: b (Int32)
```

And, just like with expression trees created manually, we can compile it into a delegate:

```csharp
Expression<Func<int, int, int>> divExpr =
    (a, b) => a / b;

var div = divExpr.Compile();

var c = div(10, 2); // 5
```

Essentially, in this context, you can think of `divExpr` as a recipe that contains the ingredients needed to create `div`, the final product.

Note, however, that while direct assignment shown previously works, you can't do something like this:

```csharp
Func<int, int, int> div = (a, b) => a / b;

// Compilation error
Expression<Func<int, int, int>> divExpr = div;
```

The expression must be defined in-place in order to work. Because the disassembly happens during compile-time, not run-time, the compiler needs to know exactly what it's dealing with.

Although this approach is incredibly useful, it has certain limitations. Specifically, the supplied lambda expression must not contain any of the following:

- Null-coalescing operator (`obj?.Prop`)
- Dynamic variables (`dynamic`)
- Asynchronous code (`async`/`await`)
- Default or named parameters (`func(a, b: 5)`, `func(a)`)
- Parameters passed by reference (`int.TryParse("123", out var i)`)
- Multi-dimensional array initializers (`new int[2, 2] { { 1, 2 }, { 3, 4 } }`)
- Assignment operations (`a = 5`)
- Increment and decrement (`a++`, `a--`, `--a`, `++a`)
- Base type access (`base.Prop`)
- Dictionary initialization (`new Dictionary<string, int> { ["foo"] = 100 }`)
- Unsafe code (via `unsafe`)
- Throw expressions (`throw new Exception()`)
- Tuple literals (`(5, x)`)

On top of all that, you cannot use this method to construct expression trees from block-bodied lambdas. In other words, this won't compile:

```csharp
// Compilation error
Expression<Func<int, int, int>> divExpr = (a, b) =>
{
    var result = a / b;
    return result;
};
```

And, more importantly, this won't work either:

```csharp
// Compilation error
Expression<Action> writeToConsole = () =>
{
    Console.Write("Hello ");
    Console.WriteLine("world!");
};
```

Most of these limitations come from the fact that this feature was designed with `IQueryable` in mind and many of the language constructs listed above don't really make sense when it comes to querying data. That said, there are a lot of other scenarios where they can be useful.

There is a suggestion to extend compile-time expression trees and it's tracked [by this issue on GitHub](https://github.com/dotnet/csharplang/issues/158). We'll see where it goes.

For now, let's move these limitations aside and explore some of the ways we can use expression trees constructed with this approach.

## Identifying type members

The most common use case for expression trees obtained in such manner is to identify type members. This approach allows us to extract information on fields, properties, or methods from a supplied lambda expression.

For example, assume we have the following class:

```csharp
public class Dto
{
    public Guid Id { get; set; }

    public string Name { get; set; }
}
```

If we wanted to get the `PropertyInfo` that represents the `Id` property, we could use reflection to do it like this:

```csharp
var idProperty = typeof(Dto).GetProperty(nameof(Dto.Id));

Console.WriteLine($"Type: {idProperty.DeclaringType.Name}");
Console.WriteLine($"Property: {idProperty.Name} ({idProperty.PropertyType.Name})");

// Type: Dto
// Property: Id (Guid)
```

That works completely fine. For example, if we were designing an API for a validation library, it could look like this:

```csharp
public class Validator<T>
{
    // Add validation predicate to the list
    public void AddValidation<TProp>(string propertyName, Func<TProp, bool> predicate)
    {
        var propertyInfo = typeof(T).GetProperty(propertyName);

        if (propertyInfo is null)
            throw new InvalidOperationException("Please provide a valid property name.");

        // ...
    }

    // Evaluate all predicates
    public bool Validate(T obj) { /* ... */ }

    /* ... */
}
```

Which we would be able to use like this:

```csharp
var validator = new Validator<Dto>();
validator.AddValidation<Guid>(nameof(Dto.Id), id => id != Guid.Empty);
validator.AddValidation<string>(nameof(Dto.Name), name => !string.IsNullOrWhiteSpace(name));

var isValid = validator.Validate(new Dto { Id = Guid.NewGuid() }); // false
```

However, the problem here is that all of our validators are effectively untyped. We have to specify the generic argument in `AddValidation(...)` so that our predicates are aware of what they're working with, but this setup is very brittle.

If we were to, for example, change the type of `Dto.Id` from `Guid` to `int`, everything would still compile, but the code will no longer work correctly because our predicate expects the type to be `Guid`. Also, we'd be lucky if our users were to provide the property names using `nameof`, in reality there will probably be magic strings instead. All in all, this code is not refactor-safe.

With expressions, we can completely remedy this:

```csharp
public class Validator<T>
{
    public void AddValidation<TProp>(
        Expression<Func<T, TProp>> propertyExpression,
        Func<TProp, bool> predicate)
    {
        var propertyInfo = (propertyExpression.Body as MemberExpression)?.Member as PropertyInfo;

        if (propertyInfo is null)
            throw new InvalidOperationException("Please provide a valid property expression.");

        // ...
    }

    public bool Validate(T obj) { /* ... */ }

    /* ... */
}
```

With the new interface we can write our code like this instead:

```csharp
var validator = new Validator<Dto>();
validator.AddValidation(dto => dto.Id, id => id != Guid.Empty);
validator.AddValidation(dto => dto.Name, name => !string.IsNullOrWhiteSpace(name));

var isValid = validator.Validate(new Dto { Id = Guid.NewGuid() }); // false
```

This works exactly the same, except that now we don't need to specify generic arguments manually, there are no magic strings, and the code is completely safe to refactor. If we change the type of `Dto.Id` from `Guid` to `int`, our code will rightfully no longer compile.

Many existing libraries are using expression trees for this purpose, including:

- [FluentValidation](https://github.com/JeremySkinner/FluentValidation) uses it to set up validation rules
- [EntityFramework](https://github.com/dotnet/efcore) uses it for entity configuration
- [Moq](https://github.com/moq/moq4) uses it to build mocks

## Providing context to assertions

Often when I'm writing test suites for my projects, I find myself spending time decorating assertions with informational error messages. For example:

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

By doing that, the errors produced by failed assertions become more descriptive. This makes it easier to understand what went wrong without having to look inside the test implementation:

```yaml
X IntTryParse_Test [60ms]
  Error Message:
    Parsed value is incorrect
  Expected: 124
  But was:  123
```

In a perfect world, however, it would be nice if the error message simply contained the code of the assertion. That way I would know which exact check failed and why.

Luckily, this is something we can do with the help of expressions. To facilitate that, we can create a helper method that will wrap the assertion in an expression:

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
        catch (AssertionException ex)
        {
            throw new AssertionException(
                expression.Body.ToReadableString() +
                Environment.NewLine +
                ex.Message
            );
        }
    }
}
```

This method is really simple. All it does is try to run the delegate represented by the expression and, if the underlying assertion fails, it prints the expression along with the error.

Let's update our test code to make use of this method:

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

Now, when this test fails we will instead get the following error message:

```yaml
X IntTryParse_Test [99ms]
  Error Message:
    Assert.That(value, Is.EqualTo(124))
  Expected: 124
  But was:  123
```

As you can see, the error message now specifies the exact assertion that failed. This gives us more context which helps determine what actually went wrong.

---

With the advent of .NET Core 3.0, the .NET team has also added a new attribute, `CallerArgumentExpression`. This attribute was meant to be supported by a [language feature](https://github.com/dotnet/csharplang/issues/287) that was planned for C# 8 but unfortunately didn't make the cut. Currently, the attribute doesn't do anything, but we should see this change in one of the future versions of the language.

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

Note that with this approach we will only be able to obtain the expression as a string, which will be the same expression specified in the source code. This can be used to provide a somewhat similar experience as shown with `AssertEx.Express` above.

## Traversing and rewriting expression trees

In order to analyze expression trees, we need to be able to traverse them in a recursive descent manner, starting from the body of the lambda expression and going down to every expression it's made out of. This could be done manually with a large switch expression that calls into itself.

Fortunately, we don't have to reinvent the wheel because the framework already provides a special class for this purpose called [`ExpressionVisitor`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.expressions.expressionvisitor). It's an abstract class that has a visitor method for every expression type, so you can simply inherit from it and override the methods you're interested in.

For example, we can implement a visitor that prints out all the binary and method call expressions it encounters:

```csharp
public class Visitor : ExpressionVisitor
{
    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
        Console.WriteLine($"Visited method call: {node}");

        return base.VisitMethodCall(node);
    }

    protected override Expression VisitBinary(BinaryExpression node)
    {
        Console.WriteLine($"Visited binary expression: {node}");

        return base.VisitBinary(node);
    }
}
```

```csharp
Expression<Func<double>> expr = () => Math.Sin(Guid.NewGuid().GetHashCode()) / 10;

new Visitor().Visit(expr);

// Visited binary expression: (Sin(Convert(NewGuid().GetHashCode(), Double)) / 10)
// Visited method call: Sin(Convert(NewGuid().GetHashCode(), Double))
// Visited method call: NewGuid().GetHashCode()
// Visited method call: NewGuid()
```

As you can see by the order of the logs, the visitor first encounters the binary expression that makes up the lambda body, then digs inside, revealing a call to `Math.Sin(...)` whose parameter is also expressed as a call to `GetHashCode()` on the result of `NewGuid()`.

You may have noticed that the visitor methods on `ExpressionVisitor` all return `Expression`s. That means that besides merely inspecting the expressions, the visitor can choose to rewrite them or completely replace them with different ones.

Let's change our visitor so that it catches all calls to method `Math.Sin(...)` and rewrites them into `Math.Cos(...)`:

```csharp
public class Visitor : ExpressionVisitor
{
    protected override Expression VisitMethodCall(MethodCallExpression node)
    {
        var newMethodCall = node.Method == typeof(Math).GetMethod(nameof(Math.Sin))
            ? typeof(Math).GetMethod(nameof(Math.Cos))
            : node.Method;

        return Expression.Call(newMethodCall, node.Arguments);
    }
}
```

```csharp
Expression<Func<double>> expr = () => Math.Sin(Guid.NewGuid().GetHashCode()) / 10;
var result = expr.Compile()();

Console.WriteLine($"Old expression: {expr.ToReadableString()}");
Console.WriteLine($"Old result: {result}");

var newExpr = (Expression<Func<double>>) new Visitor().Visit(expr);
var newResult = newExpr.Compile()();

Console.WriteLine($"New expression: {newExpr.ToReadableString()}");
Console.WriteLine($"New result value: {newResult}");

// Old expression: () => Math.Sin((double)Guid.NewGuid().GetHashCode()) / 10d
// Old result: 0.09489518488876232
// New expression: () => Math.Cos((double)Guid.NewGuid().GetHashCode()) / 10d
// New result value: 0.07306426748550407
```

As you can see, the new expression is structurally identical but with `Math.Sin(...)` replaced by `Math.Cos(...)`. Both expressions are completely independent and can be compiled to produce their respective delegates.

Using this approach we can arbitrarily rewrite supplied expressions, generating derivatives that behave differently. It can be very helpful when creating dynamic proxies. For example, a popular mocking library [Moq](https://github.com/moq/moq4) uses this technique to build stubs at run-time.

## Transpiling code into a different language

Now that we know that we can use `ExpressionVisitor` to analyze and rewrite expression trees, it's not too hard to guess that we can also use it to transpile expressions into another language. The goal of such a tool would be to convert code from one language to another, while retaining its functional behavior.

Let's imagine we're building a library that allows users to convert C# expressions to their equivalent F# representations. For example, we want to be able to do this:

```csharp
Expression<Action<int, int>> expr = (a, b) => Console.WriteLine("a + b = {0}", a + b));

var fsharpCode = FSharpTranspiler.Convert(expr);
```

To facilitate that, we can create a class called `FSharpTranspiler` which will internally use a special `ExpressionVisitor` to traverse the expression tree and write valid F# code. It could look something like this:

```csharp
public static class FSharpTranspiler
{
    private class Visitor : ExpressionVisitor
    {
        private readonly StringBuilder _buffer;

        public Visitor(StringBuilder buffer)
        {
            _buffer = buffer;
        }

        // ...
    }

    public static string Convert<T>(Expression<T> expression)
    {
        var buffer = new StringBuilder();
        new Visitor(buffer).Visit(expression);

        return buffer.ToString();
    }
}
```

With this setup, we can inject a `StringBuilder` into our visitor and use that as the output buffer. While the visitor takes care of navigating the tree, we need to make sure we're emitting valid code on each expression type.

Writing a full C# to F# transpiler would be too complicated and way outside the scope of this article. For the sake of simplicity let's only focus on supporting expressions similar to the one we've seen in the initial example. To handle those, we will just need to translate `Console.WriteLine(...)` into the correct usage of `printfn`.

Here's how we can do it:

```csharp
public static class FSharpTranspiler
{
    private class Visitor : ExpressionVisitor
    {
        private readonly StringBuilder _buffer;

        public Visitor(StringBuilder buffer)
        {
            _buffer = buffer;
        }

        protected override Expression VisitLambda<T>(Expression<T> node)
        {
            _buffer.Append("fun (");
            _buffer.AppendJoin(", ", node.Parameters.Select(p => p.Name));
            _buffer.Append(") ->");

            return base.VisitLambda(node);
        }

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            if (node.Method.DeclaringType == typeof(Console) &&
                node.Method.Name == nameof(Console.WriteLine))
            {
                _buffer.Append("printfn ");

                if (node.Arguments.Count > 1)
                {
                    // For simplicity, assume the first argument is a string (don't do this)
                    var format = (string) ((ConstantExpression) node.Arguments[0]).Value;
                    var formatValues = node.Arguments.Skip(1).ToArray();

                    _buffer.Append("\"");
                    _buffer.Append(Regex.Replace(format, @"\{\d+\}", "%O"));
                    _buffer.Append("\" ");

                    _buffer.AppendJoin(" ", formatValues.Select(v => $"({v.ToReadableString()})"));
                }
            }

            return base.VisitMethodCall(node);
        }
    }

    public static string Convert<T>(Expression<T> expression)
    {
        var buffer = new StringBuilder();
        new Visitor(buffer).Visit(expression);

        return buffer.ToString();
    }
}
```

So now we can try to convert our expression from earlier and see what it returns:

```csharp
var fsharpCode = FSharpTranspiler.Convert<Action<int, int>>(
    (a, b) => Console.WriteLine("a + b = {0}", a + b)
);

// fun (a, b) -> printfn "a + b = %O" (a + b)
```

This produces a string that contains valid F# code which should compile into an equivalent anonymous function. Let's run it in F# interactive to make sure it works correctly:

```fsharp
> let foo = fun (a, b) -> printfn "a + b = %O" (a + b)
val foo : a:int * b:int -> unit

> foo (3, 5)
a + b = 8
val it : unit = ()
```

Translating code from one language to another is definitely not a simple task, but it can be incredibly useful in certain scenarios. One example could be sharing validation rules between the backend and the frontend by converting C# predicate expressions into JavaScript code.

## Summary

Expression trees provide us with a formal structure that lets us analyze existing expressions or compile entirely new ones directly at run-time. This feature makes it possible to do a bunch of cool things, including writing transpilers, interpreters, code generators, optimize reflection calls, provide contextual assertions, and more. I think it's a really powerful tool that deserves a lot more attention.

Some other interesting articles on the topic:

- [Introduction to expression trees (Microsoft Docs)](https://docs.microsoft.com/en-us/dotnet/csharp/expression-trees)
- [10X faster execution with compiled expression trees (Particular Software)](https://particular.net/blog/10x-faster-execution-with-compiled-expression-trees)
- [AutoMapper 5.0 speed increases (Jimmy Bogard)](https://lostechies.com/jimmybogard/2016/06/24/automapper-5-0-speed-increases)
- [How we did (and did not) improve performance and efficiency in Marten 2.0 (Jeremy D. Miller)](https://jeremydmiller.com/2017/08/01/how-we-did-and-did-not-improve-performance-and-efficiency-in-marten-2-0)
- [Optimizing Just in Time with Expression Trees (Craig Gidney)](http://twistedoakstudios.com/blog/Post2540_optimizing-just-in-time-with-expression-trees)

I also recommend reading about [code quotations in F#](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/code-quotations), which is a feature similar to expression trees but with more powerful language support.
