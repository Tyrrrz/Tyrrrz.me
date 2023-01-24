---
title: 'Reverse-Engineering YouTube: Revisited'
date: '2023-02-15'
---

Back in 2017 I wrote [an article](/blog/reverse-engineering-youtube) in which I attempted to explain how YouTube works under the hood, how it serves streams to the client, and also how you can exploit that knowledge to download videos from the site. The primary goal of that write-up was to share some of the things I learned while working on [YoutubeExplode](https://github.com/Tyrrrz/YoutubeExplode) — an open-source library that provides a structured abstraction layer over YouTube's internal API.

There is one thing that developers like more than building things — and that is breaking things built by other people. So, naturally, my article attracted quite a bit of attention and still remains one of the most popular posts on this blog. One way or another, I had lots of fun doing the research, and I'm glad that it was also useful to other people.

However, many things have changed in the five years since the article was published. YouTube has evolved as a platform, went through multiple UI redesigns, and completely overhauled its frontend codebase. Most of the internal endpoints that were reverse-engineered in the early days have been gradually getting removed altogether. In fact, nearly everything I wrote in the original post has become obsolete and now only serves as a historical reference.

I know that there's still a lot of interest around this topic, so I've been meaning to revisit it and make a follow-up article with new and updated information. Seeing as YouTube has once again entered a quiet phase in terms of change and innovation, I figured that now is finally a good time to do it.

In this article, I'll cover the current state of YouTube's internal API, highlight the most important changes, and explain how everything works today. Just like before, I will focus on the video playback aspect of the platform, outlining everything you need to do in order to resolve video streams and download them.

## Retrieving video metadata

If you've worked with YouTube in the past, you'll probably remember `get_video_info`. This internal API controller was used throughout YouTube's client code to retrieve video metadata, available streams, and everything else the player needed to render it. The origin of this endpoint traces back to the Flash Player days of YouTube, and it was still available as late as July 2021, before it was finally removed.

Besides `get_video_info`, YouTube has also dropped many other endpoints, such as `get_video_metadata` ([in November 2017](https://github.com/Tyrrrz/YoutubeExplode/issues/66#issuecomment-347455728)) and `list_ajax` ([in February 2021](https://github.com/Tyrrrz/YoutubeExplode/issues/501#issuecomment-774802535)), as part of a larger effort to establish a more organized API structure. Now, instead of having a bunch of randomly scattered endpoints with unpredictable formats and usage patterns, YouTube's internal API is comprised out of a coherent set of routes nested underneath the `/youtubei/v1/` path.

In particular, much of the data previously available from `get_video_info` can now be pulled using the `/youtubei/v1/player` route. Unlike its predecessor, this endpoint expects a `POST` request with JSON data, which is also a fair bit more involved. Here is how it looks:

```json
// POST https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8
{
  "videoId": "e_S9VvJM1PI",
  "context": {
    "client": {
      "clientName": "ANDROID",
      "clientVersion": "17.29.35",
      "androidSdkVersion": 30,
      "hl": "en"
    }
  }
}
```

First thing you'll notice is that this endpoint requires authentication, which is done by passing a `key` parameter in the URL. One can assume that it corresponds to some sort of API key which is meant to identify a particular client and maybe even rotate over time — however, I found that it's actually a static value that never changes. This means that it's safe to simply hard code it as part of the URL.

The request body itself is a JSON object with two top-level properties: `videoId` and `context`. The former is pretty self-explanatory — it's the 11-character ID of the video you want to retrieve the metadata for. The latter is more complicated, however, as it represents a container for various information that YouTube uses to tailor the response to the client's preferences and capabilities.

In particular, depending on the client you choose to impersonate using the `clientName` and `clientVersion` properties, the response may contain different data, or just fail to resolve altogether for certain videos. This, of course, can be leveraged to your advantage — which is why I specifically used the `ANDROID` client in the example above — but I'll explain that in more detail later on.

After you receive the response, you should get a JSON payload that contains the video metadata, stream descriptors, closed captions, activity tracking URLs, ad placements, post-playback screen elements — basically everything that the client needs in order to show the video to the user. It's a massive blob of data, but to make things simpler I've outlined only the most interesting parts below:

```json
{
  "videoDetails": {
    "videoId": "e_S9VvJM1PI",
    "title": "Icon For Hire - Make A Move",
    "lengthSeconds": "184",
    "keywords": ["Icon", "For", "Hire", "Make", "Move", "Tooth", "Nail", "(TNN)", "Rock"],
    "channelId": "UCKvT-8xU_BTJGvsQ5lR23TQ",
    "isOwnerViewing": false,
    "shortDescription": "Music video by Icon For Hire performing Make A Move. (P) (C) 2011 Tooth & Nail Records. All rights reserved. Unauthorized reproduction is a violation of applicable laws.  Manufactured by Tooth & Nail,\n\n#IconForHire #MakeAMove #Vevo #Rock #VevoOfficial #OfficialMusicVideo",
    "isCrawlable": true,
    "thumbnail": {
      "thumbnails": [
        {
          "url": "https://i.ytimg.com/vi/e_S9VvJM1PI/default.jpg",
          "width": 120,
          "height": 90
        },
        {
          "url": "https://i.ytimg.com/vi/e_S9VvJM1PI/mqdefault.jpg",
          "width": 320,
          "height": 180
        },
        {
          "url": "https://i.ytimg.com/vi/e_S9VvJM1PI/hqdefault.jpg",
          "width": 480,
          "height": 360
        },
        {
          "url": "https://i.ytimg.com/vi/e_S9VvJM1PI/sddefault.jpg",
          "width": 640,
          "height": 480
        }
      ]
    },
    "allowRatings": true,
    "viewCount": "54284943",
    "author": "IconForHireVEVO",
    "isPrivate": false,
    "isUnpluggedCorpus": false,
    "isLiveContent": false
  },
  "playabilityStatus": {
    "status": "OK",
    "playableInEmbed": true
  },
  "streamingData": {
    "expiresInSeconds": "21540",
    "formats": [
      /* ... */
    ],
    "adaptiveFormats": [
      /* ... */
    ]
  }
  /* ... omitted ~1800 more lines of irrelevant data ... */
}
```

As you can immediately see, the response contains a range of useful information. From `videoDetails`, you can extract the video title, duration, author, view count, thumbnails, and other relevant metadata. This includes most of the stuff you will find on the video page, with the exception of likes, dislikes, channel subscribers, and other bits that are not rendered directly by the player. If you want to get that data as well, you will have to scrape the `/watch` page separately.

Next, the `playabilityStatus` object indicates whether the video is playable within the context of the client that made the request. In case it's not, a `reason` property will be included with a human-readable message explaining why — for example, because the video is intended for mature audiences, or because it's not available in the current region. When dealing with unplayable videos, you'll still be able to access their metadata, but you won't be able to retrieve any streams.

Finally, assuming the video is marked as playable, `streamingData` should contain the list of streams that YouTube provided for the playback. These are divided into `formats` and `adaptiveFormats` arrays inside the response, and correspond to the various quality options available in the player.

The separation between `formats` and `adaptiveFormats` is a bit confusing and I found that it doesn't refer so much to the [delivery method](https://en.wikipedia.org/wiki/Adaptive_bitrate_streaming), but rather to the way the streams are encoded. Specifically, the `formats` array describes traditional video streams, where both the audio and the video tracks are combined into a single container ahead of time, while `adaptiveFormats` lists dedicated audio-only and video-only streams, which are overlaid at run-time by the player.

You'll find that most of the playback options, especially the higher-fidelity ones, are provided using the latter approach, because it's more flexible in terms of bandwidth. By being able to switch the audio and video streams independently, the player can adapt to varying network conditions, as well as different playback contexts — for example, by requesting only the audio stream if the user is consuming content from YouTube Music.

As far as the metadata is concerned, both arrays have a very similar structure and contain objects that look like this:

```json
{
  "itag": 18,
  "url": "https://rr12---sn-3c27sn7d.googlevideo.com/videoplayback?expire=1669027268&ei=ZAF7Y8WaA4i3yQWsxLyYDw&ip=111.111.111.111&id=o-AC63-WVHdIW_Ueyvj6ZZ1eC3oHHyfY14KZOpHNncjXa4&itag=18&source=youtube&requiressl=yes&mh=Qv&mm=31%2C26&mn=sn-3c27sn7d%2Csn-f5f7lnld&ms=au%2Conr&mv=m&mvi=12&pl=24&gcr=ua&initcwndbps=1521250&vprv=1&svpuc=1&xtags=heaudio%3Dtrue&mime=video%2Fmp4&cnr=14&ratebypass=yes&dur=183.994&lmt=1665725827618480&mt=1669005418&fvip=1&fexp=24001373%2C24007246&c=ANDROID&txp=5538434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIge8aU9csL5Od685kA1to0PB6ggVeuLJjfSfTpZVsgEToCIQDZEk4dQyXJViNJr9EyGUhecGCk2RCFzXIJAZuuId4Bug%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAP5rrAq5OoZ0e5bgNZpztkbKGgayb-tAfBbM3Z4VrpDfAiEAkcg66j1nSan1vbvg79sZJkJMMFv1jb2tDR_Z7kS2z9M%3D",
  "mimeType": "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\"",
  "lastModified": "1665725827618480",
  "approxDurationMs": "183994",
  "bitrate": 503351,
  "width": 640,
  "height": 360,
  "projectionType": "RECTANGULAR",
  "fps": 30,
  "quality": "medium",
  "qualityLabel": "360p",
  "audioQuality": "AUDIO_QUALITY_LOW",
  "audioSampleRate": "22050",
  "audioChannels": 2
}
```

Most of the properties here are fairly self-explanatory as they detail the format and overall quality of the stream. For example, from the information above you can tell that this is a muxed (i.e. audio and video combined) `mp4` stream, encoded using the `H.264` video codec and `AAC` audio codec, with a resolution of `640x360` pixels, `30` frames per second, and a bitrate of `503 kbps`. When played on YouTube, this stream would be available as the `360p` quality option.

Each stream is also uniquely identified by something called an `itag`, which is a numeric code that refers to the encoding preset used internally by YouTube to transform the source media into a given representation. In the past, this value was the most reliable way to determine the exact encoding parameters of a given stream, but the new response has enough metadata to make it redundant.

Of course, the most interesting part of the entire object is the `url` property. This is the URL that you can use to play the stream in real-time or download it to a file:

![Stream played in a browser](stream-in-browser.png)

Note that if you try to open the URL from the JSON snippet I've shown above, you'll get a `403 Forbidden` error. That's because YouTube stream URLs are not static, but in fact generated individually for each client and also have a fixed expiration time. Once you obtain the stream manifest, the URLs inside it are only valid for roughly 6 hours and cannot be accessed from an IP address other than the one that requested them.

You can confirm this by looking at the `ip` and `expire` query parameters, which contain the (redacted) client's IP address and the expiration timestamp, respectively. While it may be temping, these values cannot be changed manually to lift the restrictions, because their integrity is protected by a special checksum signature parameter called `sig`. Trying to change any of the parameters enumerated inside `sparams` without correctly updating the signature will also result in a `403 Forbidden` error.

Nevertheless, the steps outlined so far should be enough to download most YouTube videos out there. There are a few more things to consider though, but I'll cover them in the next section.

## Descrambling the signature & Age-restricted videos

// Explain how using ANDROID client helps

racy check etc

TVHTML5 workaround

## Muxing streams

FFmpeg

## Bypassing rate limits

still needed for some streams

## DASH manifest

doesn't require signature anymore

## Summary

And remember: **if it happens in the browser, it can be replicated in code**.