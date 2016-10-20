/**
 * Created by jirwan on 2016-10-20.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController GROUP", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to group by a key", function() {
        let query: QueryRequest = {
            GET: ["courses_id"],
            WHERE: {},
            GROUP: ["courses_id"],
            ORDER: "courses_id",
            AS: "TABLE"
        };
        let dataset: Datasets = {
            "courses": [{
                "result": [{
                    "id": 1,
                    "Course": "310",
                    "Professor": "graves, gregor;zeiler, kathryn",
                    "Avg": 84,
                    "Pass": 95,
                    "Subject": "a"
                },
                    {
                        "id": 2,
                        "Course": "210",
                        "Professor": "gg",
                        "Avg": 95,
                        "Pass": 100,
                        "Subject": "apsc"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "310",
                        "Professor": "hi, gregor",
                        "Avg": 84,
                        "Pass": 80,
                        "Subject": "biol"
                    },
                        {
                            "id": 4,
                            "Course": "210",
                            "Professor": "TT",
                            "Avg": 95,
                            "Pass": 100,
                            "Subject": "cpsc"
                        }
                    ]
                }]
        };
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "210"},
                                      {"courses_id": "210"},
                                      {"courses_id": "310"}, {"courses_id": "310"}]});
    });

    it("Should be able to group by 2 keys", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            ORDER: "courses_id",
            AS: "TABLE"
        };
        let dataset: Datasets = {
            "courses": [{
                "result": [{
                    "id": 1,
                    "Course": "310",
                    "Professor": "graves, gregor;zeiler, kathryn",
                    "Avg": 84,
                    "Pass": 95,
                    "Subject": "a"
                },
                    {
                        "id": 2,
                        "Course": "210",
                        "Professor": "gg",
                        "Avg": 95,
                        "Pass": 100,
                        "Subject": "apsc"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "310",
                        "Professor": "hi, gregor",
                        "Avg": 85,
                        "Pass": 80,
                        "Subject": "biol"
                    },
                        {
                            "id": 4,
                            "Course": "210",
                            "Professor": "TT",
                            "Avg": 95,
                            "Pass": 100,
                            "Subject": "cpsc"
                        }
                    ]
                }]
        };
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "210", "courses_avg" : 95},
                {"courses_id": "210", "courses_avg" : 95},
                {"courses_id": "310", "courses_avg" : 84}, {"courses_id": "310", "courses_avg" : 85}]});
    });

    it("Should be able to order by direction up", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            ORDER: {"dir" : "UP", "keys": ["courses_id", "courses_avg"]},
            AS: "TABLE"
        };
        let dataset: Datasets = {
            "courses": [{
                "result": [{
                    "id": 1,
                    "Course": "310",
                    "Professor": "graves, gregor;zeiler, kathryn",
                    "Avg": 85,
                    "Pass": 95,
                    "Subject": "a"
                },
                    {
                        "id": 2,
                        "Course": "210",
                        "Professor": "gg",
                        "Avg": 96,
                        "Pass": 100,
                        "Subject": "apsc"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "310",
                        "Professor": "hi, gregor",
                        "Avg": 84,
                        "Pass": 80,
                        "Subject": "biol"
                    },
                        {
                            "id": 4,
                            "Course": "210",
                            "Professor": "TT",
                            "Avg": 95,
                            "Pass": 100,
                            "Subject": "cpsc"
                        }
                    ]
                }]
        };
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "210", "courses_avg" : 95},
                {"courses_id": "210", "courses_avg" : 96},
                {"courses_id": "310", "courses_avg" : 84}, {"courses_id": "310", "courses_avg" : 85}]});
    });

    it("Should be able to order by direction down", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            ORDER: {"dir" : "DOWN", "keys": ["courses_id", "courses_avg"]},
            AS: "TABLE"
        };
        let dataset: Datasets = {
            "courses": [{
                "result": [{
                    "id": 1,
                    "Course": "310",
                    "Professor": "graves, gregor;zeiler, kathryn",
                    "Avg": 85,
                    "Pass": 95,
                    "Subject": "a"
                },
                    {
                        "id": 2,
                        "Course": "210",
                        "Professor": "gg",
                        "Avg": 96,
                        "Pass": 100,
                        "Subject": "apsc"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "310",
                        "Professor": "hi, gregor",
                        "Avg": 84,
                        "Pass": 80,
                        "Subject": "biol"
                    },
                        {
                            "id": 4,
                            "Course": "210",
                            "Professor": "TT",
                            "Avg": 95,
                            "Pass": 100,
                            "Subject": "cpsc"
                        }
                    ]
                }]
        };
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "310", "courses_avg" : 85},
                {"courses_id": "310", "courses_avg" : 84},
                {"courses_id": "210", "courses_avg" : 96}, {"courses_id": "210", "courses_avg" : 95}]});
    });
});