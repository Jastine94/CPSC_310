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
        Log.trace('DatasetController::getDataset() - processing');
        let that = this;
        let data_dir: string = __dirname+"\/..\/..\/data\/";
        if(typeof (that.datasets[id]) !== 'undefined')
        {
            return that.datasets[id];
        }
        else if(fs.existsSync(data_dir+id+'.json'))
        {
            that.datasets[id] = fs.readFileSync(data_dir + id + '.json');
            //Log.trace('DatasetController::getDataset() - processed');
            return that.datasets[id];
        }
        //Log.trace('DatasetController::getDataset() - processed');
        else
        {
            return null;
        }
    } //getDataset

    /**
     * Returns all dataset files inside the ./data folder from disk if this.datasets is empty
     */
    // TODO: if datasets is empty, load all dataset files in ./data from disk
    public getDatasets(): Datasets {
        //Log.trace('DatasetController :: getDatasets is being called');
        let that = this;
        if (Object.keys(that.datasets).length === 0)
        {
            let data_dir: string = __dirname+"\/..\/..\/data\/";
            let exist_datafolder: boolean = fs.existsSync(data_dir);
            if(exist_datafolder)
            {
                let files = fs.readdirSync(data_dir);
                files.forEach(function (file, index)
                {
                    let id = file.replace('.json', '');
                    //Log.trace("Dataset with id: " + id + " - will be added to the dataset");
                    that.datasets[id] = fs.readFileSync(data_dir + file);
                })
                //Log.trace("DatasetController :: getDatasets - completed");
                return that.datasets;
            }
        }
        return that.datasets;
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
        return new Promise(function (fulfill, reject)
        {
            try
            {
                let data_json: string = __dirname + "\/..\/..\/data\/" + id + '.json';
                //Log.trace('Json file to be deleted from the data folder id: ' + data_json);
                if (fs.existsSync(data_json))
                {
                    if (that.datasets[id] !== 'undefined')
                    {
                        that.datasets[id] = null;
                        fs.unlinkSync(data_json);
                        fulfill(true);
                    }
                }
                else
                {
                    reject("File does not exist on disk");
                }
            }catch (err) {
                //Log.trace('DatasetController::deleteDataset(..) - ERROR: ' + err.message);
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
        return new Promise(function (fulfill, reject)
        {
            try
            {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    //Log.trace('DatasetController::process(..) - unzipped');
                    let processedDataset = new Array();
                    let empty_folder: boolean = true;
                    let promises:any[] = [];
                    /** promises is the promise that retrieves all the info from the zip file and stores it in
                     processedDataset **/
                    zip.folder(id).forEach(function (relativePath, file)
                    {

                        empty_folder = false;
                        promises.push(file.async("string").then(function (data)
                        {
                            let courseinfo: any;
                            courseinfo = JSON.parse(data);
                            let emptydata = '{"result":[],"rank":0}';
                            if (data !== emptydata)
                            {
                               processedDataset.push(courseinfo);
                            }
                        })
                            .catch(function(err)
                            {
                            Log.trace('Fail to get the file from the zip file: ' + err);
                            // reject(err);
                            reject(true);
                            }))
                    });
                    Promise.all(promises).then(function (results)
                    {
                        if (empty_folder)
                        {
                            reject(true);
                        }
                        else
                        {
                            Log.trace("Now will be going to save zip file into disk and memory");
                            that.save(id, processedDataset);
                            fulfill(true);
                        }
                    }).catch(function (err)
                    {
                        //Log.trace("Failed to iterate through all files: " + err.message);
                        reject(err);
                        reject(true);
                    });
                }).catch(function (err) {
                    //Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                    reject(true);
                });
            } catch (err)
            {
                //Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
                reject(true);
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
        Log.trace('DatasetController::save -- processing');
        let datastructure: any = this.parseDataset(processedDataset);
        let newobj: any = {};
        newobj[id] = datastructure;
        this.datasets[id] = datastructure;
        let  data_location: string = __dirname+"\/..\/..\/data\/";
        let data = JSON.stringify(newobj);
        let exist_datafolder: boolean = fs.existsSync(data_location);
        if (exist_datafolder)
        {
            fs.writeFileSync(data_location+id+".json", data);
        }
        else
        {
            fs.mkdirSync(data_location);
            fs.writeFileSync(data_location+id+".json", data);
        }
        Log.trace('DatasetController::save completed');
    } //save

    /**
     * Return the dataset that only contain key value pairs of -- Subject, id, Avg, Professor, Title, Passs,
     * Fail and Audit
     *
     * @param processedDataset - dataset that needs to be parsed
     */
    private parseDataset(processedDataset:any):any{
        Log.trace('DatasetController::parseDataset -- processing');
        let finalDataset = new Array();
        for (let i = 0; i < processedDataset.length; i++)
        {
            let tempresobj: any = {};
            let temparr = processedDataset[i];
            let resarr = temparr.result;
            let tempresarr = new Array();
            for (let j = 0; j < resarr.length; j++)
            {
                let resdata = resarr[j];
                let tempobj: any = {};
                for (let key in resdata)
                {
                    // Log.trace("object value is: " + key + ':' + resdata[key]);
                    if (key === 'Subject' || key === 'Avg'  || key === 'Professor' ||
                        key === 'Title' || key === 'Pass'    || key === 'Fail' || key === 'Audit')
                    {
                        tempobj[key] = resdata[key];
                    }
                    else if (key === 'Course' || key === 'id')
                    {
                        tempobj[key] = resdata[key].toString();
                    }
                    else if (key === 'Year')
                    {
                        tempobj[key] = parseInt(resdata[key]);
                    }
                }
                tempresarr.push(tempobj);
            }
            tempresobj["result"] = tempresarr;
            finalDataset.push(tempresobj);
        }
        Log.trace('DatasetController::parseDataset -- processed');
        return finalDataset;
    } //parseDataset
}
