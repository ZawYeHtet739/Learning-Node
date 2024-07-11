var http = require('http');
var fs = require('fs');
var path = require('path');

var folder_path = 'C:\\My Files';

http.createServer(async (req, res) => {
    // Decode URL to handle spaces and special characters
    var requestedPath = path.join(folder_path, decodeURIComponent(req.url));
    console.log("Requested path:", requestedPath);

    // Handle favicon.ico requests
    if (req.url === '/favicon.ico') {
        res.writeHead(204); // No Content
        res.end();
        return;
    }

    fs.stat(requestedPath, async (err, stats) => {
        if (err || !stats.isFile()) {
            console.log("File not found:", requestedPath);
            res.writeHead(404);
            res.write('404 not found');
            res.end();
        } else {
            fs.readFile(requestedPath, async (err, data) => {
                if (err) {
                    console.log("Error reading file:", err);
                    res.writeHead(500);
                    res.write('Internal Server Error');
                } else {
                    const contentType = "text/html";
                    res.writeHead(200, { "Content-Type": contentType });
                    res.write(data);
                }
                res.end();
            });
        }
    });
}).listen(8080);

console.log("HTTP server running at port 8080");





