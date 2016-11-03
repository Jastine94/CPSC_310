/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
import parse5 = require('parse5');
import {ASTNode} from "parse5";
import {ASTAttribute} from "parse5";
import http = require('http');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

export default class DatasetController {

    private datasets: Datasets = {};
    public table: any = {};
    public buildings: any = {};
    private tempRoom: any = {};
    public buildingInfo: any = {};
    private hasTable: boolean = false;

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
                    // Log.trace(JSON.stringify(zip.files))
                    let temp = zip.file('index.htm');

                    if (temp !== null){
                        that.processRooms(zip, temp, id).then(function(result) {
                            Log.trace('Completed processing and adding rooms dataset: ' + result)
                            fulfill(true);
                        }).catch(function(error) {
                            Log.trace("Didn't complete adding rooms dataset due to: " + error);
                            reject(true);
                        })
                    }
                    else {
                        zip.folder(id).forEach(function (relativePath, file) {
                            empty_folder = false;
                            promises.push(file.async("string").then(function (data) {
                                let courseinfo: any;
                                courseinfo = JSON.parse(data);
                                let emptydata = '{"result":[],"rank":0}';
                                if (data !== emptydata) {
                                    processedDataset.push(courseinfo);
                                }
                            })
                                .catch(function (err) {
                                    Log.trace('Fail to get the file from the zip file: ' + err);
                                    // reject(err);
                                    reject(true);
                                }))
                        });
                        Promise.all(promises).then(function (results) {
                            if (empty_folder) {
                                reject(true);
                            }
                            else {
                                Log.trace("Now will be going to save zip file into disk and memory");
                                that.save(id, processedDataset);
                                fulfill(true);
                            }
                        }).catch(function (err) {
                            //Log.trace("Failed to iterate through all files: " + err.message);
                            reject(err);
                            reject(true);
                        });

                    }}).catch(function (err) {
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
     * Process the rooms dataset and will add the to the datastructure and disk
     *
     * @param zip - zip file containing all the information
     * @param index - index.htm that is parsed using parse5.parseFragment
     * @param id - id of the dataset
     *
     * @return Promise<boolean> returns true if it was successful, otherwise false
     */
    private processRooms(zip: JSZip, index: any, id:string): Promise<boolean> {
        let that: any = this;
        let promises_1: any = [];
        let buildingsArr: any[] = [];

        return new Promise(function (fulfill, reject) {
            try {
                index.async("string").then(function (tempdata: any) {
                    let roomInfo = parse5.parseFragment(tempdata.toString());
                    that.findTable(roomInfo);
                    that.addBuilding(that.table);
                    that.addLatLon(that.buildingInfo).then(function (res:any) {
                    zip.folder('campus\/discover\/buildings-and-classrooms').forEach(function (relativePath, file) {
                        promises_1.push(file.async("string").then(function (data) {
                            if (typeof(that.buildings[relativePath.toString()]) !== 'undefined') {
                                let tabledata = parse5.parseFragment(data.toString())
                                that.hasTable = false;
                                let tableExists = that.findTable(tabledata);
                                if (tableExists === false) {
                                    that.table = {};
                                }
                                that.addRoom(that.table, relativePath.toString());
                            }
                        }).catch(function (err) {
                            Log.trace('Fail to get the file from the zip file: ' + relativePath + " : " + err);
                            reject(true);
                        }))
                    });
                        Promise.all(promises_1).then(function (result) {
                            for (let building in that.buildings) {
                                let buildingInfo = that.buildings[building]
                                let tempBuilding = {};
                                if (buildingInfo.length !== 0) {
                                    tempBuilding = {'result': buildingInfo};
                                    buildingsArr.push(tempBuilding)
                                }
                            }
                            // that.save(id, that.buildings)
                            that.save(id, buildingsArr)
                            fulfill(true);
                        })
                    })
                    // Promise.all(promises_1).then(function (result) {
                    //     Log.trace(":LL PMROJE NONNONONONONO" )
                    //     Log.trace(JSON.stringify(that.buildings))
                    //     for (let building in that.buildings) {
                    //         let buildingInfo = that.buildings[building]
                    //         let tempBuilding = {};
                    //         if (buildingInfo.length !== 0) {
                    //             tempBuilding = {'result': buildingInfo};
                    //             buildingsArr.push(tempBuilding)
                    //         }
                    //     }
                    //     // that.save(id, that.buildings)
                    //     that.save(id, buildingsArr)
                    //     fulfill(true);
                    // })
                })
            }
            catch (error)
            {
                Log.trace("Error in rooms ZIP: " + error);
                reject(true);
            }
        })
    } //processRooms

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any) {
        Log.trace('DatasetController::save -- processing');
        let datastructure: any;
        if (id === 'courses')
        {
            datastructure = this.parseDataset(processedDataset);
        }
        else
        {
            datastructure = processedDataset;
        }
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
                        key === 'Title' || key === 'Pass'    || key === 'Fail' || key === 'Audit' || key === 'Year')
                    {
                        tempobj[key] = resdata[key];
                    }
                    else if (key === 'Course' || key === 'id')
                    {
                        tempobj[key] = resdata[key].toString();
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


    /**
     * Finds the table in the ASTNODE (html file that is parsed)
     *
     * @param node - html that is parsed that may contain a table
     *
     * @return boolean, true if there is a table, otherwise false
     */
    public findTable(node: ASTNode):boolean {
        for (let cIndex in node.childNodes)
        {
            if (node.childNodes[cIndex].nodeName === 'tbody')
            {
                this.table = node.childNodes[cIndex];
                this.hasTable = true;
                break;
            }
            else
            {
                this.findTable(node.childNodes[cIndex])
            }
        }
        return this.hasTable;
    } //findTable

    /**
     * Adds the building into a temporary datastructure to see what's contained in the index.htm file
     *
     * @param node - table containing all the buildings information, uss findTable on index.htm file first
     */
    public addBuilding(node:ASTNode): any{
        let code: string;
        for (let cIndex in node.childNodes)
        {
            if (node.childNodes[cIndex].attrs && node.childNodes[cIndex].attrs.length === 1 &&
                node.childNodes[cIndex].attrs[0].name === 'class')
                {
                    if (node.childNodes[cIndex].attrs[0].value === 'views-field views-field-field-building-code')
                    {
                        let buildAb: any = node.childNodes[cIndex].childNodes[0].value;
                        buildAb = buildAb.trim();
                        code = buildAb;
                        this.buildings[buildAb] = [];
                    }
                    this.setBuildingInfo(node.childNodes[cIndex], code);
                }
            this.addBuilding(node.childNodes[cIndex])
        }
    } //addBuilding

    /**
     * Inputs all the information found in the index.htm file for the building into a temp datastructure
     *
     * @param node - table containing all the buildings, use findTable on the index.htm first
     * @param building - the abbreviation of the building, ie (DMP)
     */
    // TODO: get latlon to work
    public setBuildingInfo(node: ASTNode, building: string): void {
        // Log.trace('setBuildingInfo START')
        if (node.attrs[0].value === 'views-field views-field-title')
        {
            if (node.childNodes)
            {
                this.buildingInfo[building] = {'rooms_fullname': node.childNodes[1].childNodes[0].value};
            }
        }
        else if (node.attrs[0].value === 'views-field views-field-field-building-address') {
            this.buildingInfo[building]['rooms_address'] = node.childNodes[0].value.trim();
            // also add the lat long address here
            // this.setLatLon(this.buildingInfo[building]['rooms_address'], building);
        }
        // Log.trace('setBuildingInfo END')
    } //setBuildingInfo

    public addLatLon(buildings: any): Promise<boolean>{
        let promises: any[] = [];
        let that = this;
        return new Promise(function (fulfill, reject)
        {
            try {
                for (let bI in buildings) {
                    let address = buildings[bI]['rooms_address'];
                    promises.push(that.setLatLon(address, bI));
                }
                Promise.all(promises).then(function (res) {
                    fulfill(true);
                }).catch(function (err) {
                    Log.trace('Failed to add lat lons to all buildings: ' + err)
                    reject(true);
                })
            }
            catch (error) {
                Log.trace("addLatLon error was: " + error);
                reject(true);
                reject(error);
            }
        })
    }

    /**
     * Adds the rooms in the building to the temporary data structure
     *
     * @param node - table containing all the rooms, use findTable on the file first
     * @param building - the abbreviation of the building, ie (DMP)
     */
    public addRoom(node: ASTNode, building: string): void {
        let tempVal: any;
        if (Object.keys(node).length === 0)
        {
            return;
        }
        for (let cIndex in node.childNodes)
        {
            if (node.childNodes[cIndex].attrs && node.childNodes[cIndex].attrs.length === 2)
            {
                if (node.childNodes[cIndex].attrs[0].name === 'href' && node.childNodes[cIndex].childNodes[0].value) {
                    tempVal = node.childNodes[cIndex].childNodes[0].value;
                    tempVal = tempVal.trim();
                    this.tempRoom['rooms_href'] = node.childNodes[cIndex].attrs[0].value;
                    this.tempRoom['rooms_number'] = tempVal;
                }
            }
            else if (node.childNodes[cIndex].attrs && node.childNodes[cIndex].attrs.length === 1)
            {
                if (node.childNodes[cIndex].attrs[0].name === 'class' && node.childNodes[cIndex].attrs[0].value)
                {
                    tempVal = node.childNodes[cIndex].childNodes[0].value;
                    if (node.childNodes[cIndex].attrs[0].value === 'views-field views-field-field-room-capacity' && tempVal)
                    {
                        tempVal = parseInt(tempVal.trim());
                        this.tempRoom['rooms_seats'] = tempVal;
                    }
                    else if (node.childNodes[cIndex].attrs[0].value === 'views-field views-field-field-room-furniture' && tempVal)
                    {
                        tempVal = tempVal.trim();
                        this.tempRoom['rooms_furniture'] = tempVal;
                    }
                    else if (node.childNodes[cIndex].attrs[0].value === 'views-field views-field-field-room-type' && tempVal)
                    {
                        tempVal = tempVal.trim();
                        this.tempRoom['rooms_type'] = tempVal;
                    }
                }
            }
            if (this.tempRoom['rooms_href'] && this.tempRoom['rooms_number'] && this.tempRoom['rooms_seats'] &&
                this.tempRoom['rooms_furniture'] && this.tempRoom['rooms_type'])
            {
                this.tempRoom['rooms_shortname'] = building;
                this.tempRoom['rooms_name'] = building+'_'+this.tempRoom['rooms_number'];
                Object.assign( this.tempRoom, this.buildingInfo[building]);
                this.buildings[building].push(this.tempRoom)
                this.tempRoom = {};
            }
            this.addRoom(node.childNodes[cIndex], building)
        }
    } //addRoom


    /**
     * Sets the latitude and longitude of the building and stores it in the this.buildingInfo
     *
     * @param address - address of the building
     * @param building - the abbreviation of the building, ie (DMP)
     *
     * @return Promise<boolean> returns true if successful, otherwise false for some reason
     */
  public setLatLon(address: string, building: string): Promise<boolean> {
        let encodedAdd: string = encodeURI(address);
        let newAdd: string = 'http://skaha.cs.ubc.ca:8022/api/v1/team17/'+encodedAdd;
        let that: any = this;

        return new Promise(function (fulfill, reject)
        {
            try
            {
                http.get(newAdd, function (response) {
                    if (response.statusCode !== 200)
                    {
                        Log.trace('STATUS CODE WAS NOT 200 FOR LATLON, INSTEAD: ' + response.statusCode);
                        reject(true);
                    }
                    else if (!/^application\/json/.test(response.headers['content-type']))
                    {
                        Log.trace("INCORRECT TYPE: " + response.headers)
                        reject(true);
                    }
                    response.setEncoding('utf8')
                    response.on('data', function(data: any){
                        let parsedData = JSON.parse(data);
                        // console.log('PARSED DATA: ', parsedData);
                        let latlon = {'rooms_lat': parsedData.lat, 'rooms_lon': parsedData.lon};
                        that.buildingInfo[building] = Object.assign(that.buildingInfo[building], latlon);
                        // Log.trace("BUILDING INFO" + JSON.stringify(that.buildingInfo[building]))
                        fulfill(true);
                    })
                    response.on('error', function(error: any){
                        Log.trace("Error was: " + error)
                        reject(true)
                    })
                })
            }catch (err) {
                Log.trace("setLatLon EROOORRR: " + err)
                reject(err);
            }
        });
    } //setLatLon


}
