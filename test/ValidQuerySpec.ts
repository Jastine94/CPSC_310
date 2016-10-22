/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

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
            ORDER: { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            AS:"TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let invalidQ = controller.isValid(query);
        expect(invalidQ).to.be.true;
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


})