---
title: 'Reverse-Engineering YouTube'
date: '2017-12-15'
---

Almost a year ago, I started developing [YoutubeExplode](https://github.com/Tyrrrz/YoutubeExplode), a library that scrapes information on YouTube videos and lets you download them. Originally, my main motivation for developing it was simply to gain experience, as the task involved a lot of research and reverse-engineering. Nowadays, YoutubeExplode is arguably the most consistent and robust .NET library for working with YouTube.

Since this is a relatively popular discussion topic among many beginner developers, I thought that I could help out by sharing the knowledge I found by spending dozens of hours staring at Chrome Developer Tools.

> As of YoutubeExplode v6.0.7 (10-Dec-2021), practically everything in this post has become outdated, and the highlighted approaches are no longer used by my library. Instead of trying to continue updating the information here, I decided to write a completely new article altogether — [Reverse-Engineering YouTube: Revisited](/blog/reverse-engineering-youtube-revisited)

## Getting the video metadata

In order to find and resolve the video's media streams, you need to first get its metadata. There are a few ways to do it, but the most reliable one is by querying an AJAX endpoint used internally by YouTube's iframe embed API. The format is as follows: <https://www.youtube.com/get_video_info?video_id={videoId}>.

The request can take a lot of different parameters, but at minimum it needs a video ID — the value in the URL that comes after `/watch?v=`, for example `e_S9VvJM1PI`.

The response contains URL-encoded metadata, which has to be decoded first before it's usable. After that, you can map the parameter names to values in a dictionary for easier access. Some parameter values are nested objects themselves, so they can in turn be mapped to nested dictionaries.

Here's an example of the decoded metadata (truncated for brevity):

```ini
status=ok
view_count=24022293
muted=0
use_cipher_signature=True
iurl=https://i.ytimg.com/vi/e_S9VvJM1PI/hqdefault.jpg
iurlhq720=https://i.ytimg.com/vi/e_S9VvJM1PI/hq720.jpg
video_id=e_S9VvJM1PI
avg_rating=4.8990560233
videostats_playback_base_url=https://s.youtube.com
ucid=UCKvT-8xU_BTJGvsQ5lR23TQ
iurlmq=https://i.ytimg.com/vi/e_S9VvJM1PI/mqdefault.jpg
thumbnail_url=https://i.ytimg.com/vi/e_S9VvJM1PI/default.jpg
loudness=-18.5090007782
pltype=content
cl=176519171
author=IconForHireVEVO
ptk=youtube_single
is_listed=1
allow_embed=1
short_view_count_text=24M views
relative_loudness=2.4909992218
fmt_list=43/640x360,18/640x360,36/426x240,17/256x144,13/256x144
has_cc=False
title=Icon For Hire - Make A Move
iurlmaxres=https://i.ytimg.com/vi/e_S9VvJM1PI/maxresdefault.jpg
keywords=Icon,For,Hire,Make,Move,Tooth,Nail,(TNN),Rock
length_seconds=184
allow_ratings=1
iurlsd=https://i.ytimg.com/vi/e_S9VvJM1PI/sddefault.jpg
iurlhq=https://i.ytimg.com/vi/e_S9VvJM1PI/hqdefault.jpg
url_encoded_fmt_stream_map=...
adaptive_fmts=...
dashmpd=...
```

As you can see, there is quite a lot of information that can be extracted straight away.

Let's also look at some important optional query parameters that this request can take:

- `hl` — the name of the locale used to localize some strings. If not set, it defaults to the locale inferred from your IP address. Use `hl=en` to force the English language on all strings.
- `el` — the type of YouTube page that originated this request. This decides what kind of information will be available in the response. In some cases, you will need to set this parameter to a certain value depending on the type of the video, in order to avoid errors. Defaults to `embedded`.
- `sts` — a timestamp which identifies the version of the signature cipher used in stream URLs. Defaults to empty.

### The "el" parameter

The `el` request parameter can take multiple values, and it affects what kind of data you will receive in the response. There are only a few that actually matter though, so I'll list them here:

- `embedded` — the default value. YouTube uses this when requesting information for embedded videos. Doesn't work with videos that aren't embeddable, but works with age-restricted videos.
- `detailpage` — an alternative value, which yields a bit more info. Conversely, works with videos that aren't embeddable, but doesn't work with age-restricted videos.

YoutubeExplode uses `el=embedded` for the first query. If it fails because the video cannot be embedded, it then retries with `el=detailpage`.

### Handling errors

When the request fails, the response will contain only a few fields:

- `status` — which is equal to `fail`
- `errorcode` — integer code that identifies the error
- `reason` — text message that explains why the video is not available

Error codes seem to be very generic and most of the time it's either `100` or `150`, so they aren't very useful at determining what went wrong.

### Paid videos

Some videos need to be purchased before they can be watched. In such cases, there will be:

- `requires_purchase` — which is equal to `1`
- `ypc_vid` — ID of the corresponding preview video (trailer) which can be watched for free

## Resolving media streams

Media streams and their metadata come in many different forms.

### Muxed streams

Multiplexed (muxed) streams are the type that contain both video and audio tracks in the same stream. YouTube provides these streams only in low qualities — the best they can be is 720p30.

Metadata for these streams is contained within the URL-encoded response mentioned earlier, inside the `url_encoded_fmt_stream_map` parameter. To extract it, you simply need to split the value by `,` and then URL-decode each part.

This is how the decoded metadata looks for an individual muxed stream:

```ini
itag=43
type=video/webm; codecs="vp8.0, vorbis"
fallback_host=redirector.googlevideo.com
url=https://r12---sn-3c27sn7k.googlevideo.com/videoplayback?itag=43&lmt=1367519763212098&ipbits=0&key=yt6&mime=video%2Fwebm&expire=1511401259&mn=sn-3c27sn7k&mm=31&ms=au&mv=m&mt=1511379591&ei=y9IVWuuyKI-YdLvnm8AO&sparams=dur%2Cei%2Cgcr%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cnh%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cexpire&ip=255.255.255.255&id=o-AJuM11wvxuVl2WBgfb3nr6zbmXsFGQvhMelDobZ_KOrE&nh=IgpwcjAxLmticDAxKgkxMjcuMC4wLjE&requiressl=yes&gcr=ua&source=youtube&ratebypass=yes&pl=24&initcwndbps=1112500&dur=0.000
s=9599599594B0133328AA570AE0129E58478D7BCE9D226F.15ABC404267945A3F64FB4E42074383FC4FA80F5
quality=medium
```

You will be interested in the following properties:

- `itag` — integer code that identifies the type of the stream
- `type` — MIME type and codecs
- `url` — URL that serves the stream
- `s` — cipher signature used to protect the stream (if present)

Note: I've encountered cases when [some of the muxed streams were removed](https://github.com/Tyrrrz/YoutubeExplode/issues/36) despite still appearing in the metadata. Therefore, it's recommended to send HEAD requests to check that each stream is still available. You can get content length as well while you're at it, since it's not present in the metadata.

### Adaptive streams

YouTube also uses video-only and audio-only streams. These come at the highest available qualities, with no limitations.

Similarly to muxed streams, metadata for these streams can be extracted from the `adaptive_fmts` parameter. Here's how it looks:

```ini
itag=134
lmt=1507180885248732
clen=10889173
size=640x360
quality_label=360p
bitrate=638590
index=709-1196
projection_type=1
url=https://r12---sn-3c27sn7k.googlevideo.com/videoplayback?itag=134&lmt=1507180885248732&ipbits=0&key=yt6&mime=video%2Fmp4&expire=1511401259&aitags=134&mn=sn-3c27sn7k&mm=31&ms=au&mv=m&mt=1511379591&ei=y9IVWuuyKI-YdLvnm8AO&sparams=aitags%2Cclen%2Cdur%2Cei%2Cgcr%2Cgir%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cnh%2Cpl%2Crequiressl%2Csource%2Cexpire&ip=255.255.255.255&clen=10889173&id=o-AJuM11wvxuVl2WBgfb3nr6zbmXsFGQvhMelDobZ_KOrE&gir=yes&nh=IgpwcjAxLmticDAxKgkxMjcuMC4wLjE&requiressl=yes&gcr=ua&source=youtube&pl=24&initcwndbps=1112500&dur=183.850
fps=30
s=D68D68D685A42CD39B87D2AC677C8B34FA2DE3A1F3A9A5.902A1E29122D7018F6AC7C1EAFA4A51BE84C3A5C
type=video/mp4;+codecs="avc1.4d401e"
init=0-708
```

Adaptive streams have a slightly extended set of properties. I'll list the useful ones:

- `itag` — integer code that identifies the type of the stream
- `type` — MIME type and codecs
- `url` — URL that serves the stream
- `s` — cipher signature used to protect the stream (if present)
- `clen` — content length of the stream in bytes
- `bitrate` — bit rate of the stream in kbit/sec
- `size` — resolution of the video (video-only)
- `fps` — frame rate of the video (video-only)

### Adaptive streams in DASH manifest

Video info may contain the URL of a DASH manifest inside the `dashmpd` parameter. It's not always present and some videos might never have it at all.

To resolve metadata of these streams, you need to first download the manifest using the provided URL. Sometimes a manifest can be protected. If it is, you should be able to find the signature inside the URL — it's the value separated by slashes that comes after `/s/`.

Streams in DASH can also be segmented — each segment starting at a given point and lasting only a second or two. This is the type that your browser normally uses when playing a video on YouTube — it lets it easily adjust the quality based on network conditions. Segmented streams are also used for livestream videos. This post will not be covering them, however, as processing them is not required to download videos.

The DASH manifest follows [this XML schema](http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd). You can parse the stream metadata if you go through all the descendant nodes of type `Representation`. Here's how they appear:

```xml
<Representation id="133" codecs="avc1.4d4015" width="426"
                height="240" startWithSAP="1" maxPlayoutRate="1"
                bandwidth="246787" frameRate="30" mediaLmt="1507180947831345">
  <BaseURL contentLength="4436318">https://r12---sn-3c27sn7k.googlevideo.com/videoplayback?id=7bf4bd56f24cd4f2&amp;itag=133&amp;source=youtube&amp;requiressl=yes&amp;ei=Bt4VWqLOJMT3NI3qjPgB&amp;ms=au&amp;gcr=ua&amp;mv=m&amp;pl=24&amp;mn=sn-3c27sn7k&amp;initcwndbps=1143750&amp;mm=31&amp;nh=IgpwcjAxLmticDAxKgkxMjcuMC4wLjE&amp;ratebypass=yes&amp;mime=video/mp4&amp;gir=yes&amp;clen=4436318&amp;lmt=1507180947831345&amp;dur=183.850&amp;mt=1511382418&amp;key=dg_yt0&amp;s=7227CB6B79F7C702BB11275F9D71C532EB7E72046.DD6F06570E470E0E8384F74B879F79475D023A64A64&amp;signature=254E9E06DF034BC66D29B39523F84B33D5940EE3.1F4C8A5645075A228BB0C2D87F71477F6ABFFA99&amp;ip=255.255.255.255&amp;ipbits=0&amp;expire=1511404134&amp;sparams=ip,ipbits,expire,id,itag,source,requiressl,ei,ms,gcr,mv,pl,mn,initcwndbps,mm,nh,ratebypass,mime,gir,clen,lmt,dur</BaseURL>
  <SegmentBase indexRange="709-1196" indexRangeExact="true">
    <Initialization range="0-708" />
  </SegmentBase>
</Representation>
```

They have the following attributes:

- `id` — integer code that identifies the type of the stream
- `bandwidth` — bit rate of the stream in kbit/sec
- `width` — width of the video (video-only)
- `height` — height of the video (video-only)
- `frameRate` — frame rate of the video (video-only)

The URL can be extracted from the inner text of the `<BaseURL>` node.

Note: don't be tempted to extract content length from the `contentLength` attribute, because it doesn't always appear on the `<BaseURL>` tag. Instead, you can use regular expressions to parse it from the `clen` query parameter in the URL.

## Protected videos and cipher signatures

You may notice that some videos, mostly the ones uploaded by verified channels, are protected. This means that their media streams and DASH manifests cannot be directly accessed by URL — a 403 error code will be returned instead. To be able to access them, you need to decipher their signatures and then modify the URL accordingly.

For muxed and adaptive streams, the signatures are part of the extracted metadata. DASH streams themselves are never protected, but the actual manifest may be — the signature is stored as part of the URL.

A signature is a string made out of two sequences of uppercase letters and numbers, separated by a period. Here's an example:

```
537513BBC517D8643EBF25887256DAACD7521090.AE6A48F177E7B0E8CD85D077E5170BFD83BEDE6BE6C6C
```

When your browser opens a YouTube video, it transforms the signature using a set of operations defined in the player's source code, appending the result as an additional parameter inside the URL of each media stream. To repeat the same process from code, you need to locate the JavaScript source of the player used by the video and parse it.

### Reverse-engineering the player

Every video uses a slightly different version of the player, which means that you need to figure out which one to download. If you get the HTML of the [video's embed page](https://www.youtube.com/embed/e_S9VvJM1PI), you can search for `"js":` to find a JSON property that contains the player's relative source code URL. Once you prepend YouTube's host to it, you'll end up with a URL like this one:

```
https://www.youtube.com/yts/jsbin/player-vflYXLM5n/en_US/base.js
```

Besides obtaining the URL to the player's source, you also need to get something called `sts`, which is a timestamp used to identify the version of the signature cipher. You will need to send it through a parameter on the `get_video_info` endpoint mentioned earlier — this makes sure that the returned metadata is valid for this player. You can extract the value of `sts` similarly, just search for `"sts":` and you should find it.

Once you locate the source code URL and download it, you need to parse it. There are few ways to do it, for simplicity reasons I chose to parse it using regular expressions.

Instead of explaining step-by-step what exactly you need to do, I'll just copy a small part of YoutubeExplode's source code. I made sure to comment it to the best of my ability, so it should be pretty easy to follow.

```csharp
private async Task<IReadOnlyList<ICipherOperation>> GetCipherOperationsAsync(string sourceUrl)
{
    // Get player source code
    var sourceRaw = await _httpClient.GetStringAsync(sourceUrl);

    // Find the name of the function that handles deciphering
    var entryPoint = Regex.Match(sourceRaw,
        @"\bc\s*&&\s*d\.set\([^,]+,\s*(?:encodeURIComponent\s*\()?\s*([\w$]+)\(").Groups[1].Value;
    if (string.IsNullOrWhiteSpace(entryPoint))
        throw new Exception("Could not find the entry function for signature deciphering.");

    // Find the body of the function
    var entryPointBody = Regex.Match(sourceRaw,
        @"(?!h\.)" + Regex.Escape(entryPoint) + @"=function\(\w+\)\{(.*?)\}",
        RegexOptions.Singleline).Groups[1].Value;
    if (string.IsNullOrWhiteSpace(entryPointBody))
        throw new Exception("Could not find the signature decipherer function body.");
    var entryPointLines = entryPointBody.Split(";");

    // Identify cipher functions
    string reverseFuncName = null;
    string sliceFuncName = null;
    string charSwapFuncName = null;
    var operations = new List<ICipherOperation>();

    // Analyze the function body to determine the names of cipher functions
    foreach (var line in entryPointLines)
    {
        // Break when all functions are found
        if (!string.IsNullOrWhiteSpace(reverseFuncName) &&
            !string.IsNullOrWhiteSpace(sliceFuncName) &&
            !string.IsNullOrWhiteSpace(charSwapFuncName))
            break;

        // Get the function called on this line
        var calledFuncName = Regex.Match(line, @"\w+\.(\w+)\(").Groups[1].Value;
        if (string.IsNullOrWhiteSpace(calledFuncName))
            continue;

        // Find cipher function names
        if (Regex.IsMatch(sourceRaw, $@"{Regex.Escape(calledFuncName)}:\bfunction\b\(\w+\)"))
        {
            reverseFuncName = calledFuncName;
        }
        else if (Regex.IsMatch(sourceRaw,
            $@"{Regex.Escape(calledFuncName)}:\bfunction\b\([a],b\).(\breturn\b)?.?\w+\."))
        {
            sliceFuncName = calledFuncName;
        }
        else if (Regex.IsMatch(sourceRaw,
            $@"{Regex.Escape(calledFuncName)}:\bfunction\b\(\w+\,\w\).\bvar\b.\bc=a\b"))
        {
            charSwapFuncName = calledFuncName;
        }
    }

    // Analyze the function body again to determine the operation set and order
    foreach (var line in entryPointLines)
    {
        // Get the function called on this line
        var calledFuncName = Regex.Match(line, @"\w+\.(\w+)\(").Groups[1].Value;
        if (string.IsNullOrWhiteSpace(calledFuncName))
            continue;

        // Swap operation (swaps first character and character at index)
        if (calledFuncName == charSwapFuncName)
        {
            var index = int.Parse(Regex.Match(line, @"\(\w+,(\d+)\)").Groups[1].Value);
            operations.Add(new SwapCipherOperation(index));
        }
        // Slice operation (returns substring at index)
        else if (calledFuncName == sliceFuncName)
        {
            var index = int.Parse(Regex.Match(line, @"\(\w+,(\d+)\)").Groups[1].Value);
            operations.Add(new SliceCipherOperation(index));
        }
        // Reverse operation (reverses the entire string)
        else if (calledFuncName == reverseFuncName)
        {
            operations.Add(new ReverseCipherOperation());
        }
    }

    return operations;
}
```

The output of this method is a collection of `ICipherOperation`s. At this point in time, there can be up to 3 kinds of cipher operations:

- **Swap** — swaps the first character in the signature with another character, identified by its position
- **Slice** — truncates characters in the signature which come before the specified position
- **Reverse** — reverses the entire signature

Once you successfully extract the type and order of the used operations, you need to store them somewhere so that you can execute them on a signature.

### Deciphering signatures and updating URLs

After parsing the player source code, you can get the deciphered signatures and update the URL accordingly.

For muxed and adaptive streams, transform the signature extracted from the metadata and add it as a _query_ parameter called `signature`:

```
...&signature=212CD2793C2E9224A40014A56BB8189AF3D591E3.523508F8A49EC4A3425C6E4484EF9F59FBEF9066
```

For DASH manifests, transform the signature extracted from the URL and add it as a _route_ parameter called `signature`:

```
.../signature/212CD2793C2E9224A40014A56BB8189AF3D591E3.523508F8A49EC4A3425C6E4484EF9F59FBEF9066/
```

## Identifying stream properties

Each media stream has an `itag` that uniquely identifies its properties, such as container type, codecs, video quality, etc. YoutubeExplode resolves these properties using a predefined map of known tags:

```csharp
private static readonly Dictionary<int, ItagDescriptor> ItagMap = new Dictionary<int, ItagDescriptor>
{
    // Muxed
    {5, new ItagDescriptor(Container.Flv, AudioEncoding.Mp3, VideoEncoding.H263, VideoQuality.Low144)},
    {6, new ItagDescriptor(Container.Flv, AudioEncoding.Mp3, VideoEncoding.H263, VideoQuality.Low240)},
    {13, new ItagDescriptor(Container.Tgpp, AudioEncoding.Aac, VideoEncoding.Mp4V, VideoQuality.Low144)},
    {17, new ItagDescriptor(Container.Tgpp, AudioEncoding.Aac, VideoEncoding.Mp4V, VideoQuality.Low144)},
    {18, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium360)},
    {22, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High720)},
    {34, new ItagDescriptor(Container.Flv, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium360)},
    {35, new ItagDescriptor(Container.Flv, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium480)},
    {36, new ItagDescriptor(Container.Tgpp, AudioEncoding.Aac, VideoEncoding.Mp4V, VideoQuality.Low240)},
    {37, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High1080)},
    {38, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High3072)},
    {43, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.Medium360)},
    {44, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.Medium480)},
    {45, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.High720)},
    {46, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.High1080)},
    {59, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium480)},
    {78, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium480)},
    {82, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium360)},
    {83, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium480)},
    {84, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High720)},
    {85, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High1080)},
    {91, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Low144)},
    {92, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Low240)},
    {93, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium360)},
    {94, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Medium480)},
    {95, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High720)},
    {96, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.High1080)},
    {100, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.Medium360)},
    {101, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.Medium480)},
    {102, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, VideoEncoding.Vp8, VideoQuality.High720)},
    {132, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Low240)},
    {151, new ItagDescriptor(Container.Mp4, AudioEncoding.Aac, VideoEncoding.H264, VideoQuality.Low144)},

    // Video-only (mp4)
    {133, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.Low240)},
    {134, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.Medium360)},
    {135, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.Medium480)},
    {136, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High720)},
    {137, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High1080)},
    {138, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High4320)},
    {160, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.Low144)},
    {212, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.Medium480)},
    {213, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.Medium480)},
    {214, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High720)},
    {215, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High720)},
    {216, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High1080)},
    {217, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High1080)},
    {264, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High1440)},
    {266, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High2160)},
    {298, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High720)},
    {299, new ItagDescriptor(Container.Mp4, null, VideoEncoding.H264, VideoQuality.High1080)},

    // Video-only (webm)
    {167, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp8, VideoQuality.Medium360)},
    {168, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp8, VideoQuality.Medium480)},
    {169, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp8, VideoQuality.High720)},
    {170, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp8, VideoQuality.High1080)},
    {218, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp8, VideoQuality.Medium480)},
    {219, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp8, VideoQuality.Medium480)},
    {242, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Low240)},
    {243, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Medium360)},
    {244, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Medium480)},
    {245, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Medium480)},
    {246, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Medium480)},
    {247, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High720)},
    {248, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High1080)},
    {271, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High1440)},
    {272, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High2160)},
    {278, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Low144)},
    {302, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High720)},
    {303, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High1080)},
    {308, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High1440)},
    {313, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High2160)},
    {315, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High2160)},
    {330, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Low144)},
    {331, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Low240)},
    {332, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Medium360)},
    {333, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.Medium480)},
    {334, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High720)},
    {335, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High1080)},
    {336, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High1440)},
    {337, new ItagDescriptor(Container.WebM, null, VideoEncoding.Vp9, VideoQuality.High2160)},

    // Audio-only (mp4)
    {139, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},
    {140, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},
    {141, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},
    {256, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},
    {258, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},
    {325, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},
    {328, new ItagDescriptor(Container.M4A, AudioEncoding.Aac, null, null)},

    // Audio-only (webm)
    {171, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, null, null)},
    {172, new ItagDescriptor(Container.WebM, AudioEncoding.Vorbis, null, null)},
    {249, new ItagDescriptor(Container.WebM, AudioEncoding.Opus, null, null)},
    {250, new ItagDescriptor(Container.WebM, AudioEncoding.Opus, null, null)},
    {251, new ItagDescriptor(Container.WebM, AudioEncoding.Opus, null, null)}
};
```

Things like bit rate, resolution and frame rate are not strictly regulated by `itag`, so you still need to extract them from metadata.

## Bypassing rate limits

By default, adaptive streams are served at a limited rate — just enough to fetch the next part as the video plays. This is not optimal if the goal is to download the video as fast as possible.

To circumvent this, you may download the stream in multiple segments by sending HTTP requests with a `Range` header. For each request you make, YouTube first provides a small chunk instantly, followed by the rest of the data which is throttled.

Interestingly, even just by having the header set, the throttling seems to kick in much later than usual. After experimenting for some time, I've found that splitting up the requests in segments of around 10mb is optimal for videos of all sizes.

## Summary

Here's a recap of all the steps you need to take in order to download a video from YouTube:

1. Get the video ID (e.g. `e_S9VvJM1PI`)
2. Download the video's embed page (e.g. <https://www.youtube.com/embed/e_S9VvJM1PI>)
3. Extract the URL of the player's source code (e.g. <https://www.youtube.com/yts/jsbin/player-vflYXLM5n/en_US/base.js>)
4. Get the `sts` value (e.g. `17488`)
5. Download and parse the player's source code
6. Request the video metadata (e.g. <https://www.youtube.com/get_video_info?video_id=e_S9VvJM1PI&sts=17488&hl=en>); try with `el=detailpage` if it fails
7. Parse the URL-encoded metadata and extract information about streams
8. If they have signatures, use the player's source to decipher them and update the URLs
9. If there's a reference to a DASH manifest, extract the URL and decipher it if necessary as well
10. Download the DASH manifest and extract additional streams
11. Use `itag` to classify streams by their properties
12. Choose a stream and download it in segments

If you have any issues, you can always refer to the source code of [YoutubeExplode](https://github.com/Tyrrrz/YoutubeExplode) or ask me questions in the comments.
