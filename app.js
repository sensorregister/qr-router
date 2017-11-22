var express = require('express');
var util = require('util');
var request = require('request');
var cfenv = require('cfenv');

var config = cfenv.getAppEnv().getService('registration-config') ||
    { credentials :
        {   "register.url": 'http://localhost:8081/',
            "registration.url": 'http://localhost:8082/',
            "search.url": 'http://localhost:8083/'}};

function withSlash(url) {
    return url.replace(/\/?$/, '/');
}

const registerApiRoot = withSlash(config.credentials["register.url"] || process.env.REGISTER_API_ROOT || 'http://localhost:8081/');
const registerSearchTemplate = 'codes/search/findOneByValue?value=%s';

const registrationRoot = withSlash(config.credentials["registration.url"] || process.env.REGISTRATION_ROOT || 'http://localhost:8082/');
const registrationQueryTemplate = '?value=%s';
const searchRoot = withSlash(config.credentials["search.url"] || process.env.SEARCH_ROOT || 'http://localhost:8083/');
const searchQueryTemplate ='?q=%s';

console.log("Register API root: ", registerApiRoot);
console.log("Registration root: ", registrationRoot);
console.log("Search root: ", searchRoot);

var app = express();
app.get('/', function (req, res) {
    res.send('');
});

app.get('/:code', function (req, res) {
    var uri = req.header('HOST') + "/" + req.params.code;
    var path = util.format(registerSearchTemplate, uri);

    request(registerApiRoot + path, function (error, response, body) {
        if (error) {
            res.status(500).send("Redirect error")
        }
        else {
            if (response.statusCode !== 200) {
                res.status(404).send("Code node found");
            }
            else {
                var result = JSON.parse(body);
                if (result.status === 'INITIALIZED') {
                    res.redirect(registrationRoot + util.format(registrationQueryTemplate, uri));
                }
                else if (result.status === 'ACTIVATED') {
                    res.redirect(searchRoot + util.format(searchQueryTemplate, uri));
                }
                else {
                    res.send("This should not be happening, try again later.");
                }
            }
        }
    });
});


var server = app.listen(process.env.PORT || 3000, function () {
    console.log('qr-router listening on port ' + server.address().port);
});