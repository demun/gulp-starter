var gulp        = require('gulp'),
    size        = require('gulp-size'),
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
var cleanCSS     = require('gulp-clean-css');
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
  return gulp.src('dist')
    .pipe(vinylPaths(del));
});

gulp.task('sass-lint', function() {
  gulp.src(['src/scss/**/*.scss', '!src/scss/vendor/*.scss'])
    .pipe(sassLint({ configFile: '.sass-lint.yml'}))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});



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

gulp.task('scss', function() {
  return gulp.src('src/scss/styles.scss')
    .pipe(plumber(plumberOption))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' })) // expanded, compact
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(rename('styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream:true}))
    .pipe(cleanCSS({debug: true}, function(details) {
      console.log(details.name + ': ' + details.stats.originalSize);
      console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))     //생성된 소스맵을 스트림에 추가
    .pipe(gulp.dest('dist/css'))
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

//dist 폴더를 기준으로 웹서버 실행
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'dist',
      index: 'index.html'
    }
  });
});

gulp.task('deploy', function() {
  return gulp.src('dist')
    .pipe(deploy());
});


gulp.task('imagemin', function() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
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



// watch
// -------------------------------------------------------------------

gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js', ['js:main', 'copy:js']);
  gulp.watch('src/scss/**/*.scss', ['scss', 'copy:css']);
  gulp.watch('src/docs/**/*.html', ['html']);
  gulp.watch('src/images/**/*', ['imagemin', 'copy:images','copy:fonts']);
});




// BUILD TASKS
// -------------------------------------------------------------------
gulp.task('copy', ['copy:js', 'copy:css', 'copy:fonts', 'copy:images']);


gulp.task('serve', function(done) {
  runSequence('browser-sync', 'watch', done);
});

gulp.task('default', function(done) {
  runSequence('clean:dist', 'browser-sync', 'js:main', 'imagemin', 'scss', 'copy','html', 'watch', done);
});

gulp.task('build', function(done) {
  runSequence('clean:dist', 'js:main', 'imagemin', 'scss', 'copy','html', done);
});
