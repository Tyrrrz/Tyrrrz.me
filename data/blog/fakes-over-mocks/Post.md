---
title: 'Prefer Fakes Over Mocks'
date: '2020-09-08'
tags:
  - 'programming'
  - 'testing'
---

The primary purpose of software testing is to ensure that a program works exactly how the user expects it to. This is achieved by formalizing intended user interactions into functional requirements, and then validating them using (automated) tests.

Value provided by such tests is directly dependent on how well the scenarios they simulate resemble the way the software is actually used. Any deviation therein diminishes that value, as it becomes harder to reason about the state of the would-be production system based on the result of a test run.

Ideally, our test scenarios, including the environment they execute in, should perfectly match real-life conditions. This might not always be practical, however, as the system may rely on components that are difficult to test with, either because they are not available or because their behavior is inconsistent or slow.

A common practice in cases like this is to replace such dependencies with lightweight substitutes that act as _test doubles_. While doing that does lead to lower confidence, it's often essential in establishing a robust and predictable test suite.

Unfortunately, many developers get confused by the terminology and think that the concept of test doubles specifically refers to _mocking_. This misconception leads to overuse of mocks in tests, even when other forms of substitutes are usually more suitable, causing them to become [implementation-aware and fragile as a result](/blog/unit-testing-is-overrated).

When writing tests, I prefer to rely on _fake_ implementations instead. They require a bit more upfront investment compared to mocks, but provide important practical advantages, without suffering from the same problems.

In this article we will look at the differences between fakes and mocks, how using one over the other impacts test design, and why I believe that fakes should be the default choice wherever possible. I will show examples of tests written with both approaches so that we can compare them and identify the benefits.

## Fakes vs mocks

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally notorious in this regard, as it seems to always create a lot of confusion among developers.

The concept of test doubles and the distinction between them is [no different](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing). However, I think this is mainly caused by the fact that the original definitions, [as they were introduced around two decades ago](https://en.wikipedia.org/wiki/Mock_object#Mocks.2C_fakes.2C_and_stubs), don't hold as much value in the context of modern software development anymore.

Nowadays, when we say "mocking", we usually refer to the technique of creating dynamic replacements using frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others. Such objects may not necessarily be mocks under the original meaning, but everyone calls them that anyway, so we may as well stick to it.

With this understanding, a **mock is a substitute, that pretends to function like its real counterpart, but returns predefined responses instead**. Although a mock object does implement the same interface as the actual component, that implementation is entirely superficial.

In fact, a mock is not intended to replicate or even resemble the behavior of a real dependency. Its main purpose is rather to simulate specific preconditions in the system under test, by providing input in a roundabout way.

Besides that, mocks are also often used to record outgoing interactions, such as method calls. This makes it possible to observe any side-effects that took place within the system and verify them against expectations.

As an example, let's consider the following interface that represents a client of some external chatting service:

```csharp
public interface IChatClient
{
    Task<IReadOnlyList<Message>> GetMessagesAsync(
        int channelId,
        DateTimeOffset after
    );

    Task SendMessageAsync(
        int channelId,
        Message message
    );
}
```

We can see that this module exposes simple operations to retrieve and post messages in a channel. For the sake of complexity, we may pretend that the real implementation relies on some bespoke proprietary technology which is very difficult to use in testing.

The chat client is in turn passed as a dependency to another component which encapsulates behaviors related to a single channel:

```csharp
public class ChatChannel
{
    private readonly IChatClient _client;
    private readonly int _channelId;

    public ChatChannel(IChatClient client, int channelId) =>
        (_client, _channelId) = (client, channelId);


}
```

For the sake of the argument, we can pretend that the real implementation of `IUserDatabase` relies on a bulky and outdated engine that does not run in a Docker container, is hard to automate, and generally does not lend itself to testing very well. In order to work around this problem, we need to use test doubles.

With an approach based on mocking, our tests could look like this:

```csharp
[Fact]
public async Task Sign_in_with_valid_credentials_returns_a_valid_jwt()
{
    // Arrange
    var user = new User(
        "TestUser",
        "NmVlYTliN2VmMTkxNzlhMDY5NTRlZGQwZjZjMDVjZWI="
    );

    var database = Mock.Of<IUserDatabase>(db =>
        db.RetrieveUserAsync(It.IsAny<string>()) == Task.FromResult(user)
    );

    var userManager = new UserManager(database.Object);

    // Act
    var jwt = await userManager.SignInAsync(new SignInRequest
    {
        Username = "TestUser",
        Password = "qwertyuiop"
    });

    // Assert
    jwt.GetClaim("preferred_username").Should().Be("TestUser");
}

[Fact]
public async Task Sign_up_stores_a_user_in_the_database()
{
    // Arrange
    var database = Mock.Of<IUserDatabase>();

    var userManager = new UserManager(database.Object);

    // Act
    await userManager.SignUpAsync(new SignUpRequest
    {
        Username = "TestUser",
        Password = "qwertyuiop"
    });

    // Assert
    database.Verify(db => db.StoreUserAsync(It.IsAny<User>()), Times.Once());
}
```

## Testing test doubles

Testing relies on validating complex code through simple assertions.

## Summary

Due to the popularity of mocking frameworks and the convenience they provide, many developers find that there is very little incentive to write test doubles by hand. However, relying on dynamically-generated mocks can be dangerous, as it often leads to implementation-aware testing.

In many cases, it may be a better idea to use fakes instead. These are test doubles that represent complete but simplified implementations of their real-life counterparts which can be used for testing.

Because fakes are naturally decoupled from the test scenarios, it's much more difficult to create accidental dependencies on internal specifics of the system. Besides that, their self-contained nature also makes them reusable, which lends itself to better maintainability.
