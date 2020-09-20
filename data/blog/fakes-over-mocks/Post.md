---
title: 'Prefer Fakes Over Mocks'
date: '2020-09-08'
tags:
  - 'programming'
  - 'testing'
---

The primary purpose of software testing is to ensure that a program works exactly how the user expects it to. This is achieved by formalizing intended user interactions into functional requirements, and then validating them using (automated) tests.

Value provided by such tests is directly dependent on how well the scenarios they simulate resemble the way the software is actually used. Any deviation therein diminishes that value, as it becomes harder to reason about the state of the would-be production system based on the result of a test run.

Ideally, our test scenarios, including the environment they execute in, should perfectly match real-life conditions. This may not always be practical, however, as the system may rely on components that are difficult to test with, either because they are not always available or because their behavior is inconsistent or slow.

A common practice in cases like this is to replace such dependencies with lightweight substitutes that act as [_test doubles_](https://en.wikipedia.org/wiki/Test_double). While their usage does lead to lower confidence, they are often essential in making a robust and predictable test suite.

Unfortunately, many developers get confused by the terminology and think that the concept of test doubles specifically refers to _mocking_. This misconception leads to overuse of mocks in tests where other forms of substitutes are more applicable, causing them to become more [implementation-aware and fragile as a result](/blog/unit-testing-is-overrated).

???

In this article I will explain the difference between the two, how using one over the other impacts test design, and why you should prefer

## Fakes vs mocks

Since we're entering the realm of software development terminology...

## Summary
