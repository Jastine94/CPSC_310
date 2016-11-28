$(function () {
    $("#datasetAdd").click(function () {
        var id = $("#datasetId").val();
        var zip = $("#datasetZip").prop('files')[0];
        var data = new FormData();
        data.append("zip", zip);
        $.ajax("/dataset/" + id,
            {
                type: "PUT",
                data: data,
                processData: false
            }).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $("#datasetRm").click(function () {
        var id = $("#datasetId").val();
        $.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $("#roomSchedulingForm").submit(function (e) {
        e.preventDefault();
        var listofcourses = $("#courses").val();
        var coursesSet = [], roomsSet =[];
        var coursesFilt = filterByCourses(listofcourses);
        var coursesquery = '{"GET": ["courses_dept", "courses_id", "numSections", "courses_size"], ' +
            '"WHERE": { "AND": [' +
                            '{"IS": {"courses_year":"2014"}},'  + coursesFilt + ']},' +
            '"GROUP": [ "courses_dept", "courses_id","courses_size" ],' +
            '"APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ], "ORDER": { "dir": "UP", "keys": ["courses_size"]}, "AS": "TABLE"}';

        try {
            $.ajax("/query", {type:"POST", data: coursesquery, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    // console.log("COURSES DATA: ", JSON.stringify(data));
                    coursesSet = calculateSections(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }


        var startBuilding = $("#startbuilding").val();
        var distance = $("#distance").val();
        var listofrooms = $("#buildings").val();
        console.log(startBuilding,distance,listofrooms)

        if (startBuilding != "" && distance !="") {
            var boundingBox = [], lat = 0, lon = 0;
            distance = distance / 1000; //convert into kilometers

            var buildinglatlonquery = '{' +
                '"GET": ["rooms_shortname", "rooms_lat", "rooms_lon"],' +
                '"WHERE": {"IS": {"rooms_shortname": "' + startBuilding + '"}},' +
                '"GROUP": ["rooms_shortname", "rooms_lat", "rooms_lon"], "APPLY": [], "AS": "TABLE"}';

            try {
                $.ajax("/query", {
                    type: "POST",
                    data: buildinglatlonquery,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (data) {
                        // console.log("WER ARE NO IN THE QUERYING OF THE BUILDING")
                        if (data["render"] === "TABLE") {
                            lat = data["result"][0]["rooms_lat"];
                            lon = data["result"][0]["rooms_lon"];
                            boundingBox = calculateBoundingBox(lat, lon, distance);
                            queryBoundingBox(boundingBox, coursesSet); //queries and sets it as a table
                        }
                    }
                }).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            } catch (err) {
                spawnErrorModal("Query Error", err);
            }

        }

        else if (listofrooms != "")
        {
            var roomsFilt = filterByRooms(listofrooms);
            var roomsquery ='{"GET": ["rooms_name","rooms_seats"],' + '"WHERE": ' + roomsFilt + ',' +
                '"GROUP": [ "rooms_name", "rooms_seats"], "APPLY": [], "ORDER": { "dir": "UP", "keys": ["rooms_seats"]}, "AS": "TABLE"}';

            try {
                $.ajax("/query", {type:"POST", data: roomsquery, contentType: "application/json", dataType: "json", success: function(data) {
                    if (data["render"] === "TABLE") {
                        roomsSet = data["result"];
                        var table = scheduleCourses(coursesSet, roomsSet);
                        // console.log(JSON.stringify(table));
                        generateTable(table);
                    }
                }}).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            } catch (err) {
                spawnErrorModal("Query Error", err);
            }
        }

    });


    function queryBoundingBox(boundingBox, coursesSet) {
        var latMin = boundingBox[0];
        var latMax = boundingBox[1];
        var lonMin = boundingBox[2];
        var lonMax = boundingBox[3];

        var boundingBoxQuery = '{"GET": ["rooms_name","rooms_seats"],' + '"WHERE": {"AND": [' +
            '{"GT": {"rooms_lat": ' + latMin + '}},' + '{"LT": {"rooms_lat": ' + latMax + '}},' +
            '{"GT": {"rooms_lon": ' + lonMin + '}},' + '{"LT": {"rooms_lon": ' + lonMax + '}}]},' +
            '"GROUP": [ "rooms_name", "rooms_seats"],"APPLY": [],"ORDER": { "dir": "UP", "keys": ["rooms_seats"]},"AS": "TABLE"}';
        try {
            $.ajax("/query", {type:"POST", data: boundingBoxQuery, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    var roomsSet = data["result"];
                    var table = scheduleCourses(coursesSet, roomsSet);
                    generateTable(table)
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    }

    function scheduleCourses(coursesSet, roomsSet){
        // console.log("TIME TO SCHEDULE COURSES NOW")
        var courses = coursesSet, rooms = roomsSet;
        var unscheduledCourses = [], notfrom8to5 = 0;
        for (var c = 0; c < courses.length; c++)
        {
            var numSections = courses[c]['numSections'];
            var coursesize = courses[c]['courses_size'];
            for (var ns = 0; ns < numSections; ns++)
            {
                var filled = false;
                for (var r = 0; r < rooms.length; r ++)
                {
                    var roomsize = rooms[r]['rooms_seats'];
                    if (filled){
                        break;
                    }
                    if (coursesize <= roomsize &&
                        (typeof ( rooms[r]['timetable']) == 'undefined' || rooms[r]['timetable'].length < 15))
                    {
                        filled = putCourseIntoRoom(courses[c],rooms[r]);
                    }
                    else if (coursesize <= roomsize && rooms[r]['timetable'].length < 41)
                    {
                        var nextr = r + 1;
                        if (typeof (rooms[nextr]) != 'undefined' &&
                            (typeof (rooms[nextr]['timetable']) == 'undefined' || rooms[nextr]['timetable'].length < 15))
                        {
                           filled = putCourseIntoRoom(courses[c], rooms[nextr]);
                        }
                        else
                        {
                            filled = putCourseIntoRoom(courses[c], rooms[r]);
                            notfrom8to5 += 1;
                        }
                    }
                }
                if (filled == false)
                {
                    unscheduledCourses.push({"course": courses[c]["courses_dept"] + courses[c]["courses_id"],
                        "course_size": courses[c]["courses_size"],
                        "room": "Unable to fit class into selected rooms",
                        "room seats": "N/A",
                        "time": "N/A"});
                }
            }
        }
        var renderTimetable = [];
        for (var ro in rooms)
        {
            if (typeof (rooms[ro]["timetable"]) != 'undefined')
            {
                mapArrayToTime(rooms[ro]["timetable"]);
                renderTimetable = renderTimetable.concat(rooms[ro]["timetable"]);
            }
        }
        renderTimetable = renderTimetable.concat(unscheduledCourses);
        console.log("rednered tt length: ", renderTimetable.length, unscheduledCourses.length);
        console.log("not from 8 to 5: ", notfrom8to5);
        var quality = ((1-(unscheduledCourses.length/renderTimetable.length))*100).toFixed(2);
        // todo save this quality somewhere

        return renderTimetable;
    }


    function putCourseIntoRoom(course, room){
        if (typeof (room["timetable"]) == 'undefined')
        {
            room["timetable"] = [];
        }
        room["timetable"].push({"course": course["courses_dept"] + course["courses_id"],
            "course_size": course["courses_size"],
            "room": room["rooms_name"],
            "room seats": room["rooms_seats"]});
        return true;
    }

    function mapArrayToTime(roomTimetable){
        for (var i = 0; i < roomTimetable.length; i ++)
        {
            switch(i)
            {
                case 0:
                    roomTimetable[i]["time"] = "MWF 8:00 - 9:00 a.m.";
                    break;
                case 1:
                    roomTimetable[i]["time"] = "MWF 9:00 - 10:00 a.m.";
                    break;
                case 2:
                    roomTimetable[i]["time"] = "MWF 10:00 -11:00 a.m.";
                    break;
                case 3:
                    roomTimetable[i]["time"] = "MWF 11:00 a.m. - 12:00 p.m.";
                    break;
                case 4:
                    roomTimetable[i]["time"] = "MWF 12:00 - 1:00 p.m. ";
                    break;
                case 5:
                    roomTimetable[i]["time"] = "MWF 1:00 - 2:00 p.m.";
                    break;
                case 6:
                    roomTimetable[i]["time"] = "MWF 2:00 - 3:00 p.m.";
                    break;
                case 7:
                    roomTimetable[i]["time"] = "MWF 3:00 - 4:00 p.m.";
                    break;
                case 8:
                    roomTimetable[i]["time"] = "MWF 4:00 - 5:00 p.m.";
                    break;
                case 9:
                    roomTimetable[i]["time"] = "TTH 8:00 - 9:30 a.m.";
                    break;
                case 10:
                    roomTimetable[i]["time"] = "TTH 9:30 - 11:00 a.m.";
                    break;
                case 11:
                    roomTimetable[i]["time"] = "TTH 11:00 a.m. - 12:30 p.m.";
                    break;
                case 12:
                    roomTimetable[i]["time"] = "TTH 12:30 - 2:00 p.m.";
                    break;
                case 13:
                    roomTimetable[i]["time"] = "TTH 2:00 - 3:30 p.m.";
                    break;
                case 14:
                    roomTimetable[i]["time"] = "TTH 3:30 - 5:00 p.m.";
                    break;
                case 15:
                    roomTimetable[i]["time"] = "MWF 5:00 - 6:00 p.m.";
                    break;
                case 16:
                    roomTimetable[i]["time"] = "MWF 6:00 - 7:00 p.m.";
                    break;
                case 17:
                    roomTimetable[i]["time"] = "MWF 7:00 - 8:00 p.m.";
                    break;
                case 18:
                    roomTimetable[i]["time"] = "MWF 8:00 - 9:00 p.m.";
                    break;
                case 19:
                    roomTimetable[i]["time"] = "MWF 9:00 - 10:00 p.m.";
                    break;
                case 20:
                    roomTimetable[i]["time"] = "MWF 10:00 - 11:00 p.m.";
                    break;
                case 21:
                    roomTimetable[i]["time"] = "MWF 11:00 p.m. - 12:00 a.m.";
                    break;
                case 22:
                    roomTimetable[i]["time"] = "MWF 12:00 - 1:00 a.m.";
                    break;
                case 23:
                    roomTimetable[i]["time"] = "MWF 1:00 - 2:00 a.m.";
                    break;
                case 24:
                    roomTimetable[i]["time"] = "MWF 2:00 - 3:00 a.m.";
                    break;
                case 25:
                    roomTimetable[i]["time"] = "MWF 3:00 - 4:00 a.m.";
                    break;
                case 26:
                    roomTimetable[i]["time"] = "MWF 4:00 - 5:00 a.m.";
                    break;
                case 27:
                    roomTimetable[i]["time"] = "MWF 5:00 - 6:00 a.m.";
                    break;
                case 28:
                    roomTimetable[i]["time"] = "MWF 6:00 - 7:00 a.m.";
                    break;
                case 29:
                    roomTimetable[i]["time"] = "MWF 7:00 - 8:00 a.m.";
                    break;
                case 30:
                    roomTimetable[i]["time"] = "TTH 5:00 - 6:30 p.m.";
                    break;
                case 31:
                    roomTimetable[i]["time"] = "TTH 6:30 - 8:00 p.m.";
                    break;
                case 32:
                    roomTimetable[i]["time"] = "TTH 8:00 - 9:30 p.m.";
                    break;
                case 33:
                    roomTimetable[i]["time"] = "TTH 9:30 - 11:00 p.m.";
                    break;
                case 34:
                    roomTimetable[i]["time"] = "TTH 11:00 p.m. - 12:30 a.m.";
                    break;
                case 35:
                    roomTimetable[i]["time"] = "TTH 12:30 - 2:00 a.m.";
                    break;
                case 36:
                    roomTimetable[i]["time"] = "TTH 2:00 - 3:30 a.m.";
                    break;
                case 37:
                    roomTimetable[i]["time"] = "TTH 3:30 - 5:00 a.m.";
                    break;
                case 38:
                    roomTimetable[i]["time"] = "TTH 5:00 - 6:30 a.m.";
                    break;
                case 39:
                    roomTimetable[i]["time"] = "TTH 6:30 - 8:00 a.m.";
                    break;
                default:
                    break;
            }
        }
    }

    function calculateSections(courseResult){
        var cResultTable = courseResult;
        for (var section in courseResult)
        {
            for (var key in courseResult[section])
            {
                if (key == 'numSections')
                {
                    courseResult[section][key] = Math.ceil(courseResult[section][key]/3);
                }
            }
        }
        return cResultTable;
    }


    function calculateBoundingBox(lat, lon, dist) {
        // TODO, make this call after you get the lat lon of the building that you're interested in
        //http://zurb.com/forrst/posts/Finding_if_a_Lat_Lng_point_is_inside_a_Bounding-OCs
        var half = (((dist / 2)*1.2) * 1000); // added 1.2 for error
        var latrad = deg2rad(lat);
        var lonrad = deg2rad(lon);

        var radius = devineRadius(lat);
        var radius_p = (radius * Math.cos(lat));

        var latMin = (latrad - (half / radius));
        var latMax = (latrad + (half / radius));
        var lonMin = (lonrad - (half / radius_p));
        var lonMax = (lonrad + (half / radius_p));

        var box = [latMin, latMax, lonMin, lonMax];
        for (var coord in box)
        {
            box[coord] = rad2deg(box[coord]);
        }
        return box;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    function rad2deg(rad) {
        return rad * (180/Math.PI)
    }

    function devineRadius(lat){
        var WGS84_maj = 6378137.0;  // Major semiaxis in KM
        var WGS84_min = 6356752.3;

        var An = ((WGS84_maj * WGS84_min) * Math.cos(lat));
        var Bn = ((WGS84_maj * WGS84_min) * Math.sin(lat));
        var Ad = (WGS84_maj * Math.cos(lat));
        var Bd = (WGS84_min * Math.sin(lat));
        return Math.sqrt(((An * An) + (Bn * Bn)) / ((Ad * Ad) + (Bd * Bd)));
    }

    function filterByRooms(listofrooms){
        var lor = listofrooms.split(",");
        var buildingsKey = new RegExp('[A-Z]{2,4}');
        var roomsComponent = '{"OR":[';

        for (var i = 0; i < lor.length; i++){
            var comma = ",";
            if (i == lor.length-1)
            {
                comma = "";
            }
            if (JSON.stringify(lor[i].match(buildingsKey)) != 'null')
            {
                roomsComponent = roomsComponent + '{"IS": {"rooms_shortname": "'+lor[i].match(buildingsKey)[0].trim()+'"}}' + comma;
            }
        }
        roomsComponent = roomsComponent + ']}';
        return roomsComponent;
    }

    function filterByCourses(listofcourses){
        var loc = listofcourses.split(",");
        var deptKey = new RegExp('[a-z]{2,4}');
        var courseIdKey = new RegExp('[0-9]{3}[a-z]?');
        var courseKey = new RegExp('[a-z]{2,4}[0-9]{3}[a-z]?');
        var coursesComponent =  '{"OR":[';

        for (var i = 0; i < loc.length; i++){
            var comma = ',';
            if (i == loc.length-1)
            {
                comma = "";
            }
            if (JSON.stringify(loc[i].match(courseKey)) != 'null')
            {
                var deptVal = loc[i].match(deptKey);
                var courseIdVal = loc[i].match(courseIdKey);
                coursesComponent = coursesComponent +
                    '{"AND":[{"IS":{"courses_dept": "'+deptVal[0]+'"}},{"IS":{"courses_id": "'+courseIdVal[0]+'"}}]}' + comma;
            }
            else if (JSON.stringify(loc[i].match(courseIdKey)) != 'null')
            {
                coursesComponent = coursesComponent + '{"IS":{"courses_id": "'+loc[i].match(courseIdKey)[0].trim()+'"}}' + comma;
            }
            else if (JSON.stringify(loc[i].match(deptKey)) != 'null')
            {
                coursesComponent = coursesComponent + '{"IS":{"courses_dept": "' + loc[i].match(deptKey)[0].trim() +'"}}' + comma;
            }
        }
        coursesComponent = coursesComponent + ']}';
        return coursesComponent;
    };



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
