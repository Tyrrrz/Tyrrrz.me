---
title: Reality-driven testing
date: 2020-03-09
cover: Cover.png
---

![cover](Cover.png)

In this day and age, every developer recognizes the importance of automated testing in software development.

Methodologies, design patterns, best practices -- all reinforce the idea that testing is an inherent requirement if you want to deliver a successful product. It is widely understood by people on both the technical and business side of things.

However, for some reason, when people read "testing" and "development" in one sentence, they instantly assume "unit testing". In many ways the term _unit testing_ has become synonymous with any tests written by developers. Any other form of testing is either carried out separately from the actual development process, or ignored entirely.

## Fallacy of unit testing

Unit testing is a popular term in software development and, as such, is void of any useful meaning. So before we continue any further, let's establish what exactly I mean when I say "unit testing".

A unit test is a piece of code that verifies that an individual, **logically-independent** and **smallest possible** part of software **behaves as intended**. In most contexts, this _part_, also known as a _unit_, refers to an interface such as a class or a function. If the unit we intend to test interacts with other parts of the program, these dependencies are replaced with stubs or mocks, in order to facilitate testing in complete isolation. The idea is that, if we ensure that all individual atomic pieces of a system work correctly, the probability of finding a defect in general is greatly reduced.

With that out of the way, let's look at some of the benefits that unit tests provide, further referenced as _unit testing fallacies_:

- Unit tests help find problems quickly and early.
- Unit tests detect regressions and provide confidence in refactoring.
- Unit tests are easier and faster to write because they are small and independent.
- Unit tests enforce good design principles.
- Unit tests provide a form of living documentation of the system.

## Links

https://en.m.wikipedia.org/wiki/Unit_testing

https://www.sacrideo.us/the-fallacy-of-unit-testing/

https://dhh.dk/2014/slow-database-test-fallacy.html