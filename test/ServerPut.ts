// import Server from '../src/rest/Server';
// import Log from "../src/Util";
//
// // https://www.npmjs.com/package/icedfrisby
// var frisby = require('icedfrisby');
// var Joi = require('joi');
// import JSZip = require('jszip');
//
// describe("Dataset Service", function () {
//
//     const URL = 'http://localhost:4321/dataset/';
//     var server: Server;
//
//     beforeEach(function (done) {
//         server = new Server(4321);
//         server.start().then(function (val: boolean) {
//             Log.test("DatasetService::beforeEach() - started: " + val);
//             done();
//         });
//     });
//
//     afterEach(function (done) {
//         server.stop().then(function (val: boolean) {
//             Log.test("DatasetService::afterEach() - closed: " + val);
//             done();
//         }).catch(function (err) {
//             Log.error("DatasetService::afterEach() - ERROR: " + err);
//             done();
//         });
//     });
//
//     // // base64 representation of a zip file; could also get this by reading a file from fs
//     // var zipContent = 'UEsDBAoAAAAIAAEiJEm/nBg/EQAAAA8AAAALAAAAY29udGVudC5vYmqrVspOrVSyUipLzClNVaoFAFBLAQIUAAoAAAAIAAEiJEm/nBg/EQAAAA8AAAALAAAAAAAAAAAAAAAAAAAAAABjb250ZW50Lm9ialBLBQYAAAAAAQABADkAAAA6AAAAAAA=';
//     // var buf = new Buffer(zipContent, 'base64');
//     // frisby.create('Should not be able to set a valid zip that does not contain a valid dataset')
//     //     .put(URL + 'courses', buf, {json: false, headers: {'content-type': 'application/octet-stream'}})
//     //     .inspectRequest('Request: ')
//     //     .inspectStatus('Response status: ')
//     //     .inspectBody('Response body: ')
//     //     .expectStatus(400)
//     //     .expectJSONTypes({
//     //         error: Joi.string()
//     //     })
//     //     .toss();
//     //
//     // buf = new Buffer('adfadsfad', 'base64');
//     // frisby.create('Should not be able to set a dataset that is not a zip file')
//     //     .put(URL + 'courses', buf, {json: false, headers: {'content-type': 'application/octet-stream'}})
//     //     .inspectRequest('Request: ')
//     //     .inspectStatus('Response status: ')
//     //     .inspectBody('Response body: ')
//     //     .expectStatus(400)
//     //     .toss();
//
//     // buf = new Buffer
//     frisby.create('Should be able to put a dataset that did not previously exist and return 204')
//         .put(URL + 'courses', buf, {json: false, headers: {'content-type': 'application/octet-stream'}})
//         .inspectRequest('Request: ')
//         .inspectStatus('Response status: ')
//         .inspectBody('Response body: ')
//         .expectStatus(204)
//         .toss();
//
//     // buf = new Buffer
//     frisby.create('Should be able to put a dataset that existed before and will be overwritten - 201')
//         .put(URL + 'courses', buf, {json: false, headers: {'content-type': 'application/octet-stream'}})
//         .inspectRequest('Request: ')
//         .inspectStatus('Response status: ')
//         .inspectBody('Response body: ')
//         .expectStatus(201)
//         .toss();
//
// });
//
//
