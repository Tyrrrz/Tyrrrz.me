---
title: Pure-Impure Segregation Principle
date: 2020-08-30
cover: Cover.png
---

![cover](Cover.png)

About a month ago I published an article titled ["Unit Testing is Overrated"](/blog/unit-testing-is-overrated) where I shared my thoughts on how developers place way too much faith in that testing approach and why it often isn't the best tool for the job. While I didn't expect that post to do particularly well, in three weeks it managed to get over 100'000 views and 1'000 comments, despite its controversial nature (or, perhaps, owing to it?).

It was really interesting to follow the discussions that unfolded, given the vast contrast of opinions people seemed to have on the subject. And while most commenters mainly shared their personal experiences, a few have also voiced criticism of the way some arguments were presented.

In particular, a couple of comments mentioned that the drawbacks I've described, especially those concerning abstractions and mocking, are really just a byproduct of object-oriented programming and its inherent flaws. Had my examples been designed with functional principles in mind, many of the outlined problems would never have surfaced.

More specifically, the suggested solution was to refactor the class hierarchy by extracting the pure business logic away from the rest of the code. Getting rid of the hierarchy eliminates the need for mocking, which in turn greatly simplifies unit testing.

Although the article briefly mentions this approach as well, it's true that the original example was a bit forced and could be improved. That said, I think the main point goes beyond that code snippet and was still able to make its way across.

Regardless of that, I also believe that the principle of separating code based on purity, which is what the suggested approach was based on, is incredibly important and often overlooked. When applied correctly, it can make a great impact on the design of your software, providing benefits in many other areas besides just unit testing.

I initially became familiar with it when I was trying to get into functional programming while learning F#. It changed my mindset significantly and since then I've been relying on these ideas all the time, even when writing object-oriented code.

In this article I will go in-depth on what makes the code pure or impure, why is that important to us, and how we can use it to improve our code. And while I'm definitely not the first person to write about this, I think this topic deserves more attention than it gets.

_Note: as usual, the code samples in this article are written in C#, but the ideas are universal and apply to practically any language._

## Pure vs impure

As I'm writing this in 2020, there is no doubt that most readers are already familiar with the concept of purity in programming. Nevertheless, let's go over it one more time to make sure we're on the same page.

In essence, _pure code_ is code encapsulated within a function, whose **evaluation is influenced only by the function's parameters** and whose **evaluation influences only the value returned by that function**. In other words, a pure function doesn't have any implicit arguments, doesn't depend on or interact with external state, and doesn't generate any _side-effects_.

Conversely, a function which breaks at least one of those two rules is considered _impure_. To illustrate this, let's look at a very simple example:

```csharp
public static bool IsFoodEdible(DateTimeOffset expiration) =>
    DateTimeOffset.Now < expiration;

public static bool IsFoodEdible(DateTimeOffset expiration, DateTimeOffset instant) =>
    instant < expiration;
```

While both versions of the `IsFoodEdible` method are similar, only one of them is actually pure. The first overload has an implicit dependency on some external state, specifically the current system time. In practice, this means that evaluating this function multiple times may very well produce different results even for the same input parameter, which violates the first rule.

The other overload takes the current date and time as an explicit parameter instead and thus does not exhibit that problem. Regardless of whether we call that method now or ten years into the future, the result is guaranteed to always be the same for the same set of parameters.

Because of that, the second method shown in the above example is pure, while the first one isn't. Additionally, the following variant would be impure as well:

```csharp
public static void IsFoodEdible(DateTimeOffset expiration, DateTimeOffset instant)
{
    if (instant < expiration)
        Console.WriteLine("It's edible.");
    else
        Console.WriteLine("It's not edible.");
}
```

In this case, the impurity comes from the fact that this method generates side-effects by interacting with the standard output stream. Since the evaluation of this method influences something other than the returned value, it breaks the second rule we outlined earlier.

Moreover, as a general observation, we can also establish that any method that doesn't return anything (whose return type is `void`) is practically guaranteed to be impure, because a pure function without a return value is inherently useless. Furthermore, if a method executes asynchronously, it's also likely going to be impure, because asynchrony naturally comes from I/O operations.

Finally, the method in the following example may seem impure at a first glance too, but really isn't:

```csharp
public static bool AllFoodEdible(IReadOnlyList<DateTimeOffset> expirations, DateTimeOffset instant)
{
    for (var i = 0; i < products.Count; i++)
    {
        if (instant >= expirations[i])
            return false;
    }

    return true;
}
```

Seeing as `AllFoodEdible` mutates the value of `i` during the course of its execution, one could think that such a method is not pure either, because its evaluation influences more than just its result. However, because the variable `i` is defined in local scope and cannot be accessed from outside of this method, these mutations are not externally observable and, as such, do not make the code impure.

Besides that, **impurity is also contagious**. While an impure function can call pure or impure functions alike, a pure function can only call other pure functions:

```csharp
// Impure function
public static string GetId() => Guid.NewGuid().ToString();

// Pure function
public static string GetFilePath(string dirPath, string name) =>
    dirPath + name;

// Impure function (because it calls an impure function)
public static string GetFilePath(string dirPath, string name) =>
    dirPath + name + GetId();
```

Now, of course it wouldn't be very useful to classify code based on these seemingly arbitrary traits if it didn't provide us with some useful insights. When it comes to purity, these insights come in a form of properties that all pure functions are known to possess:

- Pure functions produce deterministic results which can be safely cached
- Pure functions never have race conditions and can be safely parallelized
- Pure functions are self-contained and don't influence the behavior of other functions
- Pure functions are always CPU-bound and don't need to execute asynchronously
- Pure functions are highly localized and are generally easier to debug and reason about
- Pure functions don't have implicit dependencies and are trivial to test in isolation

Judging by this list alone, it's rather clear that pure code is extremely flexible and convenient to work with. In fact, the initial instinct may be that we should optimize our design in such way that we focus exclusively on writing pure code.

Unfortunately, that's not possible because **purity is not an indication of quality, but rather of purpose**. Any program will invariably have impure code, as it's required to handle infrastructural concerns, such as reading user input, persisting data, making changes in the environment, and all the other things that make our software actually useful.

These aspects are dictated by the functional requirements and not so much by the design. No matter what, we will always have some impure elements in our code.

Having said that, it's also important to remember that impurity is inherently contagious. Depending on how we expose it to the rest of our code, we may end with different degrees of impurity in our software.

That, in turn, is something we can actually control. By designing our application in a way that minimizes impure interactions and delays them as much as possible, we can limit the amount of effectful and non-deterministic code we have, allowing us to reap the most benefits out of pure functions.

## Flattening the dependency tree

## "Almost" pure code

## Inverting side-effects
