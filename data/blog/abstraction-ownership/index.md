---
title: 'Whose Abstraction Is It, Anyway?'
date: '2022-10-17'
---

In software, solving complex problems often requires us to break them down into smaller, more manageable parts that can be reasoned about separately. In doing so, we go through the process of identifying key aspects pertaining to each of those parts, isolating them away from less important details, and, ultimately, generalizing them into abstract models.

Carefully designed abstractions can help better understand the problem domain and eliminate unnecessary complexity, while also facilitating code reuse and extensibility. Conversely, poor abstractions may suffer from unclear boundaries, lead to confusion, and become generally inconvenient to work with.

When evaluating one abstraction against another, we are used to considering factors such as encapsulation, consistency, mental overhead, cohesion, and so on. However, there is one interesting aspect that is often overlooked, which is **ownership**.

Who owns the abstraction — whether it's the provider or the consumer — plays a significant role in how it's used, and shapes the design of the system as a whole. Some programming languages and frameworks are also more conducive to one ownership model over the other, which may affect the way we approach the problem at hand.

In this article, we'll explore the idea of abstraction ownership, discuss its implications, and look at some examples of how it manifests in practice.

## Type systems

Abstraction is a mental construct, but in software design, it is usually formalized by the means of the programming language's **type system**. Defining types is a way for us to express the relevant concepts in our domain and model the relationships between them.

Different languages have different type systems, with slightly different semantics and capabilities, which in turn affects how we can use abstractions to model our domain. In order to understand these differences better, we need to look at how types are defined in each system.

For example, in C#, the most common way to define an abstract type is by using an interface:

```csharp
public interface IDatabase
{
    void Save(string key, string data);

    string Load(string key);
}
```

Here, we have defined a type `IDatabase` that represents a basic database abstraction. It has two methods, `Save` and `Load`, which are used to store and retrieve data, respectively. The interface itself does not provide any implementation details, but it does outline the contract that any concrete implementation must adhere to.

Now, let's imagine that we want to create a concrete implementation of this interface. In C#, we can do that by creating a class that implements our interface:

```csharp
public class Database : IDatabase
{
    public void Save(string key, string data) =>
        File.WriteAllText(key, data);

    public string Load(string key) =>
        File.ReadAllText(key);
}
```

An instance of this class can be used anywhere an `IDatabase` is expected, because the class implements the interface:

```csharp
public class Application
{
    private readonly IDatabase _database;

    public Application(IDatabase database) =>
        _database = database;
}

// ...

var database = new Database();
var application = new Application(database);
```

## Structural typing

TypeScript's structural nature has circumstantial origin, having inherited it from JavaScript. But, there are also other languages that primarily use structural typing, such as Go interfaces

## Mixing language paradigms

So is this something decided for us by the language or can we actually choose which model to use? We can choose, show C# example with interface vs delegate, or TypeScript interface vs class.

## Designing with ownership in mind

## Summary
