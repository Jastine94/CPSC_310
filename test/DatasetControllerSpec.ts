/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';

//
import fs = require('fs');

describe("DatasetController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to save 310sampe.zip content into disk ", function () {
        Log.test("starting 310sampe.zip test")
        let controller = new DatasetController();
        let datasets = controller.getDataset('courses');
        Log.test('Info inside the dataset is: ' + datasets);
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
            Log.test('SECOND DATA RESULTS: ' + result);
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
        // if (alldatasets != null)
        expect(alldatasets).not.to.be.empty;
        return alldatasets;
    });



});
