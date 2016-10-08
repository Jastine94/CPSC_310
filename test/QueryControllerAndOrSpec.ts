/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryControllerAND,OR", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to get with NOT NOT NOT", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
                                    WHERE: {
                                        "NOT": {
                                            "NOT" : {
                                                "NOT" : {
                                                    "IS": {
                                                        "courses_dept": "*psc"
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                    ORDER: "courses_avg", AS: 'TABLE'};

        let dataset: Datasets = {
                    "courses" :
                    [{"result": [{
                            "id" : 1,
                            "Course": "1",
                            "Professor": "graves, marcia;zeiler, kathryn",
                            "Avg": 84,
                            "Subject": "biol"
                        },
                        {
                            "id" : 2,
                            "Course": "2",
                            "Professor": "holmes, reid",
                            "Avg": 80,
                            "Subject": "cpsc"
                        },
                        {
                            "id" : 3,
                            "Course": "3",
                            "Professor": "gregor",
                            "Avg": 90,
                            "Subject": "cpsc"
                        }]},
                    {"result": [{
                            "id" : 4,
                            "Course": "4",
                            "Professor": "another result",
                            "Avg": 95,
                            "Subject": "astu"
                        },
                        {
                            "id" : 5,
                            "Course": "5",
                            "Professor": "carter",
                            "Avg": 84,
                            "Subject": "cpsc"
                        }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_dept": "biol", "courses_avg" : 84},
                                                      {"courses_dept": "astu", "courses_avg" : 95}]});
    });

    it("Should be able to query nested OR OR query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        OR: [
                                            {OR: [
                                                {"IS": {"courses_instructor":"*gregor*"}},
                                                {"GT": {"courses_avg": 94}}
                                            ]},
                                            {"IS": {"courses_id": "40969"}}
                                        ]
                                    },
                                    ORDER: null,
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "random",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "biol"
                                                    }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "graves, gregor;zeiler, kathryn"},
                                                       {"courses_instructor" : "gg"},
                                                       {"courses_instructor" : "random"}]});
    });

    it("Should be able to query nested OR OR OR query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        OR: [
                                            {OR: [
                                                {OR: [
                                                    {"IS": {"courses_instructor":"*gregor*"}},
                                                    {"GT": {"courses_avg": 94}}
                                                ]},
                                                {"NOT" : {"EQ" : {"courses_pass" : 100}}},
                                            ]},
                                            {"IS": {"courses_id": "course 1"}}]
                                    },
                                    ORDER: "courses_instructor",
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "course 1",
                                                        "Professor": "prof 1",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "subject 1"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "course 2",
                                                        "Professor": "prof 2",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "subject 2"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 3,
                                                        "Course": "course 3",
                                                        "Professor": "prof 3",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "subject 3"
                                                    },
                                                    {
                                                        "id" : 4,
                                                        "Course": "course 3",
                                                        "Professor": "prof 4",
                                                        "Avg": 95,
                                                        "Pass" : 50,
                                                        "Subject": "subject 4"
                                                    }
                                                ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "prof 1"},
                                                       {"courses_instructor" : "prof 4"}]});
    });

    it("Should be able to query nested AND AND query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        AND: [
                                            {AND: [
                                                {"IS": {"courses_instructor":"*gregor*"}},
                                                {"GT": {"courses_avg": 80}}
                                            ]},
                                            {"IS" :{ "courses_dept" : "cpsc"}},
                                        ]
                                    },
                                    ORDER: null,
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "1",
                                                        "Professor": "gregorg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    },
                                                    {
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "random1",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 4,
                                                        "Course": "2",
                                                        "Professor": "roagoain , gregoreoaifh",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "gregorg"},
                                                       {"courses_instructor" : "roagoain , gregoreoaifh"}]});
    });

    it("Should be able to query nested AND AND AND query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        AND: [
                                            {AND: [
                                                {AND: [
                                                    {"IS": {"courses_instructor":"*gregor*"}},
                                                    {"NOT" : {"LT": {"courses_fail": 50}}}
                                                ]},
                                                {"IS" :{ "courses_dept" : "cpsc"}},
                                                {"EQ": {"courses_pass": 95}},
                                                {"GT": {"courses_avg": 80}}
                                            ]},
                                            {"IS" :{ "courses_id" : "1"}},
                                        ]
                                    },
                                    ORDER: null,
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Fail" : 45,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "1",
                                                        "Professor": "gregorg",
                                                        "Avg": 85,
                                                        "Fail" : 50,
                                                        "Pass" : 95,
                                                        "Subject": "cpsc"
                                                    },
                                                    {
                                                        "id" : 5,
                                                        "Course": "2",
                                                        "Professor": "gregorg",
                                                        "Avg": 85,
                                                        "Fail" : 40,
                                                        "Pass" : 95,
                                                        "Subject": "cpsc"
                                                    },
                                                    {
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "random1",
                                                        "Avg": 80,
                                                        "Fail" : 50,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 4,
                                                        "Course": "2",
                                                        "Professor": "roagoain , gregoreoaifh",
                                                        "Avg": 84,
                                                        "Fail" : 80,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "gregorg"}]});
    });

    it("Should be able to query nested OR AND OR query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        OR: [
                                            {AND: [
                                                {OR :[
                                                    {"IS": {"courses_instructor":"*gregor*"}},
                                                    {"GT": {"courses_avg": 94}}
                                                ]},
                                                {"EQ": {"courses_pass": 100}}
                                            ]},
                                            {"EQ": {"courses_pass": 95}}
                                        ]
                                    },
                                    ORDER: "courses_instructor",
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 95,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "hi, gregor",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 4,
                                                        "Course": "40969",
                                                        "Professor": "TT",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "gg"},
                                                       {"courses_instructor" : "graves, gregor;zeiler, kathryn"},
                                                       {"courses_instructor" : "hi, gregor"},
                                                       {"courses_instructor" : "TT"}]});
    });

    it("Should be able to query nested AND 2 OR query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        AND: [
                                            {OR: [
                                                {OR :[
                                                    {"IS": {"courses_instructor":"*gregor*"}},
                                                    {"NOT" : {"GT": {"courses_avg": 94}}}
                                                ]},
                                                {"EQ": {"courses_pass": 100}}
                                            ]},
                                            {OR: [
                                                {OR :[
                                                    {"IS": {"courses_instructor":"TT"}},
                                                    {"GT": {"courses_avg": 94}}
                                                ]},
                                                {"EQ": {"courses_pass": 100}}
                                            ]},
                                            {"IS": {"courses_dept": "*cpsc*"}}
                                        ]
                                    },
                                    ORDER: "courses_instructor",
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 95,
                                                        "Subject": "cpsc"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "hi, gregor",
                                                        "Avg": 84,
                                                        "Pass" : 80,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 4,
                                                        "Course": "40969",
                                                        "Professor": "TT",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "gg"},
                                                       {"courses_instructor": "graves, gregor;zeiler, kathryn"},
                                                       {"courses_instructor": "TT"}]});
    });

    it("Should be able to query nested OR 2 AND query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        OR: [
                                            {AND: [
                                                {AND :[
                                                    {"IS": {"courses_instructor":"*gregor*"}},
                                                    {"NOT" : {"GT": {"courses_avg": 94}}}
                                                ]},
                                                {"GT": {"courses_pass": 75}}
                                            ]},
                                            {AND: [
                                                {AND :[
                                                    {"IS": {"courses_instructor":"TT"}},
                                                    {"GT": {"courses_avg": 94}}
                                                ]},
                                                {"EQ": {"courses_pass": 100}}
                                            ]},
                                            {"IS": {"courses_dept": "*cpsc*"}}
                                        ]
                                    },
                                    ORDER: "courses_instructor",
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 95,
                                                        "Subject": "cpsc"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "apsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "hi, gregor",
                                                        "Avg": 84,
                                                        "Pass" : 80,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 4,
                                                        "Course": "40969",
                                                        "Professor": "TT",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "graves, gregor;zeiler, kathryn"},
                                                        {"courses_instructor": "hi, gregor"},
                                                        {"courses_instructor": "TT"}]});
    });

    it("Should be able to query nested OR 2 AND query with a NOT", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        OR: [
                                            {AND: [
                                                {AND :[
                                                    {"IS": {"courses_instructor":"*gregor*"}},
                                                    {"NOT" : {"GT": {"courses_avg": 94}}}
                                                ]},
                                                {"NOT" : {"IS": {"courses_dept": "*cpsc*"}}}
                                            ]},
                                            {AND: [
                                                {AND :[
                                                    {"IS": {"courses_instructor":"TT"}},
                                                    {"GT": {"courses_avg": 94}}
                                                ]},
                                                {"EQ": {"courses_pass": 100}}
                                            ]},
                                            {"EQ": {"courses_avg": 95}}
                                        ]
                                    },
                                    ORDER: "courses_instructor",
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "id" : 1,
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 95,
                                                        "Subject": "a"
                                                    },
                                                    {
                                                        "id" : 2,
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "apsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "id" : 3,
                                                        "Course": "40969",
                                                        "Professor": "hi, gregor",
                                                        "Avg": 84,
                                                        "Pass" : 80,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "id" : 4,
                                                        "Course": "40969",
                                                        "Professor": "TT",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "gg"},
                                                       {"courses_instructor": "graves, gregor;zeiler, kathryn"},
                                                       {"courses_instructor": "hi, gregor"},
                                                       {"courses_instructor": "TT"}]});
    });
});
