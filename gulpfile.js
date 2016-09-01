const gulp = require('gulp')
const plug = require('gulp-load-plugins')()
const thru = require('through2')
const path = require('path')
const sync = require('browser-sync').create()
const mmnt = require('moment')
const rmrf = require('rimraf')
const _url = require('url')

const mergeStream = require('merge-stream')
const R = require('ramda')

// todo: refactor so there are two groups,
// config, site - config does not change, site is
// built up in preprocessing steps

const SITE = {
  fancy: true
}

const PATHS = {
  root: '/',      // remote
  blog: 'blog',   // remote
  templates: path.join(__dirname, 'src/templates')
}

const ASSETS = {
  pages: ['src/pages/**/*.pug', 'src/templates/**/*.pug'],
  posts: ['src/posts/**/*.md'],
  scripts: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/foundation-sites/dist/foundation.js',
    'src/scripts/lodash.js',
    'src/scripts/vg.js'
  ],
  scss: [
    'src/style/main.scss',
    'src/style/vg.scss'
  ],
  postAssets: []
}

const OPTS = {
  fm: {
    property: 'data',
    remove: true
  },
  scss: {
    includePaths: [
      'bower_components/foundation-sites/assets/',
      'src/style/'
    ]
  },
  autoprefixer: {
    browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']
  },
  pug: {
    basedir: PATHS.templates
  },
  shorty: '<!--short-->'
}

const helpers = {
  // helpers
  root: (...urls) => path.join(PATHS.root, ...urls),
  formatDate: (date) => mmnt(date).format('YYYY:MM:DD')
}

// to be passed to pug

// if two tags are present return the part in between as short,
// if only one tag, return the part before
// if none, short = text

function getShorty (text) { // todo: cleanup
  let pieces = text.split(OPTS.shorty)
  return pieces.length === 3 ? pieces[1] : pieces[0]
}

function postDataPrep (postAssets) {
  // infers slug from pathname if not present
  function inferSlug (file) {
    file.data.slug = file.data.slug || path.dirname(file.path).split(path.sep).pop()
  }

  function getAssetMap (file) {
    const srcDir = path.dirname(file.path)
    const srcGlob = path.join(srcDir, '*.*')
    const srcAnti = '!' + path.join(srcDir, '*.md')
    const destDir = path.join(PATHS.blog, file.data.slug) // [decouple]

    return ({
      src: [srcGlob, srcAnti],
      dest: destDir
    })
  }

  function each (file, enc, done) {
    inferSlug(file)
    let assetMap = getAssetMap(file)
    // postAssets.push(assetMap)
    file.data.assetSrc = assetMap.src
    file.data.destDir = assetMap.dest
    file.data.permalink = assetMap.dest
    done(null, file)
  }

  return thru.obj(each)
}

function blogAssembler () {
  // abstract posts to use in other templates like index.html
  var posts = []

  function each (file, enc, done) {
    file.base = '.'
    // todo: make file pathing less of a damn mess.
    file.path = path.join('.', file.data.slug, 'index.html')
    // push abstract post for use in other templates

    let full = file.contents.toString()
    file.data.full = full
    file.data.short = getShorty(full)
    file.data.shortened = file.data.short !== full
    posts.push(file.data)

    // stream out our post`
    done(null, file)
  }

  function after (done) {
    SITE.posts = posts
    done()
  }

  return thru.obj(each, after)
}

function rebasePosts ($, file, done) {
  const base = file.data.destDir

  const isRelPath = p =>
    p.match(/\/\//) == null &&
    !path.isAbsolute(p)

  function rebaseFn (i, url) {
    const urlObj = _url.parse(url)
    urlObj.pathname = isRelPath(urlObj.pathname)
      ? path.join(base, urlObj.pathname)
      : urlObj.pathname
    return _url.format(urlObj)
  }

  $('img').attr('src', rebaseFn)
  done()
}

gulp.task('nuke', function (done) {
  rmrf('dist', {}, function (err) {
    if (err) {
      console.log(err)
    }
    done()
  })
})

gulp.task('posts', function () {
  return gulp.src(ASSETS.posts)
    .pipe(plug.frontMatter(OPTS.fm))
    .pipe(postDataPrep(ASSETS.postAssets))
    .pipe(plug.markdown())
    .pipe(plug.cheerio(rebasePosts))
    .pipe(blogAssembler())
    .pipe(plug.data({helpers, site: SITE}))
    .pipe(plug.assignToPug('src/templates/post.pug', OPTS.pug))
    .pipe(gulp.dest(path.join('dist', PATHS.blog)))
})

gulp.task('post-assets', function (done) {
  function copy (mapping) {
    return gulp.src(mapping.src)
      .pipe(gulp.dest(path.join('dist', mapping.dest)))
  }
  const streams = R.map(copy, ASSETS.postAssets)
  return mergeStream(streams)
})

gulp.task('pages', ['posts'], function () {
  return gulp.src(ASSETS.pages)
    .pipe(plug.data({helpers, site: SITE}))
    .pipe(plug.pug(OPTS.pug))
    .pipe(gulp.dest('dist/'))
})

gulp.task('markup-reload', ['pages'], function (done) {
  sync.reload()
  done()
})

gulp.task('scss', function () {
  return gulp.src(ASSETS.scss)
    .pipe(plug.sass(OPTS.scss).on('error', plug.sass.logError))
    .pipe(plug.autoprefixer(OPTS.autoprefixer))
    .pipe(gulp.dest('dist/style/'))
    .pipe(sync.stream())
})

gulp.task('scripts', function () {
  return gulp.src(ASSETS.scripts)
    .pipe(gulp.dest('dist/scripts/'))
})
gulp.task('scripts-reload', ['scripts'], function (done) {
  sync.reload()
  done()
})

gulp.task('watch', function () {
  gulp.watch([].concat(ASSETS.pages, ASSETS.posts), ['markup-reload'])
  gulp.watch(ASSETS.scss, ['scss'])
  gulp.watch(ASSETS.scripts, ['scripts-reload'])
})

gulp.task('serve', ['default', 'watch'], function () {
  sync.init({
    server: {
      baseDir: './dist/'
    }
  })
})

gulp.task('default', plug.sequence('nuke', 'scss', 'scripts', 'pages'))

gulp.task('deploy', function () {
  return gulp.src('./dist/**/*')
    .pipe(plug.ghPages())
})

// for testing
module.exports = {
  getShorty
}
