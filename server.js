var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),

    contentTypes = {
        'html': 'text/html',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'js': 'text/javascript',
        'css': 'text/css',
        'ico': 'image/x-icon'
    };

http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname,
        filename = path.join(process.cwd(), uri);
    fs.exists(filename, function(exists) {
        if(!exists) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end();
        }
        var contentType = contentTypes[path.extname(filename).split('.')[1]];
        res.writeHead(200, contentType);
        if (filename === process.cwd() + '/') {
            filename = path.join(process.cwd(), 'index.html');
        }
        fs.createReadStream(filename).pipe(res);
    });
}).listen(1337, '127.0.0.1');

console.log("Server running at http://127.0.0.1:1337/");
