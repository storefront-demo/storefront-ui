var express = require('express');
var router = express.Router();
var path = require('path');

var http = require('request-promise-json');
var Promise = require('promise');
var UrlPattern = require('url-pattern');
var config = require('config');
var utils = require('./utils');
var bodyParser = require('body-parser');

var session;
var api_url = new UrlPattern('(:protocol)\\://(:host)(:api)/(:operation)');
var _apis = config.get('APIs');
var _authServer = config.get('Auth-Server');

var jsonParser = bodyParser.json({ type: 'application/*+json' } );

/* Handle the Get request*/
router.get('/Me', function (req, res) {
  session = req.session;
  setUserOptions(req, res)
    .then(sendApiReq)
    .then(sendResponse)
    .catch(renderErrorPage)
    .done();

});

/* Handle the PUT request*/
router.put('/Me', jsonParser, function(req, res) {
    session = req.session;
    setCreditCardOptions(req, res)
        .then(submitCreditCardRequest)
        .catch(renderErrorPage)
        .done();
});

function setUserOptions(req, res) {

  var user_url = api_url.stringify({
    protocol: _apis.user.protocol,
    host: _apis.user.service_name,
    api: _apis.user.base_path,
    operation: "Me"
  });

  var basicAuthToken = _authServer.client_id + ":" + _authServer.client_secret;
  var buffer = new Buffer(basicAuthToken);
  var basicToken = 'Basic ' + buffer.toString('base64');

  var options = {
    method: 'GET',
    url: user_url,
    strictSSL: false,
    headers: { 'Content-Type': 'application/scim+json', 'Accept': 'application/scim+json' },
  };
  return new Promise(function (fulfill) {
    // Get OAuth Access Token, if needed
    if (_apis.user.require.indexOf("oauth") != -1) {
      // If already logged in, add token to request
      options.headers.Authorization = req.headers.authorization;
      fulfill({
        options: options,
        res: res
      });
    }
    else {
        fulfill({
            options: options,
            res: res
        });
    }
  });

}

function sendApiReq(function_input) {
  var options = function_input.options;
  var res = function_input.res;

  console.log("MY OPTIONS:\n" + JSON.stringify(options));

  // Make API call for Catalog data
  return new Promise(function (fulfill, reject) {
    http.request(options)
      .then(function (result) {
        console.log("Billing Info call succeeded with result: " + JSON.stringify(result));
        fulfill({
          data: result,
          res: res
        });
      })
      .fail(function (reason) {
        console.log("Billing Info call failed with reason: " + JSON.stringify(reason));
        reject({
          err: reason,
          res: res
        });
      });
  });
}

function sendResponse(function_input) {
  var data = function_input.data;
  var res = function_input.res;

  // Render the page with the results of the API call
  res.setHeader('Content-Type', 'application/scim+json');
  res.setHeader('Accept', 'application/scim+json');
  res.send(data);
}

function setCreditCardOptions(req, res) {

    var form_body = req.body;

    var reqBody = {
      emails: form_body.emails,
      addresses: form_body.addresses,
      meta: form_body.meta,
      schemas: form_body.schemas,
      'urn:ietf:params:scim:schemas:extension:ibm:2.0:User': {
          "customAttributes": [
              {
                  "values": [
                      form_body.cardno
                  ],
                  "name": "creditcardno"
              }
          ],
          "lastLoginType": "user_password"
      },
      name: form_body.name,
      groups: form_body.groups,
      active: form_body.active,
      id: form_body.id,
      userName: form_body.userName,
      phoneNumbers: form_body.phoneNumbers
    };

    console.log("credit card data"+form_body.name.formatted);

    var cc_put_url = api_url.stringify({
        protocol: _apis.user.protocol,
        host: _apis.user.service_name,
        api: _apis.user.base_path,
        operation: "Me"
    });

    var options = {
        method: 'PUT',
        url: cc_put_url,
        strictSSL: false,
        headers: { 'Content-Type': 'application/scim+json', 'Accept': 'application/scim+json' },
        body: reqBody,
        JSON: true
    };

    // Add Headers like Host
    if (_apis.user.headers) {
        options.headers = _apis.user.headers;
    }

    return new Promise(function(fulfill) {
        // Get OAuth Access Token, if needed
        if (_apis.user.require.indexOf("oauth") != -1) {
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

function submitCreditCardRequest(function_input) {
    var options = function_input.options;
    var creditcardno = function_input.creditcardno;
    console.log("CC OPTIONS:\n" + JSON.stringify(options));
    http.request(options)
        .then(function(data) {
            console.log("DATA: " + JSON.stringify(data));
            // Render the page with the results of the API call
            txnid = data.id;
            res.setHeader('Content-Type', 'application/scim+json');
            res.setHeader('Accept', 'application/scim+json');
            res.send(data);
        })
        .fail(function(err) {
            console.log("ERR: " + JSON.stringify(err));
            // Render the error message in JSON
            res.setHeader('Content-Type', 'application/scim+json');
            res.setHeader('Accept', 'application/scim+json');
            res.send(err);
        });
}

function renderErrorPage(function_input) {
  var err = function_input.err;
  var res = function_input.res;
  // Render the error message in JSON
  res.setHeader('Content-Type', 'application/scim+json');
  res.setHeader('Accept', 'application/scim+json');
  res.send(err);

}


module.exports = router;
