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

    // it("Should be able to receive a Dataset", function () {
    //     Log.test('Creating dataset');
    //     let content = {key: 'value'};
    //     let zip = new JSZip();
    //     zip.file('content.obj', JSON.stringify(content));
    //     const opts = {
    //         compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
    //     };
    //     return zip.generateAsync(opts).then(function (data) {
    //         Log.test('Dataset created');
    //         let controller = new DatasetController();
    //         return controller.process('setA', data);
    //     }).then(function (result) {
    //         Log.test('Dataset processed; result: ' + result);
    //         expect(result).to.equal(true);
    //     });
    // });

    //
    it("Should be able to save 310sampe.zip content into disk ", function () {
        Log.test("starting 310sampe.zip test")
        var data = fs.readFileSync("test\/310sampe.zip");
        let controller = new DatasetController();
        // return controller.process('courses', data).then(function(result){
        //     Log.test("310 sample json created!! It's " +  result);
        // })
        let datasets = controller.getDataset('');
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

    // it("Should be able to retrieve everything in /data file using getDatasets())", function(){
    //     Log.test("Create new Datacontroller");
    //     let controller = new DatasetController();
    //     let alldatasets = controller.getDatasets();
    //     // if (alldatasets != null)
    //     return alldatasets;
    // });



});
