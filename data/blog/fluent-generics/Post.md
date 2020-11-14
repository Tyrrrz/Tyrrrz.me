---
title: 'Fluent Generics in C#'
date: '2020-11-25'
tags:
  - 'dotnet'
  - 'csharp'
---

Generics is a powerful feature available in many statically typed languages. It offers a way to write code that seamlessly operates against many different types, by targeting the features they share rather than the types themselves. This provides the means for building flexible and reusable components without having to sacrifice type safety or introduce unnecessary duplication.

Even though generics have been around in C# for a while, I still sometimes manage to find new and interesting ways to use them. For example, in one of my [previous articles](/blog/return-type-inference) I wrote about a trick I came up with that helps achieve return type inference for generics, providing an easier way to work with container union types.

Recently, I was also working on some code involving generics and had an unusual challenge: I needed to define a signature where all type arguments were optional, but usable in arbitrary combinations and arities. Initially I attempted to do it by introducing type overloads, but that led to an impractical design that I wasn't very fond of.

After a bit of experimentation, I found a way to solve this problem elegantly by using an approach similar to the [_fluent interface_](https://en.wikipedia.org/wiki/Fluent_interface) design pattern, except applied in relation to types instead of objects. The design I arrived at features a domain-specific language that allows consumers to resolve the type they need by "configuring" it in a sequence of logical steps.

In this article, I will show what this approach is all about, how it helped me solve my original issue, as well as some other scenarios where I think it may be useful.

## Fluent interfaces

In object-oriented programming, _fluent interface_ design is a popular pattern for building flexible and convenient interfaces. Its core idea revolves around using method chaining to express interactions through a continuous flow of human-readable instructions.

Among other things, this pattern is commonly used to simplify operations that rely on large sets of (potentially optional) input parameters. Instead of expecting all of the inputs upfront, interfaces designed in a fluent manner provide a way to configure each of the relevant aspects separately from each other.

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

In this snippet, we are calling the `RunCommand` method to spawn a child process and block until it completes. Relevant settings, such as command line arguments, working directory, and environment variables are specified through input parameters.

Although completely functional, the method invocation expression above is not very human-readable. At a glance, it's hard to even tell what each of the parameters does without relying on code comments.

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

With this approach, the consumer can create a stateful `Command` object by specifying the required executable name, after which they may use the available methods to freely configure additional options they may need. The resulting expression is not only significantly more readable, but is also much more flexible due to not being constrained by the inherent limitations of method parameters.

## Fluent type definitions

At this point you may be curious how is any of that related to generics. After all, these are just functions and we are supposed to be talking about extending the type system instead.

Well, the interesting thing is that **generics are just functions, except for types**. In fact, you may consider a generic type as a special higher-order construct that resolves to a regular type after you supply it with the required generic arguments. This is analogous to the relationship between functions and values, where a function needs to be provided with the corresponding arguments to resolve to a concrete value.

Because of their similarity, using generic types can also sometimes be inconvenient in much the same way. As an example, let's imagine we're building a web framework and want to define an `Endpoint` type, which represents an entry point through which the user can send HTTP requests and receive responses.

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

Here we have a basic generic class which takes a type argument corresponding to the request object it's meant to receive and another type argument that specifies the response format it's expected to provide. This type defines the `ExecuteAsync` which the user will need to override to implement the logic relevant to a particular endpoint.

We can use this as foundation to implement our route handlers like so:

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

By inheriting from `Endpoint<SignInRequest, SignInResponse>`, the compiler automatically enforces the matching signature on our `ExecuteAsync` method. This is very convenient as it helps avoid potential mistakes and makes the structure of the application more consistent.

However, even though the `SignInEndpoint` fits perfectly in this design, not all endpoints are going to need a request and response. For example, an analogous `SignUpEndpoint` will likely not provide a response beyond a status code, while `SignOutEndpoint` won't even expect a specific request either.

In order to properly support endpoints like that, we could try to extend our model by adding a few additional generic type overloads:

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

At a glance, this may appear to have solved this problem, however the code above does not compile. The reason for that is the fact that the `Endpoint<TReq>` and `Endpoint<TRes>` are ambiguous, since there is no way to determine whether a single provided type argument specifies a request or a response.

Just like with the `RunCommand` method earlier in the article, there are a couple ways to solve this, but they are not nice. For example, the most straightforward approach would be to change the types so that their capabilities are reflected in the name:

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

This addresses the issue, but creates another one in its place: now some of the types are less discoverable than they were before, due to being named differently. If you consider that we may also want to have additional overloads for non-async variants of the method, this can end up being a significant drawback.

Now, of course, it may seem like a rather contrived problem and there might be no reason to attempt to solve it. However, I personally believe that developer experience is extremely important when developing libraries like this.

Luckily, we can employ the same approach we did earlier and turn our type overloads into a fluent schema. Here's the same code after a small refactor:

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

```csharp
class NormalEndpoint = Endpoint.ForRequest<SomeRequest>.WithResponse<SomeResponse> { /* ... */ }
class EndpointWithoutResponse = Endpoint.ForRequest<SomeRequest>.WithoutResponse { /* ... */ }
class EndpointWithoutRequest = Endpoint.ForAnyRequest.WithResponse<SomeResponse> { /* ... */ }
class EndpointWithoutEither = Endpoint.ForAnyRequest.WithoutResponse { /* ... */ }
```

```csharp
// Error: Class Endpoint is sealed
public class MyEndpoint : Endpoint { /* ... */ }

// Error: Class Endpoint.ForRequest<T> is sealed
public class MyEndpoint : Endpoint.ForRequest<SignInRequest> { /* ... */ }
```

```csharp
public class SignInEndpoint : Endpoint
  .ForRequest<SignInRequest>
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

```csharp
public class Context<T>
{
    public class Provider
    {

    }
}
```
