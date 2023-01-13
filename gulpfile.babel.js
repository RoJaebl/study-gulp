import gulp from "gulp";
import gulpPug from "gulp-pug";
import {deleteAsync} from "del";
import gulpWebServer from "gulp-webserver";
import gulpImage from "gulp-image";
import gulpSass from "gulp-sass";
import nodeSass from "sass";
import gulpAutoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import gulpBro from "gulp-bro";
import babelify from "babelify";
import gulpUglify from "gulp-uglify";
import ghPages from "gulp-gh-pages";

// Sass compiler
const sass = gulpSass(nodeSass);

// Stream routes
const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/styles.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

// Bundler
const ghDeploy = () => gulp.src("build/**/*").pipe(ghPages());
const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      gulpBro({
        transform: [babelify.configure({ presets: ["@babel/preset-env"] })],
      })
    )
    .pipe(gulpUglify())
    .pipe(gulp.dest(routes.js.dest));
const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(gulpAutoprefixer())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));
const img = () =>
  gulp.src(routes.img.src).pipe(gulpImage()).pipe(gulp.dest(routes.img.dest));
const pug = () =>
  gulp.src(routes.pug.src).pipe(gulpPug()).pipe(gulp.dest(routes.pug.dest));
const clear = () => deleteAsync(["build/", ".publish"]);
const webServer = () =>
  gulp.src("build").pipe(gulpWebServer({ livereload: true, open: true }));
const watcher = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

// Builder
const prepare = gulp.series([clear, img]);
const assets = gulp.series([pug, styles, js]);
const postDev = gulp.parallel([webServer, watcher]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, postDev]);
export const deploy = gulp.series([build, ghDeploy, clear]);
