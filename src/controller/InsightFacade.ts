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
        return new Promise(function (fulfill, reject) {
            try {
                let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                let controller = new QueryController(datasets);
                let isValid = controller.isValid(query);
                Log.trace("Query is valid? " + isValid);
                if (isValid) {
                    let value = query["GET"];
                    let missing_id: string[] = [];
                    for (let i = 0; i < value.length; i++) {
                        let is_Key = value[i].includes("_");
                        if (is_Key) {
                            let temp_pos = value[i].indexOf("_");
                            let id = value[i].substring(0, temp_pos);
                            if (!(fs.existsSync(__dirname + "\/..\/..\/data\/" + id + ".json"))) {
                                missing_id.push(id);
                            }
                        }
                    }
                    // if (typeof (query["ORDER"]) != 'undefined' && typeof  (query["ORDER"]) === 'object')
                    // {
                    //     let key_vals:any = query["ORDER"]["keys"];
                    //     // iterate through all the values in order
                    // }
                    if (missing_id.length > 0) {
                        let mids: any = {};
                        mids["missing"] = missing_id;
                        reject({code: 424, body: {error: mids}});
                    }
                    else {
                        let result: any = controller.query(query);
                        if (result.status === "failed") {
                            reject({code: 400, body: {error: "Invalid query"}});
                        }
                        else {
                            fulfill({code: 200, body: result});
                        }
                    }
                }
                else {
                    reject({code: 400, body: {error: "Invalid query"}});
                }
            }
            catch (error) {
                //Log.error('RouteHandler::postQuery(..) - ERROR: '  + error);
                reject({code: 400, body: {error: "Invalid query"}});
            }
        })
    } // performQuery

    // TODO: make this work, not sure why it doesn't
    private returnInvalidKeys(queryInfo: string[]): string[]{
        let missing_id: string[] = [];
        for (let i = 0; i < queryInfo.length; i++) {
            let is_Key = queryInfo[i].includes("_");
            if (is_Key) {
                let temp_pos = queryInfo[i].indexOf("_");
                let id = queryInfo[i].substring(0, temp_pos);
                if (!(fs.existsSync(__dirname + "\/..\/..\/data\/" + id + ".json"))) {
                    missing_id.push(id);
                }
            }
        }
        return missing_id;
    } //returnInvalidKeys

}