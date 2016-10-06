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

    it("Should be able to query nested OR OR query", function(){
        let query: QueryRequest = {
                                    GET: ["courses_instructor"],
                                    WHERE: {
                                        OR: [
                                            {OR: [
                                                {"IS": {"courses_instructor":"*gregor*"}},
                                                {"GT": {"courses_avg": 94

                                            }}
                                            ]},
                                        ]
                                    },
                                    ORDER: null,
                                    AS: "TABLE"};
                                    let dataset: Datasets = {
                                                "courses" :
                                                [{"result": [{
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]}]};

        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).to.eql({ render: 'TABLE', result: [{"courses_instructor": "graves, gregor;zeiler, kathryn"},
                                                       {"courses_instructor" : "gg"}]});
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
                                                        "Course": "40969",
                                                        "Professor": "graves, gregor;zeiler, kathryn",
                                                        "Avg": 84,
                                                        "Pass" : 95,
                                                        "Subject": "biol"
                                                    },
                                                    {
                                                        "Course": "40969",
                                                        "Professor": "gg",
                                                        "Avg": 95,
                                                        "Pass" : 100,
                                                        "Subject": "cpsc"
                                                    }
                                                ]},
                                                {"result": [{
                                                        "Course": "40969",
                                                        "Professor": "hi, gregor",
                                                        "Avg": 84,
                                                        "Pass" : 100,
                                                        "Subject": "biol"
                                                    },
                                                    {
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
});
