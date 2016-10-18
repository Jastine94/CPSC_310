/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';
import {IInsightFacade} from '../controller/IInsightFacade';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import {fullResponse} from "restify";
import InsightFacade from "../controller/InsightFacade";

export default class RouteHandler {

    private static datasetController = new DatasetController();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                //Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::putDataset(..) - params: ' + JSON.stringify(req.params));
        try
        {
            var id: string = req.params.id;
            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any)
            {
                //Log.trace('RouteHandler::putDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });
            req.once('end', function ()
            {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');

                let insightFacade: IInsightFacade = new InsightFacade;
                insightFacade.addDataset(id, req.body).then(function(result)
                {
                    res.json(result.code, result.body);

                }).catch(function (error)
                {
                    res.json(error.code, error.body);
                })
                //Log.trace('RouteHandler::putDataset(..) on end; total length: ' + req.body.length);
                // let controller = RouteHandler.datasetController;
                // let exists: boolean = fs.existsSync(__dirname + "\/..\/..\/data\/" +id+'.json');
                // //Log.trace("The current " + id +": exists? " + (exists !== null));
                // controller.process(id, req.body).then(function (result)
                // {
                //     //Log.trace('RouteHandler::putDataset(..) - processed');
                //     if (exists)
                //     {   //this is replacing an existing id
                //         res.json(201, {success: result});
                //         // Log.trace('201 Success: '+result);
                //     }
                //     else
                //     {    //this is a new id
                //         res.json(204, {success: result});
                //         // Log.trace('204 Success: '+result);
                //     }
                // }).catch(function (error: Error)
                // {
                //     //Log.trace('--  RouteHandler::putDataset(..) - ERROR: ' + err.message);
                //     res.json(400, {error: error.message});
                // });
            });

        } catch (error)
        {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + error.message);
            res.send(400, {error: error.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        //Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try
        {
            let query: QueryRequest = req.params;

            let insightFacade: IInsightFacade = new InsightFacade;
            insightFacade.performQuery(query).then(function(result)
            {
                res.json(result.code, result.body);

            }).catch(function (error)
            {
                res.json(error.code, error.body);
            })

            // let datasets: Datasets = RouteHandler.datasetController.getDatasets();
            // let controller = new QueryController(datasets);
            // let isValid = controller.isValid(query);
            // Log.trace("Query is valid? " + isValid);
            // if (isValid)
            // {
            //     let value = req.params["GET"];
            //     let missing_id: string[] = [];
            //     for (let i = 0; i < value.length; i++)
            //     {
            //         let temp_pos = value[i].indexOf("_");
            //         let id = value[i].substring(0, temp_pos);
            //         if (!(fs.existsSync(__dirname + "\/..\/..\/data\/" + id + ".json")))
            //         {
            //             missing_id.push(id);
            //         }
            //     }
            //     if (missing_id.length > 0)
            //     {
            //         let mids: any = {};
            //         mids["missing"] = missing_id;
            //         res.json(424, mids);
            //         Log.trace("424 Missing: " + JSON.stringify(mids));
            //     }
            //     else
            //     {
            //         let result: any = controller.query(query);
            //         if (result.status === "failed")
            //         {
            //             res.json(400, {error: 'Invalid query'});
            //             Log.trace("400 Invalid query");
            //         }
            //         else
            //         {
            //             res.json(200, result);
            //             Log.trace("200 Successful");
            //         }
            //     }
            // }
            // else
            // {
            //     res.json(400, {error: 'Invalid query'});
            //     Log.trace("400 Error - Invalid query");
            // }
        }
        catch (error)
        {
            //Log.error('RouteHandler::postQuery(..) - ERROR: '  + error);
            res.send(400);
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));
        try
        {
            var id: string = req.params.id;
            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any)
            {
                //Log.trace('RouteHandler::deleteDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });
            req.once('end', function ()
            {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');


                let insightFacade: IInsightFacade = new InsightFacade;
                insightFacade.removeDataset(id).then(function(result)
                {
                    res.json(result.code, result.body);

                }).catch(function (error)
                {
                    res.json(error.code, error.body);
                })

                //Log.trace('RouteHandler::deleteDataset(..) on end; total length: ' + req.body.length);
                // let controller = RouteHandler.datasetController;
                // controller.deleteDataset(id).then(function (result)
                // {
                //     //Log.trace('RouteHandler::deleteDataset(..) - processed');
                //     res.json(204, {success: result}); //dataset was deleted
                //     //Log.trace("204 Sucessfully deleted");
                // }).catch(function (error: Error)
                // {
                //     res.json(404, {error: "Dataset does not exist"});
                //     //Log.trace('RouteHandler::deleteDataset(..) - ERROR: ' + error.message);
                // });
            });
        } catch (error)
        {
            //Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + error.message);
            res.send(404, {error: error.message});
        }
        return next();
    }
}
