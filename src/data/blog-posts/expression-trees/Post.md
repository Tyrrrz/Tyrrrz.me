---
title: Demystifying .NET expression trees
date: 2020-02-18
cover: Cover.png
---

![cover](Cover.png)

Expression trees is an obscure, although very interesting feature in .NET. Most people probably think of it as something synonymous with object-relational mapping frameworks, but despite being one of its most prolific use cases, it's not the only one.

In essence, an expression tree is a higher-order representation of code that describes its underlying syntactic structure rather than the result of an execution. This can be useful when analyzing existing code, manipulating it, or even generating and compiling entirely new code at runtime.

In this article we will take a look at some of the scenarios where that can be useful and hopefully shed some light on this overlooked part of the language.

## Creating expression trees manually

There are multiple different ways how we can obtain expression trees in our code. One of the most straightforward ways it construct them manually.

The framework offers us with a way to do this using the API provided by the `Expression` class. It contains a few dozen static builder methods that allows us to construct expressions that represent certain IL constructs.

Let's take a look at a very simple function that calculates the sum of two numbers:

```csharp
public int Sum(int a, int b) => a + b;

// Sum(3, 5) -> 8
```

This is a method definition that has two components: the signature which specifies two integer parameters and an integer return value, as well as the method body. The latter is itself comprised of a single binary expression, which in turn depends on two expressions that resolve the values for parameter `a` and `b` respectively.

The hierarchy outlined above is essentially the expression tree of this function. It can be visualized with the diagram below:

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

Now, let's recreate the same syntactic structure above using the builder API:

```csharp
public Func<int, int, int> GetSumFunction()
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

Let's digest what happened here.

First, we have to specify the parameters of our function. Using the `Expression.Parameter(...)` method we can construct an expression that identifies a specific parameter and can be used to both resolve its value, as well as to set it.

Then we construct the body of our function. Since this is a simple addition, we simply need to call `Expression.Add(...)` that constructs an expression that represents the plus operator. As a binary operator it requires two values, for which we specify our parameter expressions.

Finally, in order to create an entry point for our expression tree, we need to construct a function definition. To do that, we can use `Expression.Lambda<T>(...)` to build a lambda expression that represents an anonymous function with the body and parameters we created earlier.

Up to this point, we are dealing with expression trees which is nothing more than data. In order to turn this data into interpretable instructions, we have to compile our lambda expression with the `Compile()` method. This dynamically creates a delegate of the specified type based on the expression tree we've constructed.

Having this delegate, we can use it like any other. For example, we can rewrite our original `Sum` function to use the dynamically compiled code instead:

```csharp
public int Sum(int a, int b)
{
    var func = GetSumFunction();
    return func(a, b);
}

// Sum(3, 5) -> 8
```

"Ok, but what's the point?" you might ask. After all, we took our statically-implemented function and replaced it with a function generated at runtime that runs slower and has no type safety.

Let's move our simplistic example aside and see where this approach can actually be useful.

## Generic operators

One interesting thing we can do with expression trees is compile code that uses generic operators.

As you know, operators in C# (unlike F#) are not generic. This means that, for example, every numeric type defines its own version of the multiply and divide operators. As a result, code that uses these operators also can't be made generic either.

Let's take a look at an example:

```csharp
public int ThreeFourths(int x) => 3 * x / 4;

// ThreeFourths(18) -> 13
```

Above we have a simple function that calculates three-fourths of a number, but it only works with numbers of type `int`. If we wanted to extend this routine to support other types, we'd have to add some overloads:

```csharp
public int ThreeFourths(int x) => 3 * x / 4;

public long ThreeFourths(long x) => 3 * x / 4;

public float ThreeFourths(float x) => 3 * x / 4;

public double ThreeFourths(double x) => 3 * x / 4;

public decimal ThreeFourths(decimal x) => 3 * x / 4;
```

This is suboptimal. We are introducing a lot of code duplication which only gets worse as we need to test it.

It would've been better if we could just do something like this instead:

```csharp
public T ThreeFourths<T>(T x) => 3 * x / 4;
```

But unfortunately that won't compile because not every type has the `*` and `/` operators and there's no constraint we could use to limit the generic argument to numeric types.

However, by generic code dynamically with expression trees we can do this:

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
// ThreeFourths(DateTimeOffset.Now) -> runtime exception
```

Seeing as our generic operation doesn't have type safety, you may be wondering how is this approach any different from just using `dynamic` in our code. Surely, we could just write our code like this and save all the trouble:

```csharp
public dynamic ThreeFourths(dynamic x) => 3 * x / 4;
```

Indeed, functionally these two approaches are essentially the same. However, the main difference and the advantage of expression trees is that they are compiled, while `dynamic` is evaluated every single time.

That said, in the example above we're not benefitting from this advantage at all because we're recompiling our function every time anyway. Let's try to change our code so that it happens only once.

What I like to do in such cases is create a generic class with a static constructor and define the compiled function as a static property of that class:

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

With this little trick, we guarantee that `Impl<T>.On` will be set exactly once, the first time this particular generic version of the class is used. This essentially gives us a thread-safe lazy-evaluated generic delegate. I personally like to call this pattern a "lazy-compiled expression".

Now, with the optimizations out of the way, let's compare the performance of different approaches using [Benchmark.NET](https://github.com/dotnet/BenchmarkDotNet):

```csharp
public class Benchmarks
{
    [Benchmark(Description = "Static", Baseline = true)]
    [Arguments(13.37)]
    public double Static(double x) => 3 * x / 4;

    [Benchmark(Description = "Dynamic")]
    [Arguments(13.37)]
    public dynamic Dynamic(dynamic x) => 3 * x / 4;

    [Benchmark(Description = "Expressions")]
    [Arguments(13.37)]
    public double Expr(double x) => ThreeFourths.Of(x);

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|      Method |     x |       Mean |     Error |    StdDev | Ratio | RatioSD |
|------------ |------ |-----------:|----------:|----------:|------:|--------:|
|      Static | 13.37 |  0.6164 ns | 0.0552 ns | 0.0516 ns |  1.00 |    0.00 |
|     Dynamic | 13.37 | 19.4831 ns | 0.3475 ns | 0.3251 ns | 31.80 |    2.47 |
| Expressions | 13.37 |  2.1350 ns | 0.0754 ns | 0.0705 ns |  3.48 |    0.29 |
```

As you can see, the expression-based approach performs about 9 times faster than when using `dynamic`. Although, seeing as we're comparing nanoseconds to nanoseconds, it may not be a big deal, it can matter in some specific scenarios.

## Optimizing reflection calls

Compiled expression trees are also useful when we want to speed up some reflection-heavy code. As we all know, reflection can be quite slow because of late binding but with expression trees we can ensure that all of the heavy lifting happens only once.

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

Running `CallExecute()` once in a while is completely fine, however if we're going to rely on it in a hot path scenario, we could be better off with expression trees.

Let's use the same lazy-compiled expression pattern to generate a function that executes a method whose handle is resolved using reflection:

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

And let's do the same for reflection:

```csharp
public static class CallExecuteWithReflection
{
    public static MethodInfo Method { get; } =
        typeof(Command).GetMethod("Execute",
            BindingFlags.NonPublic | BindingFlags.Instance);

    public static int On(Command command) => (int) Method.Invoke(command, null);
}
```

```csharp
public static class CallExecuteWithReflectionDelegate
{
    public static Func<Command, int> On { get; } =
        (Func<Command, int>) Delegate.CreateDelegate(
            typeof(Func<Command, int>),
            typeof(Command).GetMethod("Execute", BindingFlags.NonPublic | BindingFlags.Instance));
}
```

And see how these two approaches compare with each other:

```csharp
public class Benchmarks
{
    [Benchmark(Description = "Expressions", Baseline = true)]
    public int Expr() => CallExecute.On(new Command());

    [Benchmark(Description = "Reflection")]
    public int Reflection() => CallExecuteWithReflection.On(new Command());

    [Benchmark(Description = "Reflection (delegate)")]
    public int ReflectionDelegate() => CallExecuteWithReflectionDelegate.On(new Command());

    public static void Main() => BenchmarkRunner.Run<Benchmarks>();
}
```

```r
|                Method |       Mean |     Error |    StdDev | Ratio | RatioSD |
|---------------------- |-----------:|----------:|----------:|------:|--------:|
|           Expressions |   4.565 ns | 0.1261 ns | 0.1295 ns |  1.00 |    0.00 |
|            Reflection | 126.912 ns | 1.7837 ns | 1.6685 ns | 27.82 |    0.78 |
| Reflection (delegate) |   5.739 ns | 0.0901 ns | 0.0842 ns |  1.26 |    0.04 |
```

As you can see, compiled expressions are significantly faster than reflection, although only slightly faster than the `CreateDelegate` approach.

## Parsing expressions

One other interesting scenario that I'm personally really fond of is parsing. Usually, when dealing with a custom DSL, you will have a parser that produces a syntax tree which gets analyzed by an interpreter and turned into runtime instructions. With expression trees you can parse directly into these runtime instructions and get rid of the interpreter step altogether.

As an example, let's write a simple program that takes a string representation of a mathematical expression and calculates the result. We will use the [Sprache](https://github.com/sprache/Sprache) library to build our parser, just to make things simpler.

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

As you can see, the parsers defined above yield an instance of type `Expression` or `ExpressionType` which are both part of `System.Linq.Expressions`. Once we parse the full expression, we already have all the required data we need to generate runtime instructions by compiling them into a lambda.

You can try it out:

```shell
> interpreter.exe 3.14 * 5 / 2
7.8500000000000005
```

Note that this simple calculator doesn't take into account operation precedence or other more complicated things, it's only meant as an example. If you want to see how a full calculator like that would look, check out [Sprache.Calc](https://github.com/yallie/Sprache.Calc/blob/master/Sprache.Calc/SimpleCalculator.cs). Also, if you want to learn more about parsing, check out my blog posts about [parsing in C#](/blog/monadic-parser-combinators) and [parsing in F#](/blog/parsing-with-fparsec).

## Generating expression trees from code

So far we've explored how to construct expression trees manually as well as some of the ways that can be useful. The cool thing about expression trees in .NET though is that they can also be created automatically from existing code.

You're definitely familiar with this approach because that's what libraries like Entity Framework use to translate C# code into SQL.

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    Console.WriteLine(expr);
}

public static void Main()
{
    Analyze(() => 42);
}

// () => 42
```

```csharp
public static void Analyze<T>(Expression<Func<T>> expr)
{
    var dump = JsonConvert.SerializeObject(expr, new JsonSerializerSettings
    {
        Formatting = Formatting.Indented,
        TypeNameHandling = TypeNameHandling.Auto,
        Converters = { new StringEnumConverter() }
    });

    Console.WriteLine(dump);
}

public static void Main()
{
    Analyze(() => 42);
}

/*
{
  "Type": "System.Func`1[[System.Int32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e]], System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e",
  "NodeType": "Lambda",
  "Parameters": {
    "$type": "System.Runtime.CompilerServices.TrueReadOnlyCollection`1[[System.Linq.Expressions.ParameterExpression, System.Linq.Expressions]], System.Linq.Expressions",
    "$values": []
  },
  "Name": null,
  "Body": {
    "$type": "System.Linq.Expressions.ConstantExpression, System.Linq.Expressions",
    "Type": "System.Int32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e",
    "NodeType": "Constant",
    "Value": 42,
    "CanReduce": false
  },
  "ReturnType": "System.Int32, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e",
  "TailCall": false,
  "CanReduce": false
}
*/
```