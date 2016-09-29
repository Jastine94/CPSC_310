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
    });




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

    //simple query that contains the course but does not return any info since the dataset will not meet the criteria
    it("Should be able to query, but will have empty answer since dataset will not contain filtered requirements", function(){
       let query: QueryRequest = {GET: ["courses_dept", "courses_pass"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 84
                                        }
                                    },
                                    ORDER: "courses_pass",
                                    AS: "TABLE"
                                    };
        let dataset: Datasets = {
                            "courses":
                                {"result":
                                    [{
                                        "Title": "mod chinese auth",
                                        "Section": "001",
                                        "Detail": "",
                                        "Other": 0,
                                        "Low": 63,
                                        "id": 44096,
                                        "Professor": "rea, christopher",
                                        "Audit": 0,
                                        "Withdrew": 1,
                                        "Year": "2013",
                                        "High": 80,
                                        "Course": "451",
                                        "Session": "w",
                                        "Pass": 40,
                                        "Fail": 0,
                                        "Avg": 72.35,
                                        "Campus": "ubc",
                                        "Subject": "asia"
                                    }]
                                }
                            };
        let controller = new QueryController(dataset);
        let ret =controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        // should be returning an empty set
    });

    //simple query with the correct format of using LOGIC COMPARISON AND NOT {filter} with a valid dataset
    it("Should be able to query and return a valid response with", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        AND: {
                                            IS: {"courses_dept" : "cpsc"},
                                            NOT: {
                                                EQ:{"courses_avg": 75}
                                            }
                                        }
                                    },
                                    ORDER: null,
                                    AS: "TABLE"
        };
        let dataset: Datasets = {
                                "courses":
                                    {"result":
                                        [
                                            {
                                                "Title": "comptn, progrmng",
                                                "Section": "911",
                                                "Detail": "",
                                                "Other": 2,
                                                "Low": 36,
                                                "id": 66968,
                                                "Professor": "kiczales, gregor",
                                                "Audit": 2,
                                                "Withdrew": 12,
                                                "Year": "2012",
                                                "Stddev": 13.34,
                                                "Enrolled": 118,
                                                "High": 98,
                                                "Course": "110",
                                                "Session": "s",
                                                "Pass": 95,
                                                "Fail": 7,
                                                "Avg": 77.43,
                                                "Campus": "ubc",
                                                "Subject": "cpsc"
                                            },
                                            {
                                                "Title": "comptn, progrmng",
                                                "Section": "overall",
                                                "Detail": "",
                                                "Other": 2,
                                                "Low": 36,
                                                "id": 66969,
                                                "Professor": "",
                                                "Audit": 5,
                                                "Withdrew": 24,
                                                "Year": "2012",
                                                "Stddev": 13.34,
                                                "Enrolled": 133,
                                                "High": 98,
                                                "Course": "110",
                                                "Session": "s",
                                                "Pass": 95,
                                                "Fail": 7,
                                                "Avg": 77.43,
                                                "Campus": "ubc",
                                                "Subject": "cpsc"
                                            }]
                                    }
        };
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        let expected_result = { render: 'TABLE',
                                result:
                                    [   {courses_instructor: 'kiczales, gregor'},
                                        { courses_instructor: ''}]};
        expect(ret).to.be.equal(expected_result.toString());
        // output of the test should be object with the correct information
    });

    // SCOMPARISON with [*] comparison
    it("Should be able to query and return all values that contain [*] string", function(){
        let query: QueryRequest = {
                                    GET: ["courses_average"],
                                    WHERE: {
                                        AND: [
                                            {IS: {"courses_instructor":"diane*"}},
                                            {"GT": {"courses_avg": 60}}
                                        ]
                                    },
                                    ORDER: "courses_id",
                                    AS: "TABLE"
        };

        let dataset: Datasets = {"courses":
                                    {"result":
                                    [{
                                        "Title": "fund ecology",
                                        "Section": "201",
                                        "id": 57865,
                                        "Professor": "goodey, wayne;srivastava, diane",
                                        "Avg": 69.23,
                                        "Subject": "biol"
                                    },
                                        {
                                            "Title": "fund ecology",
                                            "Section": "overall",
                                            "id": 57866,
                                            "Professor": "dianehahaha",
                                            "Avg": 68.07,
                                            "Subject": "biol"
                                        },
                                        {
                                            "Title": "fund ecology",
                                            "Section": "921",
                                            "id": 66714,
                                            "Professor": "goodey, wayndianee",
                                            "Avg": 74.27,
                                            "Subject": "biol"
                                        },
                                        {
                                            "Title": "fund ecology",
                                            "Section": "overall",
                                            "id": 66715,
                                            "Professor": "dididididianeh",
                                            "Avg": 74.27,
                                            "Subject": "biol"
                                        }
                                        ]}};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        let expected_value =  { render: 'TABLE',
                                result:
                                    [
                                        {courses_instructor: 'goodey, wayne;srivastava, diane'},
                                        {courses_instructor: 'dianehahaha'},
                                        {courses_instructor: 'goodey, wayndianee'},
                                        { courses_instructor: 'dididididianeh'}]};
        expect(ret).to.be.equal(expected_value);
        // todo: might not exactly output as wanted
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
