var gulp         = require('gulp');

// js
var jshint       = require("gulp-jshint");
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');

// css
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS     = require('gulp-clean-css');
var sourcemaps   = require('gulp-sourcemaps');
var rename       = require("gulp-rename");

// html
var fileinclude  = require('gulp-file-include');
var prettify     = require('gulp-prettify');

// image
var imagemin     = require('gulp-imagemin');
var cache        = require('gulp-cache');

// 서버
var browserSync  = require('browser-sync');
var reload       = browserSync.reload;

// bower
var gulpCopy     = require('gulp-copy');

// others
var del          = require('del');
var runSequence  = require('run-sequence');
var plumber      = require('gulp-plumber');



// plumber
// ----------------------------------------------
var errorHandler = function(error) {
  console.error(error.message);
  this.emit('end');
};
var plumberOption = {
  errorHandler: errorHandler
}


// 환경설정
// ----------------------------------------------
var config = {
  src: 'src',
  dist: 'dist',
  allfile: '**/*'
}



// task
// ----------------------------------------------

// js task
// main js
gulp.task('js:main', function() {
  return gulp
    .src('src/js/**/*.js')            // src/js 폴더 아래의 모든 js 파일을
    .pipe(plumber(plumberOption))     // 빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
    .pipe(jshint('.jshintrc'))        // 오류구문 검사
    .pipe(jshint.reporter('jshint-stylish'))    // 검사오류시 스타일 적용해서 콘솔에 보여주고
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))   //소스맵 생성 준비
    .pipe(concat('main.js'))          //main.js 라는 파일명로 모두 병합한 뒤에,
    .pipe(gulp.dest('dist/js'))       // 압축안된 버젼 생성
    .pipe(rename({ suffix: '.min' })) // 파일명에 .min 접두사 붙여서
    .pipe(uglify())                   //minify 해서
    .pipe(sourcemaps.write('./'))     //생성된 소스맵을 스트림에 추가
    .pipe(gulp.dest('dist/js'))       //dist/js 폴더에 저장
    .pipe(reload({ stream: true }));  //browserSync 로 브라우저에 반영
});

// scss
gulp.task('scss', function() {
  return gulp
    .src('src/scss/**/*.scss')        //scss 폴더에 .scss 파일을 찾아서
    .pipe(plumber(plumberOption))     // 빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))   //소스맵 생성 준비
    .pipe(sass({ outputStyle: 'expanded' }))    // sass 파일을 css 로 변환하고
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))  // 벤터프리픽스를 붙이고
    .pipe(gulp.dest('dist/css'))
    .pipe(cleanCSS({ keepSpecialComments: 0 }))   // minify 해서
    // .pipe(concat('main.css'))      // main.css 라는 파일로 합치고
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))     //생성된 소스맵을 스트림에 추가
    .pipe(gulp.dest('dist/css'))      //dist 폴더에 저장
    .pipe(reload({ stream: true }));  //browserSync 로 브라우저에 반영
});


// html
gulp.task('html', function() {
  return gulp
    .src('src/docs/files/**/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      context: {
        name: 'example'
      }
    }))
    .pipe(prettify({ indent_size: 2 }))
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }));
});


// images
gulp.task('imagemin', function() {
  return gulp
    .src('src/images/**/*')
    // .pipe(imagemin())
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/images'));
});




// bower task: js, css, fonts, images
// -------------------------------------------------------------------

// js copy
gulp.task('copy:js', function() {
  var allFile = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bxslider-4/dist/jquery.bxslider.js',
    'bower_components/swiper/dist/js/swiper.jquery.js',
    'bower_components/bootstrap/dist/js/bootstrap.js'
  ];
  return gulp
    .src(allFile)
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest('dist/js')) // 압축안된 버젼 생성
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js'));
});
// css copy
gulp.task('copy:css', function() {
  var allFile = [
    'bower_components/fontawesome/css/font-awesome.css',
    'bower_components/swiper/dist/css/swiper.css',
    'bower_components/bxslider-4/dist/jquery.bxslider.css',
    'bower_components/bootstrap/dist/css/bootstrap.css'
  ];
  return gulp
    .src(allFile)
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))
    .pipe(concat('vendors.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleanCSS({ keepSpecialComments: 0 }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'));
});
// fonts copy
gulp.task('copy:fonts', function() {
  var allFile = [
    'bower_components/fontawesome/fonts/*',
    'bower_components/bootstrap/dist/fonts/*'
  ];
  return gulp
    .src(allFile)
    .pipe(gulp.dest('dist/fonts'));
});
// images copy
gulp.task('copy:images', function() {
  var allFile = [
    'bower_components/bxlider-4/dist/images/*'
  ];
  return gulp
    .src(allFile)
    .pipe(gulp.dest('dist/images'));
});





//dist 폴더를 기준으로 웹서버 실행
gulp.task('server', function() {
  return browserSync.init({
    server: {
      baseDir: 'dist',
      index: 'index.html'
    }
  });
});




// 파일 변경 감지
gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', ['js:main', 'copy:js']);
  gulp.watch('src/scss/**/*.scss', ['scss', 'copy:css']);
  gulp.watch('src/docs/**/*.html', ['html']);
  gulp.watch('src/images/**/*', ['imagemin', 'copy:images']);
  gulp.watch('src/images/**/*', ['copy:fonts']);
});


// 폴더 삭제
gulp.task('clean', del.bind(null, ['dist']));



// 빌드
// ----------------------------------------------

gulp.task('js', ['js:main']);
gulp.task('css', ['scss']);
gulp.task('copy', ['copy:js', 'copy:css', 'copy:fonts', 'copy:images']);

gulp.task('serve:dist', ['server', 'watch']);

// default 를 수행한후 server,watch 실행
gulp.task('serve', function(done) {
  return runSequence('default', ['server', 'watch'], done);
});

gulp.task('build', ['js', 'css', 'html', 'imagemin', 'copy']);

// gulp 를 실행하면 defatul 작업실행, clean 작업을 수행한뒤 
gulp.task('default', function(done) {
  return runSequence('clean', ['build'], done);
});
// //gulp를 실행하면 수행할 default 작업
// gulp.task('default', function(done) {
//   //빌드(js, scss, html)를 병렬로 수행한 뒤, 그 다음 server 와 watch 를 병렬로 수행
//   return runSequence('build', ['server', 'watch'], done);
// });