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

        // if (this.datasets[id] !=== null){
            // if the dataset[id] specified is not null and can return something, return that dataset,
            // if not, then search through the json files within the data folder to see if it contains it
            // and if the case where it does not contain that dataset inside the data folder, then return null
        // }

        try{
            var fs = require(id);
            // TODO: change to ./data folder
            if (!fs.existsSync('./dataMock' + id)){
              // TODO: load dataset from disk and then load
            }
            return this.datasets[id];
            // do stuff
        }
        catch (err){
          Log.error('DatasetController::getDataset() - ERROR: ' + err);
          return null;
        }
    } //getDataset

    /**
     * Returns all dataset files inside the ./data folder from disk if this.datasets is empty
     */
    // TODO: if datasets is empty, load all dataset files in ./data from disk
    public getDatasets(): Datasets {
        Log.trace('DatasetController :: getDatasets is being called');

        if (Object.keys(this.datasets).length === 0 && this.datasets.constructor === Object){
            var data_dir: string = __dirname+"\/..\/..\/data\/";
            fs.readdir( data_dir, function( err, files ) {
                if( err ) {
                    Log.trace( "Directory could not be loaded: " + err );
                    process.exit( 1 );
                }
                Log.trace('time to read files');
                files.forEach( function( file, index ) {
                    // fs.readFile(data_dir+file, (err: any, data: any) => {
                    //     Log.trace("Data is: " + data);
                    //         if (err){
                    //         throw err;
                    //     }
                    //     this.datasets = data;
                    // });
                    this.datasets = fs.readFileSync(data_dir+file);
                    // first one is async and second one is sync
                });
            });
            return this.datasets;
        }
        else return this.datasets;
    } //getDatasets

    /**
     * Returns true if the dataset is deleted from the Datasets
     */
    public deleteDataset(dataset: Datasets, id:string): boolean {
        Log.trace("DatasetController::deleteDataset() started");
        var data_json: string = __dirname+"\/..\/..\/data\/"+id+'.json';
        Log.trace('Json file to be deleted from the data folder id: ' + data_json);
        if (this.datasets === dataset){
            this.datasets = {};
            Log.trace("deleted datasets have the following length: " + Object.keys(this.datasets).length);
            // should validate that it is empty
            fs.unlinkSync(data_json);
            return true;
        }
        else return false;
    } //deleteDataset



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
    } //process

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        // TODO: actually write to disk in the ./data directory
        // add it to the memory model
        this.datasets[id] = processedDataset;

        var data_location: string = __dirname+"\/..\/..\/data\/";
        var data = JSON.stringify(processedDataset);
        fs.access(data_location, fs.F_OK, function(err) {
            if (!err) {
                fs.writeFileSync(data_location+id+".json", data);
            } else {
                fs.mkdirSync(data_location);
                fs.writeFileSync(data_location+id+".json", data);
            }
        });
    } //save

}
