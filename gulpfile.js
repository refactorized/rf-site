var gulp = require('gulp')
var plug = require('gulp-load-plugins')()
var thru = require('through2')
var path = require('path')
var sync = require('browser-sync').create()
var mmnt = require('moment')
var rmrf = require('rimraf')
var _url = require('url')

var mergeStream = require('merge-stream')
var R = require('ramda')

var site = {
}

var paths = {
  root: '/',
  blog: 'blog'
}

var options = {
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
  }
}

const assets = {
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
  ]
}

function root (...urls) {
  return path.join(paths.root, ...urls)
}

function formatDate (date) {
  return mmnt(date).format('YYYY:MM:DD')
}

function blogAssembler () {
  // abstract posts to use in other templates like index.html
  var posts = []
  var assets = []

  function getAssetMap (file) {
    const srcDir = path.dirname(file.path)
    const srcGlob = path.join(srcDir, '*.*')
    const srcAnti = '!' + path.join(srcDir, '*.md')
    const destDir = path.join(paths.blog, file.data.slug)

    return ({
      src: [srcGlob, srcAnti],
      dest: destDir
    })
  }

  function each (file, enc, done) {
    file.data.slug = file.data.slug || path.dirname(file.path).split(path.sep).pop()
    const assetMap = getAssetMap(file)
    assets.push(assetMap)
    file.data.destDir = assetMap.destDir

    file.base = '.'
    file.path = path.join('.', file.data.slug, 'index.html')
    // push abstract post for use in other templates
    posts.push(R.merge(file.data, {body: file.contents}))

    // stream out our post
    done(null, file)
  }

  function after (done) {
    site.posts = posts
    site.assets = assets
    done()
  }

  return thru.obj(each, after)
}

function rebasePosts ($, file, done) {
  const base = file.data.destDir
  console.log(base)
  function rebaseFn (i, url) {
    console.log(url)
    const urlObj = _url.parse(url)
    urlObj.pathname = path.isAbsolute(urlObj.pathname)
      ? path.join(base, urlObj.pathname)
      : urlObj.pathname
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
  return gulp.src(assets.posts)
    .pipe(plug.frontMatter(options.fm))
    .pipe(plug.markdown())
    .pipe(blogAssembler())
    .pipe(plug.cheerio(rebasePosts))
    .pipe(gulp.dest(path.join('dist', paths.blog)))
})

gulp.task('post-assets', ['posts'], function (done) {
  function copy (mapping) {
    return gulp.src(mapping.src)
      .pipe(gulp.dest(path.join('dist', mapping.dest)))
  }

  const streams = R.map(copy, site.assets)
  return mergeStream(streams)
})

gulp.task('pages', ['posts'], function () {
  var locals = {
    site: site,
    root: root,
    formatDate: formatDate
  }
  return gulp.src(assets.pages)
    .pipe(plug.pug({locals}))
    .pipe(gulp.dest('dist/'))
})

gulp.task('markup-reload', ['pages'], function (done) {
  sync.reload()
  done()
})

gulp.task('scss', function () {
  return gulp.src(assets.scss)
    .pipe(plug.sass(options.scss).on('error', plug.sass.logError))
    .pipe(plug.autoprefixer(options.autoprefixer))
    .pipe(gulp.dest('dist/style/'))
    .pipe(sync.stream())
})

gulp.task('scripts', function () {
  return gulp.src(assets.scripts)
    .pipe(gulp.dest('dist/scripts/'))
})
gulp.task('scripts-reload', ['scripts'], function (done) {
  sync.reload()
  done()
})

gulp.task('watch', function () {
  gulp.watch([].concat(assets.pages, assets.posts), ['markup-reload'])
  gulp.watch(assets.scss, ['scss'])
  gulp.watch(assets.scripts, ['scripts-reload'])
})

gulp.task('serve', ['default', 'watch'], function () {
  sync.init({
    server: {
      baseDir: './dist/'
    }
  })
})

gulp.task('default', plug.sequence('nuke', 'scss', 'scripts', 'pages', 'post-assets'))
