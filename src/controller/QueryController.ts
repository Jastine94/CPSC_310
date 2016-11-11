/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import fs = require('fs');
import get = Reflect.get;

export interface QueryRequest {
    GET: string[];
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
        let queryString = JSON.stringify(query);
        if ( Object.keys(query).length === 0 || typeof query === 'undefined' || query === null)
        {
            return false;
        }
        else if (queryString.match('rooms') && queryString.match('courses'))
        {
            return false;
        }
        else if (query.hasOwnProperty("GET") && query.hasOwnProperty("WHERE") && query.hasOwnProperty("AS"))
        {
            let validGET:boolean = this.checkGet(query);
            let validORDER:boolean = this.checkOrder(query);
            let validAS:boolean = this.checkAs(query);
            let validWHERE: boolean = true;
            let validGROUP:boolean = true;
            let validAPPLY:boolean = true;
            let validGETGROUPAPPLY: boolean = true;
            if (Object.keys(query.WHERE).length === 0)
            {
                this.whereEmpty = true;
            }
            else {
                for (let filter in query.WHERE) {
                    validWHERE = this.checkFilter(query.WHERE, filter);
                    if (validWHERE === false) {
                        return false;
                    }
                }
            }
            if (typeof (query["GROUP"]) !== "undefined" && typeof (query["APPLY"]) !== 'undefined')
            {
                validGROUP = this.checkGroup(query);
                validAPPLY = this.checkApply(query);
                validGETGROUPAPPLY =  this.checkGetApplyGroupKeys(query);
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
                /*let tempkey = this.getKey(val.toString());
                 let isValidKey: boolean = (tempkey !== "Invalid Key");
                 return (isValidKey && key.test(val) && numberRegex.test(mcompvalue[val]));*/
                return (/*isValidKey && */key.test(val) && numberRegex.test(mcompvalue[val]));
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
                /*let tempkey = this.getKey(val.toString());
                 let isValidKey: boolean = (tempkey !== "Invalid Key");
                 return (isValidKey && key.test(val) && sCompRegex.test(scompvalue[val]));*/
                return (/*isValidKey &&*/ key.test(val) && sCompRegex.test(scompvalue[val]));
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
        let getVals = query["GET"];
        let validGET: boolean = true;
        if (getVals.length === 0)
        {
            return false;
        }
        for (let i = 0; i < getVals.length; i++)
        {
            let validKey:boolean = (typeof getVals[i] === 'string');

            if (!validKey)
            {
                validGET = false;
            }
        }
        return validGET;
    } //checkGet

    // Returns whether ORDER part of the query is valid
    private checkOrder(query: QueryRequest): boolean{
        let orderVals:any = query["ORDER"];
        let key = new RegExp("[a-zA-Z0-9,_-]+_[a-zA-Z0-9,_-]+");
        let getVals:any = query["GET"];
        if (typeof orderVals === 'undefined')
        {
            return true;
        }
        else if (typeof orderVals === 'string')
        {
            let validKey = (this.getKey(orderVals) !== "Invalid Key");
            let inGET = getVals.includes(orderVals);
            return ((validKey && inGET && key.test(orderVals)) ||
            query.ORDER === "" /*|| query.ORDER === null*/ );
            // return (key.test(orderVals) || query.ORDER === "" /*|| query.ORDER === null*/ );
        }
        else
        {
            let orderKeysInGet: boolean = true;
            //{ dir:'  DIRECTION ', keys  : [ ' string (',' string)* ']}
            for (let orderVal in orderVals)
            {
                // Log.trace("ORDER VAL IS" + orderVal)
                if (orderVal === 'dir')
                {   // just check the dir value
                    let dirVal = this.checkDirection(orderVals[orderVal]);
                    if (dirVal === false)
                    {
                        return false;
                    }
                }
                else if (orderVal === 'keys')
                {
                    if (orderVals[orderVal].length === 0)
                    {
                        return false;
                    }
                    let keysArray = orderVals[orderVal];
                    for (let keysArrVal in keysArray)
                    {
                        let stringVal = (typeof keysArray[keysArrVal] === 'string');
                        orderKeysInGet = getVals.includes(keysArray[keysArrVal]);
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
            // Log.trace(groupVal);
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
        let response : any[];
        let queryResponse : QueryResponse = {};
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

        if (query.hasOwnProperty("GROUP"))
        {
            response = this.queryGroup(query.GROUP, response);
        }

        if (query.hasOwnProperty("APPLY"))
        {
            if (!this.applyEmpty)
            {
                response = this.queryApply(query.APPLY, response);
            }
        }

        if (query.hasOwnProperty("GET"))
        {
            response = this.queryGet(query.GET, response);
        }

        if (query.hasOwnProperty("ORDER"))
        {
            response = this.queryOrder(query.ORDER, response);
        }

        if (query.hasOwnProperty("AS"))
        {
            queryResponse = response;
            queryResponse = {result: queryResponse};
            queryResponse = this.queryAs(query.AS, queryResponse);
        }

        return queryResponse;
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

        if (this.applyEmpty)
        {
            for(var i = 0; i < groups.length; ++i){
                for (var j = 0 ; j < groups[i].length; ++j)
                {
                    results.push(groups[i][j]);
                    break;
                }
            }
        }
        else
        {
            results = groups;
        }

        return results;
    }// queryGroup

    /**
     * apply token to each object in grouped array
     *
     * @param key
     * @param data to group
     * @returns any[]
     */
    private queryApply(key: any[], data: any[]): any[]
    {
        let result : any[] = [];

        for(let i = 0; i < key.length; ++i)
        {
            let tempKey = key[i];

            for (let token in tempKey)
            {
                let applyToken = tempKey[token];

                for (let to in applyToken)
                {
                    if ("MAX" == to)
                    {
                        result = this.queryApplyMax(applyToken, data, token.toString());
                        console.log("MAX");
                    }
                    else if ("COUNT" == to)
                    {
                        result = this.queryApplyCount(applyToken, data, token.toString());
                        console.log("COUNT");
                    }
                    else if ("MIN" == to)
                    {
                        result = this.queryApplyMin(applyToken, data, token.toString());
                        console.log("MIN");
                    }
                    else if ("AVG" == to)
                    {
                        result = this.queryApplyAvg(applyToken, data, token.toString());
                        console.log("AVG");
                    }
                }

            }
        }

        // get only the first result
        let results : any[] = [];
        for(var i = 0; i < result.length; ++i) {
            for (var j = 0; j < result[i].length; ++j) {
                results.push(result[i][j]);
                break;
            }
        }

        return results;
    } // queryApply

    /**
     * get the max of each group based on key
     *
     * @param key
     * @param data to apply token to
     * @param name to call the result from apply as
     * @returns any[]
     */
    private queryApplyMax(key: any, data: any[], name:string): any[]
    {
        let max : number = 0;
        for (let i = 0 ; i < data.length; ++i)
        {
            for (let token in key)
            {
                let id = String(key[token]);
                for (let values in data[i]) {
                    for (let instance in data[i][values]) {
                        let tempKey = this.getKey(id.toString());
                        if (tempKey === String(instance)) {
                            //JSON.stringify("max" + max  + "to Compare" + String(data[i][values][instance]));
                            if (max < Number(data[i][values][instance]))
                            {
                                max = Number(data[i][values][instance]);
                            }
                        }
                    }
                }
            }

            for (let values in data[i])
            {
                data[i][values][name] = max;
            }

            max = 0;
        }

        return data;
    } // queryApplyMax

    /**
     * get the min of each group based on key
     *
     * @param key
     * @param data to apply token to
     * @param name to call the result from apply as
     * @returns any[]
     */
    private queryApplyMin(key: any, data: any[], name:string): any[]
    {
        let min : number = Number.MAX_VALUE;
        for (let i = 0 ; i < data.length; ++i)
        {
            for (let token in key)
            {
                let id = String(key[token]);
                for (let values in data[i]) {
                    for (let instance in data[i][values]) {
                        let tempKey = this.getKey(id.toString());
                        if (tempKey === String(instance)) {
                            if (min > Number(data[i][values][instance]))
                            {
                                min = Number(data[i][values][instance]);
                            }
                        }
                    }
                }
            }

            for (let values in data[i])
            {
                data[i][values][name] = min;
            }

            min = Number.MAX_VALUE;
        }

        return data;
    } // queryApplyMin

    /**
     * get the avg of each group based on key
     *
     * @param key
     * @param data to apply token to
     * @param name to call the result from apply as
     * @returns any[]
     */
    private queryApplyAvg(key: any, data: any[], name:string): any[]
    {
        let total = 0;
        let n = 0;
        for (let i = 0 ; i < data.length; ++i)
        {
            for (let token in key)
            {
                let id = String(key[token]);
                for (let values in data[i]) {
                    for (let instance in data[i][values]) {
                        let tempKey = this.getKey(id.toString());
                        if (tempKey === String(instance)) {
                            n++;
                            total += data[i][values][instance];
                        }
                    }
                }
            }

            let average : number = Number((total / n).toFixed(2));

            for (let values in data[i])
            {
                data[i][values][name] = average;
            }

            n = 0;
            total = 0;
        }

        return data;
    } // queryApplyAvg


    /**
     * get the count of each group based on key
     *
     * @param key
     * @param data to apply token to
     * @param name to call the result from apply as
     * @returns any[]
     */
    private queryApplyCount(key: any, data: any[], name:string): any[]
    {
        for (let i = 0 ; i < data.length; ++i)
        {
            let count : any[] = [];

            for (let token in key)
            {
                let id = String(key[token]);
                for (let values in data[i]) {
                    for (let instance in data[i][values]) {
                        let tempKey = this.getKey(id.toString());
                        if (tempKey === String(instance)) {
                            if (!this.checkArrayForCount(count, data[i][values][instance]))
                            {
                                count.push(data[i][values][instance]);
                            }
                        }
                    }
                }
            }

            for (let values in data[i])
            {
                data[i][values][name] = count.length;
            }
        }

        return data;
    } // queryApplyCount

    private checkArrayForCount(currentCount : any [], itemToAdd : any) : boolean
    {
        let isDuplicate : boolean = false;

        for (var i = 0 ; i < currentCount.length; ++i)
        {
            if (currentCount[i] === itemToAdd)
            {
                isDuplicate = true;
                break;
            }
        }

        return isDuplicate;
    }


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
                                //Log.trace("Should be here");

                                // need to remove the not items that is in the accResult so far
                                trimResult = this.queryWhere(tempKey, trimResult, !isNot);
                                accResult = this.queryWhere(tempKey, resultList, isNot);

                                //Log.trace("Trimed Result is" + JSON.stringify(trimResult));

                                for (var values in trimResult)
                                {
                                    var value = trimResult[values];
                                    if (!this.isDuplicate(accResult, value))
                                    {
                                        //Log.trace("Should never hit here");
                                        accResult.push(value);
                                    }
                                }
                            }
                            else
                            {
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
                                    accResult = this.queryWhereHelper(tempKey, resultList, emptyList, isNot, false);
                                }
                            }
                            else
                            {
                                emptyList = [];
                                let newList: any[] = [];
                                newList.push({"result": accResult});
                                //console.log("ResultList" + JSON.stringify((newList)));

                                // handle case where not is in inside and
                                if ('AND' == i || 'OR' == i)
                                {
                                    accResult = this.queryWhere(tempKey, newList, isNot);
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
        let numberRegex = new RegExp("[1-9]*[0-9]+(.[0-9]+)?");

        if (typeof key === 'string')  //only one value for order
        {
            data.sort(function (a, b) {
                let aString : any;
                let bString : any;
                if (numberRegex.test(a[key]) && numberRegex.test(b[key]))
                {
                    aString = a[key];
                    bString = b[key];
                }
                else
                {
                    aString = String(a[key]).toUpperCase();
                    bString = String(b[key]).toUpperCase();
                }

                return that.compareObject(aString, bString);
            });
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
                let aString : any;
                let bString : any ;
                if (numberRegex.test(a[keys[0]]) && numberRegex.test(b[keys[0]]))
                {
                    aString = a[keys[0]];
                    bString = b[keys[0]];
                }
                else
                {
                    aString = String(a[keys[0]]).toUpperCase();
                    bString = String(b[keys[0]]).toUpperCase();
                }

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
                    // it is a tie
                    for (var i = 1; i < keys.length; ++i)
                    {
                        aString = String(a[keys[i]]).toUpperCase();
                        bString = String(b[keys[i]]).toUpperCase();

                        let result: number = that.compareObject(aString, bString);
                        if (0 !== result)
                        {
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
    private getKey(key: string): string
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
        else if ("courses_year" == key)
        {
            tempKey = "Year";
        }
        else if ("rooms_fullname" == key || "rooms_shortname" == key || "rooms_number" == key || "rooms_name" == key ||
            "rooms_address" == key || /*"rooms_lat" == key || "rooms_lon" == key ||*/ "rooms_seats" == key ||
            "rooms_type" == key || "rooms_furniture" == key || "rooms_href" == key )
        {
            tempKey = key.toString();
        }
        else if ("rooms_lat" == key)
        {
            tempKey = "Lat";
        }
        else if ("rooms_lon" == key)
        {
            tempKey = "Lon";
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
                    else if (!key[i].includes("_") && key[i].toString() == String(instance))
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
            if ((typeof (resultList[i]["id"])) !== 'undefined')
            {
                if (resultList[i]["id"] == instance["id"])
                {
                    isDuplicate = true;
                    break;
                }
            }
            else if ((typeof (resultList[i]["rooms_name"] !== 'undefined')))
            {
                if (resultList[i]["rooms_name"] == instance["rooms_name"])
                {
                    isDuplicate = true;
                    break;
                }
            }
        }

        return isDuplicate;
    } // isDuplicate
}