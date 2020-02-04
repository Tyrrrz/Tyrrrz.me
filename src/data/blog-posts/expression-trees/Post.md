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

The most straightforward we can obtain an expression tree is by constructing it manually. The framework offers us with a way to do it through the `Expression` class located in the `System.Linq.Expressions` namespace.

Using the static methods provided by this class, we can build expressions that represent familiar language constructs. Some of these are:

- `Expression.Constant(...)` -- an expression that represents an unchangeable value.
- `Expression.Variable(...)` -- an expression that represents a variable.
- `Expression.New(...)` -- an expression that represents an initialization of a new instance of a type.
- `Expression.Assign(...)` -- an expression that represents an assignment operation.
- `Expression.Equal(...)` -- an expression that represents an equality comparison.
- `Expression.Call(...)` -- an expression that represents a specific method call.
- `Expression.Condition(...)` -- an expression that represents branching logic.
- `Expression.Loop(...)` -- an expression that represents repeating logic.
- ...

As you can see, there are quite a lot of different builders and, while the simpler ones like `Constant` or `Variable` produce terminal nodes, the more complex ones like `Assign` or `Loop` are built by composing other expressions. It is through this composition that we end up with a data structure that resembles a tree.

Let's take a look at a very simple function that calculates the sum of two numbers:

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

Now, as an exercise, let's try and recreate this exact function by building and compiling it in runtime using expression trees:

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

First, we have to specify the parameters of our function. Using the `Expression.Parameter(...)` method we can construct an expression that identifies a specific parameter. This expression can be used to both resolve its value, as well as to set it.

Then we construct the body of our function. Since this is a simple addition, we're using `Expression.Add(...)` which constructs an expression that represents the plus operator. As a binary operator it requires two operands, for which we specify our parameter expressions.

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

However, by generating code dynamically with expression trees we work around this:

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
// ThreeFourths(6.66) -> 4,995
// ThreeFourths(100M) -> 75
```

That works great and we can reuse this method for numbers of absolutely any type. However, seeing as our generic operation doesn't have type safety, you may be wondering, "How is this approach any different from just using `dynamic`?".

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

Because the compiler generates a version of the `Impl` class for each argument of `T`, we end up with an implementation of three-fourths for each type encapsulated in a separate class. Having a static constructor ensures that the actual delegate will be initialized only once, the first time it is accessed.

This essentially gives us a thread-safe lazy-evaluated dynamic function. I like to call this pattern a "lazy-compiled expression".

Now, with the optimizations out of the way, let's compare the performance of different approaches using [Benchmark.NET](https://github.com/dotnet/BenchmarkDotNet):

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

As you can see, the expression-based approach performs about 9 times faster than when using `dynamic`. Although, seeing as we're comparing nanoseconds to nanoseconds, it may not be a big deal, it can matter in some specific scenarios.

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

While using `CallExecute()` scarcely is most likely fine, running it in a tight loop can cause some issues, so we could be better off with expression trees.

Let's use the same lazy-compiled expression pattern to generate a function that executes a method which is resolved using reflection:

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

As you can see, while the `CreateDelegate` approach comes really close, the expressions are still faster.

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

    public static object Run(string expression)
    {
        var operation = FullExpression.Parse(expression);

        var body = Expression.Convert(operation, typeof(object));
        var lambda = Expression.Lambda<Func<object>>(body);
        var func = lambda.Compile();

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

As you can see, the parsers defined above (`Constant`, `Operator`, `Operation`, `FullExpression`) all yield objects of type `Expression` or `ExpressionType`, which are both defined in `System.Linq.Expressions`. The expression tree is essentially our syntax tree, so once we parse the input we will have all the required information to compile the runtime instructions represented by it.

You can try it out:

```shell
> app 3.14 * 5 + 2
17.7
```

Note that this simple calculator is just an example of what you can do. If you want to see how a proper calculator like that would look, check out [Sprache.Calc](https://github.com/yallie/Sprache.Calc/blob/master/Sprache.Calc/SimpleCalculator.cs). Also, if you want to learn more about parsing, check out my blog posts about [parsing in C#](/blog/monadic-parser-combinators) and [parsing in F#](/blog/parsing-with-fparsec).

## Going even faster with FastExpressionCompiler

While compiled expressions execute really fast, compiling them is relatively expensive. This is largely due to various verifications the compiler has to perform to ensure that the composed expression tree is valid.

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

This library (as part of `FastExpressionCompiler.LightExpression`) also offers a drop-in replacement for `Expression` and all of its static builder methods. These alternative implementations construct expressions which may in some cases perform much faster than their default counterparts.

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