/**
 * Created by Frances on 2016-10-22.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController APPLY", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to apply with count", function() {
        let query: QueryRequest = {
            GET: ["courses_dept", "courses_id", "numSections"],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            AS:"TABLE"
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
                        "Course": "310",
                        "Professor": "gg",
                        "Avg": 96,
                        "Pass": 100,
                        "Subject": "a"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "322",
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
        // Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            "render":"TABLE",
            "result":[
                {"courses_dept":"biol","courses_id":"322","numSections":1},
                {"courses_dept":"cpsc","courses_id":"210","numSections":1},
                {"courses_dept":"a","courses_id":"310","numSections":2}]});
    });


    it("Should be able to apply with avg", function() {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        }
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
                        "Course": "310",
                        "Professor": "gg",
                        "Avg": 96,
                        "Pass": 100,
                        "Subject": "a"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "322",
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
        // Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            "render":"TABLE",
            "result":[
                {"courses_id":"322","courseAverage":84},
                {"courses_id":"310","courseAverage":90.5},
                {"courses_id":"210","courseAverage":95}]});
    });

    it("Should be able to apply with MIN", function() {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "minPass"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"minPass": {"MIN": "courses_pass"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "minPass", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        }
        let dataset: Datasets = {
            "courses": [{
                "result": [{
                    "id": 1,
                    "Course": "310",
                    "Professor": "graves, gregor;zeiler, kathryn",
                    "Avg": 85,
                    "Pass": 91,
                    "Subject": "a"
                },
                    {
                        "id": 2,
                        "Course": "310",
                        "Professor": "gg",
                        "Avg": 96,
                        "Pass": 100,
                        "Subject": "a"
                    }
                ]
            },
                {
                    "result": [{
                        "id": 3,
                        "Course": "322",
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
        // Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({
            "render":"TABLE",
            "result":[
                {"courses_dept":"biol","courses_id":"322","courseAverage":84,"minPass":80},
                {"courses_dept":"a","courses_id":"310","courseAverage":90.5,"minPass":91},
                {"courses_dept":"cpsc","courses_id":"210","courseAverage":95,"minPass":100}]});
    });


});