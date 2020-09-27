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

## Fakes vs mocks

As we enter the realm of software terminology, words slowly start to lose their meaning. Testing jargon is exceptionally notorious in this regard, as it seems to always create a lot of confusion among developers.

The concept of test doubles and the distinction between them is [no different](https://stackoverflow.com/questions/346372/whats-the-difference-between-faking-mocking-and-stubbing). However, I think this is mainly caused by the fact that the original definitions, [as they were introduced around two decades ago](https://en.wikipedia.org/wiki/Mock_object#Mocks.2C_fakes.2C_and_stubs), don't hold as much value in the context of modern software development anymore.

Nowadays, when we say "mocking", we usually refer to the technique of creating dynamic replacements using frameworks such as [Moq](https://github.com/moq/moq4), [Mockito](https://github.com/mockito/mockito), [Jest](https://github.com/facebook/jest), and others. Such objects may not necessarily be mocks under the original meaning, but everyone calls them that anyway, so we may as well stick to it.

With this understanding, a **mock is a substitute, that pretends to function like its real counterpart, but returns predefined responses instead**. Although a mock object does implement the same interface as the actual component, that implementation is entirely superficial.

In fact, **a mock is not intended to have valid functionality at all**. Its purpose is rather to mimic the outcomes of various operations, so that the system under test exercises the behavior required by the given scenario.

Besides that, mocks can also be used to record method calls, including the number of times they appear and the passed parameters. This makes it possible to observe any side-effects that take place within the system and verify them against expectations.

As an example, let's consider the following interface that represents some external binary file storage:

```csharp
public interface IBlobStorage
{
    Task<Stream> ReadFileAsync(int fileId);

    Task DownloadFileAsync(int fileId, string outputFilePath);

    Task<int> UploadFileAsync(Stream stream);

    Task<IReadOnlyList<int>> UploadManyFilesAsync(IReadOnlyList<Stream> streams);
}
```

This module provides basic operations to read and upload files, as well as a few more specialized methods. The actual implementation of the above interface does not concern us, but for the sake of complexity we may pretend that it relies on some expensive cloud vendor and doesn't lend itself well for testing.

The file storage is in turn referenced as a dependency in another component, which is responsible for managing photos:

```csharp
public class PhotoManager
{
    private readonly IBlobStorage _storage;

    public PhotoManager(IBlobStorage storage) =>
        _storage = storage;

    public async Task<Photo> GetPhotoAsync(int photoId)
    {
        await using var stream = await _storage.ReadFileAsync(photoId);
        return await Photo.FromStreamAsync(stream);
    }

    public async Task AddPhotoAsync(Photo photo)
    {
        await using var stream = photo.GetStream();
        await _storage.UploadFileAsync(stream);
    }
}
```

This class gives us an abstraction over raw file access and exposes methods that work with photos directly.

In a real world, there would probably be many other components as well, including the entry point through which the user interacts with the application. When testing software, it's very important to account for all pieces of the pipeline, but to keep the example simple we will focus only on `PhotoManager` and `IBlobStorage`.

Previously, we've already identified that using the real implementation of `IBlobStorage` in our tests would be troublesome, so that means we have to resort to test doubles. One way to approach this is, of course, by mocking the dependency:

```csharp
[Fact]
public async Task I_can_get_an_existing_photo()
{
    // Arrange
    var photoData = new byte[] {1, 2, 3, 4, 5};
    await using var photoStream = new MemoryStream(photoData);

    var blobStorage = Mock.Of<IBlobStorage>(bs =>
        bs.ReadFileAsync(It.IsAny<int>()) == Task.FromResult(photoStream)
    );

    var photoManager = new PhotoManager(blobStorage.Object);

    // Act
    var photo = await photoManager.GetPhotoAsync(1);

    // Assert
    photo.Serialize().Should().Equal(photoData);
}

[Fact]
public async Task I_can_upload_a_new_photo()
{
    // Arrange
    var blobStorage = Mock.Of<IBlobStorage>();
    var photoManager = new PhotoManager(blobStorage.Object);

    var photo = Photo.CreatePng(
        "My dog",
        new byte[] {1,2,3,4,5}
    );

    // Act
    await photoManager.AddPhotoAsync(photo);

    // Assert
    blobStorage.Verify(bs => bs.UploadFileAsync(It.IsAny<Stream>()));
}
```

In the above snippet, the first test attempts to verify that the consumer can retrieve a photo, given it already exists in the storage. To facilitate this precondition, we configure the mock in such a way that makes it return a hardcoded byte stream on every call to `ReadFileAsync()`.

However, by doing that, we are implicitly making an assumption about how `PhotoManager` is implemented, specifically that it calls the `ReadFileAsync()` method. This assumption may be true now, but there's no guarantee that it will stay so in the future.

For example, it's not a stretch to imagine that a more sophisticated implementation may instead use `DownloadFileAsync()`, as a means to avoid redundant network requests by preemptively caching photos on the local file system. If we decide to adapt the code to this behavior at some point, our test will break.

The second scenario suffers from the same issues, even though it doesn't need to set up any specific preconditions. Instead, we're using a mock here to record interactions between the dependency and its consumer, which allows us to ensure that `UploadFileAsync()` gets called when we add a new photo.

Just like in the other scenario, the test relies on an assumption that a specific method should be called. This is not stipulated by the contract of the dependency, so we can't know this unless we infer it from the implementation of `PhotoManager`.

It's also worth pointing out that the tests shown in the example above or comparably "light" in regards to their reliance on implementation details. In a more complex system, it might be necessary to have stricter mocks that match only on specific parameters and verify the number of method calls. That, in turn, makes the test more implementation-aware.

Of course, the problem with tests that depend on internal specifics of the system is that they are fragile, as any significant change will inevitably cause them to fail even without introducing actual bugs. Instead of providing a safety net against regressions, these tests lock us into the existing implementation and make it much harder for the code to evolve.

---

In order to solve this issue, it's clear that our test doubles must provide an independent implementation which is not coupled to any particular test. This is exactly where fake implementations come in.

Fakes are fully valid...

Instead of relying on mocking frameworks, we will create our test double manually.

```csharp
public class FakeBlobStorage : IBlobStorage
{
    private readonly Dictionary<int, byte[]> _files = new Dictionary<int, byte[]>();
    private int _lastId;

    public Task<Stream> ReadFileAsync(int fileId)
    {
        var data = _files[fileId];
        var stream = new MemoryStream(data);

        return Task.FromResult(stream);
    }

    public Task DownloadFileAsync(int fileId, string outputFilePath)
    {
        var data = _files[fileId];
        File.WriteAllBytes(outputFilePath, data);

        return Task.CompletedTask;
    }

    public Task<int> UploadFileAsync(Stream stream)
    {
        var data = stream.GetBytes();
        var id = _lastId++;
        _files[id] = data;

        return Task.FromResult(id);
    }

    public Task<IReadOnlyList<int>> UploadManyFilesAsync(IReadOnlyList<Stream> streams)
    {
        var ids = streams
            .Select(s =>
            {
                var data = s.GetBytes();
                var id = _lastId++;
                _files[id] = data;

                return id;
            })
            .ToArray();

        return Task.FromResult(ids);
    }
}
```

## Testing test doubles

Testing relies on validating complex code through simple assertions.

## Summary

Due to the popularity of mocking frameworks and the convenience they provide, many developers find that there is very little incentive to write test doubles by hand. However, relying on dynamically-generated mocks can be dangerous, as it often leads to implementation-aware testing.

In many cases, it may be a better idea to use fakes instead. These are test doubles that represent complete but simplified implementations of their real-life counterparts which can be used for testing.

Because fakes are naturally decoupled from the test scenarios, it's much more difficult to create accidental dependencies on internal specifics of the system. Besides that, their self-contained nature also makes them reusable, which lends itself to better maintainability.
