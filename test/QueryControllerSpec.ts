/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        // NOTE: this is not actually a valid query for D1
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(false);
    });

    it("Should be able to query, although the answer will be empty", function () {
        // NOTE: this is not actually a valid query for D1, nor is the result correct.
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should check that the value is meaningful
    });

    it("ORDER should be in the GET, else not a valid query", function () {
        let query: QueryRequest = {GET: ["courses_dept"], WHERE: {"courses_avg": 90}, ORDER: 'food', AS: 'table'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        // bad request
        expect(ret).to.be.equal(false);
    });

    it("Should be able to get", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_id"],
                                    WHERE: {"courses_avg": 90},
                                    ORDER: null, AS: 'table'};

        let dataset: Datasets = {
                    "courses" :
                    {"result": [{
                    		"id": 40969,
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 90,
                    		"Subject": "biol"
                    	}]}};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.be.equal({ render: 'TABLE', result: 'hi'});
    })


    // simple query
    it("Should be able to query, although the answer will be empty", function () {
        let query: QueryRequest = {GET: ["courses_dept"],
                                    WHERE: {
                                          GT: {
                                                "courses_avg": 90
                                              }
                                          },
                                    ORDER: "courses_avg",
                                    AS: "TABLE"
                                  };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // TODO: should check that the value is meaningful
    });

    // complex query
    it("Should be able to query, although the answer will be empty", function () {
        let query: QueryRequest = {
                                    GET: ["courses_dept", "courses_id"],
                                    WHERE: {
                                        OR: {
                                            AND: {
                                                GT: {
                                                    "courses_avg": 70
                                                },
                                                IS: {"courses_dept": "adhe"}
                                            },
                                            EQ: {"courses_avg": 90}
                                        }
                                    },
                                    ORDER: "courses_avg",
                                    AS: "TABLE"
                                  };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // TODO: should check that the value is meaningful
    });
});
