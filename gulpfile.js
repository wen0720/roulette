const gulp = require('gulp')
const sass = require('gulp-sass')
// jshint = require( 'gulp-jshint' );
const uglify = require('gulp-uglify')
const autoprefixer = require('gulp-autoprefixer')
const connect = require('gulp-connect')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const stripDebug = require('gulp-strip-debug')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const envify = require('envify/custom')
const environments = require('gulp-environments')

const open = require('gulp-open')
const port = process.env.PORT || 8001

console.log(`
==========================
                         
 ${process.env.NODE_ENV} 
                        
==========================
`)
const prodMode = environments.production

gulp.task('connect', function () {
  connect.server({
    host: '0.0.0.0',
    port: port,
    livereload: true
  })
})

gulp.task('sass2css', function () {
  return gulp
    .src('sass/**/*.scss')
    .pipe(
      sass({
        outputStyle: 'expanded',
        indentType: 'tab',
        indentWidth: 1
      })
        .on('error', sass.logError)
    )
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(cssmin({ compatibility: 'ie10', advanced: false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(connect.reload())
})

gulp.task('bundle-js', function () {
  const path = './js/app.js'
  return browserify({
    entries: path
  })
    .transform(envify({ NODE_ENV: process.env.NODE_ENV }))
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source(path))
    .pipe(prodMode(buffer()))
    .pipe(prodMode(stripDebug()))
    .pipe(prodMode(uglify()))
    .pipe(rename({
      dirname: '/',
      basename: 'bundle',
      extname: '.js'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload())
})

gulp.task('livereload', function () {
  gulp
    .watch([
      '*.html',
      '*'
    ])
    .on('change', function (e) {
      gulp
        .src(e.path)
        .pipe(connect.reload())
    })

  gulp
    .watch([
      'img/**/*',
      'js/**/*',
      'fonts/**/*'
    ])
    .on('change', function () {
      gulp
        .src([
          '*.html',
          '*'
        ])
        .pipe(connect.reload())
    })

  gulp
    .watch('sass/**/*.scss', ['sass2css'])

  gulp
    .watch('js/*.js', ['bundle-js'])
})

gulp.task('openWindow', () => {
  const options = {
    uri: `http://localhost:${port}`,
    app: 'google chrome'
  }
  gulp.src(__filename)
    .pipe(open(options))
})

// gulp.task('default', ['connect', 'sass2css', 'bundle-js', 'livereload', 'openWindow']);
gulp.task('default', ['connect', 'bundle-js', 'livereload', 'openWindow'])
