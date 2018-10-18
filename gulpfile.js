var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var fs          = require('fs');
var path        = require('path');
var sass        = require('gulp-sass');
var mustache    = require('mustache')

var lastChangedFile = "";

allPages = ["Home", "About"];

function getOtherPages(){
    var outPages = [];
    for(var i=0; i < allPages.length; i++){
        var title = this.title;
        var selected = (allPages[i] == this.title);
        var pageData = { "pageName" : allPages[i], "selected" : selected };
        outPages.push(pageData);
    }
    return outPages;
}

var template = {
    "index.html" : {
        title: "Home"
    },
    "about.html" : {
        title : "About"
    }
}

for(pageName in template){
    template[pageName].otherPages = getOtherPages
}

console.log(template["index.html"])
packView("index.html");
function packView(viewName){
    console.log("Packing view " + viewName);
    var pageContents = "";
    // todo: mustache js for page names
    var header = fs.readFileSync("static_html/header.html", 'utf8');
    var page = fs.readFileSync("views/" + viewName, 'utf8');
    var footer = fs.readFileSync("static_html/footer.html", 'utf8');
    console.log(template[viewName]);
    header = mustache.render(header, template[viewName]);
    page = mustache.render(page, template[viewName]);
    footer = mustache.render(footer, template[viewName]);
    pageContents = header + page + footer;
    fs.writeFileSync(viewName, pageContents);
}
gulp.task('sass', function() {
    return gulp.src("scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("css"))
        .pipe(browserSync.stream());
});

// Static server
gulp.task('browser-sync', ['sass'], function() {
    
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch("static_html/header.html", function(){
        packView(lastChangedFile);
        browserSync.reload();
    });
    gulp.watch("static_html/footer.html", function(){
        packView(lastChangedFile);
        browserSync.reload();
    });

    gulp.watch("scss/*.scss", ['sass']);
    
    gulp.watch("views/*.html").on('change', function(file){
        var basename = path.basename(file.path);
        console.log("Changed filename " + basename);
        lastChangedFile = basename;
        packView(basename);
        browserSync.reload();
        console.log("Reloaded?");
    });
});

gulp.task('default', ['browser-sync']);
