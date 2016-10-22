/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";

import fs = require('fs');
import get = Reflect.get;

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string | {};
    AS: string;
    APPLY? : any[];
    GROUP? : any[];
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;
    private whereEmpty : boolean = false;
    private applyEmpty : boolean = false;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

     // This method will return if the query provided is valid or not
    public isValid(query: QueryRequest): boolean {
        if ( Object.keys(query).length === 0 || typeof query === 'undefined' || query === null)
        {
            return false;
        }
        else if (query.hasOwnProperty("GET") && query.hasOwnProperty("WHERE") && query.hasOwnProperty("AS"))
        {
            let validGET:boolean = this.checkGet(query);
            let validORDER:boolean = this.checkOrder(query);
            let validAS:boolean = this.checkAs(query);
            let validWHERE: boolean;
            let validGROUP:boolean = true;
            let validAPPLY:boolean = true;
            let validGETGROUPAPPLY: boolean = true;
            if (Object.keys(query.WHERE).length === 0)
            {
                this.whereEmpty = true;
                validWHERE = true; //updated this value so that you can have an empty obj in there WHERE clause
            }
            for (let filter in query.WHERE)
            {
                validWHERE = this.checkFilter(query.WHERE, filter);
                if (validWHERE === false)
                {
                    return false;
                }
            }
            Log.trace(typeof (query["GROUP"]) + "!!!!!!!" + typeof (query["APPLY"]))
            if (typeof (query["GROUP"]) !== "undefined" && typeof (query["APPLY"]) !== 'undefined')
            {
                validGETGROUPAPPLY = this.checkGetApplyGroupKeys(query);
                validGROUP = this.checkGroup(query);
                validAPPLY = this.checkApply(query);
            }
            else if ((typeof (query["GROUP"]) === 'undefined' && typeof (query["APPLY"]) !== 'undefined') ||
                (typeof (query["GROUP"]) !== 'undefined' && typeof (query["APPLY"]) === 'undefined'))
            {
                return false;
            }
            return (validGET && validWHERE && validORDER && validAS && validWHERE && validGROUP && validAPPLY && validGETGROUPAPPLY);
        }
        else
        {
            return false;
        }
    } //isValid

    private checkApply(query: QueryRequest):boolean{
        let getVals = query["APPLY"];
        let key = new RegExp('[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+');
        if (getVals.length === 0)
        {
            this.applyEmpty = true;
            return true;
        }
        else
        {
            for (let i = 0; i < getVals.length; i++)
            {
                // {string: {APPLYTOKEN: key}}
                for (let val in getVals[i])
                {
                    let validString = (typeof val === 'string');
                    if (validString === false)
                    {
                        return false;
                    }
                    for (let stringVal in getVals[i][val]){
                        let validAPPTOKEN = this.validApplyToken(stringVal);
                        let validKEY = key.test(getVals[i][val][stringVal]);
                        if (validAPPTOKEN === false || validKEY === false)
                        {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    } //checkAPPLY


    private validApplyToken(token: string):boolean {
        return (token === 'MAX' || token === 'MIN' || token === 'AVG' || token === 'COUNT');
    } //validApplyToken

    private checkGroup(query: QueryRequest): boolean{
        let getVals = query["GROUP"];
        let key = new RegExp('[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+');
        if (getVals.length === 0)
        {
            return false;
        }
        else
        {
            for (let gVal in getVals)
            {
                let vKey = key.test(getVals[gVal]);
                if (vKey === false)
                {
                    return false;
                }
            }
        }
        return true;
    } //checkGroup

    //  Returns whether or not the WHERE clause is valid
    private checkFilter(query: any, filter: any):boolean{
        let numberRegex = new RegExp("[1-9]*[0-9]+(.[0-9]+)?");
        let key = new RegExp('[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+');
        let sCompRegex = new RegExp("[*]?[a-zA-Z0-9,_-]+[*]?");

        if (filter === "AND" || filter === "OR"){
           // LOGICCOMPARISON ::= LOGIC ':[{' FILTER ('}, {' FILTER )* '}]'
            if (query[filter].length < 1)
            {
                return false;
            }
            let isAndReturn:boolean = true;
            for (let filtobj in query[filter])
            {
                let filteredObj:any = JSON.parse(JSON.stringify(query[filter][filtobj]));
                for (let filtval in filteredObj)
                {
                    if (!this.checkFilter(filteredObj, filtval))
                    {
                        isAndReturn = false;
                        break;
                    }
                }
            }
            return isAndReturn;
        }
        else if (filter === "LT" || filter === "GT" || filter === "EQ")
        {
           // MCOMPARISON ::= MCOMPARATOR ':{' key ':' number '}'
            let mcompvalue = query[filter];
            if (Object.keys(query[filter]).length !== 1)
            {
                return false;
            }
            for (let val in mcompvalue)
            {
                let tempkey = this.getKey(val.toString());
                let isValidKey: boolean = (tempkey !== "Invalid Key");
                return (isValidKey && key.test(val) && numberRegex.test(mcompvalue[val]));
            }
        }
        else if (filter === "IS")
        {
            // SCOMPARISON ::= 'IS:{' key ':' [*]? string [*]? '}'
            let scompvalue = query[filter];
            if (Object.keys(query[filter]).length !== 1)
            {
                return false;
            }
            for (let val in scompvalue)
            {
                let tempkey = this.getKey(val.toString());
                let isValidKey: boolean = (tempkey !== "Invalid Key");
                return (isValidKey && key.test(val) && sCompRegex.test(scompvalue[val]));
            }
        }
        else if (filter === "NOT")
        {
           // NEGATION ::= 'NOT :{' FILTER '}'
            let negate = query[filter];
            if (Object.keys(query[filter]).length !== 1)
            {
                return false;
            }
            for (let filt in query[filter])
            {
                return this.checkFilter(negate,filt);
            }
        }
        else
        {
            return false;
        }
    } //checkFilter

    // Returns whether GET part of the query is valid
    private checkGet(query: QueryRequest): boolean {
        // let key = new RegExp("[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+");
        // TODO: changed the value to a string instead of key for D2
        let getVals = query["GET"];
        let validGET: boolean = true;
        if (getVals.length === 0)
        {
            return false;
        }
        for (let i = 0; i < getVals.length; i++)
        {
            // let validKey:boolean = key.test(getVals[i]);
            let validKey:boolean = (typeof getVals[i] === 'string');
            if (!validKey)
            {
                validGET = false;
            }
        }
        return validGET;
    } //checkGet

    // Returns whether ORDER part of the query is valid
    // TODO: Make sure that all the values in order appear in get
    private checkOrder(query: QueryRequest): boolean{
        let key = new RegExp("[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+");
        for (let q in query)
        {
            if (q === "ORDER")
            {
                let getVals:any = query["ORDER"];
                if (typeof getVals === 'string')  //only one value for order
                {
                    return (key.test(getVals) || query.ORDER === "" || query.ORDER === null );
                }
                else
                {
                    let orderKeysInGet: boolean = true;
                    let getVals:any = query["GET"];
                    //{ dir:'  DIRECTION ', keys  : [ ' string (',' string)* ']}
                    for (let orderVal in getVals)
                    {
                        if (orderVal === 'dir')
                        {
                            // just check the dir value
                            let dirVal = this.checkDirection(getVals[orderVal]);
                            if (dirVal === false)
                            {
                                return false;
                            }
                        }
                        else if (orderVal === 'keys')
                        {
                            if (getVals[orderVal].length === 0)
                            {
                                return false;
                            }
                            for (let keysArrVal in getVals[orderVal])
                            {
                                Log.trace("ORDER KEY VALUE: " + keysArrVal);
                                let stringVal = (typeof keysArrVal === 'string');
                                orderKeysInGet = getVals.includes(keysArrVal);
                                if (stringVal === false || orderKeysInGet === false)
                                {
                                    return false;
                                }
                            }
                        }
                        else
                        { // key inside of the {dir...} was not dir or keys
                            return false;
                        }
                    }
                }
            }
            else
            {
                return true;
            }
        }
        return true;
    } //checkOrder

    private checkDirection(direction: string): boolean{
        return (direction === 'UP' || direction === 'DOWN');
    } //checkDirection

    //  Returns whether AS part of the query is valid
    private checkAs(query: QueryRequest): boolean {
        if (query.AS === "TABLE")
        {
            return true;
        }
        else
        {
            return false;
        }
    } //checkAs

    private checkGetApplyGroupKeys(query: QueryRequest): boolean {
        let getValues = query["GET"];
        let groupValues = query["GROUP"];
        let applyValues = query["APPLY"];
        let groupApplyLen: number = groupValues.length + applyValues.length;
        let allApplyKeys: string[] = [];
        if (groupApplyLen !== getValues.length)
        {
            return false;
        }
        for (let i in groupValues)
        {
            let groupVal = groupValues[i];
            Log.trace(groupVal);
            let containedGG = getValues.includes(groupVal);
            if (containedGG === false)
            {
                return false;
            }
        }
        if (applyValues.length != 0)
        {
            for (let applyVal in applyValues)
            {
                let applyObj: any = applyValues[applyVal];
                for (let applyKey in applyObj)
                {
                    // Log.trace(applyKey);
                    let duplicate: boolean = allApplyKeys.includes(applyKey);
                    let inGroup = groupValues.includes(applyKey);
                    let containedGA = getValues.includes(applyKey);
                    if (containedGA === false || inGroup === true || duplicate === true)
                    {
                        return false;
                    }
                    allApplyKeys.push(applyKey);
                }
            }
        }
        return true;
    } //checkGetApplyGroupKeys


    public query(query: QueryRequest): QueryResponse {
        if (this.isValid(query))
        {
            let response : any[];
            let queryResponse : QueryResponse = {};
            let getPresent: boolean = false;
            let wherePresent: boolean = false;
            let orderPresent:boolean = false;
            let groupPresent:boolean = false;
            let applyPresent:boolean = false;

            if (query.hasOwnProperty("WHERE"))
            {
                wherePresent = true;
                if (this.whereEmpty)
                {
                    response = [];
                    for (var myCurrentDataSet in this.datasets) {
                        var myDataList = this.datasets[myCurrentDataSet];
                        var resultList = JSON.parse(JSON.stringify(myDataList));
                        for (var keys in resultList)
                        {
                            var result = resultList[keys];
                            let valuesList = result["result"];

                            for (var values in valuesList)
                            {
                                var value = valuesList[values];
                                response.push(value);
                            }
                        }
                    }
                }
                else
                {
                    response = this.queryWhere(query.WHERE, response, false);
                }
            }

            if (query.hasOwnProperty("GROUP"))
            {
                // TODO: do something
                groupPresent = true;
                response = this.queryGroup(query.GROUP, response);
            }

            if (query.hasOwnProperty("APPLY"))
            {
                // TODO: do something
                applyPresent = true;
                //response = this.queryApply(query.APPLY, response);

            }

            if (query.hasOwnProperty("GET"))
            {
                getPresent = true;
                response = this.queryGet(query.GET, response);
            }

            if (query.hasOwnProperty("ORDER"))
            {
                let found : boolean = true;
                orderPresent = true;
                /*
                if (query.ORDER == "" || query.ORDER == null)
                {
                    found = true;
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
                */

                if (!found)
                {
                    return {status: 'failed', error: "invalid query"};
                }

                response = this.queryOrder(query.ORDER, response);
            }

            if (query.hasOwnProperty("AS"))
            {
                queryResponse = response;
                queryResponse = {result: queryResponse};
                queryResponse = this.queryAs(query.AS, queryResponse);
            }

            return queryResponse;
        }

        return {status: 'failed', error: "invalid query"};
    }// query

    /**
     * Trim the Dataset to based on the key
     *
     * @param key
     * @returns {QueryResponse}
     */
    private queryGet(key: string | string[], data: any[]): any[]
    {
        return this.getValue(key, data);
    }// queryGet

    /**
     * Group result together based on key
     *
     * @param key
     * @param data to group
     * @returns any[]
     */
    private queryGroup(key: string[], data: any[]): any[]
    {
        let groups : any[] = [];

        for(let i = 0; i < data.length; ++i)
        {
            let obj = data[i];
            if(groups.length === 0)
            {
                groups.push([obj]);
            }
            else
            {
                let equalGroup = false;
                for(var j = 0; j < groups.length; ++j){
                    var group = groups[j];
                    var equal = true;
                    let firstElement = group[0];
                    let that = this;
                    key.forEach(function(property){
                        let tempKey = that.getKey(String(property));
                        if(firstElement[tempKey] !== obj[tempKey]){
                            equal = false;
                        }
                    });

                    if (equal)
                    {
                        group.push(obj);
                        groups[j] = group;
                        equalGroup = true;
                    }
                }
                if (!equalGroup)
                {
                    groups.push([obj]);
                }
            }
        }

        let results : any[] = [];
        for(var i = 0; i < groups.length; ++i){
            for (var j = 0 ; j < groups[i].length; ++j)
            {
                results.push(groups[i][j]);
            }
        }

        return results;
    }// queryGroup

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
                                accResult = this.queryWhere(tempKey, resultList, isNot);

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
                                resultList = JSON.parse(JSON.stringify(myDataList));
                                if ('NOT' == i || 'OR' == i || 'AND' == i)
                                {
                                    accResult = this.queryWhere(tempKey, resultList, isNot);
                                }
                                else
                                {
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
    } // queryWhereHelper

    /**
     * order the query response to based on key
     *
     * @param key
     * @param data, QueryResponse that is being ordered
     * @returns {QueryResponse}
     */
    private queryOrder(key: string | any, data: any[]): any[]
    {
        let that = this;

        if (typeof key === 'string')  //only one value for order
        {
            data.sort(function (a, b) {
                let aString = String(a[key]).toUpperCase();
                let bString = String(b[key]).toUpperCase();
                /*
                 if (a[key] > b[key]) {
                 return 1;
                 }
                 if (a[key] < b[key]) {
                 return -1;
                 }
                 // a must be equal to b
                 return 0;
                 */
                return that.compareObject(aString, bString);
            });
            /*
            // ordering for number
            if (key == "courses_avg" || key == "courses_pass" ||
                key == "courses_fail"|| key == "courses_audit")
            {
                data.sort(function (a, b) {
                    let aString = String(a[key]).toUpperCase();
                    let bString = String(b[key]).toUpperCase();
                    /*
                     if (a[key] > b[key]) {
                     return 1;
                     }
                     if (a[key] < b[key]) {
                     return -1;
                     }
                     // a must be equal to b
                     return 0;

                    return that.compareObject(aString, bString);
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
            */
        }
        else
        {
            // it is an object with direction
            let direction : String;
            let keys : any[] = [];
            for (let k in key)
            {
                if ('dir' === k)
                {
                    direction = String(key[k]);
                }
                else if ('keys' === k )
                {
                    keys = key[k];
                    break;
                }
            }

            data.sort(function (a, b) {
                /*
                let tempKey :String;
                for (var i = 1; i < keys.length; ++i)
                {
                    tempKey = keys[i];
                    break;
                }
                */
                let aString = String(a[keys[0]]).toUpperCase();
                let bString = String(b[keys[0]]).toUpperCase();
                let result: number = that.compareObject(aString, bString);
                if (0 !== result) {
                    if ('UP' === direction)
                    {
                        return result;
                    }
                    else
                    {
                        // DOWN
                        return result * -1;
                    }
                }
                else
                {
                    /*
                    if (key.length === 1)
                    {
                        return 0;
                    }
                    */

                    // it is a tie
                    Log.trace("checking here");
                    for (var i = 1; i < keys.length; ++i)
                    {
                        aString = String(a[keys[i]]).toUpperCase();
                        bString = String(b[keys[i]]).toUpperCase();

                        let result: number = that.compareObject(aString, bString);
                        if (0 !== result)
                        {
                            Log.trace("continue");
                            if ('UP' === direction)
                            {
                                return result;
                            }
                            else
                            {
                                // DOWN
                                return result * -1;
                            }
                        }
                    }

                    return 0;
                }
            });
        }

        return data;
    } // queryOrder

    /**
     * helper for comparing objects
     *
     * @param a, b
     * @returns the value of comparison
     */
    private compareObject(a : String, b : String) : number
    {
        if ( a > b ) {
            return 1;
        }
        else if (a < b) {
            return -1;
        }
        else
        {
            return 0;
        }
    } // compareObject


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
    } // queryAs

    /**
     * Get the corresponding key in the dataset
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
        else if ("courses_uuid" == key)
        {
            tempKey = "id";
        }
        else
        {
            tempKey = "Invalid Key";
        }

        return tempKey;
    } //getKey

    /**
     * Get the corresponding values based on the key in the dataset
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
