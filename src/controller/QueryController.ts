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

// TODO: change result type in query response
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
                    Log.trace(JSON.stringify(response));
                }
                else if (q == 'WHERE')
                {
                    response = this.queryWhere(query.WHERE, response);
                    Log.trace(JSON.stringify(response));
                }
                else if (q == 'ORDER')
                {
                    // check whether ORDER is in GET

                    // check if GET is of type string
                    let found : boolean = false;
                    if (typeof query.GET === 'string' ||
                        query.GET instanceof String)
                    {
                        if (query.ORDER == query.GET)
                        {
                            found = true;
                            response = this.queryOrder(query.ORDER, response);
                        }
                    }
                    else
                    {
                        // GET is of type string[]
                        for (var i = 0; i < query.GET.length; ++i)
                        {
                            if (query.ORDER == query.GET[i])
                            {
                                found = true;
                                response = this.queryOrder(query.ORDER, response);
                                break;
                            }
                        }
                    }

                    if (!found)
                    {
                        return false;
                    }
                    Log.trace(JSON.stringify(response));
                }
                else if (q == 'AS')
                {
                    response = this.queryAs(query.AS, response);
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
        var dataSetKey : string;
        var response : QueryResponse = {result: "insert answer here"};
        this.getValue(key.toString());
        if (typeof key === 'string' || key instanceof String)
        {
            dataSetKey = this.getKey(key);
        }
        else
        {
            for (var i = 0; i < key.length; ++i)
            {
                dataSetKey = this.getKey(key[i]);
            }
        }

        return response;
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

        for (var where in key)
        {
            if (!key.hasOwnProperty(where)) continue;

            //Log.trace(where);
        }

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
        Log.trace('QueryController::queryAs( ' + JSON.stringify(key)  + ' )');
        return {render: key, data};
    }// queryAs

    /**
     * Get the corresponsing key in the dataset
     *
     * @param key
     * @returns string
     */
    private getKey(key: string | string[]): string
    {
        var tempKey : string;
        // map key to satisfy dataset key
        if ("courses_dept" == key)
        {
            tempKey = "Subject";
        }
        if ("courses_id" == key)
        {
            tempKey = "id";
        }
        else if ("courses_avg" == key)
        {
            tempKey = "Avg";
        }
        else if ("courses_instructor" == key)
        {
            tempKey = "Professor";
        }
        else if ("courses_title" == key)
        {
            tempKey = "Title";
        }
        else if ("courses_pass" == key)
        {
            tempKey = "Pass";
        }
        else if ("courses_fail" == key)
        {
            tempKey = "Fail";
        }
        else if ("courses_audit" == key)
        {
            tempKey = "Audit";
        }
        else
        {
            tempKey = key.toString();
        }

        return tempKey;
    } //getKey

    /**
     * Get the corresponsing values based on the key in the dataset
     *
     * @param key
     * @returns string []
     */
    private getValue(key: string): string[]
    {
        var result : string[];
        for (var file in this.datasets)
        {
            // TODO: parse inside result
        }

        return result
    }
}
