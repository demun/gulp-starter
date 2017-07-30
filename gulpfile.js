var gulp        = require('gulp'),
    plumber     = require('gulp-plumber'),
    notify      = require('gulp-notify'),
    del         = require('del'),
    vinylPaths  = require('vinyl-paths'),
    // Temporary solution until gulp 4
    // https://github.com/gulpjs/gulp/issues/355
    runSequence = require('run-sequence');

// html
var fileinclude  = require('gulp-file-include');
var prettify     = require('gulp-prettify');

// js
var jshint       = require("gulp-jshint");
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');

// css
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var sourcemaps   = require('gulp-sourcemaps');
var rename       = require("gulp-rename");
// sassLint
var sassLint     = require('gulp-sass-lint');

// image
var imagemin     = require('gulp-imagemin');
var pngquant     = require('imagemin-pngquant');

// 서버
var browserSync  = require('browser-sync');
var reload       = browserSync.reload;


// 환경설정
// ----------------------------------------------
var config = {
  src: 'src',
  dist: 'dist',
  bower: 'bower_components'
}


// plumber
// ----------------------------------------------
var errorHandler = function(error) {
  console.error(error.message);
  this.emit('end');
};
var plumberOption = {
  errorHandler: errorHandler
}


// BUILD SUBTASKS
// ----------------------------------------------

gulp.task('clean:dist', function() {
  return gulp.src(config.dist)
    .pipe(vinylPaths(del));
});

gulp.task('sass-lint', function() {
  gulp.src([config.src + '/scss/**/*.scss', '!' + config.src + '/scss/vendor/*.scss'])
    .pipe(sassLint({ configFile: '.sass-lint.yml'}))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});



// main js
gulp.task('js:main', function() {
  return gulp
    .src(config.src + '/js/**/*.js')  // src/js 폴더 아래의 모든 js 파일을
    .pipe(plumber(plumberOption))     // 빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
    .pipe(jshint('.jshintrc'))        // 오류구문 검사
    .pipe(jshint.reporter('jshint-stylish'))    // 검사오류시 스타일 적용해서 콘솔에 보여주고
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))   //소스맵 생성 준비
    .pipe(concat('main.js'))          //main.js 라는 파일명로 모두 병합한 뒤에,
    .pipe(gulp.dest(config.dist + '/js'))       // 압축안된 버젼 생성
    .pipe(rename({ suffix: '.min' })) // 파일명에 .min 접두사 붙여서
    .pipe(uglify())                   //minify 해서
    .pipe(sourcemaps.write('./'))     //생성된 소스맵을 스트림에 추가
    .pipe(gulp.dest(config.dist + '/js'))       //dist/js 폴더에 저장
    .pipe(reload({ stream: true }));  //browserSync 로 브라우저에 반영
});


gulp.task('scss', function () {
  return gulp.src(config.src + '/scss/**/*.scss')
    .pipe(plumber(plumberOption))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compact' })) // expanded, compact
    .pipe(autoprefixer())
    .pipe(gulp.dest(config.dist + '/css'))
    .pipe(minifycss())
    .pipe(rename({ suffix: '.min' }))
    // .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('./'))     //생성된 소스맵을 스트림에 추가
    .pipe(gulp.dest(config.dist + '/css'))
    .pipe(reload({stream:true}))
});

// html
gulp.task('html', function() {
  return gulp
    .src(config.src + '/docs/files/**/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      context: {
        name: 'example'
      }
    }))
    .pipe(prettify({ indent_size: 2 }))
    .pipe(gulp.dest(config.dist))
    .pipe(reload({ stream: true }));
});

//dist 폴더를 기준으로 웹서버 실행
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: config.dist,
      index: 'index.html'
    }
  });
});

gulp.task('deploy', function() {
  return gulp.src(config.dist)
    .pipe(deploy());
});


gulp.task('imagemin', function() {
  return gulp.src(config.src + '/images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(config.dist + '/images'));
});

// bower task: js, css, fonts, images
// -------------------------------------------------------------------
// js copy
gulp.task('copy:js', function() {
  var allFile = [
    config.bower + '/jquery/dist/jquery.js',
    config.bower + '/bxslider-4/dist/jquery.bxslider.js',
    config.bower + '/swiper/dist/js/swiper.jquery.js',
    config.bower + '/bootstrap/dist/js/bootstrap.js'
  ];
  return gulp
    .src(allFile)
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(config.dist + '/js')) // 압축안된 버젼 생성
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + '/js'));
});
// css copy
gulp.task('copy:css', function() {
  var allFile = [
    config.bower + '/fontawesome/css/font-awesome.css',
    config.bower + '/swiper/dist/css/swiper.css',
    config.bower + '/bxslider-4/dist/jquery.bxslider.css',
    config.bower + '/bootstrap/dist/css/bootstrap.css'
  ];
  return gulp
    .src(allFile)
    .pipe(sourcemaps.init({ loadMaps: true, debug: true }))
    .pipe(concat('vendors.css'))
    .pipe(gulp.dest(config.dist + '/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + '/css'));
});
// fonts copy
gulp.task('copy:fonts', function() {
  var allFile = [
    config.bower + '/fontawesome/fonts/*',
    config.bower + '/bootstrap/dist/fonts/*'
  ];
  return gulp
    .src(allFile)
    .pipe(gulp.dest(config.dist + '/fonts'));
});
// images copy
gulp.task('copy:images', function() {
  var allFile = [
    config.bower + '/bxlider-4/dist/images/*'
  ];
  return gulp
    .src(allFile)
    .pipe(gulp.dest(config.dist + '/images'));
});



// watch
// -------------------------------------------------------------------

gulp.task('watch', function() {
  gulp.watch(config.src + '/js/**/*.js', ['js:main', 'copy:js']);
  gulp.watch(config.src + '/scss/**/*.scss', ['scss', 'copy:css']);
  gulp.watch(config.src + '/docs/**/*.html', ['html']);
  gulp.watch(config.src + '/images/**/*', ['imagemin', 'copy:images','copy:fonts']);
});




// BUILD TASKS
// -------------------------------------------------------------------
gulp.task('copy', ['copy:js', 'copy:css', 'copy:fonts', 'copy:images']);


gulp.task('serve', function(done) {
  runSequence('browser-sync', 'watch', done);
});

gulp.task('default', function(done) {
  runSequence('clean:dist', 'js:main', 'imagemin', 'scss', 'copy','html', 'browser-sync', 'watch', done);
});

gulp.task('build', function(done) {
  runSequence('clean:dist', 'js:main', 'imagemin', 'scss', 'copy','html', done);
});
