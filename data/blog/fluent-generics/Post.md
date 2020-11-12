---
title: 'Fluent Generics in C#'
date: '2020-11-25'
tags:
  - 'dotnet'
  - 'csharp'
---

Generics is a powerful feature available in many statically typed languages. It offers a way to write code that seamlessly operates against many different types, by defining a common constraint that they all adhere to. This provides the means for building flexible and reusable components without having to sacrifice type safety or introduce unnecessary duplication.

Even though generics have been around in C# for a while now, I still sometimes manage to find new and interesting ways to use them. For example, in one of my [previous articles](/blog/return-type-inference) I wrote about a trick I came up with that helps achieve return type inference for generics, providing an easier way to work with container union types.

Recently, I was also working on some code involving generics and had an unusual challenge: I needed to define a signature where all type arguments were optional, but usable in arbitrary combinations and arities. Initially I attempted to do it by introducing type overloads, but that led to an impractical design that I wasn't very fond of.

After a bit of experimentation, I found a way to solve this problem by using an approach similar to the [_fluent interface_](https://en.wikipedia.org/wiki/Fluent_interface) design pattern, except applied in relation to types instead of objects. The design I arrived at features a domain-specific language that allows consumers to resolve the type they need by "configuring" it in a sequence of logical steps.

In this article, I will show what this approach is all about, how it helped me solve my original issue, as well as some other scenarios where I think it may be useful.

## Endpoint architecture

Traditionally, web applications built with the [ASP.NET](http://asp.net) framework are architected according to the [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) pattern. Each individual HTTP operation is represented by a method on a controller class, which is used to group related routes together.

ASP.NET does support [other types of routing](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing) out of the box, such as Razor Pages, SignalR hubs, gRPC services, and ad-hoc delegate endpoints. That being said, if you are building a typical REST API backend, your options will be mostly limited to controllers.

This type of architecture may seem like a convenient way to model your applications, but many find that it leads to an unnecessarily complicated design, imposes inconvenient file structure, and creates code bloat. Steve Smith has written [an article](https://ardalis.com/moving-from-controllers-and-actions-to-endpoints-with-mediatr) about it and I believe he explained these issues really well.

## Deferred configuration

In object-oriented programming, _fluent interface_ design is a popular pattern for building interfaces that relies heavily on method chaining. It works by establishing a domain language in a form of a sequence of operations that represent human-legible, _fluent_ instructions.

Fluent interfaces are used quite commonly to simplify operations that require a large set of inputs by deferring them into multiple sequential steps. This is often the case when initializing or configuring objects that have multiple inputs, many of which are optional.

Essentially, instead of having one method that takes many parameters, fluent interfaces typically have many chainable methods, each taking a small portion of the parameters:

```csharp
// Non-fluent (input -> output)
var result = RunCommand(
    "git", // executable
    "pull", // args
    "/my/repository", // working dir
    new Dictionary<string, string> // env vars
    {
        ["GIT_AUTHOR_NAME"] = "John",
        ["GIT_AUTHOR_EMAIL"] = "john@email.com"
    }
);

// Fluent (deferred input)
var result = new Command("git")
    .WithArguments("pull")
    .WithWorkingDirectory("/my/repository")
    .WithEnvironmentVariable("GIT_AUTHOR_NAME", "John")
    .WithEnvironmentVariable("GIT_AUTHOR_EMAIL", "john@email.com")
    .Run();
```

Given that we've established that generic types are basically just functions that return normal types, it makes sense to question whether something like this is also possible there.

```csharp
[ApiController]
public abstract class Endpoint<TReq, TRes> : ControllerBase
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}
```

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
        // ...
    }
}
```

Signup doesn't take paramters
Signout also has no response

```csharp
// Endpoint that expects a typed request and provides a typed response
public abstract class Endpoint<TReq, TRes>
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}

// Endpoint that expects a typed request but does not provide a typed response (*)
public abstract class Endpoint<TReq>
{
    public abstract Task<ActionResult> ExecuteAsync(
        TReq request,
        CancellationToken cancellationToken = default
    );
}

// Endpoint that does not expect a typed request but provides a typed response (*)
public abstract class Endpoint<TRes>
{
    public abstract Task<ActionResult<TRes>> ExecuteAsync(
        CancellationToken cancellationToken = default
    );
}

// Endpoint that neither expects a typed request nor provides a typed response
public abstract class Endpoint
{
    public abstract Task<ActionResult> ExecuteAsync(
        CancellationToken cancellationToken = default
    );
}
```

`(*)` -

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
