---
title: New blog, new blog engine
date: 2016-09-01
tags: [gulp, github, blog]
---

![gulp + github pages = love](octogulp.png)

_I'm still working on it, as you can likely tell._

Instead of wrangling some existing solution I am rolling my own simple static site-gen with gulp.

This allows me to host the output for free using [GitHub Pages](https://pages.github.com/)!

Repo is on [github](https://github.com/refactorized/rf-site) and uses the [gulp-gh-pages plugin](https://github.com/shinnn/gulp-gh-pages) to deploy the actual site.
 
Code is an unholy mess at the moment, but after a refactor it should be a pretty good guide for similar projects.

I am vacillating between keeping the code very direct to the purpose of generating this particular blog or delving into creating a general purpose engine.  

Either way, my plan is to clean the code up and write several posts on its continued development.

Things to work on:

- comments
- general layout and navigation improvements
- archives
- tags



