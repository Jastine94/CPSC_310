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
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('.\/test\/wood.zip')).toString('base64');
        try {
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

    it("Should be able to return all rooms that do no start with 2* in woodward", function(){
        var that = this;
        var validQuery: QueryRequest =
        {
            "GET": ["maxSeats", "rooms_type", "numRooms"],
            "WHERE": {"NOT": {"AND": [{"NOT":{"IS" : {"rooms_number": "1*"}}},{"IS" : {"rooms_number": "2*"}}]}},
            "GROUP": ["rooms_type"],
            "APPLY": [{"maxSeats": {"MAX": "rooms_seats"}},{"numRooms":{"COUNT":"rooms_name"}}],
            "ORDER": {"dir": "UP", "keys": ["rooms_type", "maxSeats", "numRooms"]},
            "AS": "TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            // expect(response.body).to.deep.equal({"render":"TABLE",
            //     "result":[
            //         {"maxSeats":30,"rooms_type":"Small Group","numRooms":10},
            //         {"maxSeats":181,"rooms_type":"Tiered Large Group","numRooms":5}]});
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query three nested deepness with AND AND AND", function(){
        /* should return WOOD_3 with 88 seats */
        var that = this;
        var validQuery: QueryRequest =
        {
            "GET": ["rooms_fullname", "rooms_name",  "maxSeats", "rooms_furniture"],
            "WHERE": {"AND" :
                [
                    {"NOT" : {"IS": {"rooms_type": "Small Group"}}},
                    {"AND": [
                        {"NOT": {"IS": {"rooms_number": "1*"}}},
                        {"IS": {"rooms_fullname": "*oo*"}},
                        {"NOT": {"AND": [
                            {"GT": {"rooms_seats": 98}},
                            {"NOT": {"IS": {"rooms_furniture": "Classroom-Movable Tables & Chairs"}}}
                        ]}}
                    ]}
                ]},
            "GROUP": [ "rooms_fullname", "rooms_name", "rooms_furniture"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_fullname"]},
            "AS":"TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"render":"TABLE",
                "result":[
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_3",
                        "maxSeats":88,
                        "rooms_furniture":"Classroom-Fixed Tables/Movable Chairs"}]
            });
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query four nested deepness with AND AND AND AND", function(){
        var that = this;
        var validQuery: QueryRequest =
        {
            "GET": ["rooms_fullname", "rooms_name",  "maxSeats", "rooms_furniture"],
            "WHERE": {"AND" :
                [
                    {"NOT" : {"IS": {"rooms_type": "Tiered Large Group"}}},
                    {"AND": [
                        {"NOT": {"IS": {"rooms_number": "1*"}}},
                        {"IS": {"rooms_fullname": "*oo*"}},
                        {"AND": [
                            {"LT": {"rooms_seats": 98}},
                            {"IS": {"rooms_furniture": "Classroom-Movable Tables & Chairs"}},
                            {"AND": [{"IS": {"rooms_number": "G5*"}}]}
                        ]}
                    ]}
                ]},
            "GROUP": [ "rooms_fullname", "rooms_name", "rooms_furniture"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_fullname"]},
            "AS":"TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"render":"TABLE",
                "result":[{
                    "rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                    "rooms_name":"WOOD_G57",
                    "maxSeats":12,
                    "rooms_furniture":"Classroom-Movable Tables & Chairs"},
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_G59",
                        "maxSeats":10,
                        "rooms_furniture":"Classroom-Movable Tables & Chairs"},
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_G55",
                        "maxSeats":10,
                        "rooms_furniture":"Classroom-Movable Tables & Chairs"},
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_G53",
                        "maxSeats":10,
                        "rooms_furniture":"Classroom-Movable Tables & Chairs"}]});
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to query four nested deepness with AND AND AND (NOT)OR", function(){
        var that = this;
        var validQuery: QueryRequest =
        {
            "GET": ["rooms_fullname", "rooms_name",  "maxSeats", "rooms_furniture"],
            "WHERE": {"AND" :
                [
                    {"NOT" : {"IS": {"rooms_type": "Tiered Large Group"}}},
                    {"AND": [
                        {"NOT": {"IS": {"rooms_number": "1*"}}},
                        {"IS": {"rooms_fullname": "*oo*"}},
                        {"AND": [
                            {"LT": {"rooms_seats": 98}},
                            {"IS": {"rooms_furniture": "Classroom-Movable Tables & Chairs"}},
                            {"NOT": {"OR": [{"IS": {"rooms_number": "G5*"}},
                                {"GT":{"rooms_seats": 16}}]}}
                        ]}
                    ]}
                ]},
            "GROUP": [ "rooms_fullname", "rooms_name", "rooms_furniture"],
            "APPLY": [  {"maxSeats": {"MAX": "rooms_seats"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxSeats", "rooms_name", "rooms_fullname"]},
            "AS":"TABLE"
        };
        Log.trace("Starting test: " + that.test.title);
        return facade.performQuery(validQuery).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"render":"TABLE",
                "result":[
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_G66","maxSeats":16,
                        "rooms_furniture":"Classroom-Movable Tables & Chairs"},
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_G44","maxSeats":14,
                        "rooms_furniture":"Classroom-Movable Tables & Chairs"},
                    {"rooms_fullname":"Woodward (Instructional Resources Centre-IRC)",
                        "rooms_name":"WOOD_G65",
                        "maxSeats":12,
                        "rooms_furniture":"Classroom-Movable Tables & Chairs"}]});
            Log.trace("response " + JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

});