/**
 * optimize the compiled files if set and write them
 * depends gulp-her-kernel
 */
'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var vfs = require('vinyl-fs');
var imagemin = require('gulp-imagemin');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');

function writeFile(file, dest, optimize) {
  var stream = through.obj();
  stream.write(file);
  //if optimize not set,write pipe simply
  if (!optimize)
    stream.pipe(vfs.dest(dest));
  else {
    //optimize image files
    if (file.isImageFile) {
      stream.pipe(imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [{cleanupIDs: false}]
      }))
        .pipe(vfs.dest(dest));
    }
    //optimize css files
    else if (file.isCssLike) {
      stream.pipe(minifycss({keepBreaks: true}))
        .pipe(vfs.dest(dest));
    }
    //optimize js files
    else if (file.isJsLike) {
      stream.pipe(uglify())
        .pipe(vfs.dest(dest));
    }
    else {
      stream.pipe(vfs.dest(dest));
    }
  }
}

module.exports = function (ret) {
  if (!ret)
    return;

  var useHash = her.config.get('useHash');
  var optimize = her.config.get('optimize');
  var dest = her.config.get('dest');

  her.util.map(ret.ids, function (id, file) {
    file.path = file.getPath(useHash);
    writeFile(file, dest + file.release, optimize);
  });

  her.util.map(ret.pkg, function (id, file) {
    file.path = file.getPath(useHash);
    writeFile(file, dest + file.release, optimize);
  });

};
