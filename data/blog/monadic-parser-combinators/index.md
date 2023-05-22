---
title: 'Monadic Parser Combinators in C#'
date: '2019-11-10'
---

A while ago I had to implement proper markdown parsing in [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) so that I could replace the brittle regular expressions I had been using. I had no idea how to approach this problem, so I spent days researching into this, eventually learning about parser combinators. This concept introduced me to a whole new paradigm of writing parsers that actually makes it a fun and enjoyable experience.

In this article I will try to give a brief high-level overview of what is a parser and what constitutes a formal language, then scope into parser combinators to show how easy it is to build parsers with it. We will also write a working JSON processor as an exercise.

## What is a parser

I'm sure for most people the word _parser_ isn't new. We are parsing things all the time after all, either directly through the likes of `int.Parse(...)` and `XElement.Parse(...)`, or indirectly when deserializing HTTP responses, reading application settings, etc.

But what is a parser in a general sense of the word?

As humans, we are gifted with a lot of innate abilities, one of which is the ability to subconsciously deconstruct text into logical components. This is quite an important skill because it lets us detect patterns, analyze semantics, and compare different snippets of text with each other.

For instance, do you see some sort of logical structure when you look at `123 456.97`? You can easily tell that it's a number made out of several components:

- Digits (`123`)
- Thousands separator (space)
- Digits (`456`)
- Decimal separator (`.`)
- Digits (`97`)

For obvious reasons, a computer can't inherently detect patterns like that. After all, it only sees a seemingly random sequence of bytes: `31 32 33 20 34 35 36 2E 39 37`.

As we're dealing with text, we need some way to analyze it. To do that, we essentially need to programmatically produce the same set of syntactic components that we are able to see naturally:

```csharp
new SyntacticComponents[]
{
    new NumericLiteralComponent(123),
    new ThousandsSeparatorComponent(" "),
    new NumericLiteralComponent(456),
    new DecimalSeparatorComponent("."),
    new NumericLiteralComponent(97)
}
```

This is what parsers do. They take an input, usually in the form of text, and formalize it using domain objects. In case of an invalid input, a parser rejects it with an informative error message.

```ini
[Input] ------ (Parser)
               /      \
            ✓ /        \ X
             /          \
    [Domain objects]  [Error message]
```

Of course, it's a fairly basic example, there are much more complicated languages and inputs out there. But generally speaking, we can say that a parser is a piece of code that builds a syntactic structure of the input text, effectively helping the computer "understand" it.

Whether an input is considered valid or not is decided by a set of grammar rules that define the structure of the language.

## Formal grammar

Parsing numbers isn't rocket science, and you wouldn't be reading this article if that was what you were after. Everyone can write a quick regular expression to split text like that into syntactic components.

Speaking of regular expressions, do you know why is it that they are called _regular_?

There's an area in computer science called the _formal language theory_ that specifically deals with languages. Essentially, it's a set of abstractions that help us understand languages from a more formal standpoint.

A formal language itself builds mainly upon the concept of grammar, which is a set of rules that dictate how to produce valid symbols in a given language. When we talk about valid and invalid inputs, we refer to grammar.

Based on the complexity of these rules, grammars are separated into different types according to the [Chomsky hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy). At the lowest level you will find the two most common grammar types, the _regular_ and _context-free_ grammars.

```csharp
+---------------------------------+
|                                 |
|      CONTEXT-FREE GRAMMARS      |
|                                 |
|                                 |
|          +--------------------+ |
|          |                    | |
|          |  REGULAR GRAMMARS  | |
|          |                    | |
|          +--------------------+ |
+---------------------------------+
```

The main difference between the two is that the rules in a regular grammar can't be recursive. A recursive grammar rule is one that produces a symbol that can be further evaluated by the same rule.

HTML is a good example of a context-free language, because an element in HTML can contain other elements, which in turn can contain other elements, and so on. This is also why it inherently [can't be parsed using regular expressions](https://stackoverflow.com/a/1732454/2205454).

As a result, while an input that adheres to a regular grammar can be represented using a sequence of syntactic components, in a context-free grammar it's represented using a higher-level structure — a syntax tree:

```html
       [ HTML document ]
          |        \
          |         \
        <body>     <head>
        /     \        \
     <main>  <footer>   \
      /         |        \
   <div>       <p>      <title>
```

So if we can't use regular expressions to build these syntax trees, what should we do?

## Parser combinators

There are many approaches for writing parsers for context-free languages. Most language tools you know are built using manual recursive-descent parsers, parser generator frameworks, or parser combinators.

The concept of parser combinators revolves around representing each parser as a modular function that takes on some input and produces either a successful result or an error:

```javascript
f(input) -> (result, inputRemainder) | (error)
```

These parsers can be transformed or combined to form more complex parsers by wrapping the function in another function. Generally speaking, combinators are just another class of functions that take other parser functions and produce more intricate ones.

```javascript
F(f(input)) -> g(input)
```

The idea is to start by writing parsers for the simplest grammar rules in your language and then gradually move up the hierarchy using different combinators. By going up level by level, you should eventually reach the top-most node that represents the so-called start symbol.

That might be too abstract to understand so how about we look at a practical example?

## Parsing JSON

To better understand this approach, let's write a functional JSON parser using C# and a library called [Sprache](https://github.com/sprache/Sprache). This library provides a set of base low-level parsers and methods to combine them, which are essentially building blocks that we can use to make our own complex parsers.

To start off, I created a project and defined classes that represent different entities in the JSON grammar, 6 of them in total:

- `JsonObject`
- `JsonArray`
- `JsonString`
- `JsonNumber`
- `JsonBoolean`
- `JsonNull`

Here is the corresponding code for them, condensed into one snippet for brevity:

```csharp
// Abstract entity that acts as a base class for all data types in JSON
public abstract class JsonEntity
{
    public virtual JsonEntity this[string name] =>
        throw new InvalidOperationException($"{GetType().Name} doesn't support this operation.");

    public virtual JsonEntity this[int index] =>
        throw new InvalidOperationException($"{GetType().Name} doesn't support this operation.");

    public virtual T GetValue<T>() =>
        throw new InvalidOperationException($"{GetType().Name} doesn't support this operation.");

    public static JsonEntity Parse(string json) =>
        throw new NotImplementedException("Not implemented yet!");
}

// { "property": "value" }
public class JsonObject : JsonEntity
{
    public IReadOnlyDictionary<string, JsonEntity> Properties { get; }

    public JsonObject(IReadOnlyDictionary<string, JsonEntity> properties)
    {
        Properties = properties;
    }

    public override JsonEntity this[string name] =>
        Properties.TryGetValue(name, out var result) ? result : null;
}

// [ 1, 2, 3 ]
public class JsonArray : JsonEntity
{
    public IReadOnlyList<JsonEntity> Children { get; }

    public JsonArray(IReadOnlyList<JsonEntity> children)
    {
        Children = children;
    }

    public override JsonEntity this[int index] => Children.ElementAtOrDefault(index);
}

// Abstract literal
public abstract class JsonLiteral<TValue> : JsonEntity
{
    public TValue Value { get; }

    protected JsonLiteral(TValue value)
    {
        Value = value;
    }

    public override T GetValue<T>() => (T) Convert.ChangeType(Value, typeof(T));
}

// "foo bar"
public class JsonString : JsonLiteral<string>
{
    public JsonString(string value) : base(value)
    {
    }
}

// 12345
// 123.45
public class JsonNumber : JsonLiteral<double>
{
    public JsonNumber(double value) : base(value)
    {
    }
}

// true
// false
public class JsonBoolean : JsonLiteral<bool>
{
    public JsonBoolean(bool value) : base(value)
    {
    }
}

// null
public class JsonNull : JsonLiteral<object>
{
    public JsonNull() : base(null)
    {
    }
}
```

You can see that all of our JSON types inherit from the `JsonEntity` class which defines a few virtual methods. These methods throw an exception by default, but they are overridden with proper implementations on types that support them.

Using `JsonEntity.Parse(...)` we should be able to convert a piece of JSON text into our domain objects and traverse the whole hierarchy using indexers:

```csharp
var price = JsonEntity.Parse(json)["order"]["items"][0]["price"].GetValue<double>();
```

Now, of course that won't work just yet because our `Parse(...)` method isn't implemented. Let's fix that.

Start by downloading the Sprache library from NuGet, then create a new internal static class named `JsonGrammar`. This is where we will define the grammar for our language:

```csharp
internal static class JsonGrammar
{
}
```

As I've explained above, this approach is all about building simple independent parsers first and slowly working your way up the hierarchy. For that reason it makes sense to start with the simplest entity there is, `JsonNull`, which can only have one value:

```csharp
internal static class JsonGrammar
{
    private static readonly Parser<JsonNull> JsonNull =
        Parse.String("null").Return(new JsonNull());
}
```

Let's quickly look into what we've just wrote here.

On the right-hand side of the equals sign, we are calling `Parse.String(...)` to create a basic parser that will look for a sequence of characters that make up the string `"null"`. This method produces a delegate of type `Parser<IEnumerable<char>>`, but since we're not particularly interested in the sequence of characters itself, we chain it with the `Return(...)` extension method that lets us specify a concrete object to return instead. Doing this also changes the delegate type to `Parser<JsonNull>`.

It's worth noting that, as we write this, no parsing actually happens just yet. We are only building a delegate that can be later invoked to parse a particular input.

If we call `JsonNull.Parse("null")` it will return an object of type `JsonNull`. If we try to call it on any other input, it will throw an exception with a detailed error.

That's pretty cool, although not particularly useful yet.

Let's move on to `JsonBoolean`. This type, unlike `JsonNull` actually has two potential states, `true` and `false`. We can handle them with two separate parsers:

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<JsonBoolean> TrueJsonBoolean =
        Parse.String("true").Return(new JsonBoolean(true));

    private static readonly Parser<JsonBoolean> FalseJsonBoolean =
        Parse.String("false").Return(new JsonBoolean(false));
}
```

This works very similarly to the previous parser we wrote, except now we have two different parsers for one entity.

As you've probably guessed, that's where combinators come into play. We can merge these two parsers into one using an `Or(...)` combinator like this:

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<JsonBoolean> TrueJsonBoolean =
        Parse.String("true").Return(new JsonBoolean(true));

    private static readonly Parser<JsonBoolean> FalseJsonBoolean =
        Parse.String("false").Return(new JsonBoolean(false));

    private static readonly Parser<JsonBoolean> JsonBoolean =
        TrueJsonBoolean.Or(FalseJsonBoolean);
}
```

The `Or(...)` combinator is an extension method that takes two parsers of the same type and produces a new parser that succeeds if either one of them succeeds. That means if we try to call `JsonBoolean.Parse("true")` we will get `JsonBoolean` which has `Value` equal to `true`. Similarly, if we call `JsonBoolean.Parse("false")` we will get a `JsonBoolean` whose `Value` is `false`. And, of course, any unexpected input will result in an error.

One of the coolest things about using parser combinators is how expressive your code is. It can be read quite literally, in fact:

```
JsonBoolean is either TrueJsonBoolean or FalseJsonBoolean.
TrueJsonBoolean is a string "true" which produces a `JsonBoolean` whose value is `true`.
FalseJsonBoolean is a string "false" which produces a `JsonBoolean` whose value is `false`.
```

Reading code like this makes it really easy to infer the structure of the text we're trying to parse.

Let's handle our next data type, `JsonNumber`:

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<JsonNumber> JsonNumber =
        Parse.DecimalInvariant
            .Select(s => double.Parse(s, CultureInfo.InvariantCulture))
            .Select(v => new JsonNumber(v));
}
```

As you can see, Sprache already provides `Parse.DecimalInvariant` out of the box, which we can use to match a number. Since that returns `Parser<string>` as it parses the text that represents the number, we need to transform it to a `double` first and then to our `JsonNumber` object.

The `Select(...)` method here works quite similarly to LINQ's `Select(...)` — it lazily transforms the underlying value of the container into a different shape. This lets us map raw character sequences into more complex higher-level domain objects.

By the way, the types that have a `Select(...)` operation (or more colloquially known, a _map_ operation) are called _functors_. As you can see, they are not limited to collections (i.e. `IEnumerable<T>`) but can also be containers with a single value, just like our `Parser<T>` here.

With that out of the way, let's proceed to `JsonString`:

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<JsonString> JsonString =
        from open in Parse.Char('"')
        from value in Parse.CharExcept('"').Many().Text()
        from close in Parse.Char('"')
        select new JsonString(value);
}
```

Here you can see how we combined three consecutive parsers into one with the use of the LINQ query syntax. You are probably familiar with this syntax from working with collections, but it's a bit different here.

Each line beginning with `from` represents a separate parser that produces a value. We specify the name for the value on the left and define the actual parser on the right. To reduce the parsed values to a single result, we terminate with a `select` statement that constructs the object we want.

This works because chaining `from` statements internally calls the `SelectMany(...)` extension method, which the author of this library defined to work with `Parser<T>`.

Oh, and the types that let you do that with `SelectMany(...)` (also known as _flat map_) are what we call _monads_.

The parser we just wrote will try to match a double quote, followed by a (possibly empty) sequence of characters that doesn't contain a double quote, terminated by another double quote, ultimately returning a `JsonString` object with the text inside.

Moving on to our first non-primitive type, `JsonArray`:

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<JsonArray> JsonArray =
        from open in Parse.Char('[')
        from children in JsonEntity.Token().DelimitedBy(Parse.Char(','))
        from close in Parse.Char(']')
        select new JsonArray(children.ToArray());
}
```

Structurally, a JSON array is just a sequence of entities separated by commas, contained within a pair of square brackets. We can define that using the `DelimitedBy(...)` combinator which tries to match the first parser repeatedly separated by the second one.

If you've followed the steps here closely, you probably noticed that the code above doesn't actually compile. We're referencing `JsonEntity` which is a parser that we haven't defined yet. This is because this grammar rule is recursive — an array can contain any entity, which can be, among other things, an array as well, which can contain any entity, which can be an array, which... you get the point.

As a temporary solution, we can define a dummy in place of `JsonEntity`, just to make it compile (we will return to it later):

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<JsonArray> JsonArray =
        from open in Parse.Char('[')
        from children in JsonEntity.Token().DelimitedBy(Parse.Char(','))
        from close in Parse.Char(']')
        select new JsonArray(children.ToArray());

    public static readonly Parser<JsonEntity> JsonEntity = null;
}
```

Also, notice the `Token()` extension method? This wraps our parser in a higher-order parser that consumes all whitespace immediately around our input. As we know, JSON ignores whitespace unless it's within double quotes, so we need to account for that. If we don't do that, our parser will return an error when it encounters whitespace.

Parsing `JsonObject` is very similar, except it contains properties instead of raw entities. So we'll have to start with a parser for that first:

```csharp
internal static class JsonGrammar
{
    // ...

    private static readonly Parser<KeyValuePair<string, JsonEntity>> JsonProperty =
        from name in JsonString.Select(s => s.Value)
        from colon in Parse.Char(':').Token()
        from value in JsonEntity
        select new KeyValuePair<string, JsonEntity>(name, value);

    private static readonly Parser<JsonObject> JsonObject =
        from open in Parse.Char('{')
        from properties in JsonProperty.Token().DelimitedBy(Parse.Char(','))
        from close in Parse.Char('}')
        select new JsonObject(properties.ToDictionary(p => p.Key, p => p.Value));

    // ...
}
```

Since our model implements `JsonObject` using a dictionary, an individual property can be expressed using `KeyValuePair<string, JsonEntity>` — the name of the property (`string`) and its value (`JsonEntity`).

As you can see, we used the LINQ query syntax again to combine sequential parsers. A `JsonProperty` is made out of a `JsonString` for the name, a colon, and a `JsonEntity` which denotes its value. We use `Select(...)` on `JsonString` to lazily extract only the raw `string` value, as we're not interested in the object itself.

For the `JsonObject` parser, we pretty much wrote the same code as we did for `JsonArray`, replacing square brackets with curly braces and `JsonEntity` with `JsonProperty`.

Finally, having finished with each individual entity type, we can properly define `JsonEntity` by combining the parsers we wrote earlier:

```csharp
internal static class JsonGrammar
{
    // ...

    public static readonly Parser<JsonEntity> JsonEntity =
        JsonObject
            .Or<JsonEntity>(JsonArray)
            .Or(JsonString)
            .Or(JsonNumber)
            .Or(JsonBoolean)
            .Or(JsonNull);
}
```

And update the static method we have on `JsonEntity` class itself so that it calls the corresponding parser:

```csharp
public abstract class JsonEntity
{
    // ...

    public static JsonEntity Parse(string json) => JsonGrammar.JsonEntity.Parse(json);
}
```

That's it, we have a working JSON processor! We can now call `JsonEntity.Parse(...)` on any valid JSON text and transform it into our domain, i.e. a tree of `JsonEntity` objects.

## Wrapping up

Parsing doesn't have to be a daunting and unapproachable task. Functional programming helps us model complex grammar as a composition of smaller functions which are fairly easy to reason about. And luckily we can do it in C# as well!

If you're still thirsty for knowledge and want to see a slightly more complex example, check out [LtGt](https://github.com/Tyrrrz/LtGt/tree/csharp-sprache), an HTML processor (with CSS selectors!) that I've originally written using Sprache.

Should you wish to learn more about parsing in general, I recommend reading [Parsing in C#](https://tomassetti.me/parsing-in-csharp), an article by Gabriele Tomassetti.

There are also other monadic parser combinator libraries in .NET that you can check out, most notably [Superpower](https://github.com/datalust/superpower), [Pidgin](https://github.com/benjamin-hodgson/Pidgin), [Parsley](https://github.com/plioi/parsley), and [FParsec (F#)](https://github.com/stephan-tolksdorf/fparsec).

This article is largely based on my talk from .NET Fest 2019, Monadic parser combinators in C#. You can find the original presentation and full source code for the JSON parser [here](https://github.com/Tyrrrz/DotNetFest2019).
