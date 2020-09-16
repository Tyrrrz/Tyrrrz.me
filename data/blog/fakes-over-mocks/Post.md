---
title: 'Prefer Fakes Over Mocks'
date: '2020-09-08'
tags:
  - 'programming'
  - 'testing'
---

The primary purpose of software testing is to detect potential mismatches between how a program functions and how the user expects it to. This is typically achieved by simulating the same actions a real user would make and seeing if things actually work correctly.

Consequently, a test is only ever as valuable as the scenario it validates. If the scenario is close to something a user would experience, the test will provide high confidence whenever it succeeds or fails. Conversely, a test that verifies a scenario far detached from reality won't give enough information to make any reasonable conclusions.

Although it would be great if we could always write tests that give the highest level of confidence, this is not possible. Sometimes the system we're trying to test may rely on components that are unavailable, unreliable, unpredictable, or slow, which makes them unfit for use in a testing environment.

While substituting components with [_test doubles_](https://en.wikipedia.org/wiki/Test_double) is a very well-known technique, it's usually applied mindlessly.
