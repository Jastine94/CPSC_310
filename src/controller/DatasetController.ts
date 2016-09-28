/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');

//
import fs = require('fs');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

export default class DatasetController {

    private datasets: Datasets = {};

    constructor() {
        Log.trace('DatasetController::init()');
    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): any {
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.

        // if (this.datasets[id] != null){ // might want to check if its undefined as well???
        //     return this.datasets[id];
        // }
        // else {
        //     return null;
        try
        {
            var fs = require(id);
            // TODO: change to ./data folder
            if (!fs.existsSync('./dataMock' + id))
            {
              // TODO: load dataset from disk and then load
            }

            return this.datasets[id];
            // do stuff
        }
        catch (err)
        {
          Log.error('DatasetController::getDataset() - ERROR: ' + err);
          return null;
        }
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk
        if (this.datasets == null){
            // for each loop ???
            require("fs").fs.readFile();
            /*need a for loop to iterate all the files inside the data directory and put it into the dataset
            * should not need  the require("fs").fs.readFile for the fs to work -- should be already imported*/
        }
        else {
            return this.datasets;
        }
    }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');
                    let processedDataset = new Array();

                    let async_data: any;
                    /** async_data is the promise that retrieves all the info from the zip file and stores it in
                    processedDataset **/
                    zip.folder(id).forEach(function (relativePath, file){
                        // Log.trace('Iteration num: ' + file.name);
                        async_data = file.async("string").then(function (data) {
                            // let file_name: string = file.name.replace('courses/', "");
                            let courseinfo: any;
                            // courseinfo = '{"fileName": ' + '"' + file_name + '"';
                            // courseinfo = courseinfo + ',' + data.substring(1,data.length-1)+ '}';
                            // courseinfo = JSON.parse(courseinfo);
                            courseinfo = JSON.parse(data);
                            processedDataset.push(courseinfo);
                            });
                    });

                    Promise.all([async_data]).then(value => {
                        that.save(id, processedDataset);
                        fulfill(true);
                    }, reason => {
                        console.log('Failed to process all dataset files: ' + reason);
                    });

                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you sho uld still be tolerant to errors.

                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // add it to the memory model
        this.datasets[id] = processedDataset;

        var data_location: string = __dirname+"\\..\\..\\data\\";
        var data = JSON.stringify(processedDataset);
        fs.access(data_location, fs.F_OK, function(err) {
            if (!err) {
                fs.writeFileSync(data_location+id+".json", data);
            } else {
                fs.mkdirSync(data_location);
                fs.writeFileSync(data_location+id+".json", data);
            }
        });

        // TODO: actually write to disk in the ./data directory
    }
}
