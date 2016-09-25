/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string;
    AS: string;
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        if (this.isValid(query))
        {
            let response : QueryResponse= {};
            for (var q in query)
            {
                if (q == 'GET')
                {
                    response = this.queryGet(query.GET);
                }
                else if (q == 'WHERE')
                {
                    response = this.queryWhere(query.WHERE, response);
                    Log.trace(JSON.stringify(response));
                }
                else if (q == 'ORDER')
                {
                    response = this.queryWhere(query.ORDER, response);
                    Log.trace(JSON.stringify(response));
                }
                else if (q == 'AS')
                {
                    response = this.queryWhere(query.AS, response);
                    Log.trace(JSON.stringify(response));
                }
            }

            return {status: 'received', ts: new Date().getTime()};
        }

        // TODO: implement this
        return {status: 'received', ts: new Date().getTime()};
    }// query

    /**
     * Trim the dataset to based on the key
     *
     * @param key
     * @returns {QueryResponse}
     */
    private queryGet(key: string | string[]): QueryResponse
    {
        Log.trace('QueryController::queryGet( ' + JSON.stringify(key) + ' )');
        return {status: 'queryGet', ts: new Date().getTime()};
    }// queryGet

    /**
     * filter the dataset to based on the where option
     *
     * @param key
     * @param data, QueryResponse that is being filered
     * @returns {QueryResponse}
     */
    private queryWhere(key: {}, data: QueryResponse): QueryResponse
    {
        Log.trace('QueryController::queryWhere( ' + JSON.stringify(key) + ' )');
        return {status: 'queryWhere', ts: new Date().getTime()};
    }// queryWhere

    /**
     * order the query response to based on key
     *
     * @param key
     * @param data, QueryResponse that is being ordered
     * @returns {QueryResponse}
     */
    private queryOrder(key: string, data: QueryResponse): QueryResponse
    {
        Log.trace('QueryController::queryOrder( ' + JSON.stringify(key) + ' )');
        return {status: 'queryOrder', ts: new Date().getTime()};
    }// queryOrder

    /**
     * display the query response to based on key
     *
     * @param key
     * @param data, QueryResponse that is being displayed
     * @returns {QueryResponse}
     */
    private queryAs(key: string, data: QueryResponse): QueryResponse
    {
        Log.trace('QueryController::queryAs( ' + JSON.stringify(key) + ' )');
        return {status: 'queryAs', ts: new Date().getTime()};
    }// queryAs
}
