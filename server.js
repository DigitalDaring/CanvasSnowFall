const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.port || '5001';

const mimesICareAbout = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
}

const setCORSHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
}

const handleRequest = (req, res) => {

    console.log(req.url);

    let requestedPath = '.' + req.url;
    if (requestedPath === './') {
        requestedPath = `./index.html`;
    }

    const fileExists = fs.existsSync(requestedPath);
    if (fileExists) {
        const fileIsAFolder = fs.statSync(requestedPath).isDirectory();
        if (fileIsAFolder) {
            // I dunno, do some kind of recursive search maybe?  For now everything 
            // is in the root folder so it doesn't really matter.  Just error out atm
            res.statusCode = 404;
            res.end(`Requested path is a directory and not a file: ${requestedPath}`);
            return;
        };

        setCORSHeaders(res);
        const extension = path.parse(requestedPath).ext;

        try {
            const fileContents = fs.readFileSync(requestedPath);
            res.setHeader('Content-type', mimesICareAbout[extension]);
            res.end(fileContents);
        } catch (ex) {
            res.statusCode = 500;
            res.end(JSON.stringify(ex));
        }
        
        return;
    }

    res.statusCode = 404;
    res.end(`Could not find: ${requestedPath}`);
    return;
};

const parsedPort = parseInt(port);

http.createServer(handleRequest).listen(parsedPort);