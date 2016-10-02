/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');

//
import fs = require('fs');
import {error} from "util";

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

        Log.trace('DatasetController::getDataset() - start ');
        let data_dir: string = __dirname+"\/..\/..\/data\/";

        if(this.datasets.hasOwnProperty(id)){
            return this.datasets[id];
        }
        if(fs.existsSync(data_dir+id+'.json')) {
            this.datasets[id] = fs.readFileSync(data_dir + id + '.json');
            return this.datasets[id];
        }

        return null;
        // try{
        //     let fs = require(id);
        //     // TODO: change to ./data folder
        //     if (!fs.existsSync('./dataMock' + id)){
        //         // TODO: load dataset from disk and then load
        //     }
        //     return this.datasets[id];
        //     // do stuff
        // }
        // catch (err){
        //     Log.error('DatasetController::getDataset() - ERROR: ' + err);
        //     return null;
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
                    let id = file.replace('.json','');
                    Log.trace("Dataset with id: " + id + " - will be added to the dataset")
                    this.datasets[id] = fs.readFileSync(data_dir+file);
                    // first one is async and second one is sync
                });
            });
            return this.datasets;
        }
        else return this.datasets;
    } //getDatasets

    /**
     * Deletes the dataset only if it exists, if it doesn't it throws an error
     *
     * @param id - the id of the dataset to be deleted
     * TODO: Might want to change the return type
     */
    public deleteDataset(id:string): Promise<boolean> {
        Log.trace("DatasetController::deleteDataset() started");

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let data_json: string = __dirname + "\/..\/..\/data\/" + id + '.json';
                Log.trace('Json file to be deleted from the data folder id: ' + data_json);
                if (fs.existsSync(data_json)) {
                    if (that.datasets.hasOwnProperty(id) !== null) {
                        that.datasets[id] = null;
                        Log.trace("deleted datasets have the following length: " + Object.keys(that.datasets).length);
                        fs.unlinkSync(data_json);
                        fulfill(true);
                    }
                }
                else reject("File does not exist on disk");
            }catch (err) {
                Log.trace('DatasetController::deleteDataset(..) - ERROR: ' + err.message);
                reject(err);
            }
        });
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
                    /** promises is the promise that retrieves all the info from the zip file and stores it in
                     processedDataset **/
                    let err_data: boolean = false;

                    zip.folder(id).forEach(function (relativePath, file){
                        promises.push(file.async("string").then(function (data) {
                            let courseinfo: any;
                            courseinfo = JSON.parse(data);
                            let emptydata ='{"result":[],"rank":0}';
                            if (data !== emptydata){
                                processedDataset.push(courseinfo);
                            }
                        }).catch(function(err){
                            err_data = true;
                            Log.trace('Fail to get the file from the zip file: ' + err);
                            reject(err);
                        }))
                    });
                    Promise.all(promises).then(function (results) {
                        if (err_data){
                            Log.trace("The data in the zip file does not have the correct format")
                            reject(true);
                        }
                        else {
                            Log.trace("Now will be going to save zip file into disk and memory");
                            that.save(id, processedDataset);
                            fulfill(true);
                        }
                    }).catch(function (err) {
                        Log.trace("Failed to iterate through all files: " + err.message);
                        reject(err);
                    });

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
        let datastructure: any = this.parseDataset(processedDataset);
        let newobj: any = {};
        newobj[id] = datastructure;
        this.datasets[id] = datastructure;

        Log.trace('DatasetController::save( ' + id + '... )');
        let  data_location: string = __dirname+"\/..\/..\/data\/";
        let data = JSON.stringify(newobj);
        // let data = JSON.stringify(datastructure);
        Log.trace("Parsing the dataset into a json");
        let exist_datafolder: boolean = fs.existsSync(data_location);

        if (exist_datafolder){
            fs.writeFileSync(data_location+id+".json", data);
        }
        else {
            fs.mkdirSync(data_location);
            fs.writeFileSync(data_location+id+".json", data);
        }
        Log.trace('DatasetController::save completed');
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

    /**
     * Return the dataset that only contain key value pairs of -- Subject, id, Avg, Professor, Title, Passs,
     * Fail and Audit
     *
     * @param processedDataset - dataset that needs to be parsed
     */
    private parseDataset(processedDataset:any):any{
        Log.trace('DatasetController::parseDataset');

        let finalDataset = new Array();
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
    } //parseDataset
}
