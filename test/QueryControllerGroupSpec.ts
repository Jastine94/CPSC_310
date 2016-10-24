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

    it("Should be able to apply avg", function() {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage", "maxPass"],
            "WHERE": {} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxPass" : {"MAX": "courses_pass"}}],
            "ORDER": {"dir" : "UP", "keys": ["courseAverage"]},
            "AS":"TABLE"
        };

        let dataset : Datasets = {
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
        controller.isValid(query);
            let ret = controller.query(query);
            Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
            expect(ret).to.eql({
                render: 'TABLE', result: [{"courses_id": "310", "courseAverage" : 84.00, "maxPass" : 95},
                    {"courses_id": "210", "courseAverage" : 95.00, "maxPass" : 100}]});
        });

    it("Should be able to apply min and max", function() {
        let query: QueryRequest = {
            "GET": ["courses_id", "courses_title", "minPass", "maxAudit"],
            "WHERE": {} ,
            "GROUP": [ "courses_id", "courses_title"],
            "APPLY": [{"maxAudit": {"MAX": "courses_audit"}},
                      {"minPass" : {"MIN": "courses_pass"}}],
            "ORDER": {"dir" : "UP", "keys": ["courses_audit"]},
            "AS":"TABLE"
        };

        let dataset : Datasets = {
            "courses": [{
                "result": [{
                    "id": 1,
                    "Course": "310",
                    "Title" : "t1",
                    "Professor": "graves, gregor;zeiler, kathryn",
                    "Avg": 84,
                    "Pass": 95,
                    "Audit" : 5,
                    "Subject": "a"
                },
                    {
                        "id": 2,
                        "Course": "210",
                        "Title" : "t1",
                        "Professor": "gg",
                        "Avg": 95,
                        "Pass": 100,
                        "Audit" : 6,
                        "Subject": "apsc"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "310",
                        "Title" : "t1",
                        "Professor": "hi, gregor",
                        "Avg": 84,
                        "Pass": 80,
                        "Audit" : 10,
                        "Subject": "biol"
                    },
                        {
                            "id": 4,
                            "Course": "210",
                            "Title" : "t1",
                            "Professor": "TT",
                            "Avg": 95,
                            "Pass": 50,
                            "Audit" : 5,
                            "Subject": "cpsc"
                        }
                    ]
                }]
        };

        let controller = new QueryController(dataset);
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "310", "courses_title" : "t1", "minPass" : 80, "maxAudit" : 10},
                {"courses_id": "210", "courses_title" : "t1", "minPass" : 50, "maxAudit" : 6}]});
    });

    it("Should be able to group by a key", function() {
        let query: QueryRequest = {
            GET: ["courses_id"],
            WHERE: {},
            GROUP: ["courses_id"],
            APPLY: [],
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
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "210"},
                                      {"courses_id": "310"}]});
    });


    it("Should be able to group by 2 keys", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            APPLY: [],
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
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "210", "courses_avg" : 95},
                {"courses_id": "310", "courses_avg" : 84}, {"courses_id": "310", "courses_avg" : 85}]});
    });

    it("Should be able to group by 2 different keys", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_avg", "courses_id"],
            APPLY: [],
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
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_avg": 95, "courses_id" : "210"},
                                      {"courses_avg": 84, "courses_id" : "310"},
                                      {"courses_avg": 85, "courses_id" : "310"}]});
    });

    it("Should be able to order by direction up", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            APPLY: [],
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
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "210", "courses_avg" : 95},
                {"courses_id": "210", "courses_avg" : 96},
                {"courses_id": "310", "courses_avg" : 84}, {"courses_id": "310", "courses_avg" : 85}]});
    });

    it("Should be able to order by direction up different ordering", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            APPLY: [],
            ORDER: {"dir" : "UP", "keys": ["courses_avg", "courses_id"]},
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
                            "Course": "212",
                            "Professor": "TT",
                            "Avg": 95,
                            "Pass": 100,
                            "Subject": "cpsc"
                        }
                    ]
                }]
        };
        let controller = new QueryController(dataset);
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_avg": 84, "courses_id" : "310"},
                {"courses_avg": 85, "courses_id" : "310"},
                {"courses_avg": 95, "courses_id": "210"}, {"courses_avg": 95, "courses_id": "212"}]});
    });

    it("Should be able to order by direction down", function() {
        let query: QueryRequest = {
            GET: ["courses_id", "courses_avg"],
            WHERE: {},
            GROUP: ["courses_id", "courses_avg"],
            APPLY: [],
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
        controller.isValid(query);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            render: 'TABLE', result: [{"courses_id": "310", "courses_avg" : 85},
                {"courses_id": "310", "courses_avg" : 84},
                {"courses_id": "210", "courses_avg" : 96}, {"courses_id": "210", "courses_avg" : 95}]});
    });
});