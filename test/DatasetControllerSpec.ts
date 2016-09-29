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

    it("Should be able to save 310sampe.zip content into disk ", function () {
        Log.test("starting 310sampe.zip test")
        fs.readFile("test\/310sampe.zip", function(err, data) {
            if (err) throw err;
            Log.trace('sample data is: '+data);
            let controller = new DatasetController();
            return controller.process('courses', data);
        });
    });

    it("Should be able to save second_data.zip onto disk and retrieve it with getDatasets()", function(){
       Log.test("Start to unzip second_data.zip and load onto disk");
        fs.readFile("test\/second_data.zip", function(err,data){
            if (err){throw err;}
            let controller = new DatasetController();
            return controller.process('courses',data).then(function (result){
                let retrieved_datasets = controller.getDatasets();
                Log.test("The retrieved datasets are: " + retrieved_datasets["courses"]);
                // should contain four objects and inside those objects should be four different jsons
            });
        });
    });

    it("Should be able to retrieve all data from disk", function(){
        Log.test("Data Controller with no data created");
        let controller = new DatasetController();
        let retrieved_datasets = controller.getDatasets();
        Log.test('The data sets should be from the previous file: ' + retrieved_datasets);
    });

    // it('testing file with deletion', function (){
    //      Todo: remove later
    //     let data = fs.readFileSync("test\/second_data.zip");
    //     let controller = new DatasetController();
    //     return controller.process('courses',data);
    //
    //     // Promise.all([processing]).then(value => {
    //     //     let retrieved_datasets = controller.getDatasets();
    //     //     Log.test("The retrieved datasets are: " + retrieved_datasets["courses"]);
    //     //     controller.deleteDataset(retrieved_datasets, 'courses');
    //     // }, reason =>{
    //     //     console.log("Failed to work: " + reason);
    //     // });
    //     // let retrieved_datasets = controller.getDatasets();
    //     //     Log.test("The retrieved datasets are: " + retrieved_datasets["courses"]);
    //     //     controller.deleteDataset(retrieved_datasets, 'courses');
    //     // });
    // });


});
