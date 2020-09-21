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

In this article we will look at the differences between fakes and mocks, how using one over the other impacts test design, and why I believe that fakes should be the default choice wherever possible. I will show examples of tests written using both approaches so that we can compare them and identify the benefits.

## Fakes vs mocks

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally [notorious for creating confusion](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing) among developers, to the point where there are probably as many definitions as there are people.

What the concept of mock or fake means to one person can be completely different from what it means to someone else. In order to keep things simple, I'm going to establish the definitions of those concepts in the context of modern software development. I'm not claiming that these definitions are "correct", but we're going to stick to them for this article.

Simply put, a _mock_ is an implementation that pretends to do work, but instead returns predefined results. Mock objects typically don't have any logic and their configuration is specific to only a single test scenario.

In object-oriented programming, mocks are rarely created manually due to the overhead of defining new type for each case. Instead, they are often generated dynamically with the help of frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others.

Besides returning predefined results for query operations, mocks can also be used to test side-effects as well. This is done by recording calls to specific methods or functions and then validating that those calls were made with correct parameters and the correct number of times.

A _fake_, on the other hand, is an implementation that is complete and valid, but is much more simple than the production counterpart.

When it comes to fakes and mocks, the distinction between them is quite nuanced, as both of them can be used to replace dependencies and both operate against abstractions. The difference, however, lies in the way this is accomplished.

## Summary
