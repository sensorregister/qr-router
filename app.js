var express = require('express');
var util = require('util');
var request = require('request');

const registerApiRoot = process.env.REGISTER_API_ROOT || 'http://localhost:8081/';
const searchTemplate = 'codes/search/findOneByValue?value=%s';

const registerUiRoot = process.env.REGISTER_UI_ROOT || 'http://localhost:8082/';
const searchUiRoot = process.env.SEARCH_UI_ROOT || 'http://localhost:8083/';

var app = express();
app.get('/', function (req, res) {
    res.send('');
});

app.get('/:code', function (req, res) {
    var uri = req.header('HOST') + "/" + req.params.code;
    var path = util.format(searchTemplate, uri);

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
                    res.redirect(registerUiRoot);
                }
                else if (result.status === 'LINKED') {
                    res.redirect(searchUiRoot);
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