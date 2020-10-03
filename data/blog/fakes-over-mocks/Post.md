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

A common practice in cases like this is to replace such dependencies with lightweight substitutes that act as _test doubles_. While doing that does lead to lower confidence, it's often essential in establishing a robust and predictable test suite.

Unfortunately, many developers get confused by the terminology and think that the concept of test doubles specifically refers to _mocking_. This misconception leads to overuse of mocks in tests, even when other forms of substitutes are usually more suitable, causing them to become [implementation-aware and fragile as a result](/blog/unit-testing-is-overrated).

When writing tests, I prefer to rely on _fake_ implementations instead. They require a bit more upfront investment compared to mocks, but provide important practical advantages, without suffering from the same problems.

In this article we will look at the differences between fakes and mocks, how using one over the other impacts test design, and why I believe that fakes should be the default choice wherever possible. I will show examples of tests written with both approaches so that we can compare them and identify the benefits.

## Mocks

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally notorious in this regard, as it always seems to create a lot of confusion among developers.

Coincidentally, the concept of test doubles also has no universally accepted interpretation. So if you asked a hundred different people what the distinction between fakes, mocks, and other types of substitutes is, [you would likely get a hundred different answers](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing).

However, I think that this problem is mainly caused by the fact that the original definitions, [as they were introduced around two decades ago](https://en.wikipedia.org/wiki/Mock_object#Mocks.2C_fakes.2C_and_stubs), don't hold as much value in the context of modern software development anymore. Nowadays, when we say "mocking", we usually refer to the technique of creating dynamic replacements using frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others.

Such objects may not necessarily be mocks according to the original meaning, but there is very little practical benefit in acknowledging those technicalities. So to make matters simpler, we will stick to the more contemporary vocabulary.

With this understanding, a **mock is a substitute, that pretends to function like its real counterpart, but returns predefined responses instead**. Although a mock object does implement the same interface as the actual component, that implementation is entirely superficial.

In fact, **a mock is not intended to have valid functionality at all**. Its purpose is rather to mimic the outcomes of various operations, so that the system under test exercises the behavior required by the given scenario.

Besides that, mocks can also be used to record method calls, including the number of times they appear and the passed parameters. This makes it possible to observe any side-effects that take place within the system and verify them against expectations.

As an example, let's consider the following interface that represents some external binary file storage:

```csharp
public interface IBlobStorage
{
    Task<Stream> ReadFileAsync(string fileName);

    Task DownloadFileAsync(string fileName, string outputFilePath);

    Task UploadFileAsync(string fileName, Stream stream);

    Task UploadManyFilesAsync(IReadOnlyDictionary<string, Stream> fileNameStreamMap);
}
```

This module provides basic operations to read and upload files, as well as a few more specialized methods. The actual implementation of the above interface does not concern us, but for the sake of complexity we may pretend that it relies on some expensive cloud vendor and doesn't lend itself well for testing.

The file storage module is in turn referenced as a dependency in another component, which is responsible for managing text documents:

```csharp
public class DocumentManager
{
    private readonly IBlobStorage _storage;

    public DocumentManager(IBlobStorage storage) =>
        _storage = storage;

    private static string GetFileName(string documentName) =>
        $"docs/{documentName}";

    public async Task<string> GetContentAsync(string documentName)
    {
        var fileName = GetFileName(documentName);

        await using var stream = await _storage.ReadFileAsync(fileName);
        await using var streamReader = new StreamReader(stream);

        return await streamReader.ReadToEndAsync();
    }

    public async Task UpdateContentAsync(string documentName, string content)
    {
        var fileName = GetFileName(documentName);

        var data = Encoding.UTF8.GetBytes(content);
        await using var stream = new MemoryStream(data);

        await _storage.UploadFileAsync(fileName, stream);
    }
}
```

This class gives us an abstraction over raw file access and exposes methods that work with encoded text content directly. Its implementation isn't particularly complicated, but let's imagine we still want to test it.

In a real world, there would probably be many other components as well, including the entry point through which the user interacts with the application. When testing software, it's very important to account for all pieces of the pipeline, but to keep the example simple we will focus only on `DocumentManager` and `IBlobStorage`.

As we've identified previously, using the real implementation of `IBlobStorage` in our tests would be troublesome, which means we have to resort to test doubles. One way to approach this is, of course, by mocking the dependency:

```csharp
[Fact]
public async Task I_can_get_the_content_of_an_existing_document()
{
    // Arrange
    await using var documentStream = new MemoryStream(
        new byte[] {0x68, 0x65, 0x6c, 0x6c, 0x6f}
    );

    var blobStorage = Mock.Of<IBlobStorage>(bs =>
        bs.ReadFileAsync("docs/test.txt") == Task.FromResult(documentStream)
    );

    var documentManager = new DocumentManager(blobStorage.Object);

    // Act
    var content = await documentManager.GetContentAsync("test.txt");

    // Assert
    content.Should().Be("hello");
}

[Fact]
public async Task I_can_update_the_content_of_a_document()
{
    // Arrange
    var blobStorage = Mock.Of<IBlobStorage>();
    var documentManager = new DocumentManager(blobStorage.Object);

    // Act
    await documentManager.UpdateContentAsync("test.txt", "hello");

    // Assert
    blobStorage.Verify(bs => bs.UploadFileAsync("docs/test.txt", It.IsAny<Stream>()));
}
```

In the above snippet, the first test attempts to verify that the consumer can retrieve a document, given it already exists in the storage. To facilitate this precondition, we configure the mock such that it returns a hardcoded byte stream when `ReadFileAsync()` is called with the expected file name.

However, in doing so, we are inadvertently making some very strong assumptions about how `DocumentManager` works under the hood. More specifically, we assume that:

- Calling `GetContentAsync()` in turn calls `ReadFileAsync()`
- File name is formed by prepending `docs/` to the name of the document

These particular expectations may be true now, but they can easily change in the future. For example, it's not a stretch to imagine that, down the line, we may make the implementation more sophisticated by including a UUID in the file name. In a similar vein, we could also replace the call to `ReadFileAsync()` with `DownloadFileAsync()`, in order to cache content locally and avoid redundant network requests.

In both cases, the changes in the implementation won't be observable from the user perspective as the surface-level behavior will remain the same. However, because our test relies on internal specifics of the system, it will start failing, indicating that there's an error in our code, when in reality there isn't.

The second scenario suffers from the same issue. It doesn't have any preconditions, but instead it attempts to validate side-effects, by checking that `UploadFileAsync()` gets called when the content of a document is updated.

Since this is not stipulated by the contract of the type, we cannot reliably make such an assumption. For example, we may decide in the future to change the underlying logic, so that calling `UpdateContentAsync()` stores the documents in-memory until a certain point, after which they are uploaded in one request using `UploadManyFilesAsync()`.

Ultimately, tests that depend on implementation specifics are fragile and are going to break sooner than later. These kind of tests don't provide us with the level of confidence we need to perform substantial changes or refactoring, as they fail way more often than they should.

## Fakes

It's pretty clear that in order to avoid coupling tests with implementation details, our test doubles need to be completely independent from the scenarios they're used in. That's exactly what fakes are used for.

In essence, a **fake is a substitute that represents a completely functional (albeit simpler) alternative to its real counterpart**. It provides a valid end-to-end implementation of the same interface that the real component uses, but takes shortcuts to make it more lightweight.

Unlike mocks, fakes actually work

Instead of relying on mocking frameworks, we will create our test double manually.

```csharp
public class FakeBlobStorage : IBlobStorage
{
    private readonly Dictionary<string, byte[]> _files = new Dictionary<string, byte[]>();

    public Task<Stream> ReadFileAsync(string fileName)
    {
        var data = _files[fileName];
        var stream = new MemoryStream(data);

        return Task.FromResult(stream);
    }

    public async Task DownloadFileAsync(string fileName, string outputFilePath)
    {
        await using var input = await ReadFileAsync(fileName);
        await using var output = File.Create(outputFilePath);

        await input.CopyToAsync(output);
    }

    public async Task UploadFileAsync(string fileName, Stream stream)
    {
        await using var buffer = new MemoryStream();
        await stream.CopyToAsync(buffer);

        var data = buffer.ToArray();
        _files[fileName] = data;
    }

    public async Task UploadManyFilesAsync(IReadOnlyDictionary<string, Stream> fileNameStreamMap)
    {
        foreach (var (fileName, stream) in fileNameStreamMap)
        {
            await UploadFileAsync(fileName, stream);
        }
    }
}
```

## Testing test doubles

Testing relies on validating complex code through simple assertions.

## Summary

Due to the popularity of mocking frameworks and the convenience they provide, many developers find that there is very little incentive to write test doubles by hand. However, relying on dynamically-generated mocks can be dangerous, as it often leads to implementation-aware testing.

In many cases, it may be a better idea to use fakes instead. These are test doubles that represent complete but simplified implementations of their real-life counterparts which can be used for testing.

Because fakes are naturally decoupled from the test scenarios, it's much more difficult to create accidental dependencies on internal specifics of the system. Besides that, their self-contained nature also makes them reusable, which lends itself to better maintainability.
