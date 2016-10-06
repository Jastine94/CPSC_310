/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";

import fs = require('fs');

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

    // public isValid(query: QueryRequest): boolean {
    //     if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
    //         return true;
    //     }
    //     return false;
    // }

    public isValid(query: QueryRequest): boolean {
        if ( Object.keys(query).length === 0 || typeof query === 'undefined' || query === null){
            return false;
        }
        else if (query.hasOwnProperty("GET") && query.hasOwnProperty("WHERE") && query.hasOwnProperty("AS")){
            let validGET:boolean = this.checkGet(query);
            let validORDER:boolean = this.checkOrder(query);
            let validAS:boolean = this.checkAs(query);
            let validWHERE: boolean;

            if (Object.keys(query.WHERE).length === 0){
                return false;
            }
            for (let filter in query.WHERE){
                validWHERE = this.checkFilter(query.WHERE, filter);
                if (validWHERE === false){
                    return false;
                }
            }
            return (validGET && validORDER && validAS && validWHERE);
        }
        else return false;
    }

    private checkFilter(query: any, filter: any):boolean{ //need to add an accumulator
        let numberRegex = new RegExp("[1-9]*[0-9]+(.[0-9]+)?");
        let key = new RegExp('[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+');
        let sCompRegex = new RegExp("[*]?[a-zA-Z0-9,_-]+[*]?");
        if (filter === "AND" || filter === "OR"){
           // LOGICCOMPARISON ::= LOGIC ':[{' FILTER ('}, {' FILTER )* '}]'
            for (let filtobj in query[filter]){
                let filteredObj:any = filtobj;
                for (let filtval in filteredObj) {
                    return this.checkFilter(filteredObj, filtval);
                }
            }
        }
        else if (filter === "LT" || filter === "GT" || filter === "EQ"){
           // MCOMPARISON ::= MCOMPARATOR ':{' key ':' number '}'
            let mcompvalue = query[filter];
            for (let val in mcompvalue){
                // let fileExists: boolean = false;
                // if (key.test(val)){
                //     let id = this.retrieveIdFromKey(val);
                //     fileExists = fs.existsSync( __dirname+"\/..\/..\/data\/"+id+".json");
                //     Log.trace("JSON File exists:" + fileExists);
                // }
                // return (key.test(val) && fileExists && numberRegex.test(mcompvalue[val]));
                return (key.test(val) && numberRegex.test(mcompvalue[val]));
            }
        }
        else if (filter === "IS"){
            // SCOMPARISON ::= 'IS:{' key ':' [*]? string [*]? '}'
            let scompvalue = query[filter];
            for (let val in scompvalue){
                // let fileExists: boolean = false;
                // if (key.test(val)){
                //     let id = this.retrieveIdFromKey(val);
                //     fileExists = fs.existsSync( __dirname+"\/..\/..\/data\/"+id+".json");
                //     Log.trace("JSON File exists:" + fileExists);
                // }
                // return (key.test(val) && fileExists && sCompRegex.test(scompvalue[val]));
                return (key.test(val) && sCompRegex.test(scompvalue[val]));
            }
        }
        else if (filter === "NOT") {
           // NEGATION ::= 'NOT :{' FILTER '}'
            let negate = query[filter];
            for (let filt in query[filter]){
                return this.checkFilter(negate,filt);
            }
        }
        return true;
    }

    private checkGet(query: QueryRequest): boolean {
        let key = new RegExp("[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+");
        let getVals = query["GET"];
        let validGET: boolean = true;
        if (getVals.length === 0){
            return false;
        }
        for (let i = 0; i < getVals.length; i++){
            let validKey:boolean = key.test(getVals[i]);
            if (!validKey){
                validGET = false;
            }
        }
        return validGET;
    } //checkGet

    private checkOrder(query: QueryRequest): boolean{
        let key = new RegExp("[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+");
        for (let q in query){
            if (q === "ORDER"){
                return (key.test(query.ORDER) || query.ORDER === "" || query.ORDER === null );
            }
            else return true;
        }
        return true;
    } //checkOrder

    private checkAs(query: QueryRequest): boolean {
        if (query.AS === "TABLE"){
            return true;
        }else {
            return false;
        }
    } //checkAs

    private retrieveIdFromKey(key: string): string {
        let temp = key.indexOf("_");
        return (key.substring(0,temp));
    } //retrieveIdFromKey

    public query(query: QueryRequest): QueryResponse {
        //Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

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
                    wherePresent = true;
                }
                else if (q == 'ORDER')
                {
                    // continue only if order is in GET else not a valid query
                    // check if GET is of type string
                    let found : boolean = false;
                    orderPresent = true;

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
                        response = this.queryWhere(query.WHERE, response, false);
                        response = this.queryGet(query.GET, response);

                        //Log.trace("response" + JSON.stringify(response));
                        queryResponse = response;
                        if (orderPresent)
                        {
                            queryResponse = this.queryOrder(query.ORDER, response);
                        }
                        else
                        {
                            queryResponse = response;
                        }
                    }

                    queryResponse = {result : queryResponse};
                    queryResponse = this.queryAs(query.AS, queryResponse);
                }
            }

            return queryResponse;

        }
        return {status: 'received', ts: new Date().getTime()};
    }// query

    /**
     * Trim the dataset to based on the key
     *
     * @param key
     * @returns {QueryResponse}
     */
    private queryGet(key: string | string[], data: any[]): any[]
    {
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
    private queryWhere(key: any, data: any[], isNot: boolean): any[]
    {
        let accResult : any = [];

        for (var myCurrentDataSet in this.datasets)
        {
            // myCurrentDataSet is this.datasets.id; resultList is the data object(array of results)
            var myDataList = this.datasets[myCurrentDataSet];
            var resultList = JSON.parse(JSON.stringify(myDataList));

            if (data !== undefined)
            {
                resultList = data;
            }

            // id_key : value pair == value : instance
            for (var where in key)
            {
                if ('OR' == where)
                {
                    //TODO: do something with the array recursive
                    let keyContains = key[where];
                    let firstOne: boolean = true;
                    for (var it in keyContains)
                    {
                        let item = keyContains[it];
                        let itemList = JSON.parse(JSON.stringify(item));

                        for (var i in itemList)
                        {
                            let tempKey : {} = {[i] : itemList[i]};
                            if ('AND' == i || 'OR' == i)
                            {
                                accResult = this.queryWhere(tempKey, data, isNot);
                            }
                            else if ('NOT' == i)
                            {
                                let trimResult: any[] = [];
                                trimResult.push({"result": accResult});
                                // need to remove the not items that is in the accResult so far
                                trimResult = this.queryWhere(tempKey, trimResult, isNot);
                                accResult = this.queryWhere(tempKey, data, isNot);
                                accResult.concat(trimResult);
                            }
                            else
                            {
                                resultList = JSON.parse(JSON.stringify(myDataList));
                                accResult = this.queryWhereHelper(tempKey, resultList, accResult, isNot);
                            }
                        }
                    }
                    return accResult;
                }
                else if ('AND' == where)
                {
                    let keyContains = key[where];
                    let firstOne: boolean = true;
                    for (var it in keyContains)
                    {
                        let item = keyContains[it];
                        let itemList = JSON.parse(JSON.stringify(item));

                        for (var i in itemList)
                        {
                            let tempKey : {} = {[i] : itemList[i]};
                            let emptyList : any[] = [];
                            if (firstOne)
                            {
                                firstOne = false;
                                if ('NOT' == i || 'OR' == i || 'AND' == i)
                                {
                                    accResult = this.queryWhere(tempKey, data, isNot);
                                }
                                else
                                {
                                    accResult = this.queryWhereHelper(tempKey, resultList, emptyList, isNot);
                                }
                            }
                            else
                            {
                                emptyList = [];
                                let newList: any[] = [];
                                newList.push({"result": accResult});
                                // handle case where not is in inside and
                                if ('NOT' == i || 'OR' == i)
                                {
                                    accResult = this.queryWhere(tempKey, newList, isNot);
                                }
                                else
                                {
                                    accResult = this.queryWhereHelper(tempKey, newList, emptyList, isNot);
                                }
                            }
                        }
                    }
                    return accResult;
                }
                else if ('NOT' == where)
                {
                    let getNotNot : any[] = [];
                    if (!isNot)
                    {
                        accResult = this.queryWhere(key[where], data, true);
                    }
                    else
                    {
                        accResult = this.queryWhere(key[where], data, false);
                    }
                    data = [];
                    return accResult;
                }
                else
                {
                    accResult = this.queryWhereHelper(key, resultList, accResult, isNot);
                }
            }
        }

        data = [];
        return accResult;
    }// queryWhere

    private queryWhereHelper(key: any, resultList: any[], ret : any [], isNot : boolean): any[]
    {
        // get each result object
        for (var keys in resultList)
        {
            var result = resultList[keys];
            let valuesList = result["result"];

            for (var values in valuesList)
            {
                var value = valuesList[values];

                for (var instance in value)
                {
                    for (var where in key)
                    {
                        if ('EQ' == where)
                        {
                            let keyContains = key[where];
                            for (let k in keyContains)
                            {
                                var temp = this.getKey(k.toString());
                                if ((temp === String(instance)) &&
                                    (keyContains[k] == value[instance]) && !isNot)
                                {
                                    ret.push(value);
                                }
                                else if ((temp === String(instance)) &&
                                    (keyContains[k] != value[instance]) && isNot)
                                {
                                    ret.push(value);
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
                                    (keyContains[k] < value[instance]) && !isNot)
                                {
                                    ret.push(value);
                                }
                                else if ((temp === String(instance)) &&
                                    (keyContains[k] > value[instance]) && isNot)
                                {
                                    ret.push(value);
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
                                    (keyContains[k] > value[instance]) && ! isNot)
                                {
                                    ret.push(value);
                                }
                                else if ((temp === String(instance)) &&
                                    (keyContains[k] < value[instance]) && isNot)
                                {
                                    ret.push(value);
                                }
                            }
                        }
                        else if ('IS' == where)
                        {
                            let keyContains = key[where];
                            for (let k in keyContains)
                            {
                                var temp = this.getKey(k.toString());

                                if (!keyContains[k].includes("*"))
                                {
                                    if ((temp === String(instance)) &&
                                        (keyContains[k] == value[instance]) && !isNot)
                                    {
                                        // TODO: see if this is needed
                                        /*
                                        let pushed : boolean = true;
                                        for (var i = 0 ; i < ret.length; ++i)
                                        {
                                            if (ret[i]["id"] == value["id"])
                                            {
                                                Log.trace("Dont  push");
                                                pushed = false;
                                                break;
                                            }
                                        }
                                        if (pushed)
                                        {
                                            ret.push(value);
                                        }
                                        */
                                        ret.push(value);
                                    }
                                    else if ((temp === String(instance)) &&
                                             (keyContains[k] != value[instance]) && isNot)
                                    {
                                        ret.push(value);

                                    }
                                }
                                else
                                {
                                    var patt = new RegExp("^" + keyContains[k].split("*").join(".*") + "$");

                                    if ((temp === String(instance)) &&
                                        (value[instance].match(patt)) && !isNot)
                                    {
                                        ret.push(value);
                                    }
                                    else if ((temp === String(instance)) &&
                                        (!value[instance].match(patt)) && isNot)
                                    {
                                        ret.push(value);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return ret;
    }

    /**
     * order the query response to based on key
     *
     * @param key
     * @param data, QueryResponse that is being ordered
     * @returns {QueryResponse}
     */
    private queryOrder(key: string, data: any[]): QueryResponse
    {
        // ordering for number
        if (key == "courses_avg" || key == "courses_pass" ||
            key == "courses_fail"|| key == "courses_audit")
        {
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
        }
        else // key is a string
        {
            data.sort(function (a, b) {
                let aString = String(a[key]).toUpperCase();
                let bString = String(b[key]).toUpperCase();

                  if (aString > bString) {
                    return 1;
                  }
                  if (aString < bString) {
                    return -1;
                  }
                  // a must be equal to b
                  return 0;
              });
        }

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
            tempKey = "Course";
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
                results.push(obj);
            }
        }
        return results;
    }// getValue

    /**
     * Get the corresponsing values based on the key in the dataset
     *
     * @param key
     * @returns string []
     */
    private getArrayDiff(totalList : any[], toRemove: any[]): any[]
    {
        let ret : any [] = [];
        let total : any[] = [];

        for (var keys in totalList)
        {
            var result = totalList[keys];
            let valuesList = result["result"];

            for (var values in valuesList)
            {
                total.push(valuesList[values]);
            }
        }

        for (var i = 0; i < total.length; ++i)
        {
            var key = total[i];

            let isSame : boolean = false;

            for (var item in toRemove)
            {
                if (JSON.stringify(toRemove[item]) == JSON.stringify(key))
                {
                    isSame = true;
                    break;
                }
            }

            if (!isSame)
            {
                ret.push(key);
            }
        }

        return ret;
    } //getArrayDiff
}
