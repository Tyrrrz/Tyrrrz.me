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

In fact, a mock is not intended to replicate or even resemble the behavior of a real dependency. Its main purpose is rather to simulate specific preconditions in the system under test, by providing input in a roundabout way.

Besides that, mocks can also be used to record outgoing interactions, such as method calls, including the number of times they appear as well as the passed parameters. This makes it possible to observe any side-effects that take place within the system and verify them against expectations.

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

Looking at `IBlobStorage`, we can see that this module provides various operations to read, download, and upload files. It's not clear what the real implementation of this interface looks like, but for the sake of complexity we may pretend that it relies on some expensive cloud provider that doesn't lend itself well for testing.

The storage client is in turn referenced as a dependency in another component, called `PhotoManager`. This class is responsible for keeping track of user photos and persisting them online:

```csharp
public class PhotoManager
{
    private readonly IBlobStorage _storage;

    public PhotoManager(IBlobStorage storage) =>
        _storage = storage;

    /* ... */

    public async Task<Photo> GetPhotoAsync(int photoId)
    {
        /* ... */
    }

    public async Task UploadPhotoAsync(Photo photo)
    {
        /* ... */
    }
}
```

In a real world, there would probably be many other components as well, including the entry point through which the user interacts with the application. When testing software, it's very important to account for all pieces of the pipeline, but to keep the example simple we will focus only on `PhotoManager` and `IBlobStorage`.

Now, we've already decided that we can't use the real implementation of `IBlobStorage` in our tests, so we have to employ test doubles instead. Once way to approach this is, of course, by mocking `IBlobStorage` and its interactions:

```csharp
[Fact]
public async Task I_can_get_a_photo_by_its_ID()
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
    photo.Data.Should().Equal(photoData);
}

[Fact]
public async Task I_can_upload_a_photo()
{
    // Arrange
    var photoData = new byte[] {1, 2, 3, 4, 5};

    var blobStorage = Mock.Of<IBlobStorage>();

    var photoManager = new PhotoManager(blobStorage.Object);

    // Act
    await photoManager.UploadPhotoAsync(new Photo(photoData));

    // Assert
    blobStorage.Verify(bs => bs.UploadFileAsync(It.IsAny<Stream>()), Times.Once());
}
```

As we know, the danger of relying on mocked behavior is that it becomes painfully easy to write implementation-aware tests. Let's go over the scenarios above to identify their issues.

The first test attempts to verify that calling `photoManager.GetPhotoAsync()` does return a valid photo, given that it exists in the blob storage. To facilitate that precondition, we configure the mocked `IBlobStorage` so that it returns a prearranged stream when its `ReadFileAsync()` is called.

In doing so, we are inherently making an assumption about how `PhotoManager.GetPhotoAsync()` is implemented, specifically that it calls `IBlobStorage.ReadFileAsync()`. This may be true at the time the test is written, but such things can easily change in the future. It's not a stretch to imagine that a more sophisticated implementation may be using `IBlobStorage.DownloadFileAsync()` instead to avoid redundant requests by caching photos on the file system.

The second test verifies that calling `photoManager.UploadPhotoAsync()` successfully pushed the contents of the photo to the remote server. Since this scenario does not involve any specific preconditions, the mock is used only as a means to record interactions between `photoManager` and `blobStorage`.

Similarly, this test suffers from the same issues, as it relies on the assumption that `blobStorage.UploadFileAsync()` will be called once, or that it will be called at all.

These kind of assumptions make these tests very frail, because any significant change in the implementation of `PhotoManager` will cause the suite to start failing, even though no bugs were introduced. This makes it very difficult to introduce changes in code, including refactoring, as instead of providing a safety net against regressions, these tests lock us into a specific implementation.

What can we do to fix this?

## Testing test doubles

Testing relies on validating complex code through simple assertions.

## Summary

Due to the popularity of mocking frameworks and the convenience they provide, many developers find that there is very little incentive to write test doubles by hand. However, relying on dynamically-generated mocks can be dangerous, as it often leads to implementation-aware testing.

In many cases, it may be a better idea to use fakes instead. These are test doubles that represent complete but simplified implementations of their real-life counterparts which can be used for testing.

Because fakes are naturally decoupled from the test scenarios, it's much more difficult to create accidental dependencies on internal specifics of the system. Besides that, their self-contained nature also makes them reusable, which lends itself to better maintainability.
