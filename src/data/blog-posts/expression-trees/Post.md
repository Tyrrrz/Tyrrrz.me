---
title: Demystifying .NET expression trees
date: 2020-02-18
cover: Cover.png
---

![cover](Cover.png)

Expression trees is an obscure, although very interesting feature in .NET. Most people probably think of it as something synonymous with object-relational mapping frameworks, but despite being one of its most common use cases, it's not the only one.

In essence, an expression tree is a higher-order representation of code that describes its underlying syntactic structure rather than the result it produces. Through the use of expression trees we can analyze existing code or compile entirely new expressions directly at runtime.

In this article we will take a look at some of the different ways we can construct expression trees, as well as potential scenarios where they can be useful.

## Creating expression trees manually

The most straightforward way we can obtain an expression tree is by constructing it manually. The framework offers us with a way to do it through the [`Expression`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.expressions.expression) class located in the `System.Linq.Expressions` namespace.

Using the static methods provided by this class, we can build expressions that represent familiar language constructs. Some of these are:

- `Expression.Constant(...)` -- an expression that represents a value.
- `Expression.Variable(...)` -- an expression that represents a variable.
- `Expression.New(...)` -- an expression that represents an initialization of a new instance.
- `Expression.Assign(...)` -- an expression that represents an assignment operation.
- `Expression.Equal(...)` -- an expression that represents an equality comparison.
- `Expression.Call(...)` -- an expression that represents a specific method call.
- `Expression.Condition(...)` -- an expression that represents branching logic.
- `Expression.Loop(...)` -- an expression that represents repeating logic.
- ...

As you can see, there are quite a lot of different factory methods and, while the simpler ones like `Constant` or `Variable` produce terminal nodes, the more complex ones like `Assign` or `Loop` are built by composing other expressions. It is through this composition that we end up with a data structure that resembles a tree.

For example, let's take a look at a very simple function that calculates the sum of two numbers:

```csharp
public int Sum(int a, int b) => a + b;

// Sum(3, 5) -> 8
```

There are two main components in this method definition: the signature which specifies two integer parameters as well as an integer return value, and the method body. The latter is itself comprised of a single binary "add" expression, which in turn operates on the method parameters whose values are resolved using the corresponding expressions.

The hierarchy outlined above can be visualized by the following diagram:

```matlab
[ Sum(3, 5) ]   <- function call expression
   |  |  |
   |  |  +---- constant expression bound to parameter 'b'
   |  |
   |  +------- constant expression bound to parameter 'a'
   |
   |
   +--[ a + b ] <- function body expression
        |   |
        |   +---- parameter 'b' expression
        |
        +-------- parameter 'a' expression
```

We can try and recreate this exact function using expression trees:

```csharp
public Func<int, int, int> CreateSumFunction()
{
    // int a, int b
    // ~~~~~  ~~~~~
    //   ^------^---- params

    var paramA = Expression.Parameter(typeof(int));
    var paramB = Expression.Parameter(typeof(int));

    // a + b
    // ~~~~~
    //   ^---- body

    var body = Expression.Add(paramA, paramB);

    // (a, b) => a + b
    // ~~~~~~~~~~~~~~~
    //        ^------------ lambda

    var lambda = Expression.Lambda<Func<int, int, int>>(body, paramA, paramB);

    return lambda.Compile();
}
```

Let's digest what's going on here.

First, we have to specify the parameters of our function. Using the `Expression.Parameter(...)` method we can construct an expression that identifies a specific parameter. This expression can be used to both resolve its value, as well as to set it.

Then we construct the body of the function. Since this is a simple addition, we're using `Expression.Add(...)` which constructs an expression that represents the plus operator. As a binary operator it requires two operands, for which we specify our parameter expressions.

Finally, in order to create an entry point for our expression tree, we need to construct a function definition. To do that, we can use `Expression.Lambda<T>(...)` to build a lambda expression that represents an anonymous function with the body and parameters we defined earlier.

Up to this point, we were dealing with just data. In order to turn this data into interpretable instructions, we have to compile our lambda expression with the `Compile()` method. This dynamically creates a delegate of the specified type based on the expression tree we've constructed.

We can use this delegate like any other. For example, we can rewrite the original `Sum` function to use the dynamically compiled code instead:

```csharp
public int Sum(int a, int b)
{
    var func = CreateSumFunction();
    return func(a, b);
}

// Sum(3, 5) -> 8
```

You may be wondering, what's the point of doing that? After all, we took our statically-compiled function and replaced it with a function generated at runtime that runs slower and has no type safety.

Let's move our simplistic example aside and see where this approach can actually be useful.

## Generic operators

One of the interesting things we can do with runtime-generated code, is implement generic operators.

As you know, operators in C# (unlike F#) are not generic. This means that, for example, every numeric type defines its own version of the multiply and divide operators. As a result, code that uses these operators also can't be generic either.

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

But unfortunately that doesn't compile seeing as the `*` and `/` operators are not available on every type that can be specified in place of `T`. Sadly, there's also no constraint we could use to limit the generic argument to numeric types.

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

In order to achieve that, we can put the function delegate inside a class and have it initialized from the static constructor. Here's how that looks with generic arguments:

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

Due to the fact that the compiler generates a version of the `Impl` class for each argument of `T`, we end up with an implementation of three-fourths for each type encapsulated in a separate class. Having a static constructor ensures that the actual delegate will be initialized only once, the first time it is accessed.

This essentially gives us a thread-safe lazy-evaluated dynamic function. I like to call this pattern a "lazy-compiled expression".

Now, with the optimizations out of the way, let's use [Benchmark.NET](https://github.com/dotnet/BenchmarkDotNet) to compare the different ways we can calculate three-fourths of a value:

```csharp
public class Benchmarks
{
    [Benchmark(Description = "Static", Baseline = true)]
    [Arguments(13.37)]
    public double Static(double x) => 3 * x / 4;

    [Benchmark(Description = "Expressions")]
    [Arguments(13.37)]
    public double Expr(double x) => ThreeFourths.Of(x);

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

## Optimizing reflection calls

Compiled expression trees are also useful when we want to speed up some reflection-heavy code. As we all know, reflection can be quite slow because of late binding, however with expression trees we can offload all the heavy lifting and ensure it only happens once.

Let's imagine we have a class and we want to call its private method from the outside:

```csharp
public class Command
{
    private int Execute() => 42;
}
```

With the help of reflection, this is quite simple:

```csharp
public int CallExecute() =>
    (int) typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance)
        .Invoke(new Command(), null);
```

While using `CallExecute()` scarcely is most likely fine, running it in a tight loop can cause performance issues. We could be better off with expression trees.

Let's use the same lazy-compiled expression pattern to generate a function that executes a method which is resolved through reflection:

```csharp
public static class CallExecute
{
    public static Func<Command, int> On { get; }

    static CallExecute()
    {
        var instance = Expression.Parameter(typeof(Command));

        var method = typeof(Command).GetMethod("Execute",
            BindingFlags.NonPublic | BindingFlags.Instance);

        var call = Expression.Call(instance, method);

        On = Expression.Lambda<Func<Command, int>>(call, instance).Compile();
    }
}

// CallExecute.On(command) -> ...
```

Now, comparing this to the reflection code above isn't exactly fair. If we're going to execute the method multiple times, it makes sense to at least cache the corresponding `MethodInfo` in a similar way:

```csharp
public static class CallExecuteWithReflectionCached
{
    public static MethodInfo Method { get; } =
        typeof(Command).GetMethod("Execute",
            BindingFlags.NonPublic | BindingFlags.Instance);

    public static int On(Command command) => (int) Method.Invoke(command, null);
}
```

In fact, we can optimize this even further by using `Delegate.CreateDelegate` which turns a dynamic method invocation into a delegate:

```csharp
public static class CallExecuteWithReflectionDelegate
{
    public static Func<Command, int> On { get; } =
        (Func<Command, int>) Delegate.CreateDelegate(
            typeof(Func<Command, int>),
            typeof(Command).GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance));
}
```

Let's see how all of these techniques compare in terms of performance:

```csharp
public class Benchmarks
{
    [Benchmark(Description = "Expressions", Baseline = true)]
    public int Expr() => CallExecute.On(new Command());

    [Benchmark(Description = "Reflection")]
    public int Reflection() => (int) typeof(Command)
        .GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance)
        .Invoke(new Command(), null);

    [Benchmark(Description = "Reflection (cached)")]
    public int ReflectionCached() => CallExecuteWithReflectionCached.On(new Command());

    [Benchmark(Description = "Reflection (delegate)")]
    public int ReflectionDelegate() => CallExecuteWithReflectionDelegate.On(new Command());

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|                Method |       Mean |     Error |    StdDev | Ratio | RatioSD |
|---------------------- |-----------:|----------:|----------:|------:|--------:|
|           Expressions |   4.270 ns | 0.0478 ns | 0.0448 ns |  1.00 |    0.00 |
|            Reflection | 196.653 ns | 3.8129 ns | 3.9156 ns | 46.02 |    1.09 |
|   Reflection (cached) | 124.456 ns | 2.1948 ns | 2.0530 ns | 29.15 |    0.57 |
| Reflection (delegate) |   5.475 ns | 0.0895 ns | 0.0837 ns |  1.28 |    0.02 |
```

As you can see, compiled expressions outperform reflection across the board, even though the approach with `CreateDelegate` comes really close. Note however that while the execution times are similar, `CreateDelegate` is more limited than compiled expressions -- for example, it cannot be used to call constructor methods.

Compiled dynamic method invocation is commonly used in various software frameworks. Some examples:

- [AutoMapper](https://github.com/AutoMapper/AutoMapper) uses them to speed up object conversion
- [NServiceBus](https://github.com/Particular/NServiceBus) uses them to speed up its behavior pipeline
- [Marten](https://github.com/JasperFx/marten) uses them to speed up entity mapping

## Compiled dictionary

Another fun way we can use expression trees is to create a dictionary with a compiled lookup. Even though the standard .NET `System.Collections.Generic.Dictionary` is insanely fast on its own, it's possible to outperform it in read operations by around a factor of 3.

While a typical dictionary implementation may be pretty complicated, a lookup can be represented in the form of a switch expression:

```csharp
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
            instance: keyParameter,
            method: typeof(object).GetMethod(nameof(GetHashCode)));

        // Expression that converts the key to string
        var keyToStringCall = Expression.Call(
            instance: keyParameter,
            method: typeof(object).GetMethod(nameof(ToString)));

        // Expression that throws 'not found' exception in case of failure
        var exceptionCtor = typeof(KeyNotFoundException)
            .GetConstructor(new[] {typeof(string)});

        var throwException = Expression.Throw(
            value: Expression.New(
                constructor: exceptionCtor,
                arguments: keyToStringCall),
            type: typeof(TValue));

        // Switch expression with cases for every hash code
        var body = Expression.Switch(
            type: typeof(TValue),
            switchValue: keyGetHashCodeCall,
            defaultBody: throwException,
            comparison: null,
            cases: _pairs
                .GroupBy(p => p.Key.GetHashCode())
                .Select(g =>
                {
                    // No collision, construct constant expression
                    if (g.Count() == 1)
                        return Expression.SwitchCase(
                            body: Expression.Constant(g.Single().Value),
                            testValues: Expression.Constant(g.Key));

                    // Collision, construct inner switch for the key's value
                    return Expression.SwitchCase(
                        body: Expression.Switch(
                            type: typeof(TValue),
                            switchValue: keyParameter, // switch on actual key
                            defaultBody: throwException,
                            comparison: null,
                            cases: g.Select(p => Expression.SwitchCase(
                                body: Expression.Constant(p.Value),
                                testValues: Expression.Constant(p.Key)
                            ))),
                        testValues: Expression.Constant(g.Key));
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

    // The rest of interface implementation is omitted for brevity
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

We can see that the compiled dictionary performs lookups about 1.6-2.8 times faster. While the performance of the hash table is consistent regardless of how many elements are in the dictionary, the expression tree implementation becomes slower as the dictionary gets bigger. This can potentially be further optimized by adding another level of switch expressions for indexing.

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

As you can see, the parsers defined above (`Constant`, `Operator`, `Operation`, `FullExpression`) all yield objects of type `Expression` and `ExpressionType`, which are both defined in `System.Linq.Expressions`. The expression tree is essentially our syntax tree, so once we parse the input we will have all the required information to compile the runtime instructions represented by it.

You can try it out:

```shell
> app 3.15 * 5 + 2
17.75
```

Note that this simple calculator is just an example of what you can do. If you want to see how a proper calculator like that would look, check out [Sprache.Calc](https://github.com/yallie/Sprache.Calc/blob/master/Sprache.Calc/SimpleCalculator.cs). Also, if you want to learn more about parsing, check out my blog posts about [parsing in C#](/blog/monadic-parser-combinators) and [parsing in F#](/blog/parsing-with-fparsec).

## Going even further beyond

While compiled expressions execute really fast, compiling them can be relatively expensive.

In most cases that's completely fine, but you may want to take the performance even further by using [FastExpressionCompiler](https://github.com/dadhi/FastExpressionCompiler). This library provides a much faster drop-in replacement for the `Compile` method, called `CompileFast`.

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

As you can see, the difference is pretty noticeable.

This library (as part of `FastExpressionCompiler.LightExpression`) also offers a drop-in replacement for `Expression` and all of its static factory methods. These alternative implementations construct expressions which may in some cases perform much faster than their default counterparts.

## Generating expression trees from code

So far we've explored how to construct expression trees manually. The cool thing about expression trees in .NET though is that they can also be created automatically from a lambda. You're definitely familiar with this approach because that's what libraries like Entity Framework use to translate C# expressions into SQL queries.

The way this works is that you can define a method with a parameter of type `Expression<TDelegate>` and supply it an instance of `TDelegate` instead. Even though it will look like you're defining a lambda of type `TDelegate`, it will get automatically cast to `Expression<TDelegate>` which contains all the information about the expression contained within the lambda. This feature is facilitated by the compiler, which means that the expression tree is created during build instead of runtime.

Let's take a look at an example:

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    // Inspect the expression...
}

public static void Main()
{
    Analyze(() => 2 * Math.Sin(Math.PI / 2));
}
```

As you can see, we're simply passing a lambda expression which gets magically decompiled into an expression tree. The `Analyze` method can inspect the expression that describes the supplied lambda.

One thing we can do, for example, is analyze the function body:

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    if (expr.Body is BinaryExpression binaryExpression)
    {
        Console.WriteLine("Binary expression:");
        Console.WriteLine($"  Type: {binaryExpression.NodeType}");
        Console.WriteLine($"  Left: {binaryExpression.Left}");
        Console.WriteLine($"  Right: {binaryExpression.Right}");
    }
    else
    {
        Console.WriteLine("Function body is not a binary expression");
    }
}

public static void Main()
{
    Analyze(() => 2 * Math.Sin(Math.PI / 2));
}
```

This produces the following output:

```c
Binary expression:
  Type: Multiply
  Left: 2
  Right: Sin(1.5707963267948966)
```

Note how the right operand of this expression is `Sin(1.5707963267948966)` rather than `Sin(Math.PI / 2)`. This is because the division was evaluated into a constant during compilation.

When you know exactly what you're looking for, it may be enough to pattern match. In more complex cases however, you may want to use [`ExpressionVisitor`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.expressions.expressionvisitor) instead.

There are two ways we can traverse an expression tree with `ExpressionVisitor`, either by inheriting from it and overriding visitor methods we are interested in, or by using its static methods with a visitor delegate.

If you're unfamiliar with the [visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern), you can think of it as an exhaustive pattern matcher where each clause is a separate method.

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

## Converting expressions back to code

Even though every expression overrides the `ToString` method, the actual text produced by more complex expressions may not be so readable.

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    Console.WriteLine(expr);
}

public static void Main()
{
    var a = DateTimeOffset.Now.Year / 13.4;
    var b = 18 * 4;
    Analyze(() => Math.Sin(a / b) + Math.Cos(b / a));
}
```

Produces:

```c
() => (Sin((value(Playground.Program+<>c__DisplayClass1_0).a / Convert(value(Playground.Program+<>c__DisplayClass1_0).b, Double))) + Cos((Convert(value(Playground.Program+<>c__DisplayClass1_0).b, Double) / value(Playground.Program+<>c__DisplayClass1_0).a)))
```

If we use [ExpressionToCode](https://github.com/EamonNerbonne/ExpressionToCode):

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    Console.WriteLine(ExpressionToCode.ToCode(expr));
}

public static void Main()
{
    var a = DateTimeOffset.Now.Year / 13.4;
    var b = 18 * 4;
    Analyze(() => Math.Sin(a / b) + Math.Cos(b / a));
}
```

```c
() => Math.Sin(a / b) + Math.Cos(b / a)
```

Assertions:

```csharp
var a = 3;
var b = 5;

PAssert.That(() => 3 * a + (b - 1) == 12); // actually 13
```

```r
Unhandled exception. System.InvalidOperationException: assertion failed

3 * a + (b - 1) == 12
      false (caused assertion failure)

3 * a + (b - 1)      13
          3 * a      9
              a      3
          b - 1      4
              b      5
```

```csharp
var arr = Enumerable.Range(0, 10).ToArray();

PAssert.That(() => arr.Contains(10));
```

```r
arr.Contains(10)
      false (caused assertion failure)

arr      new[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }
```

```csharp
public static void Assert(
    bool condition,
    [CallerArgumentExpression("condition")] string expression = "")
{
    if (!condition)
        throw new AssertionFailedException($"Condition `{expression}` is not true");
}
```

```csharp
Assert(2 + 2 == 5);

// Exception:
// Condition `2 + 2 == 5` is not true
```

Attribute exists but the functionality is not yet here: https://github.com/dotnet/csharplang/issues/287

## Limitations of automatically-generated expressions

Despite how convenient they may be, automatically-inferred expressions haven't really evolved since they were introduced. And while it may be enough for Entity Framework and some other scenarios, they have certain limitations.

The following constructs are not supported in expressions generated from lambdas:

- Multi-dimensional array initializers
- Named and optional parameters
- Dynamic
- Async and await
- Conditional access operator
- Index initializers for dictionaries
- Throw expressions
- Discard expressions

Also, multi-line lambdas are not supported:

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    // ...
}

public static void Main()
{
    // Compile error:
    // A lambda expression with a statement body cannot be converted to an expression tree
    Analyze(() =>
    {
        var a = 3;
        var b = 5;
        return a + b;
    };
}
```

Most of the time it's possible to rewrite such statements into one a single expression, either by

## Transpile

## Summary

Some other interesting articles about expression trees:

- [Introduction to expression trees (Microsoft Docs)](https://docs.microsoft.com/en-us/dotnet/csharp/expression-trees)
- [10X faster execution with compiled expression trees (Particular Software)](https://particular.net/blog/10x-faster-execution-with-compiled-expression-trees)
- [AutoMapper 5.0 speed increases (Jimmy Bogard)](https://lostechies.com/jimmybogard/2016/06/24/automapper-5-0-speed-increases)
- [How we did (and did not) improve performance and efficiency in Marten 2.0 (Jeremy D. Miller)](https://jeremydmiller.com/2017/08/01/how-we-did-and-did-not-improve-performance-and-efficiency-in-marten-2-0)
- [Optimizing Just in Time with Expression Trees (Craig Gidney)](http://twistedoakstudios.com/blog/Post2540_optimizing-just-in-time-with-expression-trees)
