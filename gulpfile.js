var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var dartSass = require("dart-sass")
var gulpSass = require("gulp-sass")
var sourcemaps = require('gulp-sourcemaps'); // 소스 파일 경로 
var autoprefixer = require("gulp-autoprefixer");
var fileinclude = require("gulp-file-include")
var spritesmith = require('gulp.spritesmith');

var htmlmin = require('gulp-htmlmin');
var through2 = require('through2');
var pretty = require('pretty');
var babel = require("gulp-babel");
var template = require('gulp-template-html');
var concat = require("gulp-concat");
var plumber = require('gulp-plumber');
var del = require('del');
const sass = gulpSass(dartSass);

const DEV_PATH = {
    ROOT : './src',
    ADMIN : './src/admin',
    RESOURCES : {
        SPRITE : './src/admin/resources/sprite_container/sprite-images',
        HANDLEBAR: './src/admin/resources/handlebar/handlebar.sass.handlebars',
        SCRIPT: './src/resources/script',
        IMAGES: './src/resources/images',
        STYLE: './src/resources/style',
    }
}
const BUILD_PATH = {
    ROOT : './build',
    ADMIN : './build/admin',
    RESOURCES : {
        SPRITE : './build/public/sprite_images',
        SPRITE_STYLE : './build/public/sprite_style',
        SCRIPT: './build/resources/script',
        IMAGES: './build/resources/images',
        STYLE: './build/resources/style',
    }
}

function prettyGulp(file, enc, callback){
    file.contents = Buffer.from(pretty(file.contents.toString(), { ocd: true}));
    callback(null, file);
}

//clean
gulp.task('clean', () => {
    return new Promise(resolve => {
        // del.sync(BUILD_PATH.ROOT);
        del.sync(BUILD_PATH.ROOT);

        resolve()
    })
})

//html
gulp.task('html', () => {
    return new Promise(resolve => {
        gulp.src([
            `${DEV_PATH.ROOT}/index.html`
        ])
            .pipe(plumber())
            .pipe(fileinclude({
            prefix : '@@'
            }))
            .pipe(gulp.dest(`${BUILD_PATH.ROOT}/`))
            .pipe(browserSync.reload({ stream: true }))
        resolve();
    })
})

//layout html 작업
gulp.task('preprocess_admin', () => {
    return new Promise(resolve => {
        gulp.src(`${DEV_PATH.ADMIN}/pages/*.html`)
            .pipe(template(`${DEV_PATH.ADMIN}/layout/index.html`))
            .pipe(gulp.dest(`${DEV_PATH.ADMIN}/preprocess/`))
        resolve()
    })
})

//preprocessing html -> build 작업
gulp.task('processed-html_admin', () => {
    return new Promise(resolve => {
        gulp.src([
            `${DEV_PATH.ADMIN}/preprocess/*`
        ])
            .pipe(plumber())
            .pipe(fileinclude({
                prefix: '@@'
            }))
            .pipe(htmlmin({
                caseSensitive: true,
                collapseWhitespace: true,
                preserveLineBreaks: true,
                conservativeCollapse: true,
                removeTagWhitespace: true,
                trimCustomFragments: true,
                quoteCharacter: '"',
                sortAttributes: true,
            }))
            .pipe(through2.obj(prettyGulp))
            .pipe(gulp.dest(`${BUILD_PATH.ADMIN}/pages/`))
            .pipe(browserSync.reload({ stream: true }))
        resolve();
    })
})

//style-sass
gulp.task('sass', () => {
    return new Promise(resolve => {
        
        let options = {
            sass: {
                outputStyle: "expanded",
                indentType: "space",
                indentWidth: 4,
                precision: 8,
                sourceComments: false
            }
        }

        gulp.src(`${DEV_PATH.ADMIN}/resources/style/*.scss`)
            .pipe(sourcemaps.init())
            .pipe(sass(options.sass).on("error", sass.logError))
            .pipe(autoprefixer({
                overrideBrowserslist: ["> 1%", "last 2 versions", "Safari >= 12", "Firefox >= 60"]
            }))
            .pipe(sourcemaps.write())
            .pipe(concat("admin.css"))
            .pipe(gulp.dest(`${BUILD_PATH.ADMIN}/resources/style/`))
            .pipe(browserSync.reload({ stream: true }))
        resolve();
    })
})

//sprite-images
gulp.task('sprite', () => {
    return new Promise(resolve => {
        var spriteData = gulp.src(`${DEV_PATH.RESOURCES.SPRITE}/*.png`)
            .pipe(spritesmith({
                retinaSrcFilter: DEV_PATH.RESOURCES.SPRITE + '/*@2x.png',
                imgName: 'sp_all.png',
                padding: 0,
                retinaImgName: 'sp_all@2x.png',
                cssName: 'sp_all.css',
                cssTemplate: DEV_PATH.RESOURCES.HANDLEBAR
            }))
        
        spriteData.img.pipe(gulp.dest(`${DEV_PATH.ADMIN}/resources/sprite_container/result/sprite_images`))
        spriteData.css.pipe(gulp.dest(`${DEV_PATH.ADMIN}/resources/sprite_container/result/sprite_style`))

        resolve();
    })
})
gulp.task('copy-sprite-into-build', () => {
    return new Promise(resolve => {

        gulp.src([`${DEV_PATH.ADMIN}/resources/sprite_container/result/**/*`])
        .pipe(gulp.dest(`${BUILD_PATH.ADMIN}/resources/sprite_container`))
        resolve();
    })
})

gulp.task('font', () => {
    return new Promise(resolve => {
        
        gulp.src(`${DEV_PATH.ADMIN}/resources/font/**/*`)
            .pipe(gulp.dest(`${BUILD_PATH.ADMIN}/resources/font`))

        resolve();
    })
})

gulp.task('browserSync', () => {
    return new Promise(resolve => {
        let bs = browserSync;

        bs.init({
            server: {
                baseDir: BUILD_PATH.ROOT,
                directory: true,
            },
            cors: true
        })
        resolve()
    })
});

// change watch
gulp.task('watch', () => {
    return new Promise(resolve => {
        gulp.watch(`${DEV_PATH.ROOT}/*.html`, gulp.series(['html']));

        gulp.watch(`${DEV_PATH.ADMIN}/preprocess/*.html`, gulp.series(['processed-html_admin']));
        gulp.watch(`${DEV_PATH.ADMIN}/pages/*.html`, gulp.series(['preprocess_admin']));
        gulp.watch(`${DEV_PATH.ADMIN}/layout/*`, gulp.series(['preprocess_admin', 'processed-html_admin']))

        //style
        gulp.watch(`${DEV_PATH.ADMIN}/resources/style/*.scss`, gulp.series(['sass']));


        //sprite
        gulp.watch(`${DEV_PATH.ADMIN}/resources/sprite_container/sprite-images/*`, gulp.series(['sprite', 'copy-sprite-into-build']))


        resolve();
    })
})

var allSeries = gulp.series([
    'clean',
    'font',
    'sprite',
    'copy-sprite-into-build',
    'html',
    'preprocess_admin',
    'processed-html_admin',
    'sass',
    'browserSync',
    'watch'
])

gulp.task('default', allSeries)