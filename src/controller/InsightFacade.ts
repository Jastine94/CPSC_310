/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest} from "./QueryController";
import QueryController from './QueryController';
import DatasetController from './DatasetController';
import {Datasets} from './DatasetController';

import Log from '../Util';
import fs = require('fs');

export default class InsightFacade implements IInsightFacade {

    private static datasetController = new DatasetController();
    private whereKeys: string[] = [];

    public addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            try {
                let controller = InsightFacade.datasetController;
                let exists: boolean = fs.existsSync(__dirname + "\/..\/..\/data\/" + id + '.json');
                controller.process(id, content).then(function (result) {
                        if (result) {
                            if (exists) {
                                Log.trace("IT IS UPDATING EXISTING ADDITION");
                                fulfill({code: 201, body: {success: "Updated existing id"}});
                            }
                            else {
                                Log.trace("NEW DS ADDED");
                                fulfill({code: 204, body: {success: "New id was added"}});
                            }
                        }
                        else {
                            reject({code: 400, body: {error: "Add dataset unsuccessful"}});
                        }
                    }
                ).catch(function (error) {
                    reject({code: 400, body: {error: "Add dataset unsuccessful"}});
                });

            } catch (err) {
                reject({code: 400, body: {error: "Add dataset unsuccessful"}});
            }
        });
    } //addDataset

    public removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            try {
                let controller = InsightFacade.datasetController;
                controller.deleteDataset(id).then(function (result) {
                    Log.trace('InsightFacde ::deleteDataset(..) - processed');
                    fulfill({code: 204, body: {success: "Successfully deleted"}});
                }).catch(function (error: Error) {
                    reject({code: 404, body: {error: "Delete dataset unsuccessful"}});
                });
            } catch (err) {
                reject({code: 404, body: {error: "Delete dataset unsuccessful"}});
            }
        });
    } // removeDataset

    public performQuery(query: QueryRequest): Promise<InsightResponse> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                let controller = new QueryController(datasets);
                let isValid = controller.isValid(query);
                Log.trace("Query is valid? " + isValid);
                if (isValid) {
                    let value = query["GET"];
                    let missing_id: string[] = [];
                    let dir = __dirname + "\/..\/..\/data\/";
                    let files = fs.readdirSync(dir);
                    let fileList: any[] = [];
                    for(var f in files)
                    {  // adding all the files in the data folder in the 'files' array
                        // if (!files.hasOwnProperty(i)) continue;
                        // var name = files[i];
                        fileList.push(files[f]);
                    }
                    for (let i = 0; i < value.length; i++)
                    {
                        let is_Key = value[i].includes("_");
                        if (is_Key) {
                            let temp_pos = value[i].indexOf("_");
                            let id = value[i].substring(0, temp_pos);
                            if (!fileList.includes(id+".json"))
                            {
                                missing_id.push(id);
                            }
                            // if (!(fs.existsSync(__dirname + "\/..\/..\/data\/" + id + ".json"))) {
                            //     missing_id.push(id);
                            // }
                        }
                    }
                    if (Object.keys(query.WHERE).length > 0)
                    { // First iterates through the where clause and adds it to whereKeys
                        for (let filter in query.WHERE)
                        {
                            that.grabWHEREKeys(query.WHERE, filter);
                        }
                        for (let wk in that.whereKeys)
                        {  // Iterates through all the whereKeys to see if that value is in the data folder
                            let wksep = that.whereKeys[wk].indexOf(".");
                            let wkid = that.whereKeys[wk].substring(0, wksep);
                            if (!fileList.includes(that.whereKeys[wk]))
                            {
                                missing_id.push(wkid);
                            }
                        }
                    }
                    if (missing_id.length > 0)
                    {
                        // let mids: any = {};
                        // mids.missing = missing_id;
                        reject({code: 424, missing: missing_id});
                    }
                    else {
                        let result: any = controller.query(query);
                        fulfill({code: 200, body: result});
                    }
                }
                else
                    {
                    reject({code: 400, error: "Invalid query"});
                    }
            }
            catch (error)
            {
                //Log.error('RouteHandler::postQuery(..) - ERROR: '  + error);
                reject({code: 400, error: "Invalid query"});
            }
        })
    } // performQuery


    private grabWHEREKeys(query: any, filter: string): void{
        if (filter === "AND" || filter === "OR") {
            // LOGICCOMPARISON ::= LOGIC ':[{' FILTER ('}, {' FILTER )* '}]'
            for (let filtobj in query[filter])
            {
                let filteredObj: any = JSON.parse(JSON.stringify(query[filter][filtobj]));
                for (let filtval in filteredObj)
                {
                    Log.trace("AND/OR " + filtval)
                    this.grabWHEREKeys(filteredObj, filtval);
                }
            }
            return;
        }
        else if (filter === "LT" || filter === "GT" || filter === "EQ")
        {
            // MCOMPARISON ::= MCOMPARATOR ':{' key ':' number '}'
            let mcompvalue = query[filter];
            for (let val in mcompvalue)
            {
                let temp_pos = val.indexOf("_");
                let id = val.substring(0, temp_pos);
                if (!this.whereKeys.includes(id+".json"))
                {
                    this.whereKeys.push(id +".json");
                }
            }
            return;
        }
        else if (filter === "IS")
        {
            // SCOMPARISON ::= 'IS:{' key ':' [*]? string [*]? '}'
            let scompvalue = query[filter];
            for (let val in scompvalue)
            {
                let temp_pos = val.indexOf("_");
                let id = val.substring(0, temp_pos);
                if (!this.whereKeys.includes(id+".json"))
                {
                    this.whereKeys.push(id +".json");
                }
            }
            return;
        }
        else if (filter === "NOT")
        {
            // NEGATION ::= 'NOT :{' FILTER '}'
            let negate = query[filter];
            for (let filt in query[filter])
            {
                this.grabWHEREKeys(negate, filt);
            }
        }
    }
}