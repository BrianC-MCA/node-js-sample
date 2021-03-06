#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var DOWNLOAD_DEFAULT = "http://floating-badlands-4396.herokuapp.com/index.html";
var indexFile = "index.html";
var validDownloadFileSpecified = false;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    var exist = fs.existsSync(instr);
    if (!exist) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var downloadUrl = function(inUrl) {
    var htmlFileUrl = inUrl.toString();
    var downloadedFile = rest.get(htmlFileUrl).on('complete', function(result) {
    var isError = (result instanceof Error);
       if (isError) {
	console.log('Error: ' + result.message,htmlFileUrl);
	process.exit(1);
      }
    });
    fs.writeFileSync(indexFile,downloadedFile);
	validDownloadFileSpecified = true;
	return downloadedFile;
};



var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

if (require.main == module) {
    program
	.option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
	.option('-f, --file ','File name of index.html file', assertFileExists, HTMLFILE_DEFAULT)
	.option('-u, --url ','URL of index.html file', downloadUrl, DOWNLOAD_DEFAULT)
	.parse(process.argv);
   var checkJson;
   if (validDownloadFileSpecified) {
       checkJson = checkHtmlFile(indexFile.toString(), program.checks.toString());
    } else {
       checkJson = checkHtmlFile(program.file.toString(), program.checks.toString());
	}
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
