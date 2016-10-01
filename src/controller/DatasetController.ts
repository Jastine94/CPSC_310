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
            let fs = require(id);
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
            let data_dir: string = __dirname+"\/..\/..\/data\/";
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
        let data_json: string = __dirname+"\/..\/..\/data\/"+id+'.json';
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
    // TODO: iterate through files in zip (zip.files)
    // The contents of the file will depend on the id provided. e.g.,
    // some zips will contain .html files, some will contain .json files.
    // You can depend on 'id' to differentiate how the zip should be handled,
    // although you sho uld still be tolerant to errors.
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    let processedDataset = new Array();
                    let promises:any[] = [];
                    // let async_data: any;
                    /** async_data is the promise that retrieves all the info from the zip file and stores it in
                     processedDataset **/


                    zip.folder(id).forEach(function (relativePath, file){
                        promises.push(file.async("string").then(function (data) {
                            let courseinfo: any;
                            courseinfo = JSON.parse(data);
                            let emptydata ='{"result":[],"rank":0}';
                            if (data !== emptydata){
                                processedDataset.push(courseinfo);
                            }
                            fulfill(true);
                        }).catch(function(reason){
                            Log.trace('Fail to get the file from the zip file: ' + reason);
                        }))
                    });
                    Promise.all(promises).then(function(results){
                        Log.trace("Now will be going to save zip file into disk and memory");
                        that.save(id, processedDataset);
                        fulfill(true);
                    }).catch(function(reason){
                        Log.trace("Failed to iterate through all files: " + reason);
                    });

                    // var p = new Promise(function(resolve, reject) {
                    //     zip.folder(id).forEach(function (relativePath, file){
                    //         file.async("string").then(function (data) {
                    //             let courseinfo: any;
                    //             courseinfo = JSON.parse(data);
                    //             let emptydata ='{"result":[],"rank":0}';
                    //             if (data !== emptydata){
                    //                 processedDataset.push(courseinfo);
                    //             }
                    //         }).catch(function(reason){
                    //             Log.trace('Fail to get the file from the zip file: ' + reason);
                    //         })})
                    //     });
                    // p.then(function() {
                    //     Log.trace("Now will be going to save zip file into disk and memory");
                    //     that.save(id, processedDataset);
                    //     fulfill(true);
                    // }).catch(function(reason) {
                    //     Log.trace("Failed to iterate through all files: " + reason);
                    // });
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
        let datastructure: any = this.saveDataset(processedDataset);
        this.datasets = datastructure;

        Log.trace('Saving onto disk');
        let  data_location: string = __dirname+"\/..\/..\/data\/";
        let data = JSON.stringify(datastructure);
        // let data = JSON.stringify(processedDataset);
        Log.trace("Parsing the dataset into a json");
        let exist_datafolder: boolean = fs.existsSync(data_location);

        if (exist_datafolder){
            fs.writeFileSync(data_location+id+".json", data);
        }
        else {
            fs.mkdirSync(data_location);
            fs.writeFileSync(data_location+id+".json", data);
        }
        Log.trace("saved onto disk");
        // fs.access(data_location, fs.F_OK, function(err) {
        //     if (!err) {
        //         fs.writeFileSync(data_location+id+".json", data);
        //     } else {
        //         fs.mkdirSync(data_location);
        //         fs.writeFileSync(data_location+id+".json", data);
        //     }
        //     Log.trace("saved onto disk");
        // });
    } //save

    private saveDataset(processedDataset:any){
        Log.trace("Starting to save the dataset into data structure");

        let finalDataset = new Array();
        // let tempresobj: any = {};
        for (let i = 0; i < processedDataset.length; i++) {

            let tempresobj: any = {};
            // Log.trace('Starting the first for loop with i value of: ' + i);
            let temparr = processedDataset[i];
            let resarr = temparr.result;

            let tempresarr = new Array();
            for (let j = 0; j < resarr.length; j++) {

                let resdata = resarr[j];
                let tempobj: any = {};
                for (let key in resdata) {
                    // Log.trace("object value is: " + key + ':' + resdata[key]);
                    if (key === 'Subject' || key === 'id' || key === 'Avg' || key === 'Professor' ||
                        key === 'Title' || key === 'Pass' || key === 'Fail' || key === 'Audit') {
                        tempobj[key] = resdata[key];
                        // Log.trace("temporary inner object has the value:" + key + ":" + tempobj[key]);
                    }
                }
                tempresarr.push(tempobj);
            }
            tempresobj["result"] = tempresarr;
            finalDataset.push(tempresobj);
        }
        return finalDataset;
    }
}
