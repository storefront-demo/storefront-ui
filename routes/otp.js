var express = require('express');
var router = express.Router();
var path = require('path');

var http = require('request-promise-json');
var Promise = require('promise');
var UrlPattern = require('url-pattern');
var config = require('config');
var utils = require('./utils');

var session;
var api_url = new UrlPattern('(:protocol)\\://(:host)(:api)/(:operation)');
var _apis = config.get('APIs');
var _authServer = config.get('Auth-Server');

// router.get('/otp', function(req, res) {
//     session = req.session;
//     res.sendFile(path.join(__dirname, '../', 'public/resources/components/views/otp.html'));
// });

/* Handle the POST request for creating a new item review */
router.post('/generation', function(req, res) {
    session = req.session;
    setOtpOptions(req, res)
        .then(submitOtpRequest)
        .catch(renderErrorPage)
        .done();
});

function setOtpOptions(req, res) {

    var reqBody = {
        emailAddress: "phemankita@gmail.com"
    };

    var otp_url = api_url.stringify({
        protocol: utils.getProtocol(_apis.otp.protocol),
        host: _apis.otp.service_name,
        api: _apis.otp.base_path,
        operation: "transient/verifications"
    });

    var options = {
        method: 'POST',
        url: otp_url,
        strictSSL: false,
        headers: {},
        body: reqBody,
        JSON: true
    };

    // Add Headers like Host
    if (_apis.otp.headers) {
        options.headers = _apis.otp.headers;
    }

    return new Promise(function(fulfill) {
        // Get OAuth Access Token, if needed
        if (_apis.otp.require.indexOf("oauth") != -1) {
            // Add OAuth access token to the header
            options.headers.Authorization = req.headers.authorization;
            fulfill({
                options: options,
                res: res
            });
        } else fulfill({
            options: options,
            res: res
        });
    });

}

function submitOtpRequest(function_input) {
    var options = function_input.options;
    var email = "phemankita@gmail.com";
    var res = function_input.res;
    console.log("OTP OPTIONS:\n" + JSON.stringify(options));
    http.request(options)
        .then(function(data) {
            console.log("DATA: " + JSON.stringify(data));
            // Render the page with the results of the API call
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        })
        .fail(function(err) {
            console.log("ERR: " + JSON.stringify(err));
            // Render the error message in JSON
            res.setHeader('Content-Type', 'application/json');
            res.send(err);
        });
}

function renderErrorPage(function_input) {
    var err = function_input.err;
    var res = function_input.res;

    // Render the error message in JSON
    res.setHeader('Content-Type', 'application/json');
    res.send(err);

}

module.exports = router;
