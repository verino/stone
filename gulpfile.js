var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	notify = require('gulp-notify'),
	spritesmith = require('gulp.spritesmith'),
	uncss = require('gulp-uncss'),
	csscomb = require('gulp-csscomb'),
	rename = require('gulp-rename'),
	cssnano = require('gulp-cssnano'),
	rigger = require('gulp-rigger'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglifyjs'),
	del = require('del'),
	cache = require('gulp-cache'),
	cleanCSS = require('gulp-clean-css'),
	gcmq = require('gulp-group-css-media-queries'),
	browsersync   = require('browser-sync');

gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'dist'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	})
});

gulp.task('htaccess', function() {
	return gulp.src('src/.htaccess')
	.pipe(gulp.dest('dist/'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('mail', function() {
	return gulp.src('src/mail.php')
	.pipe(gulp.dest('dist/'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('html', function() {
	return gulp.src('src/*.html')
		.pipe(rigger())
		.pipe(gulp.dest('dist/'))
		.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('font', function() {
	return gulp.src('src/font/*')
		.pipe(gulp.dest('dist/font/'))
		.pipe(browsersync.reload( {stream: true} ))
});


gulp.task('js-libs', function() {
	return gulp.src('src/js/libs.js')
		.pipe(rigger())
		.pipe(gulp.dest('dist/js'))
		.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('js', function() {
	return gulp.src('src/js/custom.js')
		.pipe(rigger())
		.pipe(gulp.dest('dist/js/'))
		.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('script', function() {
	return gulp.src(['src/js/libs.js','src/js/custom.js'])
		.pipe(rigger())
		.pipe(concat('script.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js/'))
		.pipe(browsersync.reload( {stream: true} ))
});



gulp.task('css', function() {
	return sass('src/css/main.scss')
		.on('error', sass.logError)
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(uncss({
			html: ['dist/*.html']
		}))
		.pipe(csscomb())
		.pipe(gcmq())
		.pipe(gulp.dest('dist/css'))
		.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('css-libs', function() {
	return sass('src/css/libs.scss')
		.on('error', sass.logError)
		.pipe(gulp.dest('dist/css'))
		.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('style',['css','css-libs'], function() {
	return  gulp.src(['dist/css/libs.css','dist/css/main.css'])
		.pipe(concat('style.min.css'))
		.pipe(cleanCSS({
			compatibility: 'ie8',
			keepSpecialComments: 0
		}))
		.pipe(cssnano())
		.pipe(gulp.dest('dist/css'))
		.pipe(browsersync.reload( {stream: true} ))
});



gulp.task('images', function() {
	return gulp.src(['src/img/**/*', '!src/img/icons'])
		.pipe(imagemin({
			optimizationLevel: 3,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngquant()],
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('dist/img'))
		.pipe(notify({
			message: 'Images task complete'
		}));
});

gulp.task('sprite', function() {
	var spriteData = gulp.src('src/img/icons/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: 'dist/img/sprite.png',
		padding: 10,
		cssName: 'sprite.scss'
	}));
	spriteData.img.pipe(gulp.dest('dist/img/')); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest('src/css/')); // путь, куда сохраняем стили
});


gulp.task('watch', function() {

	// Watch any files in dist/, reload on change
	gulp.watch('src/components/**/*.scss', ['css','css-libs','style'])
	gulp.watch('src/css/*', ['css','style'])
	gulp.watch('src/css/libs.scss', ['css-libs','style'])
	gulp.watch('src/font/*', ['font'])
	gulp.watch('src/js/custom.js', ['js','script'])
	gulp.watch('src/js/libs.js', ['js-libs','script'])
	gulp.watch('src/*.html', ['html'])
	gulp.watch('src/mail.php', ['mail'])
	gulp.watch('src/.htaccess', ['htaccess'])
	gulp.watch('src/template/*.html', ['html'])
	gulp.watch('src/components/**/*.html', ['html'])
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('clear', function(done) {
	return cache.clearAll(done);
});

gulp.task('build', ['html','htaccess', 'mail', 'font', 'css', 'css-libs','style', 'js', 'js-libs','script', 'sprite', 'images']);

gulp.task('default', ['html', 'browser-sync', 'watch']);