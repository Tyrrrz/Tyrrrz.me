---
title: 'Pure-Impure Segregation Principle'
date: '2020-08-24'
---

Two months ago I published an article detailing why I think that [Unit Testing is Overrated](/blog/unit-testing-is-overrated), which seemed to resonate quite a lot with readers, prompting very involved and interesting discussions. And although most commenters mainly shared their personal experiences, a few have also voiced criticism of the way some arguments were presented.

In particular, one person mentioned that the drawbacks I've described, especially those pertaining to abstractions and mocking, are really just a byproduct of object-oriented programming and its inherent flaws. Had my example been designed with functional principles in mind, many of the outlined problems would never have surfaced.

More specifically, the suggested solution was to refactor the presented class hierarchy by extracting the pure business logic away from the rest of the code. Getting rid of the impure dependency eliminates the need for mocking, which in turn simplifies unit testing.

This is a valid approach, and it does work well in that particular example due to how the code is structured. However, it's not a universal solution and, while it does help with some immediate challenges of unit testing, it does not invalidate the broader issues raised by the article.

That said, I also think that the underlying principle of code separation based on purity is very important and often overlooked. When used correctly, it can guide software design, providing benefits in terms of readability, portability and, as mentioned, testing.

Depending on whom you ask, this principle may have different names, such as [functional core & imperative shell](https://destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell), [impure-pure-impure sandwich](https://blog.ploeh.dk/2017/02/02/dependency-rejection), and some others. And while most developers seem to agree on its value, there's still some misunderstanding remaining as to how it's applied beyond simple academic examples.

At the end of the day, just like with any other software development pattern, its usefulness is entirely situational. However, it offers a good mental model for reasoning about non-determinism in code, which is relevant regardless of context.

In this article we will look at what actually makes something pure or impure, why is that important to us, and how we can leverage that knowledge to write better software. I will show examples of where applying this principle lends to better design, as well as scenarios where it might not be as helpful.

## Pure vs impure

The concept of purity is not novel in programming, so I have no doubt that most readers are already familiar with it. Nevertheless, let's go over it one more time to make sure we are on the same page.

In essence, _pure code_ is code encapsulated within a function, whose **evaluation is influenced only by its parameters** and whose **evaluation influences only its returned value**. In other words, a pure function doesn't have any implicit inputs, doesn't depend on or interact with external state, and doesn't generate any observable side effects.

Conversely, a function that breaks at least one of those two rules is called _impure_. To illustrate this, let's look at a very simple example:

```csharp
public static bool IsFoodEdible(DateTimeOffset expiration) =>
    DateTimeOffset.Now < expiration;

public static bool IsFoodEdible(DateTimeOffset expiration, DateTimeOffset instant) =>
    instant < expiration;
```

While both versions of the `IsFoodEdible(...)` function are similar, only one of them is pure. The first overload gets the current time from the system clock, creating an implicit dependency on non-deterministic external state. In practice, this means that evaluating the function multiple times may very well produce different results even for the same arguments, which violates the first rule of purity.

The other version takes the current time as an explicit parameter instead and thus does not exhibit that problem. Regardless of whether we call that function now or ten years into the future, the result is guaranteed to always be the same for the same input. In other words, the behavior of the function depends only on the arguments that were passed to it and nothing else.

Because of that, the second function shown in the above example is pure, while the first one isn't. Additionally, the following variant would be impure as well:

```csharp
public static void IsFoodEdible(DateTimeOffset expiration, DateTimeOffset instant)
{
    if (instant < expiration)
        Console.WriteLine("It's edible.");
    else
        Console.WriteLine("It's not edible.");
}
```

In this case, the impurity comes from the fact that this function generates side effects by interacting with the standard output stream. Since its evaluation influences something other than its returned value, it breaks the second rule we've outlined earlier.

As a general guideline, **any function that doesn't return anything** (or whose return value may be ignored) **is guaranteed to be impure**, because a pure function without a return value is inherently useless. Furthermore, if a function executes asynchronously, it's also a reliable giveaway that a function is impure, since asynchrony naturally comes from I/O operations.

Finally, the function in the following example may seem impure at a first glance too, but actually isn't:

```csharp
public static bool AllFoodEdible(IReadOnlyList<DateTimeOffset> expirations, DateTimeOffset instant)
{
    for (var i = 0; i < expirations.Count; i++)
    {
        if (instant >= expirations[i])
            return false;
    }

    return true;
}
```

Seeing as `AllFoodEdible(...)` mutates the value of `i` during the course of its execution, one could think that such a function is not pure either. However, because the variable `i` is encapsulated within a local scope and cannot be accessed from outside, this mutation is not externally observable and, as such, does not make the function impure.

Now, of course it wouldn't make much sense to classify code based on these seemingly arbitrary traits if purity didn't provide us with some useful benefits. Indeed, since pure functions are deterministic and have no side effects, they possess the following intrinsic qualities:

- Easy to reason about
- Can be safely cached
- Can be safely parallelized
- Testable in isolation
- Don't execute asynchronously
- Don't influence other functions

Judging by this list alone, it's rather clear that pure code is extremely flexible and convenient to work with. In fact, the initial instinct may be that we should optimize our design in such way that we focus exclusively on writing pure code.

Unfortunately, that's not possible because **purity**, in itself, **is not an indication of quality, but rather of purpose**. Any program will invariably have impure code, as it's required to handle infrastructural concerns, such as reading user input, persisting data, making changes in the environment, and all the other things that make our software actually useful.

These aspects are dictated by the functional requirements of the software and not so much by its design. That means that we can't simply eliminate impurities from our code, at least not without also changing how it works.

Having said that, one very important characteristic of **impurity** is that it's **inherently contagious**. Any function that depends on the execution of an impure function becomes impure as well:

```csharp
// Impure function
public static string GetId() => Guid.NewGuid().ToString();

// Impure function (calls an impure function)
public static string GetFilePath(string dirPath, string name) =>
    dirPath + name + GetId();

// Pure function (takes the result of impure function as a parameter)
public static string GetFilePath(string dirPath, string name, string id) =>
    dirPath + name + id;
```

Depending on how the code is structured and how it interacts with non-deterministic and effectful operations, impurities may make up a larger or smaller portion of the whole. That, in turn, is something we can actually control.

In order to reap the most benefit out of pure functions, we need to design software in a way that **limits and delays impure interactions as much as possible**, ideally pushing them towards the _boundaries of the system_.

## Flattening the dependency tree

While the concept of purity forms the foundation of functional programming, it isn't given as much thought in the object-oriented world. In fact, the main purpose of object-oriented design is to aggregate related behavior in a single contextual entity, which usually involves state and mutations.

Software written with OOP in mind follows a hierarchical design, where objects are composed together to represent different layers of abstraction in a connected fashion. Any impurities that may exist in those objects are free to spread from child to parent, potentially contaminating the entire dependency tree.

To better understand what that means in practice, let's revisit an example from my previous article. The idea was to build a simple web API application that calculates user's sunrise and sunset times based on their IP address. This functionality can be modeled using three classes:

- `LocationProvider` to get a location from an IP address, using a public GeoIP database
- `SolarCalculator` to calculate solar times from that location
- `SolarTimesController` to expose the result through an HTTP endpoint

```csharp
public class LocationProvider
{
    private readonly HttpClient _httpClient;

    /* ... */

    public async Task<Location> GetLocationAsync(IPAddress ipAddress)
    {
        // Pure
        var ipAddressFormatted = !ipAddress.IsLocal()
            ? ipAddress.MapToIPv4().ToString()
            : "";

        // Impure
        var json = await _httpClient.GetJsonAsync($"http://ip-api.com/json/{ipAddressFormatted}");

        // Pure
        var latitude = json.GetProperty("lat").GetDouble();
        var longitude = json.GetProperty("lon").GetDouble();

        return new Location(latitude, longitude);
    }
}

public class SolarCalculator
{
    private readonly LocationProvider _locationProvider;

    /* ... */

    private DateTimeOffset CalculateSunrise(Location location, DateTimeOffset date)
    {
        /* Pure (implementation omitted) */
    }

    private DateTimeOffset CalculateSunset(Location location, DateTimeOffset date)
    {
        /* Pure (implementation omitted) */
    }

    public async Task<SolarTimes> GetSolarTimesAsync(IPAddress ipAddress, DateTimeOffset date)
    {
        // Impure
        var location = await _locationProvider.GetLocationAsync(ipAddress);

        // Pure
        var sunrise = CalculateSunrise(location, date);
        var sunset = CalculateSunset(location, date);

        return new SolarTimes(sunrise, sunset);
    }
}

[ApiController, Route("solartimes")]
public class SolarTimeController : ControllerBase
{
    private readonly SolarCalculator _solarCalculator;

    /* ... */

    [HttpGet("by_ip")]
    public async Task<IActionResult> GetSolarTimesByIp(DateTimeOffset? date)
    {
        // Impure
        var result = await _solarCalculator.GetSolarTimesAsync(
            HttpContext.Connection.RemoteIpAddress,
            date ?? DateTimeOffset.Now
        );

        return Ok(result);
    }
}
```

Note how these three classes represent a vertical slice from a potentially much more involved object hierarchy. Schematically, the flow of data in this relationship can be depicted like so:

```ini
 [ LocationProvider ]
           |
           ↓
  [ SolarCalculator ]
           |
           ↓
[ SolarTimesController ]
```

This is a very typical scenario for traditionally designed object-oriented software. You'll probably find it extremely familiar if you have experience working on code that follows the [n-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture) or any other similar pattern.

If we consider this relationship from a standpoint of purity, we'll also notice that the entire call chain is impure. And while for `LocationProvider` it makes sense because it performs non-deterministic I/O, the `SolarCalculator` is impure only due to its dependency on the former.

That design is not ideal, because we lose out on the benefits of pure functions without really getting anything in return. Now if we wanted to, for example, test `SolarCalculator.GetSolarTimesAsync(...)` in isolation, we would only be able to do so with the help of an autotelic abstraction and a test double, which is not desirable.

This issue could've been avoided if we architected our code with the pure-impure segregation principle in mind. Let's see how we can refactor our classes to push the impurities out of `SolarCalculator`:

```csharp
public class LocationProvider
{
    /* ... */
}

// Converted to a static class because the function is now pure
public static class SolarCalculator
{
    public static SolarTimes GetSolarTimes(Location location, DateTimeOffset date)
    {
        // Pure
        var sunrise = CalculateSunrise(location, date);
        var sunset = CalculateSunset(location, date);

        return new SolarTimes(sunrise, sunset);
    }
}

[ApiController, Route("solartimes")]
public class SolarTimesController
{
    private readonly LocationProvider _locationProvider;

    /* ... */

    [HttpGet("by_ip")]
    public async Task<IActionResult> GetSolarTimesByIp(DateTimeOffset? date)
    {
        // Impure
        var location = await _locationProvider.GetLocationAsync(
            HttpContext.Connection.RemoteIpAddress
        );

        // Pure
        var result = SolarCalculator.GetSolarTimes(
            location,
            date ?? DateTimeOffset.Now
        );

        return Ok(result);
    }
}
```

Previously, the method in `SolarCalculator` took an IP address as a parameter and relied on `LocationProvider` to get the coordinates it maps to. After refactoring, the method is now static and instead takes the location directly, skipping the previously required impure operation.

Of course, that impurity didn't just disappear into thin air, our software still needs to get the location somehow. The difference is that now this concern is pushed out towards the boundary of the system, which, in this case, is represented by the controller.

In doing that, we also flattened the hierarchy so that all the dependencies are aggregated at the boundary. The data flow now looks a bit more like a pipeline instead:

```ini
[ LocationProvider ]  [ SolarCalculator ]
          |                   |
          |_____         _____|
                ↓       ↓
        [ SolarTimesController ]
```

The benefit of this design is that our pure business logic is no longer contaminated by effectful code, which means we can take advantage of the useful properties listed in the previous section. For example, if we wanted to parallelize or test `SolarCalculator`, it's much easier to do so now than it was before.

## Interleaved impurities

Although very useful, the type of "lossless" refactoring shown earlier only works if the data required by the function can be easily encapsulated within its input parameters. Unfortunately, this is not always the case.

Often a function may need to dynamically resolve data from an external API or a database, with no way of knowing about it beforehand. This typically results in an implementation where pure and impure concerns are interleaved with each other, creating a tightly coupled cohesive structure.

To illustrate a scenario like that, let's take a look at a slightly more involved example. The following snippet contains a class called `RecommendationsProvider` which is responsible for generating song suggestions for a user of some music streaming service:

```csharp
public class RecommendationsProvider
{
    private readonly SongService _songService;

    /* ... */

    public async Task<IReadOnlyList<Song>> GetRecommendationsAsync(string userName)
    {
        // 1. Get user's own top scrobbles
        // 2. Get other users who listened to the same songs
        // 3. Get top scrobbles of those users
        // 4. Aggregate the songs into recommendations

        // Impure
        var scrobbles = await _songService.GetTopScrobblesAsync(userName);

        // Pure
        var scrobblesSnapshot = scrobbles
            .OrderByDescending(s => s.ScrobbleCount)
            .Take(100)
            .ToArray();

        var recommendationCandidates = new List<Song>();
        foreach (var scrobble in scrobblesSnapshot)
        {
            // Impure
            var otherListeners = await _songService
                .GetTopListenersAsync(scrobble.Song.Id);

            // Pure
            var otherListenersSnapshot = otherListeners
                .Where(u => u.TotalScrobbleCount >= 10_000)
                .OrderByDescending(u => u.TotalScrobbleCount)
                .Take(20)
                .ToArray();

            foreach (var otherListener in otherListenersSnapshot)
            {
                // Impure
                var otherScrobbles = await _songService
                    .GetTopScrobblesAsync(otherListener.UserName);

                // Pure
                var otherScrobblesSnapshot = otherScrobbles
                    .Where(s => s.Song.IsVerifiedArtist)
                    .OrderByDescending(s => s.Song.Rating)
                    .Take(10)
                    .ToArray();

                recommendationCandidates.AddRange(
                    otherScrobblesSnapshot.Select(s => s.Song)
                );
            }
        }

        // Pure
        var recommendations = recommendationCandidates
            .OrderByDescending(s => s.Rating)
            .Take(200)
            .ToArray();

        return recommendations;
    }
}
```

The above algorithm works by retrieving the user's most listened songs, finding other people who have also listened to the same titles, and then extracting their top songs as well. Those songs are then aggregated into a list of recommendations and returned to the caller.

It's quite clear that this function would benefit greatly from being pure, seeing how much business logic is encapsulated within it. Unfortunately, the technique we relied upon earlier won't work here.

In order to fully isolate `GetRecommendationsAsync(...)` from its impure dependencies, we would have to somehow supply the function with an entire list of songs, users, and their scrobbles upfront. If we assume that we're dealing with data on millions of users, it's obvious that this would be completely impractical and likely even impossible.

A seemingly simple way we could try to work around this problem is to split the function into smaller pieces, each handling one of the four stages of the algorithm separately:

```csharp
public class RecommendationsProvider
{
    /* ... */

    // Pure
    public static IReadOnlyList<string> HandleOwnScrobbles(IReadOnlyList<Scrobble> scrobbles) =>
        scrobbles
            .OrderByDescending(s => s.ScrobbleCount)
            .Take(100)
            .Select(s => s.Song.Id)
            .ToArray();

    // Pure
    public static IReadOnlyList<string> HandleOtherListeners(IReadOnlyList<User> users) =>
        users
            .Where(u => u.TotalScrobbleCount >= 10_000)
            .OrderByDescending(u => u.TotalScrobbleCount)
            .Take(20)
            .Select(u => u.UserName)
            .ToArray();

    // Pure
    public static IReadOnlyList<Song> HandleOtherScrobbles(IReadOnlyList<Scrobble> scrobbles) =>
        scrobbles
            .Where(s => s.Song.IsVerifiedArtist)
            .OrderByDescending(s => s.Song.Rating)
            .Take(10)
            .Select(s => s.Song)
            .ToArray();

    // Pure
    public static IReadOnlyList<Song> FinalizeRecommendations(IReadOnlyList<Song> songs) =>
        songs
            .OrderByDescending(s => s.Rating)
            .Take(200)
            .ToArray();

    public async Task<IReadOnlyList<Song>> GetRecommendationsAsync(string userName)
    {
        // Impure
        var scrobbles = await _songService.GetTopScrobblesAsync(userName);

        // Pure
        var songIds = HandleOwnScrobbles(scrobbles);

        var recommendationCandidates = new List<Song>();
        foreach (var songId in songIds)
        {
            // Impure
            var otherListeners = await _songService
                .GetTopListenersAsync(songId);

            // Pure
            var otherUserNames = HandleOtherListeners(otherListeners);

            foreach (var otherUserName in otherUserNames)
            {
                // Impure
                var otherScrobbles = await _songService
                    .GetTopScrobblesAsync(otherListener.UserName);

                // Pure
                var songsToRecommend = HandleOtherScrobbles(otherScrobbles);

                recommendationCandidates.AddRange(songsToRecommend);
            }
        }

        // Pure
        return FinalizeRecommendations(recommendationCandidates);
    }
}
```

By extracting all the pure code out of `GetRecommendationsAsync(...)`, we can now write unit tests that verify that the intermediate stages of the algorithm work as intended. On the surface, it looks as though we managed to achieve exactly what we wanted.

However, instead of having one cohesive element to reason about, we ended up with multiple fragments, each having no meaning or value of their own. While unit testing of individual parts may have become easier, the benefit is very questionable, as it provides no confidence in the correctness of the algorithm as a whole.

Ultimately, we weren't able to push impurities out towards the system boundaries — what we did was simply push the pure code further in instead. In other words, the flow of data in the program remains completely unchanged.

The main issue is that each stage of the recommendation algorithm depends on additional data derived from the previous stages. Since this behavior is inherently non-deterministic, it's impossible to express it using pure functions alone.

## Pure "enough" code

Although it's convenient to treat purity as an objectively provable characteristic, it's actually a bit more nuanced than that. As a matter of fact, one could say that purity is a relative concept, not an absolute one.

To understand what exactly I mean by that, let's take a look at an example:

```csharp
public static int FindIndexOf(IEnumerable<Item> items, Item item)
{
    var i = 0;

    foreach (var o in items)
    {
        if (o == item)
            return i;

        i++;
    }

    throw new Exception("Item not found.");
}
```

This is a very simple function that attempts to find an index that corresponds to the position of an item in a sequence. The negative outcome is assumed to be very improbable in this scenario, hence why an exception is used to signify failure, as opposed to a fallback value.

According to the criteria of purity, this function is not pure because the result of its evaluation is not entirely encapsulated within the returned value. Throwing an exception is an effectful operation, since it can change the behavior of the function above in the call stack, or lead to the termination of the program altogether.

However, despite all that, the function is still deterministic, cacheable, parallelizable, and testable, as long as we remember to handle the exception that may be raised in certain circumstances. Even though it's not technically pure, it still retains most of the important properties we care about.

Let's consider an even simpler example:

```csharp
public static int Wrap(int value, int period) => value % period;
```

Seeing as the above code literally just represents a mathematical expression, it seems logical that it must be pure. However, this function shares the exact same problem as the one in the previous snippet.

The modulo operator has an exceptional outcome, which occurs when the supplied divisor is equal to zero. If we were to try and invoke `Wrap(123, 0)`, it would throw an exception, indicating that the function is actually impure as well.

Notably, this problem could be avoided if we used something like `Option<int>` as the return type instead. This approach eliminates the need for an exception, but comes at an expense of making basic arithmetic operations appear more cumbersome.

In any case, even though the code we wrote originally doesn't satisfy the theoretical definition of purity, it might be _pure enough_ for our usage scenario.

Let's also take a look at an opposite situation:

```csharp
public static string GetOutputPath(Report report, string outputDir)
{
    var fileExtension = report.Format == ReportFormat.Html
        ? "html"
        : "txt";

    var fileName = $"{report.Name}.{fileExtension}";

    return Path.Combine(outputDir, fileName);
}
```

The code above assembles a file path for the provided report by combining the output directory with the generated file name. It calls the [`Path.Combine(...)`](https://docs.microsoft.com/en-us/dotnet/api/system.io.path.combine#System_IO_Path_Combine_System_String_System_String_) method, whose behavior relies on the value of the `Path.DirectorySeparatorChar` constant, as it indicates which directory separator is used by the operating system.

Since it is a constant and its value is guaranteed to always be the same for the duration of the program's lifetime, our function is pure (as long as we also disregard possible exceptions). However, it's pure only within the current session.

If we imagine that we're building a cross-platform solution, it's logical that we treat specifics of each platform as environmental parameters. In other words, for code that is expected to run seamlessly on Windows and Linux, the path separator constant essentially acts as a global variable.

Assuming our goal is to test `GetOutputPath(...)` in isolation, simply relying on the parameters of the function is not enough. We would also need to execute tests on each of the supported operating systems, to make sure it actually works with all the possible path separators.

In this case, the fact that the function is pure does not provide us with sufficient guarantees. While it's pure by definition, it's _not pure enough_ for what we need.

As you can see, the concept of purity gets a bit hazy once you start digging into specifics. In reality, everything around us is inherently impure, so what we accept as pure really depends on what level of abstraction we choose to operate at.

If you decide to follow the rules pedantically, you'll find the idea of modelling any problem domain with pure functions quickly becomes impractical. However, it's important to remember that **the goal is not purity in itself, but rather the benefits it provides**.

At the end of the day, the entire notion of purity is just a mathematical model, which may not necessarily translate very well to applied programming. As the developer of the project, it is up to you to draw the line and decide what makes sense and what doesn't.

## Summary

Overall, purity is a pretty useful concept, as it helps us understand how some operations may make our code non-deterministic, difficult to reason about, and cumbersome to test in isolation. Impure interactions are not bad on their own, but the constraints they impose are contagious in nature and may spread to other parts of the application.

The pure-impure segregation principle aims to limit impurities to an essential minimum, by decoupling them from the rest of the code. Ultimately, the goal is to push all non-pure operations towards the outermost layers of the system, while keeping the domain layer comprised entirely out of pure functions.

Designing software in such a way leads to an architecture that resembles a pipeline rather than a hierarchy, which favors functional style of programming. Depending on the project, this may aid in expressing the flow of data more clearly, among other useful benefits.

However, this is not always practical and there are scenarios where extracting pure code comes at a cost of severely reduced cohesiveness. In any case, if your goal is to facilitate testing without mocking, [architecting your solution for high-level testing](/blog/unit-testing-is-overrated) is likely going to be a much better time investment.
