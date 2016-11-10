/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacadeRoomSpecRoomsBuchanan", function () {

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    var emptyZip: string = null;
    var invalidDataZip: string = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('.\/test\/BUCH.zip')).toString('base64');
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

    it("Should be able to perform query group by room-furniture", function(){
        var that = this;
        var validQuery: QueryRequest =  {
            "GET": ["maxSeats", "rooms_type", "numRooms"],
            "WHERE": {
                "GT": {"rooms_seats": 0}},
            "GROUP": ["rooms_type"],
            "APPLY": [{"maxSeats": {"MAX": "rooms_seats"}},{"numRooms":{"COUNT":"rooms_name"}}],
            "ORDER": {"dir": "UP", "keys": ["rooms_type", "maxSeats", "numRooms"]},
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

    it("Should be able to return an empty result", function(){
        var that = this;
        var validQuery: QueryRequest =  {
            "GET": ["maxSeats", "rooms_type", "numRooms"],
            "WHERE": {"AND": [
                {"NOT": {"IS": {"rooms_shortname":"A*"}}},
                {"NOT": {"IS": {"rooms_shortname":"B*"}}},
                {"NOT": {"IS": {"rooms_shortname":"D*"}}}
            ]},
            "GROUP": ["rooms_type"],
            "APPLY": [{"maxSeats": {"MAX": "rooms_seats"}},{"numRooms":{"COUNT":"rooms_name"}}],
            "ORDER": {"dir": "UP", "keys": ["rooms_type", "maxSeats", "numRooms"]},
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

    it("Should be able to return all rooms starting with B, D or A101", function(){
        var that = this;
        var validQuery: QueryRequest =  {
            "GET": ["maxSeats", "rooms_type", "numRooms"],
            "WHERE": {"OR" : [
                {"IS": {"rooms_number":"A101"}},
                {"IS": {"rooms_number":"B*"}},
                {"IS": {"rooms_number":"D*"}}
            ]},
            "GROUP": ["rooms_type"],
            "APPLY": [{"maxSeats": {"MAX": "rooms_seats"}},{"numRooms":{"COUNT":"rooms_name"}}],
            "ORDER": {"dir": "UP", "keys": ["rooms_type", "maxSeats", "numRooms"]},
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

    it("Should be able to return all rooms not  starting with A*", function(){
        var that = this;
        var validQuery: QueryRequest =  {
            "GET": ["maxSeats", "rooms_type", "numRooms"],
            "WHERE": {
                "OR": [
                    {"NOT" : {"AND" : [
                        {"IS": {"rooms_number":"A*"}},
                        {"NOT": {"IS": {"rooms_number":"D*"}}},
                        {"NOT": {"IS": {"rooms_number":"B*"}}}]}}
                ]},
            "GROUP": ["rooms_type"],
            "APPLY": [{"maxSeats": {"MAX": "rooms_seats"}},{"numRooms":{"COUNT":"rooms_name"}}],
            "ORDER": {"dir": "UP", "keys": ["rooms_type", "maxSeats", "numRooms"]},
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

    // NOTE: there might be a bug here, A202 and A201 shouldnt be here
    it("Should be able to perform query group by room-furniture excluding room A2*", function(){
        var that = this;
        var validQuery: QueryRequest =  {
            "GET": ["maxSeats", "rooms_type", "numRooms"],
            "WHERE": {
                "OR": [
                    {"NOT" : {"GT": {"rooms_seats": 0}}},
                    {"AND" : [
                        {"IS": {"rooms_number":"A*"}},
                        {"NOT": {"IS" : {"rooms_furniture": "Classroom*"}}}
                    ]},
                    {"OR" : [
                        {"IS": {"rooms_number":"A101"}},
                        {"IS": {"rooms_number":"B*"}},
                        {"IS": {"rooms_number":"D*"}},
                        {"AND": [
                            {"NOT": {"IS": {"rooms_number":"A*"}}},
                            {"NOT": {"IS": {"rooms_number":"B*"}}},
                            {"NOT": {"IS": {"rooms_number":"D*"}}}
                        ]}
                    ]},
                    {"OR": [
                        {"NOT": {"GT": {"rooms_seats": 100}}}
                        ]},
                    {"AND": [
                        {"GT": {"rooms_seats": 60}},
                        {"IS": {"rooms_furniture":"*Fixed Tablets"}},
                        {"IS": {"rooms_type":"*Tiered*"}},
                        {"NOT": {"IS": {"rooms_type": "Open*"}}}
                        ]},
                    {"EQ": {"rooms_seats": 30}}
                    ]},
            "GROUP": ["rooms_type"],
            "APPLY": [{"maxSeats": {"MAX": "rooms_seats"}},{"numRooms":{"COUNT":"rooms_name"}}],
            "ORDER": {"dir": "UP", "keys": ["rooms_type", "maxSeats", "numRooms"]},
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
});