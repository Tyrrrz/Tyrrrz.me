---
title: 'Building a library in .NET'
date: '2024-10-28'
---

Developing a library involves a lot of moving pieces, and not all of them are just about writing code. Beyond the functionality of the library itself, we also need to consider the surrounding infrastructural concerns, such as how the library is built, tested and released — as well as how to keep those processes automated in an efficient way. These aspects often tend to be overlooked, but they do have overreaching implications not only on your own productivity as the library author, but also on the experience of the library's consumers.

Even in a such a mature and opinionated ecosystem as .NET, there is no true one-size-fits-all solution in regard to this. Certain approaches may work better for some projects than others, and the tooling landscape — both within .NET and in the broader software development world — is constantly evolving. Learning which options are available and understanding their trade-offs is something that takes time, but if you're just starting out, it can also be very daunting.

I have built and maintained several open-source libraries in .NET over the years, and in this article I will try to distill that experience into a set of common approaches and recommendations. We'll go over everything from project structure to compiler settings, explore how to maintain compatibility with various framework versions and runtime environments, cover important things to consider when publishing a NuGet package, and see how to use services such as GitHub Actions to help us streamline the operational aspects of the development workflow.

## Local environment

## Targeting and polyfills

## Testing workflow

## Releasing workflow

## Security considerations

## Changelog

## Formatting

## GitHub issue forms

## Summary
