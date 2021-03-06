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

    it("Should be able to get with 2 key with when none is not", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "NOT": {
                                            "LT": {
                                                "courses_avg": 85
                                                }
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Courses": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 86,
                            "Subject": "biol"
                        }]},
                    {"result": [{
                            "Courses": "2",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "cpsc"
                        }
                        ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "biol", "courses_avg" : 86},
                                                      {"courses_dept": "cpsc", "courses_avg" : 95}]});
    });

    it("Should be able to get with 2 key with and array", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                            "AND": [
                                                {"IS": {"courses_dept" : "cpsc"}},
                                                {"EQ": {"courses_avg" : 95}}]
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 86,
                            "Subject": "biol"
                        }]},
                    {"result": [{
                            "Course": "2",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "cpsc"
                        },
                        {
                                "Course": "10",
                                "Professor": "another result",
                                "Avg": 95,
                                "Subject": "cpscblabla"
                            },
                        {
                            "Course": "3",
                            "Professor": "another result",
                            "Avg": 92,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "key"
                        }
                        ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "cpsc", "courses_avg" : 95}]});
    });

    it("Should be able to get with 2 key with not", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "NOT": {
                                            "LT": {
                                                "courses_avg": 85
                                                }
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "biol"
                        },
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "biol"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "cpsc", "courses_avg" : 90},
                                                      {"courses_dept": "biol", "courses_avg" : 95}]});
    });

    it("Should be able to get with 2 key with not is a wild card", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "NOT": {
                                            "IS": {
                                                "courses_dept": "*psc"
                                                }
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "biol"
                        },
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "astu"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "biol", "courses_avg" : 84},
                                                      {"courses_dept": "astu", "courses_avg" : 95}]});
    });

    it("Should be able to get with 2 key with not with empty result", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "NOT": {
                                            "IS": {
                                                "courses_dept": "cpsc"
                                                }
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: []});
    });

    it("Should be able to get with 2 key with double negation", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "NOT": {
                                            "NOT" :
                                            {
                                                "IS": {
                                                    "courses_dept": "*psc"
                                                    }
                                                }
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "biol"
                        },
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "astu"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "cpsc", "courses_avg" : 80},
                                                      {"courses_dept": "cpsc", "courses_avg" : 84},
                                                      {"courses_dept": "cpsc", "courses_avg" : 90}]});
    });

    it("Should be able to get with 2 key where lt clause and order by avg", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "LT": {
                                            "courses_avg": 85
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "5",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "biol"
                        },
                        {
                            "Course": "1",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "biol"
                        },
                        {
                            "Course": 4,
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "cpsc", "courses_avg" : 80},
                                                      {"courses_dept": "biol", "courses_avg" : 84},
                                                      {"courses_dept": "cpsc", "courses_avg" : 84}]})
    });

    it("Should be able to get with 2 key where lt clause and order by avg", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "GT": {
                                            "courses_avg": 90
                                            }
                                        },
                                    ORDER: "courses_dept", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "5",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "biol"
                        },
                        {
                            "Course": "1",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 91,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "biol"
                        },
                        {
                            "Course": "4",
                            "Professor": "carter",
                            "Avg": 93,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "biol", "courses_avg" : 95},
                                                      {"courses_dept": "cpsc", "courses_avg" : 91},
                                                      {"courses_dept": "cpsc", "courses_avg" : 93}]})
    });

    // is string comparison query
    it("Should be able to get with where is clause without wildcard", function () {
        let query: QueryRequest = {GET: ["courses_dept", "courses_instructor"],
                                    WHERE: {
                                          IS: {
                                                "courses_dept": "cpsc"
                                              }
                                          },
                                    ORDER: "courses_dept",
                                    AS: "TABLE"
                                  };
        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "1",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 84,
                    		"Subject": "biol"
                    	},
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                    		"Course": "4",
                    		"Professor": "another result",
                    		"Avg": 95,
                    		"Subject": "biol"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_dept":"cpsc", "courses_instructor" : "holmes, reid"},
                                                      {"courses_dept": "cpsc", "courses_instructor" : "gregor"},
                                                      {"courses_dept": "cpsc", "courses_instructor" : "carter"}]});
    });

    it("Should be able to get with where is clause with wildcard", function () {
        let query: QueryRequest = {GET: ["courses_dept", "courses_instructor"],
                                    WHERE: {
                                          IS: {
                                                "courses_dept": "*ps*"
                                              }
                                          },
                                    ORDER: "courses_dept",
                                    AS: "TABLE"
                                  };
        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "1",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 84,
                    		"Subject": "biol"
                    	},
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                    		"Course": "4",
                    		"Professor": "another result",
                    		"Avg": 95,
                    		"Subject": "biol"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_dept":"cpsc", "courses_instructor" : "holmes, reid"},
                                                      {"courses_dept": "cpsc", "courses_instructor" : "gregor"},
                                                      {"courses_dept": "cpsc", "courses_instructor" : "carter"}]});
    });

    it("Should be able to get with where is clause with wildcard", function () {
        let query: QueryRequest = {GET: ["courses_dept", "courses_instructor"],
                                    WHERE: {
                                          IS: {
                                                "courses_instructor": "*grego*"
                                              }
                                          },
                                    ORDER: "courses_dept",
                                    AS: "TABLE"
                                  };
        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "1",
                    		"Professor": "gregor",
                    		"Avg": 84,
                    		"Subject": "cpsc 1"
                    	},
                        {
                            "Course": "2",
                            "Professor": "gregoria",
                            "Avg": 90,
                            "Subject": "cpsc 2"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregur",
                            "Avg": 90,
                            "Subject": "cpsc 3"
                        }]},
                    {"result": [{
                    		"Course": "4",
                    		"Professor": "aaagregor",
                    		"Avg": 95,
                    		"Subject": "cpsc 3"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_dept":"cpsc 1", "courses_instructor" : "gregor"},
                                                      {"courses_dept": "cpsc 2", "courses_instructor" : "gregoria"},
                                                      {"courses_dept": "cpsc 3", "courses_instructor" : "aaagregor"}]});
    });

    it("Should be able to get with one key where eq clause", function() {
        let query: QueryRequest = { GET: ["courses_dept"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 84
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "1",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 84,
                    		"Subject": "biol"
                    	},
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                    		"Course": "4",
                    		"Professor": "another result",
                    		"Avg": 84,
                    		"Subject": "biol"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{courses_dept: "biol"},
                                                      {courses_dept: "cpsc"},
                                                      {courses_dept: "biol"},
                                                      {courses_dept: "cpsc"}]});
    });

    it("Should be able to get with 2 key where gt clause", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "GT": {
                                            "courses_avg": 85
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "1",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 84,
                    		"Subject": "biol"
                    	},
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                    		"Course": "4",
                    		"Professor": "another result",
                    		"Avg": 95,
                    		"Subject": "biol"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "cpsc", "courses_avg" : 90},
                                                      {"courses_dept": "cpsc", "courses_avg" : 90},
                                                      {"courses_dept": "biol", "courses_avg" : 95}]});
    });

    it("Should be able to get with 2 key where gt clause", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_id"],
                                    WHERE: {
                                        "LT": {
                                            "courses_avg": 85
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "1",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 84,
                    		"Subject": "biol"
                    	},
                        {
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                    		"Course": "4",
                    		"Professor": "another result",
                    		"Avg": 95,
                    		"Subject": "biol"
                        },
                        {
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{"courses_dept": "biol", "courses_id" : "1"},
                                                      {"courses_dept": "cpsc", "courses_id" : "5"}]});
    });

    it("ORDER should be in the GET, else not a valid query", function () {
        let query: QueryRequest = {GET: ["courses_dept"], WHERE: {"courses_avg": 90}, ORDER: 'courses_avg', AS: 'TABLE'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let validQuery: boolean = controller.isValid(query);
        // let ret = controller.query(query);
        // Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        // expect(ret).to.eql({status: 'failed', error: "invalid query"});
        Log.test('In: ' + JSON.stringify(query) + ', out: is valid? ' + validQuery);
        expect(validQuery).to.be.false;
    });

    it("Should be able to get when key is not present,result will be empty", function() {
        let query: QueryRequest = { GET: ["courses_fail"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 90
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    {"result": [{
                    		"Course": "40969",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 90,
                    		"Subject": "biol"
                    	}]}};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: []});
    });

    it("Should be able to get one items with one key", function() {
        let query: QueryRequest = { GET: ["courses_dept"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 90
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "40969",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 90,
                    		"Subject": "biol"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({render: 'TABLE', result: [{courses_dept: "biol"}]});
    });

    it("Should be able to get multiple items with one key", function() {
        let query: QueryRequest = { GET: ["courses_dept"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 90
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result":
                        [{
                            "Course": "40969",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 90,
                            "Subject": "biol"
                        },
                        {
                            "Course": "40969",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "40969",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 90,
                            "Subject": "math"
                        }]
                    }]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [ {"courses_dept": "biol"},
                                                        {"courses_dept": "cpsc"},
                                                        {"courses_dept": "math"}]});
    });

    it("Should be able to get multiple items with 2 keys", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_id"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 90
                                            }
                                        },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result":
                        [{
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 90,
                            "Subject": "biol"
                        },
                        {
                            "Course": "2",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 90,
                            "Subject": "cpsc"
                        },
                        {
                            "Course": "3",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 90,
                            "Subject": "math"
                        }]
                    }]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_dept": "biol", "courses_id": "1"},
                                                        {"courses_dept": "cpsc","courses_id": "2"},
                                                        {"courses_dept": "math","courses_id": "3"}]});
    });

    // simple query
    it("Should be able to query, although the answer will be empty", function () {
        let query: QueryRequest = {GET: ["courses_dept"],
                                    WHERE: {
                                          GT: {
                                                "courses_avg": 90
                                              }
                                          },
                                    ORDER: "courses_dept",
                                    AS: "TABLE"
                                  };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: []});
    });

    it("Should be able to get multiple keys; 3 keys", function() {
        let query: QueryRequest = { GET: ["courses_fail", "courses_id",
                                          "courses_instructor", "courses_avg", "courses_dept"],
                                    WHERE: {
                                        EQ: {"courses_avg": 91.5}
                                    },
                                    ORDER: null, AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                    		"Course": "40969",
                    		"Professor": "graves, marcia;zeiler, kathryn",
                    		"Avg": 91.5,
                    		"Subject": "biol"
                    	}]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_id": "40969", "courses_instructor" : "graves, marcia;zeiler, kathryn",
                                                        "courses_avg" : 91.5, "courses_dept" : "biol"}]});
    });

    //simple query that contains the course but does not return any info since the dataset will not meet the criteria
    it("Should be able to query, but will have empty answer since dataset will not contain courses_avg: 84", function(){
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
                                [{"result":
                                    [{
                                        "Title": "mod chinese auth",
                                        "Section": "001",
                                        "Detail": "",
                                        "Other": 0,
                                        "Low": 63,
                                        "id": "44096",
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
                                }]
                            };
        let controller = new QueryController(dataset);
        let ret =controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: []});
        // should be returning an empty set
    });

    //simple query that contains the course but does not return any info since the dataset will not meet the criteria
    it("Should be able to query, should return courses with courses_avg: 84", function(){
       let query: QueryRequest = {GET: ["courses_avg", "courses_pass", "courses_fail"],
                                    WHERE: {
                                        EQ: {
                                            "courses_avg": 84
                                        }
                                    },
                                    ORDER: "courses_pass",
                                    AS: "TABLE"
                                    };
        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "Course": "40969",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Pass" : 100,
                            "Subject": "biol"
                        },
                        {
                            "Course": "40969",
                            "Professor": "gg",
                            "Avg": 85,
                            "Pass" : 100,
                            "Subject": "cpsc"
                        }
                    ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_avg": 84, "courses_pass" : 100}]});
    });

    //simple query with the correct format of using LOGIC COMPARISON AND NOT {filter} with a valid dataset
    it("Should be able to query and return a valid response with", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        AND: [{
                                            "IS": {"courses_dept" : "cpsc"}},
                                            {"NOT": {
                                                "EQ":{"courses_avg": 75}}}]
                                        },
                                    ORDER : null,
                                    AS: "TABLE"};
        let dataset: Datasets = {
                                "courses":
                                    [{"result":
                                        [
                                            {
                                                "Title": "comptn, progrmng",
                                                "Section": "911",
                                                "Detail": "",
                                                "Other": 2,
                                                "Low": 36,
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
                                    }]
        };
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        let expected_result = { render: 'TABLE',
                                result:
                                    [{courses_instructor: 'kiczales, gregor'},
                                     {courses_instructor: ''}]};
        expect(ret).to.eql(expected_result);
    });

    // SCOMPARISON with [*] comparison
    it("Should be able to query and return all values that contain [*] string", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        AND: [
                                            {"IS": {"courses_instructor":"*diane*"}},
                                            {"GT": {"courses_avg": 60}}
                                        ]
                                    },
                                    ORDER: null,
                                    AS: "TABLE"
        };

        let dataset: Datasets = {"courses":
                                    [{"result":
                                    [{
                                        "Title": "fund ecology",
                                        "Section": "201",
                                        "Course": "57865",
                                        "Professor": "goodey, wayne;srivastava, diane",
                                        "Avg": 69.23,
                                        "Subject": "biol"
                                    },
                                        {
                                            "Title": "fund ecology",
                                            "Section": "overall",
                                            "Course": "57866",
                                            "Professor": "dianehahaha",
                                            "Avg": 68.07,
                                            "Subject": "biol"
                                        },
                                        {
                                            "Title": "fund ecology",
                                            "Section": "921",
                                            "Course": "66714",
                                            "Professor": "goodey, wayndianee",
                                            "Avg": 74.27,
                                            "Subject": "biol"
                                        },
                                        {
                                            "Title": "fund ecology",
                                            "Section": "overall",
                                            "Course": "66715",
                                            "Professor": "dididididianeh",
                                            "Avg": 74.27,
                                            "Subject": "biol"
                                        }
                                    ]}]};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        let expected_value =  { render: 'TABLE',
                                result:
                                        [{courses_instructor: 'goodey, wayne;srivastava, diane'},
                                        {courses_instructor: 'dianehahaha'},
                                        {courses_instructor: 'goodey, wayndianee'},
                                        {courses_instructor: 'dididididianeh'}]};
        expect(ret).to.eql(expected_value);
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
    });

    // random query
    it("Should be able to query, although the answer will be empty", function () {
        let query: QueryRequest = {
            GET: ["rooms_lat", "rooms_lon"],
            WHERE: {},
            ORDER: null,
            AS: "TABLE"
        };
        let dataset: Datasets = {"rooms":[
            {"result":[
                {"rooms_href":"http",
                    "rooms_number":"105",
                    "rooms_seats":94,
                    "rooms_furniture":"Classroom-Fixed Tables/Movable Chairs",
                    "rooms_type":"Case Style","rooms_shortname":"ALRD",
                    "rooms_name":"ALRD_105","rooms_fullname":"Allard Hall (LAW)",
                    "rooms_address":"1822 East Mall","rooms_lat": null,"rooms_lon":null}]}]};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: []})});
});
