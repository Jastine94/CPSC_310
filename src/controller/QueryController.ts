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
    private returnDatasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
        this.returnDatasets = null;
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
            let response : any[];
            let queryResponse : QueryResponse = {};
            let getPresent: boolean = false;
            let wherePresent: boolean = false;
            let orderPresent:boolean = false;
            for (var q in query)
            {
                if (q == 'GET')
                {
                    getPresent = true;
                }
                else if (q == 'WHERE')
                {
                    if (getPresent)
                    {
                        wherePresent = true;
                    }

                }
                else if (q == 'ORDER')
                {
                    // continue only if order is in GET else not a valid query
                    // check if GET is of type string
                    let found : boolean = false;
                    orderPresent = true;
                    // if (query.ORDER == null)
                    if (query.ORDER == "" || query.ORDER == null)
                    {
                        found = true;
                    }
                    else if (typeof query.GET === 'string' ||
                        query.GET instanceof String)
                    {
                        if (query.ORDER == query.GET)
                        {
                            found = true;
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
                                break;
                            }
                        }
                    }

                    if (!found)
                    {
                        return {status: 'failed', error: "invalid query"};
                    }
                }
                else if (q == 'AS')
                {
                    if (wherePresent && getPresent)
                    {
                        // note that where must be done before get
                        response = this.queryWhere(query.WHERE, response);
                        Log.trace(JSON.stringify(response));
                        response = this.queryGet(query.GET, response);
                        if (orderPresent)
                        {
                            //let unorderedResponse : [] = queryResponse;
                            queryResponse = this.queryOrder(query.ORDER, response);
                        }
                        else
                        {
                            queryResponse = response;
                        }
                    }

                    queryResponse = {result : queryResponse};
                    queryResponse = this.queryAs(query.AS, queryResponse);
                    Log.trace(JSON.stringify(queryResponse));
                }
            }

            return queryResponse;

        }
        return {status: 'received', ts: new Date().getTime()};
        // TODO: implement this

    }// query

    /**
     * Trim the dataset to based on the key
     *
     * @param key
     * @returns {QueryResponse}
     */
    private queryGet(key: string | string[], data: any[]): any[]
    {
        Log.trace('QueryController::queryGet( ' + JSON.stringify(key) + ' )');
        let dataSetKey : string;

        return this.getValue(key, data);
    }// queryGet

    /**
     * filter the dataset to based on the where option
     *
     * @param key
     * @param data, QueryResponse that is being filered
     * @returns {QueryResponse}
     */
    private queryWhere(key: any, data: any[]): any[]
    {
        let accResult : any = [];

        for (var myCurrentDataSet in this.datasets)
        {
            // myCurrentDataSet is this.datasets.id; resultList is the data object(array of results)
            var myDataList = this.datasets[myCurrentDataSet];
            var resultList = JSON.parse(JSON.stringify(myDataList));

            // get each result object
            for (var keys in resultList)
            {
                var result = resultList[keys];
                let valuesList = result["result"];

                for (var values in valuesList)
                {
                    var value = valuesList[values];
                    // id_key : value pair == value : instance
                    for (var instance in value)
                    {
                        for (var where in key)
                        {
                            if ('AND' == where || 'OR' == where  || 'NOT' == where)
                            {
                                //TODO: do something with the array recursive
                            }
                            else if ('EQ' == where)
                            {
                                let keyContains = key[where];
                                for (let k in keyContains)
                                {
                                    var temp = this.getKey(k.toString());
                                    if ((temp === String(instance)) &&
                                        (keyContains[k] == value[instance]))
                                    {
                                        accResult.push(value);
                                    }
                                }
                            }
                            else if ('GT' == where)
                            {
                                let keyContains = key[where];
                                for (let k in keyContains)
                                {
                                    var temp = this.getKey(k.toString());
                                    if ((temp === String(instance)) &&
                                        (keyContains[k] < value[instance]))
                                    {
                                        accResult.push(value);
                                    }
                                }
                            }
                            else if ('LT' == where)
                            {
                                let keyContains = key[where];
                                for (let k in keyContains)
                                {
                                    var temp = this.getKey(k.toString());
                                    if ((temp === String(instance)) &&
                                        (keyContains[k] > value[instance]))
                                    {
                                        accResult.push(value);
                                    }
                                }
                            }
                            else if ('IS' == where)
                            {
                                let keyContains = key[where];
                                for (let k in keyContains)
                                {
                                    var temp = this.getKey(k.toString());
                                    var patt = new RegExp(keyContains[k].split("*").join(".*"));
                                    if ((temp === String(instance)) &&
                                        (patt.test(value[instance])))
                                    {
                                        Log.trace(keyContains[k]);
                                        accResult.push(value);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return accResult;
    }// queryWhere

    /**
     * order the query response to based on key
     *
     * @param key
     * @param data, QueryResponse that is being ordered
     * @returns {QueryResponse}
     */
    private queryOrder(key: string, data: any[]): QueryResponse
    {
        Log.trace('QueryController::queryOrder( ' + JSON.stringify(data) + ' )');

        data.sort(function (a, b) {
              if (a[key] > b[key]) {
                return 1;
              }
              if (a[key] < b[key]) {
                return -1;
              }
              // a must be equal to b
              return 0;
          });

        Log.trace("ORDERED!!!!!!!!!" + JSON.stringify(data));
        let queryOrderedResult :QueryResponse = [];

        queryOrderedResult = data;
        return queryOrderedResult;
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
        var obj1: any = {};
        obj1["render"] = key;
        return Object.assign(obj1, data);
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
        else if ("courses_id" == key)
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
    private getValue(key: string | string[], data: any[]): any[]
    {
        var results : any[] = [];
        for (var k = 0; k < data.length; ++k)
        {
            let value  = data[k];
            let obj : any = {};
            let gotData : boolean = false;
            for (var i = 0; i < key.length; ++i)
            {
                var temp = this.getKey(key[i].toString());
                for (var instance in value)
                {
                    if (temp === String(instance))
                    {
                        let tempObj : {} = {[key[i]] : value[instance]};
                        Object.assign(obj, tempObj);
                        gotData = true;
                    }
                }
            }
            if (gotData)
            {
                Log.trace(JSON.stringify(obj));
                results.push(obj);
            }
        }

        /*
        for (var file in this.datasets)
        {
            // file is this.datasets.id; dataList is the data object(array of results)
            var dataList = this.datasets[file];
            var items = JSON.parse(JSON.stringify(dataList));

            // get each result object
            for (var keys in items)
            {
                var result = items[keys];
                let valuesList = result["result"];

                for (var values in valuesList)
                {
                    var value = valuesList[values];
                    let obj : any = {};
                    let gotData : boolean = false;
                    for (var i = 0; i < key.length; ++i)
                    {
                        var temp = this.getKey(key[i].toString());
                        for (var instance in value)
                        {
                            if (temp === String(instance))
                            {
                                let tempObj : {} = {[key[i]] : value[instance]};
                                Object.assign(obj, tempObj);
                                gotData = true;
                            }
                        }
                    }
                    if (gotData)
                    {
                        results.push(obj);
                    }
                }
            }
        }
        */
        return results;
    }// getValue
}
