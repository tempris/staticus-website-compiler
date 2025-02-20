# gulp-breadcrumb

A [gulp](http://gulpjs.com/) plugin that creates accessible HTML5 breadcrumbs (with bootstrap classes) based on the page directory structure.

e.g. if your site is `example.org` and you have a file called `~/htodcs/foo/bar/baz/index.html` then (assuming htdocs is your root folder) the breadcrumb output should look like this...
[example.org](http://example.org) / [foo](http://example.org/foo/) / [bar](http://example.org/foo/bar/) / [baz](http://example.org/foo/bar/baz/)

This plugin is based-off [gulp-breadcrumbs](https://www.npmjs.com/package/gulp-breadcrumbs) but has been changed to add bootstrap [breadcrumb](https://getbootstrap.com/docs/4.0/components/breadcrumb/) classes for styling.

## Install
```shell
npm install gulp-breadcrumb --save-dev
```

## Example

### Using `gulp-breadcrumb`

In your HTML create a comment for the breadcrumbs placeholder, like so:

```html
<!-- breadcrumb -->
```

In `gulpfile.js` add

```js
var gulp = require('gulp');
var breadcrumb = require('gulp-breadcrumb');

// Default task with gulp-breadcrumb
gulp.task('breadcrumb',
    function () {
        return gulp.src("**.*.html")
        .pipe(breadcrumb())
        .pipe(gulp.dest('./dest/'));
    }
);
```
Then run `gulp breadcrumb` from the command line.

## Configuration ##
The config object can be configured as follows:

### rootDir ###
default: `'src'`

Define the root directory that the breadcrumbs start from.
If your path is `user/app/src/pages/foo/bar/article.html` and you want `foo/bar/article.html` then set `rootDir: 'pages'`

### rootHTML ###
Default: `'Home'`

HTML or text to use for the home/root link.

e.g. `rootHTML: '<i class="icon icon-home" title="Home"></i>'`

### showPageName ###
Default: `false`

Flag to show the page name at the end of the breadcrumb list. Note: It is not a link.


### Config example ###
```js
var gulp = require('gulp');
var breadcrumb = require('gulp-breadcrumb');

// Overriding config with gulp-breadcrumb
gulp.task('breadcrumb',
    function () {
        return gulp.src("**.*.html")
        .pipe(breadcrumb({
            rootHTML: '<i class="icon icon-home" title="Home"></i>',
            rootDir: 'pages',
            showPageName: true
        }))
        .pipe(gulp.dest('./dest/'));
    }
);
```