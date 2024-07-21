import gulp, {dest, src} from "gulp";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import cheerio from "gulp-cheerio";
import rename from "gulp-rename";
import changed from "gulp-changed";
import imagemin from "gulp-imagemin";
import pngquant from "imagemin-pngquant";
import htmlhint   from "gulp-htmlhint";
import replace   from "gulp-replace";
import fs from "fs";
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);

const paths = {
    gulpSvgmin: {
        src: "icons/*.svg",
        dest: "icons/min"
    },
    gulpSvgStore: {
        src: "icons/min/*.svg",
        dest: "./"
    },
    optPNG: {
        src: "images/*.png",
        dest: "images/min"
    },
    checkHTML: {
        src: "page/index.html"
    },
    injectSvg: {
        src: "page/index.html",
        dest: "./"
    },
    buildStyles: {
        src: "./*.scss",
        dest: "./"
    }
};

export function gulpSvgmin() {
    return src(paths.gulpSvgmin.src)
        .pipe(svgmin(() => {
            return {
                plugins: [{ removeViewBox: false },
                    {
                        name: 'removeUselessStrokeAndFill',
                        params: {
                            stroke: true,
                            fill: true
                        }
                    },
                    {removeEmptyAttrs: false}]
            }
        }))
        .pipe(dest(paths.gulpSvgmin.dest));
}

export function gulpSvgStore() {
    return src(paths.gulpSvgStore.src)
        .pipe(svgstore())
        //delete unnecessary things
        .pipe(cheerio({
            run: function ($) {
                $('defs').remove();
                // Добавляем префикс ко всем id именам
                $('symbol').attr('id', function (i, id) {
                    return 'svg-icon-' + id;
                });
                // Удаление атрибутов fill и stroke
                $('[fill]').removeAttr('fill');
               /* $('[stroke]').removeAttr('stroke');*/

                /*Добавление fill="currentColor" и stroke="currentColor" к тегу path*/
                $('path').each(function() {
                    $(this).attr('fill', 'currentColor');
                   /* $(this).attr('stroke', 'currentColor');*/
                });
                // Удаление элементов-демонстраций, если они имеются
                $('demo-element').remove();
                // Удаление элементов <title>
                $('title').remove();
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(rename('svg-sprite.svg'))
        .pipe(dest(paths.gulpSvgStore.dest)); //результат  обработки  файла  SVG-спрайта  в  папку  `dist`
}

export function injectSvg() {
    const svgSprite = fs.readFileSync('svg-sprite.svg', 'utf8');
    return src(paths.injectSvg.src)
        .pipe(replace('<!-- inject:svg -->', svgSprite))
        .pipe(dest(paths.injectSvg.dest));
}

function buildStyles() {
    return src(paths.buildStyles.src)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(dest(paths.buildStyles.dest));
}

export function optPNG() {
    return src(paths.optPNG.src, { encoding: false })
        .pipe(changed(paths.optPNG.dest))
        .pipe(imagemin([
            pngquant({ quality: [0.9, 1] }) // Установка уровня качества для pngquant
        ]))
        .pipe(dest(paths.optPNG.dest));
}

export function checkHTML() {
    return src(paths.checkHTML.src)
        .pipe(htmlhint(".htmlhintrc"))
        .pipe(htmlhint.reporter());
}

export const run = gulp.parallel(optPNG, checkHTML, buildStyles, gulp.series(gulpSvgmin, gulpSvgStore, injectSvg));