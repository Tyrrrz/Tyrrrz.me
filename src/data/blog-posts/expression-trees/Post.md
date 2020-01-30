---
title: Planting C# expression trees
date: 2020-02-15
cover: Cover.png
---

![cover](Cover.png)

Expression trees is an interesting feature in .NET that very few people know about, despite interacting with it quite often. To most people, expression trees is something synonymous with object-relational mapping frameworks, but it's not the only thing they can be used for.

In their essence, expression trees belong to the domain of metaprogramming, which is a collective term for techniques that can be used to analyze, transform or even rewrite code at runtime.

At its core, expression trees comprises of a set of types used to represent various language constructs, along with ways to generate, compose, and compile them. Essentially, it's a specialized representation of the C# abstract syntax tree.

I think this part of the language is undeservedly obscure and, although I wouldn't say that knowing them is critical to being ...

## Creating expressions manually

