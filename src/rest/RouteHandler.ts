/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import {fullResponse} from "restify";

export default class RouteHandler {

    private static datasetController = new DatasetController();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::putDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::putDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::putDataset(..) on end; total length: ' + req.body.length);

                let controller = RouteHandler.datasetController;
                let exists = controller.getDataset(id);
                Log.trace("The current " + id +": exists? " + (exists !== null));

                controller.process(id, req.body).then(function (result) {
                    Log.trace('RouteHandler::putDataset(..) - processed');
                    if (exists !== null){
                        res.json(201, {success: result}); //this is replacing an existing id
                        Log.trace('201 Success: '+result);
                    }
                    else {
                        res.json(204, {success: result}); //this is a new id
                        Log.trace('204 Success: '+result);
                    }
                    // TODO: make sure that it handles a zip with invalid files
                    //need to check if the id is new or just replaced
                }).catch(function (err: Error) {
                    Log.trace('--  RouteHandler::putDataset(..) - ERROR: ' + err.message);
                    res.json(400, {err: err.message});
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;
            let datasets: Datasets = RouteHandler.datasetController.getDatasets();
            Log.trace("Retrieved all the datasets");
            let controller = new QueryController(datasets);
            let isValid = controller.isValid(query);

            // if (Object.keys(datasets).length === 0)
            // check if the dataset has it, if not it has to have a missing
            // TODO: Check if the data is on disk if it is not in the dataset since it can shutdown between put & post
            // 200: the query was successfully answered. The result should be sent in JSON according in the response body.
            // 424: the query failed because it depends on a resource that has not been PUT. The body should contain {missing: ['id1', 'id2'...]}.
            // 400: the query failed; body should contain {error: 'my text'} providing extra detail.

            Log.trace("Query is valid? " + isValid);
            if (isValid === true) {
                let result:any = controller.query(query);
                Log.trace("Completed querying it");
                Log.trace("result is: " + result);
                for (let i in result){
                    console.log (i, result[i]); //only for printing purposess, todo: take out before commit
                }
                res.json(200, result);
                Log.trace("200 Successful");
            } else {
                res.json(400, {status: 'Invalid query'});
                Log.trace("400 Error - Invalid query");
            }
        } catch (err) {
            Log.error('RouteHandler::postQuery(..) - ERROR: '  + err);
            res.send(400);
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));


        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::deleteDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::deleteDataset(..) on end; total length: ' + req.body.length);

                // need to edit the following code to delete the dataset
                let controller = RouteHandler.datasetController;

                // Todo: else you can break the loop possibly
                // also have to delete the dataset in the data folder
                controller.deleteDataset(id).then(function (result) {
                    Log.trace('RouteHandler::deleteDataset(..) - processed');
                    res.json(204, {success: result}); //dataset was deleted
                    Log.trace("204 Sucessfully deleted");
                }).catch(function (err: Error) {
                    res.json(404, {err: err.message});
                    Log.trace('RouteHandler::deleteDataset(..) - ERROR: ' + err.message);
                });
            });

        } catch (err) {
            Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + err.message);
            res.send(404, {err: err.message});
        }
        return next();

    }
}
