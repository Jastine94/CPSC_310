/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';
import parse5 = require('parse5');
import http = require('http');

//
import fs = require('fs');
import {ASTNode} from "parse5";
import {ASTAttribute} from "parse5";

describe("DatasetController", function () {

    before(function() {
        try {
            fs.unlinkSync('..\/data\/');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('DatasetController::before() - data folder not removed (probably not present)');
        }
    });

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to save 310sampe.zip content into disk ", function () {
        Log.test("starting 310sampe.zip test")
        let controller = new DatasetController();
        let datasets = controller.getDataset('courses');
        // Log.test('Info inside the dataset is: ' + datasets);
    });

    it("Should be able create and delete a dataset", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        var file = fs.readFileSync("test\/second_data.zip");
        let controller = new DatasetController();
        return controller.process('courses',file).then(function (result){
            let should_exist:boolean = fs.existsSync(__dirname+"\/..\/data\/courses.json");
            if (should_exist) {
                controller.deleteDataset('courses');
            }
            expect(fs.existsSync(__dirname+"\/..\/data\/courses.json")).to.be.false;
        });
    });

    it("Should be able to save second_data.zip onto disk and retrieve it with getDataset()", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        var file = fs.readFileSync("test\/second_data.zip");
        let controller = new DatasetController();
        return controller.process('courses',file).then(function (result){
            let retrieved_datasets = controller.getDataset('courses');
            expect(retrieved_datasets).not.to.be.empty;
        });
    });

    it("Should be able to retrieve a dataset that was previously saved onto disk", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        let controller = new DatasetController();
        let result = controller.getDataset('courses');
        expect(result).not.to.be.empty;
    });

    it("Should not be able to retrieve a dataset that is not on disk", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        let controller = new DatasetController();
        let result = controller.getDataset('bells');
        expect(result).to.be.null;
    });

    it("Should be able to retrieve everything in /data file using getDatasets())", function(){
        Log.test("Create new Datacontroller");
        let controller = new DatasetController();
        let alldatasets = controller.getDatasets();
        expect(alldatasets).not.to.be.empty;
        return alldatasets;
    });


    it("Should be able to save 310rooms.1.1.zip onto disk", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        var file = fs.readFileSync("test\/310rooms.1.1.zip");
        let controller = new DatasetController();
        return controller.process('rooms',file).then(function (result){
            let retrieved_datasets = controller.getDataset('courses');
            expect(retrieved_datasets).not.to.be.empty;
        });
    });


    it("Should be able to import a rooms.zip file and add it to the dataset", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        var roomsfile = fs.readFileSync("test\/310rooms.1.1.zip");
        // var file = fs.readFileSync("test\/index.htm");
        // var dmp = fs.readFileSync("test\/DMP");
        // var acu = fs.readFileSync("test\/ACU");
        // var anso = fs.readFileSync("test\/ANSO");
        // let roomInfo = parse5.parseFragment(file.toString());
        // let dmpInfo = parse5.parseFragment(dmp.toString())
        // let acuInfo = parse5.parseFragment(acu.toString())
        // let ansoInfo = parse5.parseFragment(anso.toString())
        let controller = new DatasetController();

        return controller.process('rooms',roomsfile).then(function (result){
            expect(result).to.be.true
        });

        // controller.findTable(roomInfo)
        // controller.addBuilding(controller.table)
        // controller.findTable(dmpInfo);
        // controller.addRoom(controller.table, "DMP")
        // Log.trace(JSON.stringify(controller.buildings))
        // controller.findTable(ansoInfo);
        // controller.addRoom(controller.table, "ANSO")
        // // controller.findTable(acuInfo);
        // // controller.addRoom(controller.table, "ACU")
        // let boo = controller.findTable(acuInfo);

    });


});
