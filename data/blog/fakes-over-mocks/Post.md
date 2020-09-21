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

A common practice in cases like this is to replace such dependencies with lightweight substitutes that act as [_test doubles_](https://en.wikipedia.org/wiki/Test_double). While doing that does lead to lower confidence, it's often essential in establishing a robust and predictable test suite.

Unfortunately, many developers get confused by the terminology and think that the concept of test doubles specifically refers to _mocking_. This misconception leads to overuse of mocks in tests, even when other forms of substitutes are usually more suitable, causing them to become [implementation-aware and fragile as a result](/blog/unit-testing-is-overrated).

When writing tests, I prefer to rely on _fake_ implementations instead. They require a bit more upfront investment compared to mocks, but provide important practical advantages, while also not suffering from the same problems.

In this article we will look at the differences between fakes and mocks, how using one over the other impacts test design, and why I believe that fakes should be the default choice wherever possible. I will show examples of tests written using both approaches so that we can compare them and identify the benefits.

## Fakes vs mocks

As we enter the realm of software development terminology, we need to define the meaning behind these words in order to avoid confusion. This topic is

Both fakes and mocks work through a layer of indirection established between the system and the component that needs to be replaced. This is can be an interface, an abstract class, a function type, or other tool available within the language.

The difference between the two, however, is in

## Summary
