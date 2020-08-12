---
title: Pure-Impure Segregation Principle
date: 2020-08-30
cover: Cover.png
---

![cover](Cover.png)

About a month ago I published an article titled ["Unit Testing is Overrated"](/blog/unit-testing-is-overrated) where I shared my thoughts on how developers place way too much faith in that testing approach and why it often isn't the best tool for the job. While I didn't expect that post to do particularly well, it managed to get over 100k views and 1k comments in a span of just a couple of weeks in spite of its controversial nature (or, perhaps, owing to it?).

It was really interesting to follow the discussion as it unfolded, due to the vast contrast of opinions people seemed to have on the subject. While most commenters mainly shared their personal experiences, a few have also voiced criticism of the way some arguments were presented.

In particular, a couple of comments mentioned that the drawbacks I've described, especially those concerning abstractions and mocking, are really just a byproduct of object-oriented programming and its inherent flaws. Had my examples been designed with functional principles in mind, many of the outlined problems would never have surfaced.

The suggested approach was to refactor the class hierarchy I had in my example by creating a clear separation between the pure business logic and impure side-effects. Getting rid of the hierarchy eliminates the need for mocking, which in turn greatly simplifies unit testing.

Although the article also later alluded to this exact approach (in another context), I agree that the original example was a bit forced and could be simplified. And while I think that this doesn't take away from the point of the article, I also believe that the principle of separating pure and impure code is very potent and can often positively influence the design of your software.

When I was just getting into functional programming, one of the earliest mindset shifts I've experienced was upon learning of the functional architecture and how it utilizes this principle. Since then I've been applying these ideas on a daily basis, even when writing object-oriented code.

Because of its importance, I feel like this topic really deserves a dedicated article of its own. So to that end, I will try to cover it in this piece, explaining what makes the code pure or impure, why would we want to create separation based on such seemingly arbitrary properties, where it can be beneficial and where it probably isn't worth doing at all.

_Note: as usual, the article contains code samples in F# and C#, but the ideas are universal and apply to practically any language._
