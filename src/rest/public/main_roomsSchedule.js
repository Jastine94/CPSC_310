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
                    // generateTable(data["result"]);
                    console.log("COURSES DATA: ", JSON.stringify(data));
                    coursesSet = calculateSections(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }

        var listofrooms = $("#buildings").val();
        var roomsFilt = filterByRooms(listofrooms);
        var roomsquery ='{"GET": ["rooms_name","rooms_seats"],' +
            '"WHERE": ' + roomsFilt + ',' +
            '"GROUP": [ "rooms_name", "rooms_seats"], "APPLY": [], "ORDER": { "dir": "UP", "keys": ["rooms_seats"]}, "AS": "TABLE"}';

        try {
            $.ajax("/query", {type:"POST", data: roomsquery, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    // generateTable(data["result"]);
                    console.log("ROOMS DATA: ", JSON.stringify(data));
                    roomsSet = data["result"];

                    var table = scheduleCourses(coursesSet, roomsSet);
                    console.log(JSON.stringify(table));
                    generateTable(table);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }

    });

    function scheduleCourses(coursesSet, roomsSet){
        console.log("TIME TO SCHEDULE COURSES NOW")
        var courses = coursesSet, rooms = roomsSet;
        var unscheduledCourses = [];
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
                        (typeof ( rooms[r]['timetable']) == 'undefined' || rooms[r]['timetable'].length < 16))
                    {

                        filled = putCourseIntoRoom(courses[c],rooms[r]);
                        // need to add it so that if it's all full, can still add more
                        // todo calculate the number of schedule
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
