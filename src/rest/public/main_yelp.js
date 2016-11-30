$(function () {

    $("#queryForm").submit(function (e) {
        e.preventDefault();
        console.log("Submitting query");

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

        var parameters = {};
        parameters['term']= 'food';
        parameters['location'] = 'Vancouver, CA';
        parameters['cc'] = 'CA';
        var address = $("#address").val();
        var distance = $("#radius").val();
        var category = $("#category").val().toLowerCase();

        if (distance !== '')
        {
            parameters['radius_filter'] = distance;
        }

        if (address !== '')
        {
            parameters['location'] = address + ' Vancouver, CA';
        }

        if (category !== '')
        {
            parameters['category_filter'] = category;
        }

        try {
            $.ajax("/queryYelp", {type:"POST", data: JSON.stringify(parameters), contentType: "application/json", dataType: "json", success: function(data) {
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