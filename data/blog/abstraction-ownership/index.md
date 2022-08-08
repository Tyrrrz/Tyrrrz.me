---
title: 'Whose Abstraction Is It, Anyway?'
date: '2022-10-17'
---

In software, solving complex problems often requires us to break them down into smaller, more manageable parts that can be reasoned about separately. In doing so, we go through the process of identifying key aspects pertaining to each of those parts, isolating them away from less important details, and, ultimately, generalizing them into abstract models.

Carefully designed abstractions can help better understand the problem domain and eliminate unnecessary complexity, while also facilitating code reuse and extensibility. Conversely, poor abstractions may suffer from unclear boundaries, lead to confusion and overcomplication, and become generally inconvenient to work with.

When evaluating one abstraction against another, we are used to considering factors such as encapsulation, consistency, mental overhead, cohesion, performance and scalability, and so on. However, there is one aspect that is often overlooked, which is **ownership**.

Who owns the abstraction — whether it's the provider or the consumer — carries a significant weight in its usefulness, as well as shapes the design of the system as a whole. Additionally, some programming languages and frameworks are more conducive to one ownership model than the other, which may affect the way we approach the problem at hand.

In this article, we'll explore the concept of abstraction ownership, discuss its implications, and look at some examples of how it manifests in practice.

## Nominal vs structural type systems



## Structural typing

TypeScript's structural nature has circumstantial origin, having inherited it from JavaScript. But, there are also other languages that primarily use structural typing, such as Go interfaces

## Mixing language paradigms

## Designing with ownership in mind

## Summary
