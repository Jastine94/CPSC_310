// /**
//  * Created by rtholmes on 2016-10-04.
//  */
//
// import fs = require('fs');
// import Log from "../src/Util";
// import {expect} from 'chai';
// import InsightFacade from "../src/controller/InsightFacade";
// import {InsightResponse} from "../src/controller/IInsightFacade";
//
// describe("InsightFacade", function () {
//
//     var zipFileContents: string = null;
//     var facade: InsightFacade = null;
//     var emptyZip: string = null;
//     var invalidDataZip: string = null;
//     before(function () {
//         Log.info('InsightController::before() - start');
//         // this zip might be in a different spot for you
//         zipFileContents = new Buffer(fs.readFileSync('.\/test\/310courses.1.0.zip')).toString('base64');
//         emptyZip = new Buffer(fs.readFileSync('.\/test\/empty.zip')).toString('base64');
//         invalidDataZip = new Buffer(fs.readFileSync('.\/test\/baddata.zip')).toString('base64');
//         try {
//             // what you delete here is going to depend on your impl, just make sure
//             // all of your temporary files and directories are deleted
//             // fs.unlinkSync('./id.json');
//             fs.unlinkSync('..\/data\/courses.json');
//             // fs.rmdirSync(__dirname+"\/..\/data\/");
//         } catch (err) {
//             // silently fail, but don't crash; this is fine
//             Log.warn('InsightController::before() - id.json not removed (probably not present)');
//         }
//         Log.info('InsightController::before() - done');
//     });
//
//     beforeEach(function () {
//         facade = new InsightFacade();
//     });
//
//     // ADDDATASET
//     it("Should be able to add a add a new dataset (204)", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
//             expect(response.code).to.equal(204);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should be able to update an existing dataset (201)", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
//             expect(response.code).to.equal(201);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should not be able to add an empty zip file (400)", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.addDataset('courses', emptyZip).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     it("Should not be able to add a zip file with invalid content (400)", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.addDataset('courses', invalidDataZip).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     it("Should not be able to add an invalid dataset (400)", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.addDataset('courses', 'some random bytes').then(function (response: InsightResponse) {
//             expect.fail();
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     // TODO: add tests for performQuery
//
//     // PERFORMQUERY
//     it("Should not be able to performQuery on empty query", function () {
//         var that = this;
//         var emptyQuery: any = {};
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(emptyQuery).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     it("Should not be able to perform query with missing GET field", function () {
//         var that = this;
//         var noGetQuery: any = {
//             "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
//             "AS":"TABLE"};
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(noGetQuery).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     it("Should not be able to perform query with missing QUERYBODY field", function () {
//         var that = this;
//         var noQueryBodyQuery: any = {
//             "GET": ["courses_id", "courseAverage"],
//             "ORDER": "",
//             "AS":"TABLE"};
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(noQueryBodyQuery).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     it("Should not be able to perform query with missing AS field", function () {
//         var that = this;
//         var noAsQuery: any = {
//             "GET": ["courses_id", "courseAverage"],
//             "WHERE" : {},
//             "ORDER": ""};
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(noAsQuery).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(400);
//         });
//     });
//
//     it("Should not be able to perform query with missing ids", function () {
//         var that = this;
//         var missingId: any = {
//             "GET": ["courss_id", "courses_avg"],
//             "WHERE" : {},
//             "ORDER": "",
//             "AS":"TABLE"};
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(missingId).then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(424);
//             expect(response.body).to.equal({ error: { missing: [ 'courss' ] } });
//             // todo: find out why it is failing -- shouldn't be failing
//         });
//     });
//
//     it("Should be able to perform query with valid query", function(){
//         // this query takes around 22-27s to execute
//         var that = this;
//         var validQuery: any = {
//             "GET": ["courses_dept", "courses_id", "courses_avg"],
//             "WHERE": {
//                 "OR": [
//                     {"AND": [
//                         {"GT": {"courses_avg": 70}},
//                         {"IS": {"courses_dept": "adhe"}}
//                     ]},
//                     {"EQ": {"courses_avg": 90}}
//                 ]
//             },
//             "ORDER": "courses_avg",
//             "AS": "TABLE"
//         };
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(validQuery).then(function (response: InsightResponse) {
//             expect(response.code).to.equal(200);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should be able to perform query and find the average for all cpsc courses (200)", function(){
//         // this query will fail for not because no implementation of group & apply
//         // Find the average for all cpsc courses
//         var that = this;
//         var validQuery: any = {
//             "GET": ["courses_id", "courseAverage"],
//             "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
//             "GROUP": [ "courses_id" ],
//             "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
//             "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
//             "AS":"TABLE"
//         };
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(validQuery).then(function (response: InsightResponse) {
//             expect(response.code).to.equal(200);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should be able to perform query and find the avg for all courses in university (200)", function(){
//         // this query will fail for not because no implementation of group & apply
//         // Find the average for all courses in the university, sort up (hardest to easiest)
//         var that = this;
//         var validQuery: any =
//         {
//             "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
//             "WHERE": {},
//             "GROUP": [ "courses_dept", "courses_id" ],
//             "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
//             "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "course_dept", "courses_id"]},
//             "AS":"TABLE"
//         };
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(validQuery).then(function (response: InsightResponse) {
//             expect(response.code).to.equal(200);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should be able to perform query and find the courses offered the most times", function(){
//         // this query will fail for not because no implementation of group & apply
//         // Find the courses offered the most times
//         var that = this;
//         var validQuery: any =
//         {
//             "GET": ["courses_dept", "courses_id", "numSections"],
//             "WHERE": {},
//             "GROUP": [ "courses_dept", "courses_id" ],
//             "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
//             "ORDER": { "dir": 'UP', "keys": ["numSections", "courses_dept", "courses_id"]},
//             "AS":"TABLE"
//         };
//         Log.trace("Starting test: " + that.test.title);
//         return facade.performQuery(validQuery).then(function (response: InsightResponse) {
//             expect(response.code).to.equal(200);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     // DELETEDATSET
//     it("Should be able to delete an existing dataset", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.removeDataset('courses').then(function (response: InsightResponse) {
//             expect(response.code).to.equal(204);
//         }).catch(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         });
//     });
//
//     it("Should not be able to delete a dataset that does not exist", function () {
//         var that = this;
//         Log.trace("Starting test: " + that.test.title);
//         return facade.removeDataset('courses').then(function (response: InsightResponse) {
//             expect.fail('Should not happen');
//         }).catch(function (response: InsightResponse) {
//             expect(response.code).to.equal(404);
//         });
//     });
//
// });
