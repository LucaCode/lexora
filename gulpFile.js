const gulp = require("gulp");
const { exec } = require("child_process");
const terser = require("gulp-terser");

function ts(cb) {
  exec("npx tsc -p tsconfig.json", (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    cb(err || null);
  });
}

function cof() {
  return gulp.src(["src/**/*", "!src/**/*.ts"]).pipe(gulp.dest("dist"));
}

function optimize() {
  return gulp
    .src("dist/**/*.js", { allowEmpty: true })
    .pipe(terser())
    .pipe(gulp.dest("dist"));
}

const compile = gulp.series(gulp.parallel(cof, ts), optimize);

function watch() {
  gulp.watch("src/**/*.ts", ts);
  gulp.watch(["src/**/*", "!src/**/*.ts"], cof);
}

exports.ts = ts;
exports.cof = cof;
exports.optimize = optimize;
exports.compile = compile;
exports.watch = watch;
exports.default = gulp.series(compile, watch);