const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const imagemin = require("gulp-imagemin");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const imageminPngquant = require('imagemin-pngquant');
const run = require("run-sequence");
const del = require("del");
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const mozjpeg = require('imagemin-mozjpeg');

gulp.task('serve', function(){
 browserSync.init({
   server:{
     baseDir: "./build"
   }
 });
});

gulp.task('sass', ()=>{
return gulp.src('scss/style.scss')
.pipe(plumber())
.pipe(sourceMaps.init())
.pipe(sass())
.pipe(autoprefixer({
  browsers: ['last 2 version']
}))
.pipe(sourceMaps.write())
.pipe(gulp.dest('build/css'))
.pipe(browserSync.reload({stream: true}));
});


gulp.task('html', function(){
 return gulp.src('*.html')
 .pipe(gulp.dest('build/'))
 .pipe(browserSync.reload({stream: true}));
});
gulp.task('js', function(){
  return gulp.src('js/**/*.js')
  .pipe(gulp.dest('build/js'))
  .pipe(browserSync.reload({stream: true}));
});
gulp.task('allimg', function () {
  return gulp.src('img/**/*.{png,jpg}')
      .pipe(gulp.dest('build/img'))
      .pipe(browserSync.reload({stream: true}));
});
// gulp.task('images', function () {
//   return gulp.src('build/img/**/*.{png, jpg}')
//   .pipe(plumber())
//     .pipe(imagemin([
//       imagemin.jpegtran({progressive: true}),
//       imagemin.gifsicle({interlaced: true}),
//       imageminJpegRecompress({
//         loops: 5,
//         min: 65,
//         max: 70,
//         quality: 'medium'
//       }),
//       mozjpeg({
//         progressive: true
//    }),
//    imagemin.optipng({optimizationLevel: 3}),
//    pngquant({quality: '65-70', speed: 5}),     
//    imagemin.svgo({plugins: [{removeViewBox: true}]})
//     ]))
//       .pipe(gulp.dest('build/img'));
// });
gulp.task('images', function () {
  return gulp.src('build/img/**/*.{png,jpg}')
  .pipe(plumber())
      .pipe(imagemin())
      .pipe(gulp.dest('build/img'));
});
gulp.task('svg', function () {
  return gulp.src('img/**/*.svg')
      .pipe(svgmin({
        js2svg: {
          pretty: true
        }
      }))
      .pipe(cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {xmlMode: true}
      }))
      .pipe(replace('&gt;', '>'))
      // build svg sprite
      .pipe(svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg"
          }
        }
      }))
      .pipe(gulp.dest('build/img'));
});

gulp.task('watch', ()=>{
  gulp.watch('*.html', gulp.series('html')),
  gulp.watch('js/**/*.js', gulp.series('js')),
  gulp.watch("img/**/*.{png,jpg}", gulp.series("allimg")),
  gulp.watch("build/img/**/*.{png,jpg}", gulp.series("images")),
  gulp.watch("img/**/*.{svg}", gulp.series("svg")),
  gulp.watch('scss/style.scss', gulp.series('sass'))
});

gulp.task('default', gulp.series(
  gulp.parallel('html', 'sass', 'js', 'allimg', 'images', 'svg'),
  gulp.parallel('watch', 'serve')
));