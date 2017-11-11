const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const port = Number(process.argv[2]) || 8888;

const server = (request, response) => {
    const status = {
        200: (file, filename) => {
            const ext = filename.match(/\.(\w+)$/)[1];
            const mime = {
                html: 'text/html',
                css: 'text/css',
                js: 'application/javascript',
                gif: 'image/gif',
                png: 'image/png',
                jpg: 'image/jpeg',
            };

            response.writeHead(200, {
                'Content-Type': `${mime[ext] || 'text/plain'}`,
                'Access-Control-Allow-Origin': '*',
                'Pragma': 'no-cache',
                'Cache-Control' : 'no-cache',
            });
            response.write(file, 'binary');
            response.end();
        },
        301: (uri) => {
            response.writeHead(301, {
                'Location': `${uri}/`,
            });
            response.end();

        },
        404: () => {
            response.writeHead(404, {
                'Content-Type': 'text/plain',
            });
            response.write('404 Not Found\n');
            response.end();

        },
        500: (err) => {
            response.writeHead(500, {
                'Content-Type': 'text/plain',
            });
            response.write(`${err}\n`);
            response.end();
        }
    }

    const uri = url.parse(request.url).pathname;
    let filename = path.join(process.cwd(), uri);

    fs.exists(filename, (exists) => {
        if (!exists) {
            console.log(`${uri} 404`);
            status['404']();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            if (filename.match(/[^/]$/)) {
                console.log(`${uri} 301`);
                status['301'](uri);
                return
            }
            filename += 'index.html';
        }

        fs.readFile(filename, 'binary', (err, file) => {
            if (err) {
                console.log(`${uri} 500`);
                status['500'](err);
                return;
            }
            console.log(`${uri} 200`);
            status['200'](file, filename);
        });
    });
};

http.createServer(server).listen(port);
console.log(`Server running at http://localhost:${port}`);
