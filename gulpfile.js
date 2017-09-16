var gulp        = require('gulp'),
    pug         = require('gulp-pug'),
    watch       = require('gulp-watch'),
    prefixer    = require('gulp-autoprefixer'),
    uglify      = require('gulp-uglify'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    cssmin      = require('gulp-minify-css'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    del         = require('del'),
    browserSync = require("browser-sync"),
    reload      = browserSync.reload,
    gutil       = require('gulp-util'),
    ftp         = require('gulp-ftp');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        pug: 'src/views/**/*.pug',
        js: 'src/assets/js/main.js',
        style: 'src/assets/scss/main.scss',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/fonts/**/*.*'
    },
    watch: {
        pug: 'src/views/**/*.pug',
        js: 'src/assets/js/**/*.js',
        style: 'src/assets/**/**/*.scss',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/fonts/**/*.*'
    },
    clean: './build',
    cleanftp: './build/*.html',
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "FED"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function () {
    return del([
        path.clean
    ]);
});
gulp.task('cleanftp', function () {
    return del([
        path.cleanftp
    ]);
});

gulp.task('pug:build', function () {
    gulp.src(path.src.pug)
        .pipe(pug({
            pretty: true // Отключаем минификацию
        }))
        .pipe(gulp.dest(path.build.html));
});


gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'pug:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.pug], function(event, cb) {
        gulp.start('pug:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('deploy', function () {
    return gulp.src('build/**/*')
        .pipe(ftp({
            host: '',
            user: '',
            pass: ''
        }))
        .pipe(gutil.noop());
});

gulp.task('default', ['build', 'webserver', 'watch']);