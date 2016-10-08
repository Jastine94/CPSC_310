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
                // NOTE for Frances: this.checkFilter works half the time with the UI. Sometimes result is empty.
                validWHERE = this.checkFilter(query.WHERE, filter);
                // validWHERE = true;
                if (validWHERE === false){
                    return false;
                }
            }
            return (validGET && validORDER && validAS && validWHERE);
        }
        else return false;
    }

    private checkFilter(query: any, filter: any):boolean{
        let numberRegex = new RegExp("[1-9]*[0-9]+(.[0-9]+)?");
        let key = new RegExp('[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+');
        let sCompRegex = new RegExp("[*]?[a-zA-Z0-9,_-]+[*]?");

        if (filter === "AND" || filter === "OR"){
           // LOGICCOMPARISON ::= LOGIC ':[{' FILTER ('}, {' FILTER )* '}]'
            if (query[filter].length < 2){
                return false;
            }

            let isAndReturn:boolean = true;

            for (let filtobj in query[filter]){
                let filteredObj:any = JSON.parse(JSON.stringify(query[filter][filtobj]));
                for (let filtval in filteredObj) {
                    if (!this.checkFilter(filteredObj, filtval)){
                        isAndReturn = false;
                        break;
                    }
                }
            }
            return isAndReturn;
        }
        else if (filter === "LT" || filter === "GT" || filter === "EQ"){
           // MCOMPARISON ::= MCOMPARATOR ':{' key ':' number '}'
            let mcompvalue = query[filter];

            if (Object.keys(query[filter]).length !== 1){
                return false;
            }

            for (let val in mcompvalue){
                let tempkey = this.getKey(val.toString());
                let isValidKey: boolean = (tempkey !== "Invalid Key");
                return (isValidKey && key.test(val) && numberRegex.test(mcompvalue[val]));
            }
        }
        else if (filter === "IS"){
            // SCOMPARISON ::= 'IS:{' key ':' [*]? string [*]? '}'
            let scompvalue = query[filter];
            if (Object.keys(query[filter]).length !== 1){
                return false;
            }
            for (let val in scompvalue){
                let tempkey = this.getKey(val.toString());
                let isValidKey: boolean = (tempkey !== "Invalid Key");
                return (isValidKey && key.test(val) && sCompRegex.test(scompvalue[val]));
            }
        }
        else if (filter === "NOT") {
           // NEGATION ::= 'NOT :{' FILTER '}'
            let negate = query[filter];
            if (Object.keys(query[filter]).length !== 1){
                return false;
            }
            for (let filt in query[filter]){
                return this.checkFilter(negate,filt);
            }
        }
        else return false;
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
        }
        else {
            return false;
        }
    } //checkAs

    public query(query: QueryRequest): QueryResponse {
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

        return {status: 'failed', error: "invalid query"};
    }// query

    /**
     * Trim the dataset to based on the key
     *
     * @param key
     * @returns {QueryResponse}
     */
    private queryGet(key: string | string[], data: any[]): any[]
    {
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
                    let keyContains = key[where];
                    let firstOne: boolean = true;
                    for (var it in keyContains)
                    {
                        let item = keyContains[it];
                        let itemList = JSON.parse(JSON.stringify(item));

                        for (var i in itemList)
                        {
                            let tempKey : {} = {[i] : itemList[i]};
                            if ('OR' == i || 'AND' == i)
                            {
                                let tempResult = this.queryWhere(tempKey, resultList, isNot);

                                for (var values in tempResult)
                                {
                                    var value = tempResult[values];
                                    if (!this.isDuplicate(accResult, value))
                                    {
                                        accResult.push(value);
                                    }
                                }
                            }
                            else if ('NOT' == i)
                            {
                                let trimResult: any[] = [];

                                trimResult.push({"result": accResult});
                                // need to remove the not items that is in the accResult so far
                                trimResult = this.queryWhere(tempKey, trimResult, isNot);
                                accResult = this.queryWhere(tempKey, data, isNot);

                                for (var values in trimResult)
                                {
                                    var value = trimResult[values];
                                    if (!this.isDuplicate(accResult, value))
                                    {
                                        accResult.push(value);
                                    }
                                }
                            }
                            else
                            {
                                resultList = JSON.parse(JSON.stringify(myDataList));
                                accResult = this.queryWhereHelper(tempKey, resultList, accResult, isNot, true);
                            }
                        }
                    }
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
                                    accResult = this.queryWhere(tempKey, resultList, isNot);
                                }
                                else
                                {
                                    resultList = JSON.parse(JSON.stringify(myDataList));
                                    accResult = this.queryWhereHelper(tempKey, resultList, emptyList, isNot, false);
                                }
                            }
                            else
                            {
                                emptyList = [];
                                let newList: any[] = [];
                                newList.push({"result": accResult});
                                // handle case where not is in inside and
                                if ('AND' == i || 'OR' == i)
                                {
                                    let tempResult = this.queryWhere(tempKey, newList, isNot);
                                    for (var values in tempResult)
                                    {
                                        var value = tempResult[values];
                                        if (!this.isDuplicate(accResult, value))
                                        {
                                            accResult.push(value);
                                        }
                                    }
                                }
                                else if ('NOT' == i)
                                {
                                    // get each result object
                                    accResult = this.queryWhere(tempKey, newList, isNot);
                                }
                                else
                                {
                                    accResult = this.queryWhereHelper(tempKey, newList, emptyList, isNot, false);
                                }
                            }
                        }
                    }
                }
                else if ('NOT' == where)
                {
                    let getNotNot : any[] = [];
                    if (!isNot)
                    {
                        accResult = this.queryWhere(key[where], resultList, true);
                    }
                    else
                    {
                        accResult = this.queryWhere(key[where], resultList, false);
                    }
                }
                else
                {
                    accResult = this.queryWhereHelper(key, resultList, accResult, isNot, false);
                }
            }
        }

        data = [];
        return accResult;
    }// queryWhere

    private queryWhereHelper(key: any, resultList: any[], ret : any [],
                            isNot : boolean, isOr : boolean): any[]
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
                                    if (isOr)
                                    {
                                        if (!this.isDuplicate(ret, value))
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else
                                    {
                                        ret.push(value);
                                    }
                                }
                                else if ((temp === String(instance)) &&
                                    (keyContains[k] != value[instance]) && isNot)
                                {
                                    if (isOr)
                                    {
                                        if (!this.isDuplicate(ret, value))
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else
                                    {
                                        ret.push(value);
                                    }
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
                                    if (isOr)
                                    {
                                        if (!this.isDuplicate(ret, value))
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else
                                    {
                                        ret.push(value);
                                    }
                                }
                                else if ((temp === String(instance)) &&
                                    (keyContains[k] >= value[instance]) && isNot)
                                {
                                    if (isOr)
                                    {
                                        if (!this.isDuplicate(ret, value))
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else
                                    {
                                        ret.push(value);
                                    }
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
                                    (keyContains[k] > value[instance]) && !isNot)
                                {
                                    if (isOr)
                                    {
                                        if (!this.isDuplicate(ret, value))
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else
                                    {
                                        ret.push(value);
                                    }
                                }
                                else if ((temp === String(instance)) &&
                                    (keyContains[k] <= value[instance]) && isNot)
                                {
                                    if (isOr)
                                    {
                                        if (!this.isDuplicate(ret, value))
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else
                                    {
                                        ret.push(value);
                                    }
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
                                        if (isOr)
                                        {
                                            if (!this.isDuplicate(ret, value))
                                            {
                                                ret.push(value);
                                            }
                                        }
                                        else
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else if ((temp === String(instance)) &&
                                             (keyContains[k] != value[instance]) && isNot)
                                    {
                                        if (isOr)
                                        {
                                            if (!this.isDuplicate(ret, value))
                                            {
                                                ret.push(value);
                                            }
                                        }
                                        else
                                        {
                                            ret.push(value);
                                        }
                                    }
                                }
                                else
                                {
                                    var patt = new RegExp("^" + keyContains[k].split("*").join(".*") + "$");

                                    if ((temp === String(instance)) &&
                                        (value[instance].match(patt)) && !isNot)
                                    {
                                        if (isOr)
                                        {
                                            if (!this.isDuplicate(ret, value))
                                            {
                                                ret.push(value);
                                            }
                                        }
                                        else
                                        {
                                            ret.push(value);
                                        }
                                    }
                                    else if ((temp === String(instance)) &&
                                        (!value[instance].match(patt)) && isNot)
                                    {
                                        if (isOr)
                                        {
                                            if (!this.isDuplicate(ret, value))
                                            {
                                                ret.push(value);
                                            }
                                        }
                                        else
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
            tempKey = "Invalid Key";
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
     * Check if the object is a duplicate and is already in the list
     *
     * @param resultList
     * @param instance
     * @returns true if it is a duplicated else false
     */
    private isDuplicate(resultList: any[], instance : any) : boolean
    {
        let isDuplicate : boolean = false;

        for (var i = 0 ; i < resultList.length; ++i)
        {
            if (resultList[i]["id"] !== undefined && instance["id"] !== undefined)
            {
                if (resultList[i]["id"] == instance["id"])
                {
                    isDuplicate = true;
                    break;
                }
            }
            else
            {
                // there is no valid primary key
                break;
            }

        }

        return isDuplicate;
    } // isDuplicate
}
