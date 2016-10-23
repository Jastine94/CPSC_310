/**
 * Created by rtholmes on 2016-09-03.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";

import JSZip = require('jszip');
import {expect} from 'chai';

//
import fs = require('fs');

describe("QueryController", function () {

    before (function(){
    });
    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Query should be valid from D1", function() {
        let query: QueryRequest = { GET: ["courses_dept", "courses_avg"],
            WHERE: {
                "NOT": {
                    "LT": {
                        "courses_avg": 85
                    }
                }
            },
            ORDER: "courses_avg", AS: 'TABLE'};
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let validQ = controller.isValid(query);
        expect(validQ).to.be.true;
    });

    it("Should be validate that the ORDER and APPLY works", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id", "courseAverage"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let validQ = controller.isValid(query);
        expect(validQ).to.be.true;
    })

    it("Should not work when GET does not contain GROUP values", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id", "courseAverage"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_dept" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not work when GET does not contain APPLY values", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id", "courseAverage"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            APPLY: [ {"courseverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be valid with empty APPLY field", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            APPLY: [],
            ORDER: { "dir": "UP", "keys": ["courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let validQ = controller.isValid(query);
        expect(validQ).to.be.true;
    })

    it("Should not work with APPLY missing, but GROUP present", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            ORDER: { "dir": "UP", "keys": ["courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not work with GROUP missing, but APPLY present", function(){
        let query: QueryRequest =
        {
            GET: ["courseAverage"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be able to have APPLY keys in GROUP keys", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id", "courseAverage"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id", "courseAverage" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should have all keys in GET present in GROUP or APPLY", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id", "courseAverage", "courses_dept"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            APPLY: [ {"courseAverage": {"AVG": "courses_avg"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be invalid with empty WHERE and no APPLY", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id"],
            WHERE: {} ,
            GROUP: [ "courses_id" ],
            ORDER: { "dir": "UP", "keys": ["courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be invalid with ORDER keys not in GET", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            ORDER: { "dir": "UP", "keys": ["courses_dept"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be invalid with ORDER keys not in GET", function(){
        let query: QueryRequest ={
            GET: ["courses_id", "courses_avg", "courseAverage", "maxFail", "courses_uuid"],
            WHERE: {},
            GROUP: [ "courses_avg", "courses_id" ],
            APPLY: [{"numSections": {"COUNT": "courses_uuid"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be invalid with duplicate key in APPLY", function(){
        let query: QueryRequest ={
            GET: ["courses_id", "courses_avg", "courses_dept", "courseAverage", "numSections", "courses_uuid"],
            WHERE: {},
            GROUP: [ "courses_avg", "courses_id", "courses_dept" ],
            APPLY: [{"numSections": {"COUNT": "courses_uuid"}},{"courseAverage": {"AVG": "courses_avg"}}, {"numSections": {"MAX": "courses_fail"}} ],
            ORDER: { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be valid with valid ORDER values", function(){
        let query: QueryRequest ={
            GET: ["courses_dept", "courses_id", "numSections"],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let validQ = controller.isValid(query);
        expect(validQ).to.be.true;
    })

    it("Should not be valid, no GET value", function(){
        let query: QueryRequest ={
            GET: [],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid, value in get is not a string", function(){
        let query: any ={
            GET: [3333],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should be valid with valid no ORDER field", function(){
        let query: any ={
            GET: ["courses_dept", "courses_id", "numSections"],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let validQ = controller.isValid(query);
        expect(validQ).to.be.true;
    })

    it("Should not be valid with invalid direction", function(){
        let query: QueryRequest ={
            GET: ["courses_dept", "courses_id", "numSections"],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "LEFT", "keys": ["numSections", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with no keys in ORDER", function(){
        let query: QueryRequest ={
            GET: ["courses_dept", "courses_id", "numSections"],
            WHERE: {},
            GROUP: [ "courses_dept", "courses_id" ],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "LEFT", "keys": []},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with object key of values instead of dir or keys in ORDER", function(){
        let query: QueryRequest ={
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "value": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with invalid apply value", function(){
        let query: QueryRequest =
        {
            GET: ["courses_id"],
            WHERE: {"IS": {"courses_dept": "cpsc"}} ,
            GROUP: [ "courses_id" ],
            APPLY: [{"numSections": {"MIX": "courses_uuid"}}],
            ORDER: { "dir": "UP", "keys": ["courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with empty where group", function(){
        let query: QueryRequest =
        {
            GET: ["courses_dept", "courses_id", "numSections"],
            WHERE: {},
            GROUP: [],
            APPLY: [ {"numSections": {"COUNT": "courses_uuid"}} ],
            ORDER: { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with invalid AS", function(){
        let query: QueryRequest =
        {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"MOOO"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with more than one value in NOT", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "NOT": {
                    "GT": {
                        "courses_avg": 90
                    },
                    "LT": {
                        "courses_avg": 90
                    }
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with empty AND", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": []},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with more than one value in GT", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90, "courses_dept": "cpsc"
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with empty keys in ORDER", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": []},
            "AS":"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

    it("Should not be valid with no key/value pair for IS", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.false;
    })

})