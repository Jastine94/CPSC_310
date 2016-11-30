$(function () {

    $("#queryForm").submit(function (e) {
        e.preventDefault();
        console.log("Submitting query");
        /*
         var auth = {
         //
         // Update with your auth tokens.
         //
         // TODO: remove this before commit
         consumerKey : "Pw7sip730OyT18b",
         consumerSecret : "2vrIqHQadJkXujSIVjp7_dgQQ_4",
         accessToken : "M4UX3_3aAPZLAfUq2xPoMbWH67qHxoUm",
         accessTokenSecret : "BHOovNwQn5HwSJ1iPkhQGuSzAYg",
         serviceProvider : {
         signatureMethod : "HMAC-SHA1"
         }
         };

         var terms = 'food';
         var near = 'Vancouver';
         //var cc = 'CA';

         var accessor = {
         consumerSecret : auth.consumerSecret,
         tokenSecret : auth.accessTokenSecret
         };

         var parameters = [];
         parameters.push(['term', terms]);
         parameters.push(['location', near]);
         //parameters.push(['cc', cc]);
         //parameters.push(['callback', 'callback']);
         parameters.push(['oauth_consumer_key', auth.consumerKey]);
         parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
         parameters.push(['oauth_token', auth.accessToken]);
         //parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

         var message = {
         'action' : 'http://api.yelp.com/v2/search',
         'method' : 'GET',
         'parameters' : parameters
         };

         OAuth.setTimestampAndNonce(message);
         OAuth.SignatureMethod.sign(message, accessor);
         var parameterMap = OAuth.getParameterMap(message.parameters);
         console.log(parameterMap);

         parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

         var url = OAuth.addToURL(message.action,parameterMap);
         console.log(String(url));
         var response = UrlFetchApp.fetch(url).getContentText();
         var responseObject = Utilities.jsonParse(response);

         console.log(JSON.stringify(responseObject));

         $.ajax({
         'url': 'https://api.yelp.com/v2/search',
         'data': parameterMap,
         'dataType': 'jsonp',
         'jsonpCallback' : 'callback',
         }).done(function(data, textStatus, jqXHR) {
         console.log('success[' + data + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
         }
         ).fail(function(jqXHR, textStatus, errorThrown) {
         console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
         }
         );

         console.log("Done");
         */
        var query = "";
        try {
            $.ajax("/queryYelp", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {

                console.log("Done");

                console.log(data);

                console.log("Done");

            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }});

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }
});