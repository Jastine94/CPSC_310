/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacadeRoom", function () {

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    var emptyZip: string = null;
    var invalidDataZip: string = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('.\/test\/310rooms.1.1.zip')).toString('base64');
        try {
            // fs.unlinkSync('./id.json');
            fs.unlinkSync('..\/data\/rooms.json');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - id.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    // DELETEDATSET
    it("Should be able to delete an existing dataset", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('rooms').then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should not be able to delete a dataset that does not exist", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('rooms').then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);
        });
    });

    // ADDDATASET
    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('rooms', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform query with valid query", function(){
        var that = this;
        var validQuery: QueryRequest = {
            "GET": ["rooms_lat", "rooms_lon", "rooms_fullname"],
            "WHERE": {
            },
            "ORDER": null,
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform deep query", function()
    {
        var validQuery: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_name",  "maxSeats", "rooms_furniture"],
            "WHERE": {"AND" :
                [
                    {"NOT" : {"IS": {"rooms_type": "Small Group"}}},
                    {"GT": {"rooms_lon": -123.249886}},
                    {"AND": [
                        {"NOT": {"IS": {"rooms_number": "1*"}}},
                        {"IS": {"rooms_fullname": "*oo*"}},
                        {"OR": [
                            {"GT": {"rooms_seats": 98}}
                        ]}
                    ]}
                ]},
            "GROUP": [ "rooms_fullname", "rooms_name", "rooms_furniture"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_fullname"]},
            "AS":"TABLE"
        };
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to perform deep query without OR", function()
    {
        var validQuery: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_name",  "maxSeats", "rooms_furniture"],
            "WHERE": {"AND" :
                [
                    {"NOT" : {"IS": {"rooms_type": "Small Group"}}},
                    {"GT": {"rooms_lon": -123.249886}},
                    {"AND": [
                        {"NOT": {"IS": {"rooms_number": "1*"}}},
                        {"IS": {"rooms_fullname": "*oo*"}},
                        {"GT": {"rooms_seats": 98}}
                    ]}
                ]},
            "GROUP": [ "rooms_fullname", "rooms_name", "rooms_furniture"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_fullname"]},
            "AS":"TABLE"
        };
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to get the same result for 2 queries with the same meaning", function()
    {
        var validQuery: QueryRequest = {
            "GET": ["rooms_shortname", "rooms_name",  "maxSeats", "rooms_furniture", "rooms_lat", "rooms_lon"],
            "WHERE": {"AND" :
                [
                    {"AND" : [
                        {"NOT" : {"IS": {"rooms_type": "Tie*"}}}
                    ]},
                    {"AND" : [
                        {"NOT" : {"IS": {"rooms_fullname": "C*"}}}
                    ]},
                    {"AND" : [
                        {"LT": {"rooms_lon": 0}}
                    ]},
                    {"AND" : [
                        {"GT": {"rooms_lat": 0}}
                    ]},
                    {"AND" : [
                        {"GT": {"rooms_seats": 100}}
                    ]},
                    {"AND" : [
                        {"GT": {"rooms_seats": 90}}
                    ]}
                ]},
            "GROUP": [ "rooms_shortname", "rooms_name", "rooms_furniture", "rooms_lat", "rooms_lon"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_shortname"]},
            "AS":"TABLE"
        };

        var validQuery2: QueryRequest = {
            "GET": ["rooms_shortname", "rooms_name",  "maxSeats", "rooms_furniture", "rooms_lat", "rooms_lon"],
            "WHERE": {"AND" :
                [
                    {"OR" : [
                        {"NOT" : {"IS": {"rooms_type": "Tie*"}}}
                    ]},
                    {"OR" : [
                        {"NOT" : {"IS": {"rooms_fullname": "C*"}}}
                    ]},
                    {"OR" : [
                        {"LT": {"rooms_lon": 0}}
                    ]},
                    {"OR" : [
                        {"GT": {"rooms_lat": 0}}
                    ]},
                    {"OR" : [
                        {"GT": {"rooms_seats": 90}}
                    ]},
                    {"OR" : [
                        {"GT": {"rooms_seats": 100}}
                    ]}
                ]},
            "GROUP": [ "rooms_shortname", "rooms_name", "rooms_furniture", "rooms_lat", "rooms_lon"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_shortname"]},
            "AS":"TABLE"
        };

        facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });

        facade.performQuery(validQuery2).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

});