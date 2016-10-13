/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest} from "./QueryController";

export default class InsightFacade implements IInsightFacade {

    // TODO: need to implement this


    public addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise(function (fulfill, reject) {
            try {
            } catch (err) {
            }
        });
    } //addDataset

    public removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function (fulfill, reject) {
            try {
            } catch (err) {
            }
        });
    } // removeDataset

    public performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function (fulfill, reject) {
            try {
            } catch (err) {
            }
        });
    } // performQuery
}