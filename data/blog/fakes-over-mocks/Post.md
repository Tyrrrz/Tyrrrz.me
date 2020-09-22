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

When writing tests, I prefer to rely on _fake_ implementations instead. They require a bit more upfront investment compared to mocks, but provide important practical advantages, while also not suffering from the same problems.

In this article we will look at the differences between fakes and mocks, how using one over the other impacts test design, and why I believe that fakes should be the default choice wherever possible. I will show examples of tests written with both approaches so that we can compare them and identify the benefits.

## Fakes vs mocks

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally notorious in this regard, as it seems to always create a lot of confusion among developers.

The concept of test doubles and the distinction between them is [no different](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing). However, I think this is mainly caused by the fact that the original definitions, [as they were introduced more than 13 years ago](http://xunitpatterns.com/Test%20Double.html), don't hold as much value in the context of modern software development anymore.

Nowadays, when we say "mocking", we usually refer to the technique of creating dynamic replacements using frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others. Such objects may not necessarily be mocks under the original meaning, but everyone calls them that anyway, so we may as well stick to it.

Under this understanding, a **mock is a substitute that pretends to function like its real counterpart, but instead short-circuits with predefined outcomes**. Although a mock object does implement the same interface as the actual component, that implementation is entirely superficial.

Besides returning predefined results, mocks can also record method calls. While the former is used to facilitate _indirect input_ when the system under test requires data from a dependency, the latter is used to verify produced side-effects by observing _indirect output_.

As an example, let's consider the following interface of some database component, which has operations to both query and push data:

```csharp
public interface IMailDatabase
{
    Task<Mail> FindMailAsync(int mailId);

    Task<IReadOnlyList<Mail>> GetAllMailsAsync();

    Task StoreMailAsync(Mail mail);
}
```

The database is a dependency to another component...:

```csharp
public class MailManager
{
    private readonly IMailDatabase _database;

    /* ... */

    public
}
```

Of course, if this project were using a modern database engine, there would be no problem running it in a Docker container for use in tests, in which case neither mocks nor fakes would be necessary. But for the sake of argument, let's imagine that the production implementation of this interface relies on a very outdated version of SQL Server that is nearly impossible to run on demand.

## Summary
