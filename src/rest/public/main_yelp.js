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

        // var building = $("#postalCode").val();
        var postalCode = $("#postalCode").val();
        var food = $("#category").val();
        var radius = $("#radius").val();
        /*
        var lat = 0, lon = 0, latlon = "";
        var buildinglatlonquery = '{' +
            '"GET": ["rooms_shortname", "rooms_lat", "rooms_lon"],' +
            '"WHERE": {"IS": {"rooms_shortname": "' + building + '"}},' +
            '"GROUP": ["rooms_shortname", "rooms_lat", "rooms_lon"], "APPLY": [], "AS": "TABLE"}';

        try {
            $.ajax("/query", {
                type: "POST",
                data: buildinglatlonquery,
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    if (data["render"] === "TABLE") {
                        lat = data["result"][0]["rooms_lat"];
                        lon = data["result"][0]["rooms_lon"];
                        console.log("THIS LAT LON IS ", lat, lon)
                        latlon = '"'+lat+','+lon+'"';

                        var query = '{"term": "'+ food +'", "ll":' + latlon +', "radius": ' + radius+ '}';
                        // var query = '{"term": "sushi", "ll": "40.748068,-73.985056"}';
                        try {
                            $.ajax("/queryYelp", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                                console.log(data);
                                console.log("Done");
                                $("#render").val(data);
                                var d = parseRestaurant(data);
                                generateTable(d);

                            }}).fail(function (e) {
                                spawnHttpErrorModal(e)
                            });
                        } catch (err) {
                            spawnErrorModal("Query Error", err);
                        }
                    }
                }
            }).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
        */

<<<<<<< HEAD
                console.log("Done");

=======
        var query = '{"term": "'+ food +'", "location":"' + postalCode + '"}';
        try {
            $.ajax("/queryYelp", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
>>>>>>> 548153908413eab7b6e030b99a18b4d2bcb64a77
                console.log(data);
                console.log("Done");
                $("#render").val(data);
                var d = parseRestaurant(data);
                generateTable(d);

            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }

    });

    function parseRestaurant(data){
        var allRest = [];
        var businesses = data.businesses;
        if (typeof businesses != 'undefined')
        {
            for (var res = 0; res < businesses.length; res++) {
                var restaurant = {};
                var address = businesses[res].location.address[0] + ', ' + businesses[res].location.city;
                restaurant["Restaurant Name"] = businesses[res].name;
                restaurant["Phone Number"] = businesses[res].display_phone;
                restaurant["Address"] = address;
                restaurant["Yelp Rating"] = businesses[res].rating + '/5';
                restaurant["Yelp URL"] = '<a href='+businesses[res].url+'>'+restaurant["Restaurant Name"] + ' Yelp Review</a>';
                allRest.push(restaurant);
            }
        }
        return allRest;
    }


    function generateTable(data) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title,
                cl: "title",
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select("#render");
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").style("margin", "auto");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                return d["cl"]
            })
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }

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