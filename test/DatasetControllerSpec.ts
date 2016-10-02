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
    // it("Should be able to save 310sampe.zip content into disk ", function () {
    //     Log.test("starting 310sampe.zip test")
    //     var data = fs.readFileSync("test\/310courses.1.0.zip");
    //     let controller = new DatasetController();
    //     // return controller.process('courses', data).then(function(result){
    //     //     Log.test("310 sample json created!! It's " +  result);
    //     // })
    //     let datasets = controller.getDataset('');
    //     Log.test('Info inside the dataset is: ' + datasets);
    // });

    it("Should be able to save second_data.zip onto disk and retrieve it with getDatasets()", function(){
        Log.test("Start to unzip second_data.zip and load onto disk");
        // var file = fs.readFileSync("test\/310courses.1.0.zip");
        var file = fs.readFileSync("test\/second_data.zip");
            // if (err){throw err;}
            let controller = new DatasetController();
            return controller.process('courses',file).then(function (result){
                Log.test('SECOND DATA RESULTS: ' + result);
                // let retrieved_datasets = controller.getDatasets();
                // should contain four objects and inside those objects should be four different jsons
            });
    });

    // it("Should be able to retrieve all data from disk", function(){
    //     // TODO: FIX THIS NOT ASYNC CALL, currently does not work
    //     Log.test("Data Controller with no data created");
    //     let controller = new DatasetController();
    //     let retrieved_datasets = controller.getDatasets();
    //     Log.test('The data sets should be from the previous file: ' + retrieved_datasets);
    // });

    // it('testing file with deletion', function (){
    //      // Todo: remove later
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

    // it('own testing purposes', function(){
    //     let dataList:any =[{"result":[{"tier_eighty_five":0,"tier_ninety":0,"Title":"mod chinese auth","Section":"001","Detail":"","tier_seventy_two":13,"Other":0,"Low":63,"tier_sixty_four":4,"id":44096,"tier_sixty_eight":11,"tier_zero":0,"tier_seventy_six":10,"tier_thirty":0,"tier_fifty":0,"Professor":"rea, christopher","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2013","tier_twenty":0,"Stddev":4.24,"Enrolled":41,"tier_fifty_five":0,"tier_eighty":1,"tier_sixty":1,"tier_ten":0,"High":80,"Course":"451","Session":"w","Pass":40,"Fail":0,"Avg":72.35,"Campus":"ubc","Subject":"asia"},{"tier_eighty_five":0,"tier_ninety":0,"Title":"mod chinese auth","Section":"overall","Detail":"","tier_seventy_two":13,"Other":0,"Low":63,"tier_sixty_four":4,"id":44097,"tier_sixty_eight":11,"tier_zero":0,"tier_seventy_six":10,"tier_thirty":0,"tier_fifty":0,"Professor":"","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2013","tier_twenty":0,"Stddev":4.24,"Enrolled":41,"tier_fifty_five":0,"tier_eighty":1,"tier_sixty":1,"tier_ten":0,"High":80,"Course":"451","Session":"w","Pass":40,"Fail":0,"Avg":72.35,"Campus":"ubc","Subject":"asia"}],"rank":1209}];
    //     var items = JSON.parse(JSON.stringify(dataList));
    //
    //     // var firstitem = dataList[0];
    //     // Log.test(firstitem.result[0]);
    //     // Log.test(firstitem.result[0]["Title"]);
    //
    //     for (var keys in dataList){
    //         Log.test(items);
    //         if (keys == "result") {
    //             var valuesList = items["result"];
    //             Log.test('the key value is: ' + valuesList);
    //         }
    //
    //         }
    // })


});
