---
title: 'Parsing in F# with FParsec'
date: '2020-01-04'
---

Two months ago I wrote an article about [Monadic Parser Combinators in C#](/blog/monadic-parser-combinators) and how you can use this approach to express complex recursive grammar. To extend this topic a bit, I also wanted to show how the same approach can be applied in a functional-first language such as F#.

FParsec may not be the only, but is definitely the most popular F# framework for building parsers. Designed as a clone to Haskell's [Parsec](https://github.com/haskell/parsec), with which it shares a very similar API, this library is focused on high throughput and human-readable error messages.

As a personal learning exercise, I've decided to port [LtGt](https://github.com/Tyrrrz/LtGt) from [Sprache](https://github.com/sprache/Sprache) to [FParsec](https://github.com/stephan-tolksdorf/fparsec). Just by simply rewriting the same rules in a new framework, I saw a [7.35x performance improvement](https://twitter.com/Tyrrrz/status/1205966639352684544), which is pretty impressive!

In this article I'll guide you through the basics of this library and show how you can write parsers with it.

## Parser primitives

Every parser in FParsec is an instance of `Parser<'Result, 'State>` which is a type of function that takes a `CharStream<'State>` and returns a `Reply<'Result>`. Yes, parsers in FParsec can have state which means you can express context-sensitive grammar, but I'm not going to talk about it here. All we need to know is that a parser is a function that takes an input and produces a result or a failure.

Similarly to Sprache and other parser combinator libraries, FParsec builds upon a set of powerful primitives. These are accessible as top-level functions and provide starting points for even the most complicated parsers.

Among these are:

- `anyChar` — parses any single character
- `pchar` — parses a specific character
- `anyOf` — parses any of the specified characters
- `satisfy` — parses any character that satisfies a predicate
- `letter`, `digit`, `upper`, `lower` — parses a character that belongs to a specific category
- `pstring` — parses a specified string

These can be used to parse basic inputs but, being primitives, they are obviously not very useful on their own. In order to compose these simple parsers into more sophisticated ones, we need to use combinators.

In essence, combinators are just functions that take existing parsers as parameters and construct new, enhanced versions of them. I personally like to divide them into three logical groups:

- Chaining combinators
- Grouping combinators
- Mapping combinators

Let's take a look at some of them.

## Chaining multiple parsers

At the base of all chaining combinators in FParsec stands the _bind_ operator (`>>=`). It constructs a new parser based on the result of the previous one.

We can use the bind operator to chain multiple sequential parsers and combine them into a higher-order parser. As a simple example, here's how we can express two consecutive characters that appear in opposite cases:

```fsharp
open FParsec

let isOppositeCase a b = isUpper a <> isUpper b

let sawtooth = anyChar >>= fun a -> satisfy <| isOppositeCase a >>= fun b -> preturn (a, b)
//             ~~~~~~~              ~~~~~~~    ~~~~~~~~~~~~~~~~              ~~~~~~~~~~~~~~
// parse any char --^                  ^         ^                              ^
//                                     |         |                              |
// then any char satisfying predicate —           — partially applied function  |
//                                                                              |
//             then combine the results in a tuple ------------------------------
```

The parser `sawtooth` will succeed on inputs such as `"aB"`, `"Aa"`, `"dP"` and similar, but will fail on `"ab"`, `"AA"`, `"dp"`.

Although it is quite flexible, the bind operator isn't very convenient to use. It's too verbose and, unlike this particular case, we rarely need the result of the previous parser to construct the next one.

This is why FParsec also offers a few high level chaining operators:

- `.>>` — chains two sequential parsers and retains the result of the one on the left
- `>>.` — chains two sequential parsers and retains the result of the one on the right
- `.>>.` — chains two sequential parsers and combines both of their results in a tuple

For example, here's how we can compose a parser that will consume `"5,9"` and turn it into an F# tuple consisting of characters `'5'` and `'9'`, discarding the comma in the middle:

```fsharp
let commaSeparatedDigits = digit .>> pchar ',' .>>. digit
```

Individual parsers in the expression are chained pairwise left to right. Here's the same code but with parentheses highlighting how it works:

```fsharp
let commaSeparatedDigits = ((digit .>> pchar ',') .>>. digit)
//                           ~~~~~ ^              ^  ^ ~~~~~
//                                 |              |  |
//   take result of the left side —                ---- take both
```

We can further improve this by using `skipChar` instead of `pchar` to avoid unnecessary allocation of the result that we're not interested in:

```fsharp
let commaSeparatedDigits = digit .>> skipChar ',' .>>. digit
```

This kind of parser chaining can be useful to express grammar rules with a fixed structure. Sometimes, however, we also need to express repetition, which is when a certain symbol may appear more than once. To do that, we can use one of the sequence combinators that FParsec offers:

- `many` — chains the same parser until it fails
- `sepBy` — chains the same parser separated by another parser
- `manyTill` — chains the same parser until another parser succeeds
- `manyChars`, `manyCharsTill` — same as `many` and `manyTill` but optimized for strings

For example, we can use `manyChars` to enhance the original `commaSeparatedDigits` parser so that it can handle multiple consecutive digits around the comma:

```fsharp
let commaSeparatedDigits = manyChars digit .>> skipChar ',' .>>. manyChars digit
//                         ~~~~~~~~~~~~~~~                       ~~~~~~~~~~~~~~~
//                              ^--  take many digits instead of one  --^
//                                    (manyChars produces a string)
```

This will now work on inputs such as `"1337,69"`, producing a tuple of strings instead of characters. We can also change it a bit and use `sepBy` so that it can handle an arbitrary number of digits separated by commas:

```fsharp
let manyCommaSeparatedDigits = manyChars digit |> sepBy <| skipChar ','
//                                                ~~~~~~~~~~~~~~~~~~~~~
//        apply the parser many times separated by commas --^
```

If we run the last parser on `"5,96,10"` we will get a matching list of strings `["5"; "96"; "10"]`, which we can operate on.

I like to apply F#'s forward and backward pipes in compositions like this because it makes the parsers more readable — the expression above is equivalent to `sepBy (manyChars digit) (skipChar ',')`.

Note that the parsers created with these sequence combinators will always succeed — if the parser `x` fails, `many x` will simply produce an empty list. If you need the underlying parser to succeed at least once, you can use the non-empty variants of these combinators instead: `many1`, `sepBy1`, `many1Chars`, etc.

## Grouping alternatives

Another way we can combine parsers is by grouping them. This lets us defer complex grammar rules to multiple separate parsers.

We can do this with the _choice_ operator (`<|>`). For example, to combine `letter` and `digit` into one parser, we may write:

```fsharp
let letterOrDigit = letter <|> digit
```

The above parser will succeed on `"a"`, `"B"` as well as `"0"`, `"4"`. Similarly, we can write a parser for a string that contains only letters or digits:

```fsharp
let alphanumericString = manyChars (letter <|> digit)
```

Of course, we can also chain the choice operator multiple times to provide more than two alternatives:

```fsharp
let letterOrDigitOrSpecial = letter <|> digit <|> pchar '*' <|> pchar '#' <|> pchar '%'
```

When we're dealing with many alternatives, however, it's better to use the `choice` function instead. It's an optimized version of the `<|>` operator that takes multiple parsers as a sequence:

```fsharp
let letterOrDigitOrSpecial =
    choice [
        letter
        digit
        pchar '*'
        pchar '#'
        pchar '%'
    ]
```

Not only is the parser above going to work on a bunch of different inputs, it will also produce informative error messages if the parser fails. For example, if we try to use it to parse `"!"`, it will say:

```javascript
Failure:
Error in Ln: 1 Col: 1
!
^
Expecting: decimal digit, letter, '#', '%' or '*'
```

An important thing to note about choice combinators in FParsec is that all of them are non-backtracking by default. This ensures the path of the least resistance for writing high performance code but may lead to slightly unexpected results.

For example, in the following snippet one of the alternative parsers (`fooXyz`) will never be evaluated:

```fsharp
let fooBar = pstring "foo" .>>. pstring "bar"
let fooXyz = pstring "foo" .>>. pstring "xyz"

let fooBarOrFooXyz =
    choice [
        fooBar
        fooXyz
    ]

// Input:         fooxyz
//                ~~~===
//                  ^  ^
// fooBar:          |  |
// 1. take "foo" ----  |   success, change state
// 2. take "bar" -------   error: expected "bar", found "xyz"
//
// fooXyz will not be tried because fooBar changed state
```

Trying to run `fooBarOrFooXyz` on `"fooxyz"` will fail, but will work well with `"foobar"`. This is because the underlying parser `fooBar` _partially_ succeeds on `"fooxyz"` and changes the parser state.

To instruct FParsec to backtrack in such cases, we can wrap the individual parsers in `attempt` which will reset the state after the underlying parser fails:

```fsharp
let fooBar = pstring "foo" .>>. pstring "bar"
let fooXyz = pstring "foo" .>>. pstring "xyz"

let fooBarOrFooXyz =
    choice [
        attempt fooBar
        attempt fooXyz
    ]

// Input:         fooxyz
//                ~~~===
//                  ^  ^
// fooBar:          |  |
// 1. take "foo" ----  |   success, change state
// 2. take "bar" -------   error: expected "bar", found "xyz"
// 3. reset state
//
//                fooxyz
//                ~~~~~~
//                  ^  ^
// fooXyz:          |  |
// 1. take "foo" ----  |   success, change state
// 2. take "xyz" -------   success, change state
// 3. produce result: ("foo", "xyz")
```

This will work as expected. Of course, you should use `attempt` sparingly to avoid unnecessary backtracking. Alternatively, it's also possible to selectively avoid changing the parser state by using the following variant of the chaining combinator:

```fsharp
let fooBar = pstring "foo" .>>.? pstring "bar"
let fooXyz = pstring "foo" .>>.? pstring "xyz"
//   state won't change here --^

// ...so backtracking is not necessary
let fooBarOrFooXyz =
    choice [
        fooBar
        fooXyz
    ]
```

These variants of chaining combinators are just like the regular ones, except that the constructed parser is treated as a single whole instead of two separate parsers:

- `>>=?` — same as `>>=` but doesn't change state
- `>>?` — same as `>>.` but doesn't change state
- `.>>?` — same as `.>>` but doesn't change state
- `.>>.?` — same as `.>>.` but doesn't change state

## Mapping results

Let's not forget that the main purpose of a parser is to extract semantics from text. In programming terms, that means converting raw character strings to some domain types.

There are two main operators associated with that:

- Return operator (`>>%`) — sets the result of a parser to the specified value
- Map operator (`|>>`) — applies a function to the result of a parser

We can use the return operator to construct a parser that will simply produce a constant if it succeeds:

```fsharp
type ShapeType = Circle | Rectangle

// This parser produces ShapeType
let shapeType =
    choice [
        skipString "circle" >>% Circle
        skipString "rectangle" >>% Rectangle
    ]
```

Combination of `skipString` and `>>%` is so common that it also has its own optimized shorthand `stringReturn`:

```fsharp
let shapeType =
    choice [
        stringReturn "circle" Circle
        stringReturn "rectangle" Rectangle
    ]
```

The example parser above will turn `"circle"` into `ShapeType.Circle` and `"rectangle"` into `ShapeType.Rectangle`.

To perform more complex conversions, we can use the map operator which lets us transform the result using a function. For example, here we map a tuple into our own domain type:

```fsharp
// Single-case union
type NameValuePair = NameValuePair of string * string

// Parses: name=value;
let nameValuePair =
    (anyChar |> manyCharsTill <| skipChar '=')  // take a string of any chars until equals sign
    .>>.
    (anyChar |> manyCharsTill <| skipChar ';')  // take a string of any chars until semicolon
    |>> NameValuePair                           // map the tuple to a domain type
```

The reason we were able to simply write `|>> NameValuePair` is because the type's constructor expects a tuple of two strings, which is exactly what we're supplying it with. In a general form we can use any function:

```fsharp
let nameValuePair =
    (anyChar |> manyCharsTill <| skipChar '=')
    .>>.
    (anyChar |> manyCharsTill <| skipChar ';')
    |>> fun (name, value) -> NameValuePair (name, value)
//           ~~~~  ~~~~~
//            ^      ^
//            |      |
//      deconstructed tuple
```

## Parsing JSON

There are still a lot of other primitives and combinators in FParsec. In fact, with around [200 of them in total](https://quanttec.com/fparsec/reference/parser-overview.html), covering them all here would be both ambitious and unnecessary.

Instead, let's take a look at how it all fits together by writing our own JSON parser.

I know that the official documentation has a tutorial on exactly this topic and on top of that I've already shown how to write a JSON processor in C# using Sprache in my previous article. That being said, I think JSON grammar has the perfect mixture of small and non-trivial rules that make it a pretty good "hello world" exercise for parser frameworks.

Before we can begin, however, we have to establish what is it that we want our parsers to produce. Since we're dealing with JSON, being a typical context-free language, its structure can be expressed using a syntax tree.

Thanks to F#'s recursive discriminated unions, defining ASTs is really trivial:

```fsharp
namespace MyJsonProcessor

type JsonNode =
    // Literals
    | JsonNull                            // null
    | JsonBool of bool                    // true | false
    | JsonNumber of float                 // 10 | 5.63
    | JsonString of string                // "foobar"
    // Complex types
    | JsonArray of List<JsonNode>         // [ "hello", 10, true ]
    | JsonObject of Map<string, JsonNode> // { "count": 4, "items": [5, 1, -8, 3.14] }
```

These will represent the individual nodes in the tree, and later we're going to add some logic to navigate through the hierarchy.

Let's create a new module called `JsonGrammar` in the same file. The functions in this module will represent individual grammar rules, so their names will match those of the actual data types but with camel case instead.

The first parser that we'll write is going to be `jsonNull`, which is really easy:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    open FParsec

    let jsonNull = stringReturn "null" JsonNull .>> spaces
    //                           ~~~~  ~~~~~~~~     ~~~~~~
    //                            ^        ^           ^-- skip trailing whitespace
    //                            |        |
    //                match this —        — produce this
```

We are using `stringReturn` to consume a string `"null"` and return the corresponding value — the union case `JsonNull`.

Since whitespace is ignored in JSON, we have to also account for it in our parsers or else they will fail when they encounter any whitespace character. We can do that by chaining our parser with `spaces` which will consume and discard any trailing spaces. As long as we do that at the end of every parser, we will be fine.

The traditional way of dealing with insignificant whitespace involves writing a separate _lexer_ component, which parses raw characters into so-called _tokens_. It can be done with FParsec as well, and it provides many benefits, but for the sake of simplicity we'll be writing a scanner-less parser this time.

If you're following along and your IDE is complaining that the type of parser can't be inferred — help it by explicitly specifying it as `let jsonNull : Parser<_, unit> = ...`. We're not going to be using state, so we can set it to `unit`. By the end of this exercise we will have an entry point function that will help the F#'s compiler correctly determine the generic types, but for now we can write them out manually.

With `JsonNull` out of the way, let's proceed on to our next data type, `JsonBool`:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    let jsonBoolTrue = stringReturn "true" <| JsonBool true .>> spaces
    let jsonBoolFalse = stringReturn "false" <| JsonBool false .>> spaces

    let jsonBool = jsonBoolTrue <|> jsonBoolFalse
```

Since a boolean can be in either of two states, we can handle them separately and combine them using the choice operator. This is an advantage of combinatory parsing — we can split complex grammar rules into many simpler ones.

When it comes to `jsonNumber`, FParsec already does most of the work by providing us with `pfloat`, a parser that matches text that represents a floating point number and converts it to `float` (which is an alias for `System.Double` in F#). That means we can just write our parser like this:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    let jsonNumber = pfloat .>> spaces |>> JsonNumber
```

Note how we used the map operator (`|>>`) in the parser above. This takes the result of `pfloat` and pipes it into `JsonNumber`'s constructor, which conveniently expects a `float`.

Moving on to `JsonString`, where we need to handle text of any length between two double quotes. To make our life easier we can introduce a few helper functions:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    // Applies popen, then pchar repeatedly until pclose succeeds,
    // returns the string in the middle.
    let manyCharsBetween popen pclose pchar = popen >>? manyCharsTill pchar pclose

    // Parses any string between popen and pclose
    let anyStringBetween popen pclose = manyCharsBetween popen pclose anyChar

    // Parses any string between double quotes
    let quotedString = skipChar '"' |> anyStringBetween <| skipChar '"'
    // ^ this is also equivalent to: anyStringBetween (skipChar '"') (skipChar '"')
```

The combinator `manyCharsBetween` applies `popen`, then repeatedly applies `pchar` until it encounters `pclose`. We build upon it and define a higher-level combinator `anyStringBetween` which will parse a string between two parsers consisting of any characters. It's effectively the same as the `.*?` regular expression.

Finally, we also define `quotedString` which is `anyStringBetween` with double quotes already applied. Note how the use of the forward and backward pipes makes the code fluent — the order of tokens in this expression actually matches the order in which the parser consumes them!

Now, defining `jsonString` becomes really trivial:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    let jsonString = quotedString .>> spaces |>> JsonString
```

Ok, to be fair this doesn't handle escape sequences like `\t`, `\n`, etc. which are allowed in JSON strings. Handling those is not very interesting, so I will cheat here by claiming that this is left as an exercise for the reader. 🙂

With all the literals out of the way, we can group them into a single parser. This is not necessary, but it makes it slightly easier to reason about the grammar.

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    let jsonLiteral =
        choice [
            jsonNull
            jsonBool
            jsonNumber
            jsonString
        ]
```

Our two remaining cases, `JsonArray` and `JsonObject`, are slightly more complicated. That's because the corresponding grammar rules are recursive — arrays and objects can both be nested within each other.

What makes it harder is that the order of declarations in a file matters in F# as opposed to C#. This means we can't reference a parser if it hasn't been defined above, so it's not possible to introduce a cyclic recursion that easily.

FParsec provides its own way to work around this problem with the `createParserForwardedToRef` function. We can use it to construct a dummy `jsonNode` parser, which we can later update using its reference:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    let jsonNode, jsonNodeRef = createParserForwardedToRef()
```

At this point we can temporarily pretend that `jsonNode` is already defined and will evaluate any valid JSON node, including arrays and objects.

Now let's parse an array which is an enumeration of comma-separated items contained within square brackets. Each item in an array can be any literal, an object, or another array as well — or in other words, any node.

We can define a helper function called `manyContained` which will take care of the list inside the brackets. With that, the implementation of `jsonArray` looks like this:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    // Parses: popen p psep p psep p psep ... p pclose
    let manyContained popen pclose psep p = between popen pclose <| sepBy p psep

    let jsonArray =
        jsonNode                       // parse JSON nodes...
        |> manyContained               // contained within...
            (skipChar '[' .>> spaces)  // opening square bracket...
            (skipChar ']' .>> spaces)  // and closing square bracket...
            (skipChar ',' .>> spaces)  // separated by commas
        |>> JsonArray
```

The combinator `between popen pclose p` is an optimized version of `popen >>. p .>> pclose`. We pipe `sepBy` into it, which will apply a parser repeatedly using a separator. By combining these two combinators, we get a yet another combinator which will apply an opening parser, then the main parser delimited by the separator parser, and finally the closing parser.

Ultimately, the implementation of `jsonArray` comes down to just passing the correct arguments to our helper function.

Dealing with `JsonObject` is pretty similar except that we have to parse an enumeration of properties instead of just nodes. A property in JSON is a quoted string followed by a colon and a value. Conveniently, we've already defined a useful combinator called `quotedString` when we were writing `jsonString` earlier, which we can now use like so:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    // Produces a tuple: (string, JsonNode)
    let jsonProperty =
        quotedString .>> spaces .>> skipChar ':' .>> spaces .>>. jsonNode .>> spaces

    let jsonObject =
        jsonProperty
        |> manyContained
            (skipChar '{' .>> spaces)
            (skipChar '}' .>> spaces)
            (skipChar ',' .>> spaces)
        |>> Map.ofList
        |>> JsonObject
```

Finally, now that we have parsers for all types of nodes defined, we can actually implement `jsonNode` using its reference we've obtained earlier:

```fsharp
namespace MyJsonProcessor

// ...

module JsonGrammar =

    // ...

    do jsonNodeRef :=
        choice [
            jsonObject
            jsonArray
            jsonLiteral
        ]
```

Tada! Our parser is technically complete. To test it out, we can use the `run` function to evaluate a parser on a string:

```fsharp
[<EntryPoint>]
let main _ =
    run jsonNode "{ \"arr\": [1, 3.14, false, null] }" |> printfn "%O"
    0

// Prints:
Success: JsonObject
  (map
     [("arr",
       JsonArray [JsonNumber 1.0; JsonNumber 3.14; JsonBool false; JsonNull])])
```

Of course, a JSON processor isn't very useful if it doesn't have any means for querying data. To that end, let's create another module and add some business logic:

```fsharp
namespace MyJsonProcessor

// ...

module Json =

    open FParsec

    /// Tries to parse a string as a JSON node.
    let tryParse source =
        // Discard leading whitespace and ensure the parser reaches end of stream
        let jsonNodeFull = spaces >>. JsonGrammar.jsonNode .>> eof

        // Run parser and convert FParsec's result to F#'s standard result
        match run jsonNodeFull source with
        | Success (res, _, _) -> Result.Ok res
        | Failure (err, _, _) -> Result.Error err

    /// Tries to extract a boolean value from a node.
    let tryBool (node : JsonNode) =
        match node with
        | JsonBool b -> Some b
        | _ -> None

    /// Tries to extract a string value from a node.
    let tryString (node : JsonNode) =
        match node with
        | JsonString s -> Some s
        | _ -> None

    /// Tries to extract a float value from a node.
    let tryFloat (node : JsonNode) =
        match node with
        | JsonNumber n -> Some n
        | _ -> None

    /// Tries to extract an int value from a node.
    let tryInt (node : JsonNode) =
        node |> tryFloat |> Option.map int

    /// Tries to get an item by its index.
    let tryItem (i : int) (node : JsonNode) =
        match node with
        | JsonArray a -> a |> List.tryItem i
        | _ -> None

    /// Tries to get a child node by its name.
    let tryChild (name : string) (node : JsonNode) =
        match node with
        | JsonObject o -> o |> Map.tryFind name
        | _ -> None
```

By defining our own `tryParse` function, we hide FParsec's API behind a layer of abstraction so that our library is slightly easier to use. We also wrap the original `jsonNode` in a parser that will discard leading whitespace and ensure that the end of the stream has been reached — the latter is important because we don't want to only partially parse the input.

Functions `tryBool`, `tryString`, `tryFloat`, `tryInt` make it easier to extract values without having to do pattern matching yourself. To make it simpler to work with objects and arrays, there's also `tryChild` which will get an object child by its name and `tryItem` which will get an array item by its index.

Let's put it all together and test it on some real input:

```fsharp
[<EntryPoint>]
let main _ =
    let str = """
    {
        "quiz": {
            "sport": {
                "q1": {
                    "question": "Which one is correct team name in NBA?",
                    "options": [
                        "New York Bulls",
                        "Los Angeles Kings",
                        "Golden State Warriors",
                        "Huston Rocket"
                    ],
                    "answer": "Huston Rocket"
                }
            },
            "math": {
                "q1": {
                    "question": "5 + 7 = ?",
                    "options": [
                        "10",
                        "11",
                        "12",
                        "13"
                    ],
                    "answer": "12"
                },
                "q2": {
                    "question": "12 - 8 = ?",
                    "options": [
                        1,
                        2,
                        3,
                        4
                    ],
                    "answer": 4
                }
            }
        }
    }
    """

    // Get the value of quiz.sport.q1.options[2]
    match Json.tryParse str with
        | Ok result ->
            result
            |> Json.tryChild "quiz"
            |> Option.bind (Json.tryChild "sport")
            |> Option.bind (Json.tryChild "q1")
            |> Option.bind (Json.tryChild "options")
            |> Option.bind (Json.tryItem 2)
            |> Option.bind (Json.tryString)
            |> Option.iter (printfn "Value: %s")
            0
        | Error err ->
            printfn "Parsing failed: %s" err
            1
```

Once we run this piece of code, we should see `Value: Golden State Warriors`. Awesome, we've verified that our parser works and made a pretty simple but useful API around it.

## Monadic syntax

If you've come here after my previous article or were otherwise expecting to see monads here, you might be a bit surprised that there was no use of the monadic syntax. This is because the combinators FParsec provides out of the box are so powerful you very rarely need to resort to it.

However, we could have, for example, defined our JSON array parser from earlier like this instead:

```fsharp
let jsonArray = parse {
    // [
    do! skipChar '['
    do! spaces

    // ...
    let! items = sepBy jsonNode <| (skipChar ',' .>> spaces)

    // ]
    do! skipChar ']'
    do! spaces

    return JsonArray items
}
```

The `parse` computation expression allows us to chain sequential parsers in a more imperative way. Under the hood it also uses the bind operator (`>>=`) but provides a slightly cleaner syntax when dealing with a large number of parsers. If you've used monads in C#, this is similar to the LINQ query syntax but way more powerful.

Stephan Tolksdorf, the author of FParsec, discourages the use of this syntax [in the documentation](https://quanttec.com/fparsec/users-guide/where-is-the-monad.html) because it's rarely necessary and may negatively impact performance.

That said, some grammar rules are easier to express using this syntax. For example, let's say we were parsing an HTML element and needed to match a closing tag that has the same name as the opening tag:

```fsharp
let htmlElement = parse {
    // <div ...>
    do! skipChar '<'
    let! tagName = manyChars (letter <|> digit)
    do! spaces

    let! attributes = many attribute
    do! spaces

    do! skipChar '>'
    do! spaces

    // ...
    let! children = many elementChild

    // </div>
    do! skipString "</"
    do! skipString tagName // use the result of the earlier parser
    do! spaces

    do! skipChar '>'
    do! spaces

    return HtmlElement (tagName, attributes, children)
}
```

Writing the same thing using binds may not be as pleasant.

## Summary

FParsec is an incredibly robust framework for building parsers with the combinatorial approach. With some careful fine-tuning, parsers written with this library may even outperform traditional hand-rolled parsers. If you're using .NET and want to build a text processor, compiler, or a DSL interpreter — FParsec is likely a no-brainer.

Should you ever get stuck, I recommend reading the [API reference](https://quanttec.com/fparsec/reference/parser-overview.html) and the [user guide](https://quanttec.com/fparsec/users-guide).

In case you're curious to see some other examples of FParsec in action, check out [the official samples](https://github.com/stephan-tolksdorf/fparsec/tree/master/Samples). There are also some open-source projects that depend on this library, like [GraphQL.NET](https://github.com/chkimes/graphql-net), [QSharp Compiler](https://github.com/microsoft/qsharp-compiler), and [LtGt](https://github.com/Tyrrrz/LtGt).

Other articles about FParsec: [by Jake Witcher](https://codefornerds.com/better-parsing-with-fsharp-and-fparsec-getting-started), [by Phillip Trelford](https://trelford.com/blog/post/FParsec.aspx), [by Tamizh Vendan](https://blog.tamizhvendan.in/blog/2015/01/18/step-5-advanced-search-dsl-using-fparsec).
