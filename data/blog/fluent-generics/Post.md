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

In this snippet, we are calling the `RunCommand` method to spawn a child process with the specified settings and block until it completes.

It's pretty clear that this method invocation expression is not very human-readable, as it requires comments to even understand what each parameter does. Additionally, omitting some of the optional settings is cumbersome, as it requires either the use of default values, named parameters, or relying on overloads for every possible permutation.

The experience can be greatly improved by refactoring this interaction into a fluent interface:

```csharp
var result = new Command("git")
    .WithArguments("pull")
    .WithWorkingDirectory("/my/repository")
    .WithEnvironmentVariable("GIT_AUTHOR_NAME", "John")
    .WithEnvironmentVariable("GIT_AUTHOR_EMAIL", "john@email.com")
    .Run();
```

Unlike the previous example, this is a lot more readable.

## Fluent type definitions

Now, at this point you may be wondering how any of this may be related to generics. Well, it's directly related because **generics are essentially functions for types**.

In fact, you can consider the relationship between generic types and normal types as the same type of relationship that functions and values have. In order to use a generic type, we must first provide it with a set of required type arguments, after which we get a regular resolved type that we can instantiate or derive from.

The similarity between functions and generics is also evident in the design problems that you can experience in both. For example, imagine we're working on a web framework and want to define an `Endpoint` type that represents an operation that maps a request object to the resulting response object.

We can model such a type with the following signature:

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

This allows us to implement our route handlers like so:

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

By inheriting from `Endpoint<SignInRequest, SignInResponse>`, the compiler automatically enforces the corresponding signature on our `ExecuteAsync` method. This is nice as it enforces a consistent and strict design.

However, while the `SignInEndpoint` fits perfectly in this design, not all endpoints need to have a typed request and response. For example, a similar `SignUpEndpoint` will likely not have any response besides a status code, while `SignOutEndpoint` won't have a request either.

In order to properly support endpoints like that, we need to extend our generic class declaration with a few additional overloads:

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

```csharp
public static class Endpoint
{
    public static class ForRequest<TReq>
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

    public static class ForAnyRequest
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
// Error: Class Endpoint is sealed
public class MyEndpoint : Endpoint { /* ... */ }

// Error: Class Endpoint.ForRequest<T> is sealed
public class MyEndpoint : Endpoint.ForRequest<SignInRequest> { /* ... */ }
```

```csharp
public class Context<T>
{
    public class Provider
    {

    }
}
```
