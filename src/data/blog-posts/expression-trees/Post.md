---
title: Demystifying .NET expression trees
date: 2020-02-15
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



```csharp
public int Sum(int a, int b)
{
    var func = GetSumFunction();
    return func(a, b);
}

// Sum(3, 5) -> 8
```

```csharp
public int ThreeFourths(int x) => 3 * x / 4;
```

```csharp
public T ThreeFourths<T>(T x)
{
    var param = Expression.Parameter(typeof(T));

    var three = Expression.Convert(Expression.Constant(3), typeof(T));
    var four = Expression.Convert(Expression.Constant(4), typeof(T));

    var operation = Expression.Divide(Expression.Multiply(param, three), four);

    var lambda = Expression.Lambda<Func<T, T>>(operation, param);

    var func = lambda.Compile();

    return func(x);
}
```