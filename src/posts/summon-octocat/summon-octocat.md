---
title: Summon Octocat to stand up a github repo in seconds.
---


I have really been trying to get in the habbit of putting my code up on github as soon as I start on a project, even if it's just a curiosity. I have wirtten a _quick and dirty_ script to knock this step out without halting my momentum; my ADD doesn't need competition from my workflow.

<!--short-->

<aside>

**Update:** My workflow is now being helped along by github's
[hub](https://github.com/github/hub) tool, which is excellent.  

Go ~~git~~ get it right now, you won't be sorry.

</aside>

### The Quick:

The script does the following given a project name, and optional description string:

1.  Creates project subdirctory, named after project name
2.  CDs into that directory and initzilizes a new git repo
3.  Touches an empty README.md file and adds it to the git index.
4.  Commits the changes with the comment 'init'
5.  Makes an api call to github to new up a repo named after the project

    *   This ends up asking for my git password, which I like just fine.
    *   This also redirects the response ouput to /dev/null which is kinda lame.
6.  Adds the remote, as origin
7.  Pushes to origin/master

This happens in a few seconds and without any need to leave the terminal.

### The Dirty:

The script is not at all robust, and requires many things to not go wrong:

*   Any error with any step will be unhandled, and probably break all subsequent steps, and surely leave things in an unknown state.
*   This does not handle the problem of preexisting repos in your current directory, or on github with the same name.
*   This uses the same name for the directory and reposistory and hasn't been tested with anything outside of simple camelCase or dash-seperated project names
*   The script can not be reran to correct an error that occured

But really the solution to any of these problems is just to `cd..` & `rm -rf` the folder the script created. Because I run this script before writing any code, npm'ing any packages, etc. I can afford a messy script that doesn't disturb the muses.

### The Code:

The following sits in my funcs file and can be found in my [dotfiles](https://github.com/refactorized/dotfiles) repo.

```
  gh-summon () { #todo: add conditionals for breaking if error.
      echo Summoning Octocat to create $1 repository...
      mkdir $1
      cd $1
      git init
      #todo: construct readme from name and desc, copy some default .gitignore
      touch README.md
      git add README.md
      git commit -am"init"
      #todo: something more useful with output
      curl -u $(cfg github.username) https://api.github.com/user/repos -d "{\"name\":\"${1}\",\"description\":\"$2\"}" > /dev/null
      git remote add origin git@github.com:$(cfg github.username)/$1.git
      git push origin master
  }

```

and it reads pretty much like the bulletted list above, rendered in simple and likely inelegant bash script. It is added in my .bash_profile chain and invoking it looks like this:

`gh-summon empty-repo "now with 9000% more working code"`

which looks like this in my terminal:

![Terminal Screenshot](https://refactorized.s3.amazonaws.com/blog/imgs/summon-octocat-terminal.png)

and just like that, I have a repo on github:

![GitHub Screenshot](https://refactorized.s3.amazonaws.com/blog/imgs/summon-octocat-new-repo.png)

I hope you find the script useful; I know I do, even if it is a little sloppy. Feel free to copy, improve and share, and if you make anything cool with it let me know.

-Adam

Posted on <span class="postdate">Mar 6th, 2015</span>
