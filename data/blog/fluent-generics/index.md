---
title: 'Fluent Generics in C#'
date: '2020-11-17'
---

Generic programming is a powerful feature available in many statically typed languages. It offers a way to write code that seamlessly operates against many different types, by targeting the features they share rather than the types themselves. This provides the means for building flexible and reusable components without having to sacrifice type safety or introduce unnecessary duplication.

Even though generics have been around in C# for a while, I still sometimes manage to find new and interesting ways to use them. For example, in one of my [previous articles](/blog/return-type-inference) I wrote about a trick I came up with that helps achieve target-type inference, providing an easier way to work with certain container types.

Recently, I was also working on some code involving generics and had an unusual challenge: I needed to define a signature where all type arguments were optional, but usable in arbitrary combinations with each other. Initially I attempted to do it by introducing type overloads, but that led to an impractical design that I wasn't very fond of.

After a bit of experimentation, I found a way to solve this problem elegantly by using an approach similar to the [_fluent interface_](https://en.wikipedia.org/wiki/Fluent_interface) design pattern, except applied in relation to types instead of objects. The design I arrived at features a domain-specific language that allows consumers to resolve the type they need, by "configuring" it in a sequence of logical steps.

In this article I will explain what this approach is about and how you can use it to organize complex generic types in a more accessible way.

## Fluent interfaces

In object-oriented programming, the _fluent interface_ design is a popular pattern for building flexible and convenient interfaces. Its core idea revolves around using method chaining to express interactions through a continuous flow of human-readable instructions.

Among other things, this pattern is commonly used to simplify operations that rely on large sets of (potentially optional) input parameters. Instead of expecting all the inputs upfront, interfaces designed in a fluent manner provide a way to configure each of the relevant aspects separately from each other.

As an example, let's consider the following code:

```csharp
var result = RunCommand(
    "git", // executable (required)
    "pull", // args (optional)
    "/my/repository", // working dir (optional)
    new Dictionary<string, string> // env vars (optional)
    {
        ["GIT_AUTHOR_NAME"] = "John",
        ["GIT_AUTHOR_EMAIL"] = "john@email.com"
    }
);
```

In this snippet, we are calling the `RunCommand(...)` method to spawn a child process and block execution until it completes. Relevant settings, such as command-line arguments, working directory, and environment variables are specified through the input parameters.

Although completely functional, the method invocation expression above is not very human-readable. At a glance, it's hard to even tell what each of the parameters does without relying on the comments.

Additionally, since most of the parameters are optional, the method definition has to account for it too. There are different ways to achieve that, including overloads, named parameters with default values, etc., but they are all rather clunky and offer suboptimal experience.

We can improve on this design, however, by reworking the method into a fluent interface:

```csharp
var result = new Command("git")
    .WithArguments("pull")
    .WithWorkingDirectory("/my/repository")
    .WithEnvironmentVariable("GIT_AUTHOR_NAME", "John")
    .WithEnvironmentVariable("GIT_AUTHOR_EMAIL", "john@email.com")
    .Run();
```

With this approach, the consumer can create a stateful `Command` object by specifying the required executable name, after which they may use the available methods to freely configure any additional options they need. The resulting expression is not only significantly more readable, but is also much more flexible as it's not constrained by the inherent limitations of method parameters.

## Fluent type definitions

At this point you may be curious how is any of that related to generics. After all, these are just functions, and we are supposed to be talking about the type system instead.

Well, the connection lies in the fact that **generics are also just functions, except for types**. In fact, you may consider a generic type as a special higher-order construct that resolves to a regular type after you supply it with the required generic arguments. This is analogous to the relationship between functions and values, where a function needs to be provided with the corresponding arguments to resolve to a concrete value.

Because of their similarity, generic types may also sometimes suffer from the same design issues. To illustrate this, let's imagine we're building a web framework and want to define an `Endpoint` interface responsible for mapping deserialized requests into corresponding response objects.

Such a type can be modeled using the following signature:

```csharp
public abstract class Endpoint<TReq, TRes> : EndpointBase
{
    // This method gets called by the framework
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}
```

Here we have a basic generic class that takes a type argument corresponding to the request it's meant to receive and another type argument that specifies the response format it's expected to provide. This class also defines the `ExecuteAsync(...)` method which the user will need to override to implement the logic relevant to a particular endpoint.

We can use this as the foundation to build our route handlers like so:

```csharp
public class SignInRequest
{
    public string Username { get; init; }
    public string Password { get; init; }
}

public class SignInResponse
{
    public string Token { get; init; }
}

public class SignInEndpoint : Endpoint<SignInRequest, SignInResponse>
{
    [HttpPost("auth/signin")]
    public override async Task<ActionResult<SignInResponse>> ExecuteAsync(
        SignInRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await Database.GetUserAsync(request.Username);

        if (!user.CheckPassword(request.Password))
        {
            return Unauthorized();
        }

        return Ok(new SignInResponse
        {
            Token = user.GenerateToken()
        });
    }
}
```

By inheriting from `Endpoint<SignInRequest, SignInResponse>`, the compiler automatically enforces the correct signature on the entry point method. This is very convenient as it helps avoid potential mistakes and also makes the structure of the application more consistent.

However, even though the `SignInEndpoint` fits perfectly in this design, not all endpoints are necessarily going to have both the request and response models. For example, an analogous `SignUpEndpoint` will likely just return a status code without any response body, while `SignOutEndpoint` may not even need a request model.

In order to properly accommodate endpoints like that, we could try to extend our model by adding a few additional generic type overloads:

```csharp
// Endpoint that expects a typed request and provides a typed response
public abstract class Endpoint<TReq, TRes> : EndpointBase
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}

// Endpoint that expects a typed request but does not provide a typed response (*)
public abstract class Endpoint<TReq> : EndpointBase
{
    public abstract Task<ActionResult> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}

// Endpoint that does not expect a typed request but provides a typed response (*)
public abstract class Endpoint<TRes> : EndpointBase
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        CancellationToken cancellationToken = default
    );
}

// Endpoint that neither expects a typed request nor provides a typed response
public abstract class Endpoint : EndpointBase
{
    public abstract Task<ActionResult> ExecuteAsync(
        CancellationToken cancellationToken = default
    );
}
```

At a glance, this may appear to have solved this problem, however the code above does not actually compile. The reason for that is the fact that the `Endpoint<TReq>` and `Endpoint<TRes>` are ambiguous, since there is no way to determine whether a single unconstrained type argument is meant to specify a request or a response.

Just like with the `RunCommand(...)` method earlier in the article, there are a couple of straightforward ways to work around this, but they are not particularly elegant. For example, the simplest solution would be to rename the types so that their capabilities are reflected in their names, avoiding collisions in the process:

```csharp
public abstract class Endpoint<TReq, TRes> : EndpointBase
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}

public abstract class EndpointWithoutResponse<TReq> : EndpointBase
{
    public abstract Task<ActionResult> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}

public abstract class EndpointWithoutRequest<TRes> : EndpointBase
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        CancellationToken cancellationToken = default
    );
}

public abstract class Endpoint : EndpointBase
{
    public abstract Task<ActionResult> ExecuteAsync(
        CancellationToken cancellationToken = default
    );
}
```

This addresses the issue, but results in a rather ugly design. Because half of the types are named differently, the user of the library might have a harder time finding them or even knowing about their existence in the first place. Moreover, if we consider that we may want to add more variants in the future (e.g. non-async handlers in addition to async), it also becomes clear that this approach doesn't scale very well.

Of course, all the problems above may seem a bit contrived and there might be no reason to attempt to solve them. However, I personally believe that optimizing developer experience is an extremely important aspect of writing library code.

Luckily, there is a better solution that we can use. Drawing on the parallels between functions and generic types, we can get rid of our type overloads and replace them with a fluent schema instead:

```csharp
public static class Endpoint
{
    public static class WithRequest<TReq>
    {
        public abstract class WithResponse<TRes>
        {
            public abstract Task<ActionResult<TRes>> ExecuteAsync(
                TReq request,
                CancellationToken cancellationToken = default
            );
        }

        public abstract class WithoutResponse
        {
            public abstract Task<ActionResult> ExecuteAsync(
                TReq request,
                CancellationToken cancellationToken = default
            );
        }
    }

    public static class WithoutRequest
    {
        public abstract class WithResponse<TRes>
        {
            public abstract Task<ActionResult<TRes>> ExecuteAsync(
                CancellationToken cancellationToken = default
            );
        }

        public abstract class WithoutResponse
        {
            public abstract Task<ActionResult> ExecuteAsync(
                CancellationToken cancellationToken = default
            );
        }
    }
}
```

The above design retains the original four types from earlier, but organizes them in a hierarchical structure rather than a flat one. This is possible to achieve because C# allows type definitions to be nested within each other, even if they are generic.

In fact, **types contained within generics are special because they also gain access to the type arguments specified on their parent**. It lets us put `WithResponse<TRes>` inside `WithRequest<TReq>` and use both `TReq` and `TRes` to define the inner `ExecuteAsync(...)` method.

Functionally, the approach shown above and the one from earlier are identical. However, the unconventional structure employed here completely eliminates all discoverability issues, while still offering the same level of flexibility.

Now, if the user wanted to implement an endpoint, they would be able to do it like this:

```csharp
public class MyEndpoint
    : Endpoint.WithRequest<SomeRequest>.WithResponse<SomeResponse> { /* ... */ }

public class MyEndpointWithoutResponse
    : Endpoint.WithRequest<SomeRequest>.WithoutResponse { /* ... */ }

public class MyEndpointWithoutRequest
    : Endpoint.WithoutRequest.WithResponse<SomeResponse> { /* ... */ }

public class MyEndpointWithoutNeither
    : Endpoint.WithoutRequest.WithoutResponse { /* ... */ }
```

And here is how the updated `SignInEndpoint` would look like:

```csharp
public class SignInEndpoint : Endpoint
    .WithRequest<SignInRequest>
    .WithResponse<SignInResponse>
{
    [HttpPost("auth/signin")]
    public override async Task<ActionResult<SignInResponse>> ExecuteAsync(
        SignInRequest request,
        CancellationToken cancellationToken = default)
    {
        // ...
    }
}
```

As you can see, this approach leads to a very expressive and clean type signature. Regardless of what kind of endpoint the user wanted to implement, they would always start from the `Endpoint` class and compose the capabilities they need in a fluent and human-readable manner.

Besides that, since our type structure essentially represents a finite state machine, it's safe against accidental misuse. For example, the following incorrect attempts to create an endpoint all result in compile-time errors:

```csharp
// Incomplete signature
// Error: Class Endpoint is sealed
public class MyEndpoint : Endpoint { /* ... */ }

// Incomplete signature
// Error: Class Endpoint.WithRequest<TReq> is sealed
public class MyEndpoint : Endpoint.WithRequest<MyRequest> { /* ... */ }

// Invalid signature
// Error: Class Endpoint.WithoutRequest.WithRequest<T> does not exist
public class MyEndpoint : Endpoint.WithoutRequest.WithRequest<MyRequest> { /* ... */ }
```

## Summary

Although generic types are incredibly useful, their rigid nature can make them difficult to consume in some scenarios. In particular, when we need to define a signature that encapsulates multiple different combinations of type arguments, we may resort to overloading, but that imposes certain limitations.

As an alternative solution, we can nest generic types within each other, creating a hierarchical structure that allows users to compose them in a fluent manner. This provides the means to achieve much greater customization, while still retaining optimal usability.
