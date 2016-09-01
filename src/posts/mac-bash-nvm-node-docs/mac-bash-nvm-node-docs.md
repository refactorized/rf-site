---
title: node-docs alias
summary: bash (mac) one-liner to view nvm-selected node version docs.
---
## What-why?

<!--short-->
This is a feature I expected to find in nvm, and when I didn't I forked the repo so I could add it. I am a little busy right now, however; and I didn't know the best way to go about writing tests for a proper pull request, seeing as I would have to monitor the launch of a web page.

So I took the path of least resistance, and kind of like how that turned out. There is something delicious about adding so much convenience with 5 minutes of thought and one line of code.
<!--short-->
## How?

Here's the alias I add to my start-up [dotfiles](https://github.com/refactorized/dotfiles) :

```
alias node-docs='open http://nodejs.org/docs/`node --version`/api/'

```

This simply opens a browser to node's versioned api docs, which follow a simple convetion. To fulfill that convetion ``node --version`` is invoked inline to output the currently active node install's version. This works with nvm because nvm takes care of aliasing the executable in a very straightforward way. It works without nvm too, as its just a regular node call.

### The single quotes

Originally, I had this wrapped up as a bash function, but it works fine as a simple alias, so I quickly stuck it with my other aliases and wrapped it in a pair of double quotes to ensure the entire command was used as the alias. I tested it out in a random directory and, sure enough, the docs for the system default version of node showed up in my browser, 0.10.35 in my case. _But_ when I used `npm use 0.11.16` to set my shell environment accordingly, subsequent calls to node-docs would load the same system default docs as before.

"Well, _Duh_" says the seasoned bash programmer, the contents inside the double quotes are expanded when the script is run. The ``node --version`` part 'executes' when the alias is first built and the resulting alias becomes `open http://nodejs.org/docs/v0.10.35/api/`. Wrapping it all in single quotes instead prevents bash from evaluating the inner expressions until the alias is invoked from the shell.

This should work with little modification in linux too, namely replacing the `open` command, but I haven't tried.

 
