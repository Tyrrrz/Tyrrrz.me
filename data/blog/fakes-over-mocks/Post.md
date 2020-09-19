---
title: 'Prefer Fakes Over Mocks'
date: '2020-09-08'
tags:
  - 'programming'
  - 'testing'
---

The primary purpose of software testing is to ensure that a program works exactly how the user expects it to. This is achieved by formalizing supported user behaviors into functional requirements, and then validating them using (automated) tests.

Value provided by such tests is directly dependent on how well the scenarios they execute resemble the way the software is actually used. Any deviation between the test environment and the real environment diminishes that value, as it becomes harder to make a confident conclusion about the state of the would-be production system, based on the result of a test run.

Ideally, we would want our tests to be as close as possible to reality. This is not always practical, however, as the system may rely on components that are difficult to test, either because they are not always available or because their behavior is too slow or inconsistent.

A common practice in such cases is to replace these components with lightweight substitutes, also known as [_test doubles_](https://en.wikipedia.org/wiki/Test_double). While their use also leads to lower confidence, they are often integral for a robust and predictable test suite.

However, similarly to how developers conflate [unit testing with automated testing](/blog/unit-testing-is-overrated), the concept of test doubles seemingly appears synonymous with _mocking_.
