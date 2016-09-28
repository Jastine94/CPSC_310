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

    it("Should be able to receive a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process('setA', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(true);
        });
    });

    it("Should be able to save 310sampe.zip content into disk ", function () {
        Log.test("starting 310sampe.zip test")
        fs.readFile("test\\310sampe.zip", function(err, data) {
            if (err) throw err;
            let controller = new DatasetController();
            return controller.process('courses', data);
        });
    });

    it("Should be able to save second_data.zip content into disk and replace the current information ", function () {
        Log.test("starting second_data.zip test")
        fs.readFile("test\\second_data.zip", function(err, data) {
            if (err) throw err;
            let controller = new DatasetController();
            return controller.process('courses', data);
        });
    });

});
