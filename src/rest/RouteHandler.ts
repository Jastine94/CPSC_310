/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');
import {IInsightFacade} from '../controller/IInsightFacade';
import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import {fullResponse} from "restify";
import InsightFacade from "../controller/InsightFacade";

export default class RouteHandler {

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');

        fs.readFile('./src/rest/views/index_courses.html', 'utf8', function (err: Error, file: Buffer) {
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
                // Log.trace(JSON.stringify(result.body))
                res.json(result.code, result.body);

            }).catch(function (error)
            {
                res.json(error.code, error.body);
            })
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
            });
        } catch (error)
        {
            //Log.error('RouteHandler::deleteDataset(..) - ERROR: ' + error.message);
            res.send(404, {error: error.message});
        }
        return next();
    }
}
