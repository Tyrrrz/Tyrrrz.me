---
title: Pure-Impure Segregation Principle
date: 2020-08-30
cover: Cover.png
---

![cover](Cover.png)

About a month ago I published an article titled ["Unit Testing is Overrated"](/blog/unit-testing-is-overrated) where I shared my thoughts on how developers place way too much faith in that testing approach and why it often isn't the best tool for the job. While I didn't expect that post to do particularly well, it managed to get over 100k views and 1k comments in a span of just a couple of weeks in spite of its controversial nature (or, perhaps, owing to it?).

It was really interesting to follow the discussions that unfolded, given the vast contrast of opinions people seemed to have on the subject. And while most commenters mainly shared their personal experiences, a few have also voiced criticism of the way some arguments were presented.

In particular, a couple of comments mentioned that the drawbacks I've described, especially those concerning abstractions and mocking, are really just a byproduct of object-oriented programming and its inherent flaws. Had my examples been designed with functional principles in mind, many of the outlined problems would never have surfaced.

The suggested approach was to refactor the class hierarchy I had in my example by extracting the pure business logic away from the rest of the code. Getting rid of the hierarchy eliminates the need for mocking, which in turn greatly simplifies unit testing.

Although I've also alluded to this approach in another context, I agree that the original example was a bit forced and could be simplified. And while I think that this doesn't take away from the point of the article, I also believe that the principle of separating pure and impure code is very potent and can often positively influence the design of your software.

When I was just getting into functional programming, one of the earliest mindset shifts I've experienced was upon learning of the functional architecture and how it utilizes this principle. Since then I've been applying these ideas on a daily basis, even when writing object-oriented code.

Because of its importance, I feel like this topic deserves an article of its own. So to that end, I will try to cover it in this piece, explaining what makes the code pure or impure, why would we want to create separation based on such classification, where it can be beneficial and where it probably isn't worth doing at all.

_Note: as usual, the article contains code samples in C#, but the ideas are universal and apply to practically any language._

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

While both versions of the `IsFoodEdible` method are rather similar, only one of them is actually pure. The first overload has an implicit dependency on some external state, specifically the current system time. In practice, this means that evaluating the function multiple times may very well produce different results even for the same parameter, and that violates the first rule.

The other overload, which instead takes the current date and time as an explicit parameter, does not exhibit that problem. Regardless of whether we call that method now or ten years into the future, the result is guaranteed to always be the same for the same set of parameters.

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

Moreover, as a general observation, it's fair to establish that any method that doesn't return anything (whose return type is `void`) is practically guaranteed to be impure, because a pure function without a return value is inherently useless. Additionally, any method that executes asynchronously is also likely going to be impure because asynchrony inherently comes from I/O operations.

Finally, the method in the following example may also seem impure at a first glance, but isn't:

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

Seeing as `AllFoodEdible` mutates the value of `i` during the course of its execution, one could think that such a method is not pure either, because its evaluation influences more than just the result. However, because the variable `i` is defined in local scope and cannot be accessed from outside of this method, these mutations are not externally observable and, as such, do not make the code impure.

Now, of course it wouldn't be very useful to classify code based on these seemingly arbitrary traits if it didn't provide us with some useful insights. When it comes to purity, these insights come in a form of properties that all pure functions are known to possess:

- Pure functions produce deterministic results which can be safely cached
- Pure functions never have race conditions and can be safely parallelized
- Pure functions execute in isolation and don't influence the behavior of other functions
- Pure functions are always CPU-bound and don't need to execute asynchronously
- Pure functions are highly localized and are generally easier to debug and reason about
- Pure functions don't have implicit dependencies which makes them trivial to test

And while pure code is extremely flexible and convenient to work with, it can't exist on its own. Any real program will invariably have at least some degree of impurity to handle infrastructural concerns such as reading user input, persisting data, making changes in the environment, and whatnot.

On top of that, **impurity is also contagious**. If an otherwise pure function calls an impure function, it becomes impure as well, losing all of the associated benefits.

It makes sense that, to reap the most benefit possible, we would want to maximize the number of pure functions in our code and minimize the number of impure ones. And although we can't control that directly simply by eliminating impure code, we can instead control how these different parts of code interact with each other.

## Flattening the dependency tree
