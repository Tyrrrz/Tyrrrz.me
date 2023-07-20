---
title: 'Prefer Fakes Over Mocks'
date: '2020-10-13'
---

The primary purpose of software testing is to detect any potential defects in a program before it reaches its intended consumers. This is typically achieved by establishing functional requirements which define supported user interactions as well as expected outcomes, and then validating them using (automated) tests.

Consequentially, the value provided by such tests is directly dependent on how well the scenarios they simulate resemble the way the software is actually used. Any deviation therein diminishes that value, as it becomes harder to reason about the state of the would-be production system based on the result of a test run.

In an ideal world, our test scenarios, including the environment they execute in, should perfectly match real-life conditions. This is always desirable, but might not always be practical, as the system may rely on components that are difficult to test with, either because they are not readily accessible or because their behavior is inconsistent or slow.

A common practice in cases like these is to replace such dependencies with lightweight substitutes that act as _test doubles_. Although doing so does lead to lower confidence, it's often an unavoidable trade-off when it comes to designing a robust and deterministic test suite.

That said, while test doubles can be implemented in different ways, most of the time developers tend to resort to _mocking_ as their default choice. This is unfortunate, as it leads to overuse of mocks where other forms of substitutes are typically more suitable, making tests [implementation-aware and fragile](https://en.wikipedia.org/wiki/Mock_object#Limitations) as a result.

When writing tests, I prefer to avoid mocks as much as possible and rely on _fake_ implementations instead. They require a bit of additional upfront investment, but provide many practical advantages which are important to consider.

In this article we will look at the differences between these two variants of test doubles, identify how using one over the other impacts test design, and see why fakes often help in building more manageable test suites.

## Drawbacks of mocking

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally notorious in this regard, as it always seems to create a lot of uncertainty among developers.

Unsurprisingly, the concept of a _mock_ or how it's fundamentally different from other types of substitutes is also one of those cases. Despite its highly ubiquitous usage, this term [doesn't have a single universally accepted interpretation](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing).

According to the [original definition introduced by Gerard Meszaros](https://martinfowler.com/bliki/TestDouble.html), a mock object is a very specific type of substitute which is used to verify interactions between the system under test and its dependencies. Nowadays, however, the distinction has become a bit blurry, as this term is commonly used to refer to a broader category of objects created with frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others.

Such substitutes may not necessarily be mocks under the original definition, but there's very little benefit in acknowledging these technicalities. So to make matters simpler, let's agree to stick to the more colloquial understanding of the term throughout the article.

Generally speaking, a **mock object is a substitute, that pretends to function like its real counterpart, but returns predefined responses instead**. From a structural standpoint, it does implement the same external interface as the actual component, however that **implementation is entirely superficial**.

In fact, **a mock object is not intended to have valid functionality at all**. Its purpose is rather to mimic the outcomes of various operations, so that the system under test exercises the behavior required by a given scenario.

Besides that, mocks can also be used to verify side effects that take place within the system. This is achieved by recording method calls and checking if the number of times they appear and the passed arguments match the expectations.

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

As we can see, it provides basic operations to read and upload files, as well as a few more specialized methods. The actual implementation of the above abstraction does not concern us, but for the sake of the thought experiment we can pretend that it relies on some expensive cloud vendor and doesn't lend itself well for testing.

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
        using var streamReader = new StreamReader(stream);

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

    var blobStorage = Mock.Of<IBlobStorage>();

    Mock.Get(blobStorage)
        .Setup(bs => bs.ReadFileAsync("docs/test.txt"))
        .ReturnsAsync(documentStream);

    var documentManager = new DocumentManager(blobStorage);

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
    var documentManager = new DocumentManager(blobStorage);

    // Act
    await documentManager.SaveDocumentAsync("test.txt", "hello");

    // Assert
    Mock.Get(blobStorage).Verify(bs => bs.UploadFileAsync(
        "docs/test.txt",
        It.Is<Stream>(s => /* stream verification */)
    ));
}
```

In the above code snippet, the first test attempts to verify that the consumer can retrieve a document, given it already exists in the storage. To facilitate this precondition, we configure the mock in such way that it returns a hard-coded byte stream when `ReadFileAsync(...)` is called with the expected file name.

However, in doing so, we are inadvertently making a few very strong assumptions about how `DocumentManager` works under the hood. Namely, we assume that:

- Calling `GetDocumentAsync(...)` in turn calls `ReadFileAsync(...)`
- File name is formed by pre-pending `docs/` to the name of the document

These specifics may be true now, but they can easily change in the future. For example, it's not a stretch to imagine that we may decide to store files under a different path or replace the call to `ReadFileAsync(...)` with `DownloadFileAsync(...)`, as a means to preemptively cache files.

In both cases, the changes in the implementation won't be observable from the user's perspective as the surface-level behavior will remain the same. However, because the test we wrote relies on internal details of the system, it will start failing, indicating that there's an error in our code, when in reality there isn't.

The second scenario works a bit differently, but also suffers from the same issue. To verify that a document is correctly persisted in the storage when it gets saved, it checks that a call to `UploadFileAsync(...)` takes place in the process.

Again, it's not hard to imagine a situation where the underlying implementation can change in way that breaks this test. For example, we may decide to optimize the behavior slightly by not uploading the documents straight away, but instead sending them in batches using `UploadManyFilesAsync(...)`.

An experienced mocking practitioner might argue that some of these shortcomings can be mitigated if we configure our mocks to be less strict. In this instance, we can modify the test so that it expects a call to any of the upload methods rather than a specific one, while also not checking the arguments at all:

```csharp
[Fact]
public async Task I_can_update_the_content_of_a_document()
{
    // Arrange
    var eitherUploadMethodCalled = false;

    var blobStorage = Mock.Of<IBlobStorage>();

    Mock.Get(blobStorage).Setup(bs => bs.UploadFileAsync(
        It.IsAny<string>(), // any argument -> OK
        It.IsAny<Stream>()  // any argument -> OK
    )).Callback(() => eitherUploadMethodCalled = true);

    Mock.Get(blobStorage).Setup(bs => bs.UploadManyFilesAsync(
        // any argument -> OK
        It.IsAny<IReadOnlyDictionary<string, Stream>>()
    )).Callback(() => eitherUploadMethodCalled = true);

    var documentManager = new DocumentManager(blobStorage);

    // Act
    await documentManager.SaveDocumentAsync("test.txt", "hello");

    // Assert
    eitherUploadMethodCalled.Should().BeTrue();
}
```

The mocking framework we're using ([Moq](https://github.com/Moq/moq4)) doesn't allow us to directly verify that either one of the given methods was called, so we need a workaround. To do this, we inject a callback that sets the value of the corresponding variable to `true` and then use it to check the outcome accordingly.

As you can probably tell, this change increased the complexity of the test rather significantly, as suddenly we find ourselves dealing with some additional state and a much more involved mocking setup. It also became less clear what exactly is it that we're trying to verify or whether we're doing it correctly, making the whole scenario harder to reason about.

Even despite all that effort, this test is still not as resilient as we would've wanted. For example, adding another method to `IBlobStorage` and calling it from `DocumentManager` will cause the test to break as the mock wasn't previously taught how to deal with it. You can see how all of these issues and complexity can only exacerbate in real projects with large test suites.

One way or another, **tests that rely on mocks are inherently coupled to the implementation of the system**, which makes them fragile as a result. This does not only impose additional maintenance cost as such tests need to be constantly updated, but also makes them considerably less valuable due to poor signal-to-noise ratio.

Instead of providing us with a safety net in the face of potential regressions, they **lock us into the existing implementation and discourage evolution**. Because of that, introducing substantial changes and refactoring code becomes a much more difficult and ultimately discouraging experience.

## Behavioral testing with fakes

Logically, in order to avoid strong coupling between tests and the underlying implementations, our test doubles need to be completely independent of the scenarios they're used in. As you can probably guess, that's exactly where fakes come in.

In essence, a **fake is a substitute that represents a lightweight but otherwise completely functional alternative to its real counterpart**. Instead of merely trying to fulfil the contract with pre-configured responses, it provides an actually valid end-to-end implementation.

Although its functionality resembles that of the real component, a **fake implementation is intentionally made simpler by taking certain shortcuts**. For example, rather than relying on a remote database server, the fake can be programmed to use an in-memory provider instead. This makes it more accessible for testing, while retaining most of its core behavior.

In contrast to mocks, fakes are usually not created at run-time via dynamic proxies, but defined statically like other regular types. While it is technically possible to generate a fake implementation using mocking frameworks as well, there are rarely any benefits in doing so.

Now let's come back to our file storage interface and make a fake implementation that we can use in tests. Here's one of the ways that we can do it:

```csharp
public class FakeBlobStorage : IBlobStorage
{
    private readonly Dictionary<string, byte[]> _files =
        new Dictionary<string, byte[]>(StringComparer.Ordinal);

    public Task<Stream> ReadFileAsync(string fileName)
    {
        var data = _files[fileName];
        var stream = new MemoryStream(data);

        return Task.FromResult<Stream>(stream);
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

As seen above, our fake blob storage uses a hash map to keep track of uploaded files and their content. For the more high-level operations such as `DownloadFileAsync(...)` and `UploadManyFilesAsync(...)`, the real implementation may be using some optimized routines, but here we are just composing existing functionality.

Note that the above implementation doesn't make any assumptions about how it's going to be used in tests. Instead, it provides what can effectively be a drop-in replacement for the actual blob storage component in our system.

Because of that, it's also important that the fake replicates the behavior of the real dependency as closely as possible. This means that we might have to consider various nuances like:

- Whether the file names are treated as case-sensitive
- Whether `ReadFileAsync(...)` throws on a non-existing file or returns an empty stream
- Whether `UploadFileAsync(...)` throws on an existing file or just overwrites it

Not getting these aspects right doesn't invalidate the implementation altogether, but can make it less valuable in specific edge-case scenarios. At the end of the day, even when using fakes, we won't be able to gain the same level of confidence as we would by testing in a real environment, which is why proper end-to-end testing is still necessary.

It may also appear that the details we have to take into account here are not that different from the implementation-aware assumptions we were making when using mocks, as neither are actually governed by the interface of the component. However, the major distinction is that the coupling we institute here is between the test double and the real implementation of the component, rather than between the test double and the internal specifics of its consumer.

Since our fake is defined separately from the tests themselves, its design doesn't rely on any particular interactions with the rest of the system. As a result, changing the implementation of `DocumentManager` should not cause the tests to fail.

With that out of the way, let's consider how incorporating fakes actually affects the design of our scenarios. The initial instinct would probably be to convert it over to something like this:

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

    // Act
    var content = await documentManager.GetDocumentAsync("test.txt");

    // Assert
    content.Should().Be("hello");
}
```

Here we take an existing test and rather than configure a mock to return a pre-configured response, we create a fake blob storage and fill it with data directly. This way we don't need to assume that retrieving a document should call a certain method, but instead just rely on the completeness of the behavior provided by our fake.

However, despite being able to eliminate most of the assumptions, we didn't get rid of all of them. Namely, our test still expects that calling `GetDocumentAsync(...)` should look for the file inside the `docs/` namespace, as that's where we're uploading it in the arrange phase.

This problem stems from the fact that we are yet again relying on how `DocumentManager` interacts with `IBlobStorage`, but this time it's not caused by the test double but by the design of the test itself. To avoid it, we need to adapt the scenario so that it revolves around the external behavior of the system and not the relationship with its dependencies.

Here is how we can achieve that:

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

Now, rather than creating a file directly through `FakeBlobStorage`, we do it using `DocumentManager` instead. This brings the scenario closer to how an actual consumer would interact with the class that we are testing.

From the perspective of the behavior of the system, the only thing we care about is whether a document that was saved can be retrieved afterwards. Other unrelated details do not concern us, so there is no reason to be testing them.

Because of this, we don't have to worry about where the file is persisted inside the storage, how exactly it gets uploaded, which format or encoding is used, or other similar aspects. Since the test above only validates external behavior, it doesn't have any overreaching assumptions about internal specifics.

It is also worth noting how little code we had to write, compared to our previous attempts when we relied on mocking. This additional benefit comes from the fact that well-designed fakes are inherently reusable, which helps a lot with maintainability.

If you are used to purist unit testing, this approach may seem a little weird at first, since we're not verifying the outcomes of individual operations, but rather how they fit together to create cohesive functionality. In the grand scheme of things, the latter is [far more important](/blog/unit-testing-is-overrated), as the confidence we derive directly depends on how accurately our tests match the way the software is actually used.

## Testing the test doubles

Since fakes are used to provide a realistic and potentially non-trivial implementation, it makes sense that their behavior should be tested as well. The idea of testing test doubles may appear bizarre, as we never do it with mocks, but in this case it is actually perfectly reasonable.

In fact, it's even common to define fakes as part of the main project, where the rest of the code resides, rather than with the tests. Many libraries and frameworks often also provide fake implementations as part of their core package, in order to make it easier for other developers to write their own tests as well.

The process of testing fakes is not in any way different from testing normal production code. For example, in case with our `FakeBlobStorage`, we can verify important aspects of its behavior like so:

```csharp
[Fact]
public async Task Previously_uploaded_file_can_be_retrieved()
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
public async Task Trying_to_retrieve_non_existing_file_throws()
{
    // Arrange
    var blobStorage = new FakeBlobStorage();

    // Act & assert
    await Assert.ThrowsAnyAsync<Exception>(() => blobStorage.ReadFileAsync("test.txt"));
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

These tests make sure that the fake implementation we've built actually works like it's supposed to. As long as they pass, we can be confident that using `FakeBlobStorage` doesn't produce incorrect results in other scenarios.

## Summary

Due to the popularity of mocking frameworks and the convenience they provide, many developers find that there is very little incentive to write test doubles by hand. However, relying on dynamically generated mocks can be dangerous, as it typically leads to implementation-aware testing.

In many cases, it may be a better idea to use fakes instead. These are test doubles that represent complete but simplified implementations of their real-life counterparts, rather than just a set of prearranged responses.

Because fakes are naturally separated from the scenarios in which they are used, it's easier to design tests that are not coupled to internal specifics of the system. Besides that, their self-contained nature makes them reusable as well, which lends itself to better long-term maintainability.
