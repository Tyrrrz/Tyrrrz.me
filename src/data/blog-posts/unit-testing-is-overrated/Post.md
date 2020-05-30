---
title: Unit Testing is Overrated
date: 2020-03-30
cover: Cover.png
---

![cover](Cover.png)

The importance of testing in modern software development is really hard to overstate. Delivering a successful software product is not something you do once and forget about, but is rather a continuous recurring process. With every line of code that changes, software has to remain in a functional state, which implies the need for rigorous testing.

Over time, as the software industry evolved, testing practices have matured as well. Gradually moving towards automation, testing approaches have also influenced software design itself, spawning mantras like test-driven development, emphasizing patterns such as dependency inversion, and ultimately leading to high-level architectures such as the "Clean Architecture" and similar.

Nowadays, automated testing is embedded so deeply within our perception of software development, it's hard to imagine one without the other. And since that ultimately enables us to produce software quickly without sacrificing quality, it's hard to argue that it's not a good thing.

However, despite there being many different approaches, modern "best practices" primarily push developers specifically towards *unit testing*. Tests, whose scope lies higher on [Martin Fowler's pyramid](https://martinfowler.com/articles/practical-test-pyramid.html#TheTestPyramid) are either written as part of a wider suite (often by completely different people) or even disregarded entirely.

The benefit of this approach is often explained by the argument that unit tests provide the most value during development because they're able to catch errors quickly and help enforce design patterns that facilitate modularity. This idea has become so widely accepted that the term "unit testing" is now somewhat conflated with automated testing in general, losing part of its meaning.

When I was a less experienced developer, I believed in following these "best practices" to the letter, as I thought that would make my code better. I didn't particularly enjoy writing unit tests because of all the ceremony involved with abstractions and mocking, but it was the recommended approach after all, so who am I to know better.

It was only later, as I've experimented more and built more projects, that I started to realize that there are much better ways to approach testing and that **focusing on unit tests is**, in most cases, **a complete waste of time**.

Aggressively-popularized "best practices" often have a tendency of manifesting cargo cults around them, enticing developers to apply design patterns or use specific approaches without giving them a much needed second thought. In the context of automated testing, I find this prevalent when it comes to our industry's unhealthy obsession with unit testing.

In this article I will share my observations about unit testing and explain why I believe it to be a waste of time. I'll also explain which approaches I'm currently using instead to test my code, both in open source projects and day-to-day work.

## Fallacy of unit testing

Unit testing is a popular term in software development and, as such, is void of any useful meaning. So before we continue any further, let's establish what exactly I mean when I say "unit testing".

A unit test is a piece of code that verifies that an individual, **logically-independent** and **smallest possible** part of software **behaves as intended**. In most contexts, this _part_, also known as a _unit_, refers to an interface such as a class or a function. If the unit we intend to test interacts with other parts of the program, these dependencies are replaced with stubs or mocks, in order to facilitate testing in complete isolation. The idea is that, if we ensure that all individual atomic pieces of a system work correctly, the probability of finding a defect in general is greatly reduced.

With that out of the way, let's look at some of the benefits that unit tests provide, further referenced as _unit testing fallacies_:

- Unit tests help find problems quickly and early.
- Unit tests detect regressions and provide confidence in refactoring.
- Unit tests are easier and faster to write because they are small and independent.
- Unit tests enforce good design principles.
- Unit tests provide a form of living documentation of the system.

## Summary

Whenever you say "testing" in a room full of software developers, it is immediately assumed that you're talking about unit testing. I believe it's really unfortunate the industry arrived at this stereotype.

I think unit testing is inefficient and most of the time not worth doing at all. You're almost always better of writing wider-scope tests that cover a larger set of interactions, such as functional tests. Functional tests should match specifications that describe how the user can interact with the system and what they can observe in the process.

Unit testing should be prioritized lower, ultimately considering it only as last resort. Instead of spending time trying to make your code more "unit-testable", it's more beneficial to make it more "functionally-testable" instead.

The topic of testing is very popular and there quite a lot of articles written that challenge the necessity for ubiquitous unit tests. I don't necessarily agree with everything mentioned in them, but they are well-reasoned and at the very least provide some food for thought:

- [Fallacy of Unit Testing (Aaron W. Hsu)](https://www.sacrideo.us/the-fallacy-of-unit-testing)
- [Slow database test fallacy (David Heinemeier Hansson)](https://dhh.dk/2014/slow-database-test-fallacy.html)
- [Test-induced design damage (David Heinemeier Hansson)](https://dhh.dk/2014/test-induced-design-damage.html)
- [Write tests. Not too many. Mostly integration (Kent C. Dodds)](https://kentcdodds.com/blog/write-tests)
- [Why Most Unit Testing is Waste (James O. Coplien)](https://rbcs-us.com/documents/Why-Most-Unit-Testing-is-Waste.pdf)
- [Mocking is a Code Smell (Eric Elliott)](https://medium.com/javascript-scene/mocking-is-a-code-smell-944a70c90a6a)
