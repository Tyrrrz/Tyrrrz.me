---
title: 'Prefer Fakes Over Mocks'
date: '2020-10-12'
tags:
  - 'programming'
  - 'testing'
---

The primary purpose of software testing is to detect any potential defects in a program before it reaches its intended consumers. This is typically achieved by establishing functional requirements which define supported user interactions as well as expected outcomes, and then validating them using (automated) tests.

Consequentially, the value provided by such tests is directly dependent on how well the scenarios they simulate resemble the way the software is actually used. Any deviation therein diminishes that value, as it becomes harder to reason about the state of the would-be production system based on the result of a test run.

In an ideal world, our test scenarios, including the environment they execute in, should perfectly match real-life conditions. This is always desirable, but might not always be practical, as the system can rely on components that are difficult to test with, either because they are not available or because their behavior is inconsistent or slow.

A common practice in cases like this is to replace such dependencies with lightweight substitutes that act as _test doubles_. Although doing so does lead to lower confidence, it's often a trade-off between usefulness and usability, which is essential in designing a robust and consistent test suite.

That said, while test doubles can be implemented in different ways, most of the time developers tend to resort to _mocking_ as the default choice. This is unfortunate, as it typically leads to overuse of mocks where other forms of substitutes are more suitable, making tests [implementation-aware and fragile](https://en.wikipedia.org/wiki/Mock_object#Limitations) as a result.

When writing tests, I prefer to avoid mocks as much as possible and rely on _fake_ implementations instead. They require a bit of upfront investment, but provide many practical advantages which are very important to consider.

In this article we will look at the differences between these two variants of test doubles, identify how using one over the other impacts test design, and why using fakes often results in more manageable test suites.

## Drawbacks of mocking

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally notorious in this regard, as it always seems to create a lot of uncertainty among developers.

Unsurprisingly, the concept of "mock" or how it's fundamentally different from other types of substitutes is also one of those cases. Despite its highly ubiquitous usage, this term [doesn't have a single universally accepted interpretation](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing).

According to the [original definitions introduced by Gerard Meszaros](https://martinfowler.com/bliki/TestDouble.html), a mock is a very specific type of substitute which is used to verify interactions between the system under test and its dependencies. However, this distinction is not as relevant nowadays, as the term is instead used to refer to a broader class of substitutes created with frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others.

Such objects may not necessarily be mocks under the original definition, but there's very little benefit in acknowledging these technicalities. So to make matters simpler, we will stick to this more colloquial understanding of the term throughout the article.

Generally speaking, a **mock is a substitute, that pretends to function like its real counterpart, but returns predefined responses instead**. From a structural standpoint, it does implement the same external interface as the actual component, however that implementation is entirely superficial.

In fact, **a mock is not intended to have valid functionality at all**. Its purpose is rather to mimic the outcomes of various operations, so that the system under test exercises the behavior required by a given scenario.

Besides that, mocks can also be used to verify side-effects that take place within the system. This is achieved by recording method calls and checking if the number of times they appear and their parameters match the expectations.

Let's take a look at how all of this works in practice. As an example, imagine that we're building a system that relies on some binary file storage represented by the following interface:

```csharp
public interface IBlobStorage
{
    Task<Stream> ReadFileAsync(string fileName);

    Task DownloadFileAsync(string fileName, string outputFilePath);

    Task UploadFileAsync(string fileName, Stream stream);

    Task UploadManyFilesAsync(IReadOnlyDictionary<string, Stream> fileNameStreamMap);
}
```

As we can see, it provides basic operations to read and upload files, as well as a few more specialized methods. The actual implementation of the above abstraction does not concern us, but for the sake of complexity we can pretend that it relies on some expensive cloud vendor and doesn't lend itself well for testing.

Built on top of it, we also have another component which is responsible for loading and saving text documents:

```csharp
public class DocumentManager
{
    private readonly IBlobStorage _storage;

    public DocumentManager(IBlobStorage storage) =>
        _storage = storage;

    private static string GetFileName(string documentName) =>
        $"docs/{documentName}";

    public async Task<string> GetDocumentAsync(string documentName)
    {
        var fileName = GetFileName(documentName);

        await using var stream = await _storage.ReadFileAsync(fileName);
        await using var streamReader = new StreamReader(stream);

        return await streamReader.ReadToEndAsync();
    }

    public async Task SaveDocumentAsync(string documentName, string content)
    {
        var fileName = GetFileName(documentName);

        var data = Encoding.UTF8.GetBytes(content);
        await using var stream = new MemoryStream(data);

        await _storage.UploadFileAsync(fileName, stream);
    }
}
```

This class gives us an abstraction over raw file access and exposes methods that work with text content directly. Its implementation is not particularly complex, but let's imagine we want to test it anyway.

As we've identified earlier, using the real implementation of `IBlobStorage` in our tests would be troublesome, so we have to resort to test doubles. One of the simpler ways to approach this is, of course, by creating mock implementations:

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
    var content = await documentManager.GetDocumentAsync("test.txt");

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
    await documentManager.SaveDocumentAsync("test.txt", "hello");

    // Assert
    blobStorage.Verify(bs => bs.UploadFileAsync(
        "docs/test.txt",
        // Omitted: proper verification of the passed stream
        It.Is<Stream>(s => s.CanRead)
    ));
}
```

In the above code snippet, the first test attempts to verify that the consumer can retrieve a document, given it already exists in the storage. To facilitate this precondition, we configure the mock in such way that it returns a hardcoded byte stream when `ReadFileAsync()` is called with the expected file name.

However, in doing so, we are inadvertently making a few very strong assumptions about how `DocumentManager` works under the hood. Namely, we assume that:

- Calling `GetDocumentAsync()` in turn calls `ReadFileAsync()`
- File name is formed by prepending `docs/` to the name of the document

These specifics may be true now, but they can easily change in the future. For example, it's not a stretch to imagine that we may decide to store files under a different path or replace calls to `ReadFileAsync()` with `DownloadFileAsync()` (as a means to preemptively cache files locally).

In both cases, the changes in the implementation won't be observable from the user perspective as the surface-level behavior will remain the same. However, because the test we wrote relies on internal details of the system, it will start failing, indicating that there's an error in our code, when in reality there isn't.

The second scenario works a bit differently, but also suffers from the same issue. To verify that a document is correctly persisted in the storage when it gets saved, it checks that a call to `UploadFileAsync()` takes place in the process.

Again, it's not hard to imagine a situation where the underlying implementation might change in way that breaks this test. For example, we may decide to optimize the behavior slightly by not uploading the documents immediately, but instead keeping them in memory to later send in bulk using `UploadManyFilesAsync()`.

An experienced mocking practitioner may also point out that some of these shortcomings can be avoided: we can provide stubs for all methods on the interface, rather than just the ones that are expected to be called, and also could avoid using specific arguments:

```csharp
[Fact]
public async Task I_can_update_the_content_of_a_document()
{
    // Arrange
    var eitherUploadMethodCalled = false;

    var blobStorage = Mock.Of<IBlobStorage>();

    blobStorage.Setup(bs => bs.UploadFileAsync(
        It.IsAny<string>(),
        It.IsAny<Stream>()
    )).Callback(() => eitherUploadMethodCalled = true);

    blobStorage.Setup(bs => bs.UploadManyFilesAsync(
        It.IsAny<IReadOnlyDictionary<string, Stream>>()
    )).Callback(() => eitherUploadMethodCalled = true);

    var documentManager = new DocumentManager(blobStorage.Object);

    // Act
    await documentManager.SaveDocumentAsync("test.txt", "hello");

    // Assert
    eitherUploadMethodCalled.Should().BeTrue();
}
```

Imagine doing this for dozens or hundreds of tests.

When we rewrite the tests like this, they become more resilient, but it comes at a cost of complexity. Additionally, since we're also no longer validating that the passed file name is correct, we may potentially allow a bug where the implementation generates it incorrectly.

One way or another, tests that rely on mocks are inherently coupled to the implementation of the system and will often break when it changes. This does not only impose an additional maintenance cost as such tests need to be constantly updated, but makes them considerably less valuable as well.

Instead of providing us with a safety net in the face of potential regressions, they lock us into an existing implementation and discourage evolution. Because of that, introducing substantial changes and refactoring code becomes a much more difficult and ultimately discouraging experience.

## Behavioral testing with fakes

Logically, in order to avoid strong coupling between tests and the underlying implementations, our test doubles need to be completely independent from the scenarios they're used in. As you can probably guess, that's exactly where fakes come in.

In essence, a **fake is a substitute that represents a lightweight but otherwise completely functional alternative to its real counterpart**. Instead of merely trying to fulfil the contract with preconfigured responses, it provides an actually valid end-to-end implementation.

Although its functionality resembles that of the real component, a **fake implementation is intentionally made simpler by taking certain shortcuts**. For example, rather than relying on a remote database server, the fake can be programmed to use an in-memory provider instead. This makes it more accessible in testing, while also retaining most of its important behavior.

In contrast to mocks, fakes are usually not created in runtime via dynamic proxies, but defined statically like other regular types. While it is technically possible to generate a fake implementation using mocking frameworks as well, there are rarely any benefits in doing so.

Now let's come back to our file storage interface and make a fake implementation that we can use in tests. There are many different ways to do it, but using a dictionary to maintain the list of files is probably the easiest:

```csharp
public class FakeBlobStorage : IBlobStorage
{
    private readonly Dictionary<string, byte[]> _files =
        new Dictionary<string, byte[]>(StringComparer.Ordinal);

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

As you can see, our fake blob storage uses a hash map to keep track of uploaded files and their content. More advanced methods such as `DownloadFileAsync()` and `UploadManyFilesAsync()` are implemented simply by composing existing functionality, while a real implementation could be using optimized routines for these.

Note that the above implementation doesn't make any assumptions about how it's going to be used in tests. Instead it provides what effectively can be a drop-in replacement for the actual blob storage component in our system.

That said, if we consider the behavior of the real dependency, there maybe a few other aspects that we may want to replicate. Those can include:

- Whether the file names are case-sensitive or not
- Whether `ReadFileAsync()` throws an exception for a non-existent files or returns an empty stream
- Whether `UploadFileAsync()` throws an exception when trying to upload the same file or overwrites it

Of course, we would want all of these things to reflect the behavior of the real component as much as possible. This can be difficult to do which is why end-to-end testing is still required.

It may seem like the effort in trying to accommodate these behavior specifics which are not constrained by the interface is not much different than the implementation-specific assumptions we've made when using mocks. However, there is an important distinction: by replicating the behavior of the component, we are coupling the implementation of the fake to the implementation of the actual component, rather than to the implementation of its consumer as is the case with mocks.

Ideally, because the fake implementation doesn't know in which context it's going to be used, it can't make any assumptions about it. As a result, changing the part of the system that depends on it, should not result in failing tests.

With that aside, let's consider how we can actually write a test scenario that relies on a fake. The initial instinct would probably be to change it to something like this:

```csharp
[Fact]
public async Task I_can_get_the_content_of_an_existing_document()
{
    // Arrange
    var blobStorage = new FakeBlobStorage();
    var documentManager = new DocumentManager(blobStorage);

    await using var documentStream = new MemoryStream(
        new byte[] {0x68, 0x65, 0x6c, 0x6c, 0x6f}
    );

    await blobStorage.UploadFileAsync("docs/test.txt", documentStream);
    //          still implementation-aware --^

    // Act
    var content = await documentManager.GetDocumentAsync("test.txt");

    // Assert
    content.Should().Be("hello");
}
```

We took the existing scenario we had and instead of configuring a mock to return canned data, we create a fake blob storage and fill it with data. This way we don't make the assumption that retrieving a document should call a certain method, but instead rely on the completeness of the behavior provided by our fake.

However, despite being able to eliminate one of the assumptions, we are still left with the other one, namely that we rely on a particular filename pattern to be used for storing documents.

Even though we replaced a mock with a fake, we are still relying on internal interactions between `DocumentManager` and `IBlobStorage` as a means to facilitate preconditions in our test. In other words, our test still verifies internal specifics, rather than the behavior.

To avoid this, we need to redesign the scenario so it only relies on the top level interface:

```csharp
[Fact]
public async Task I_can_get_the_content_of_a_previously_saved_document()
{
    // Arrange
    var blobStorage = new FakeBlobStorage();
    var documentManager = new DocumentManager(blobStorage);

    await documentManager.SaveDocumentAsync("test.txt", "hello");

    // Act
    var content = await documentManager.GetDocumentAsync("test.txt");

    // Assert
    content.Should().Be("hello");
}
```

As you can see, now instead of creating a file via `FakeBlobStorage` in the arrange phase, we create it directly using `DocumentManager` instead. Now the scenario properly resembles user behavior, as the consumer of this module would use these exact methods to create documents.

We don't care about file names, encoding, etc.

Note that this is not unit testing.

Reusability!

## Testing the test doubles

Since fakes are used to provide a realistic and potentially non-trivial implementation, it makes sense that their behavior should also be tested to make sure it matches that of the actual component. This idea may seem a bit odd, especially coming from mock-based testing.

In fact, it's not unusual for fakes to be located in the same project as the actual implementation. Many libraries and frameworks often provide fakes as part of the main package to make it easier for developers to write tests. For example, [CliFx](https://github.com/Tyrrrz/CliFx) provides a fake instance of [`IConsole`](https://github.com/Tyrrrz/CliFx/blob/5e53107deffd4ef0795fb7fd7ccb9d790cfb66c8/CliFx/IConsole.cs) called [`VirtualConsole`](https://github.com/Tyrrrz/CliFx/blob/5e53107deffd4ef0795fb7fd7ccb9d790cfb66c8/CliFx/VirtualConsole.cs), which it also uses for testing itself as well.

Testing fakes is not much different from testing anything else, the important thing is to actually do it. In case with our `FakeBlobStorage`, we can write tests like these:

```csharp
[Fact]
public async Task I_can_retrieve_previously_uploaded_file()
{
    // Arrange
    var blobStorage = new FakeBlobStorage();

    var fileData = new byte[] {0x68, 0x65, 0x6c, 0x6c, 0x6f};
    await using var fileStream = new MemoryStream(fileData);
    await blobStorage.UploadFileAsync("test.txt", fileStream);

    // Act
    await using var actualFileStream = await blobStorage.ReadFileAsync("test.txt");
    var actualFileData = actualFileStream.ToArray();

    // Assert
    actualFileData.Should().Equal(fileData);
}

[Fact]
public async Task I_can_try_to_retrieve_a_non_existing_file_and_get_an_exception()
{
    // Arrange
    var blobStorage = new FakeBlobStorage();

    // Act & assert
    await Assert.ThrowsAnyAsync(() => blobStorage.ReadFileAsync("test.txt"));
}

[Fact]
public async Task File_names_are_case_sensitive()
{
    // Arrange
    var blobStorage = new FakeBlobStorage();

    await using var fileStream1 = new MemoryStream(new byte[] {1, 2, 3});
    await using var fileStream2 = new MemoryStream(new byte[] {4, 5, 6});

    await blobStorage.UploadFileAsync("test.txt", fileStream1);
    await blobStorage.UploadFileAsync("TEST.txt", fileStream2);

    // Act
    await using var actualFileStream1 = await blobStorage.ReadFileAsync("test.txt");
    var actualFileData1 = actualFileStream1.ToArray();

    await using var actualFileStream2 = await blobStorage.ReadFileAsync("TEST.txt");
    var actualFileData2 = actualFileStream2.ToArray();

    // Assert
    actualFileData1.Should().NotEqual(actualFileData2);
}
```

With the tests above, we can outline the types of behaviors and properties that our fake is expected to posses and verify them. That we can use the fake in other tests and be confident that it works as needed.

## Summary

Due to the popularity of mocking frameworks and the convenience they provide, many developers find that there is very little incentive to write test doubles by hand. However, relying on dynamically-generated mocks can be dangerous, as it typically leads to implementation-aware testing.

In many cases, it may be a better idea to use fakes instead. These are test doubles that, unlike mocks, represent complete but simplified implementations of their real-life counterparts, rather than just a set of predefined responses.

Because fakes are naturally decoupled from the test scenarios in which they are used in, it's much more difficult to create accidental dependencies on internal specifics of the system. Besides that, their self-contained nature also makes them reusable, which lends itself to better maintainability.

Using fakes also pushes developers to focus on the behavior of the system under test, rather than how it communicates with other components. This helps in designing test cases that more accurately reflect the way an actual user would interact with the software.
