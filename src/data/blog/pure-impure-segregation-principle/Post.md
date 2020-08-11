---
title: Pure-Impure Segregation Principle
date: 2020-08-30
cover: Cover.png
---

![cover](Cover.png)

About a month ago I published an article titled ["Unit Testing is Overrated"](/blog/unit-testing-is-overrated) where I shared my thoughts on why I believe developers place way too much faith in this testing approach and why it often isn't the best tool for the job. While I didn't expect that post to do particularly well, it managed to get over 100k views and 1k comments in a span of just a couple of weeks, despite its controversial nature (or perhaps thanks to it).

It was really interesting to follow the discussions as they unfolded, due to a vast contrast of opinions people seemed to have on the subject. While most commenters mainly shared their personal experiences, a few have also voiced criticism of the way some arguments were presented in the article.

In particular, a couple of comments mentioned that the drawbacks I've described, especially those concerning abstractions and mocking, are really just a byproduct of object-oriented programming and its inherent flaws. Had my examples been designed with functional principles in mind, many of the problems I had would not have even existed.

The suggested approach was to refactor a class hierarchy I had in my example by creating a clear separation between the pure business logic and impure side-effects. Getting rid of the hierarchy eliminates the need for mocking, which greatly simplifies unit testing.

Although I've also alluded to this exact approach later in the article, I agree that the original example was a bit forced and can be simplified. However, I think it doesn't take away from the conclusions I've made as they still apply well to unit testing as a whole.

Nevertheless, I believe that the principle of separating pure and impure code from each other is a powerful tool for guiding software design, which deserves an article of its own. In this piece I will try to explain what problems it attempts to solve, how it helps to change a developer's mindset, and how we can apply it in practice.
