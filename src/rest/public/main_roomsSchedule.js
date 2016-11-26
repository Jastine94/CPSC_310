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
        var listofcourses = $("#courses").val();
        var coursesSet = [], roomsSet =[];
        var coursesFilt = filterByCourses(listofcourses);
        var coursesquery = '{"GET": ["courses_dept", "courses_id", "numSections", "courses_size"], ' +
            '"WHERE": {' +
            '"AND": [' +
                '{"IS": {"courses_year":"2014"}},'  + coursesFilt + ']},' +
            '"GROUP": [ "courses_dept", "courses_id","courses_size" ],' +
            '"APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],' +
            '"ORDER": { "dir": "UP", "keys": ["courses_size"]}, "AS": "TABLE"}';

        try {
            $.ajax("/query", {type:"POST", data: coursesquery, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    // generateTable(data["result"]);
                    coursesSet = calculateCourses(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }

        var listofrooms = $("#buildings").val();
        var roomsFilt = filterByRooms(listofrooms);
        var roomsquery ='{"GET": ["rooms_shortname","rooms_seats"],' +
            '"WHERE": ' + roomsFilt + ',' +
            '"GROUP": [ "rooms_shortname", "rooms_seats"], "APPLY": [],' +
            '"ORDER": { "dir": "UP", "keys": ["rooms_seats"]},' +
            '"AS": "TABLE"}';

        try {
            $.ajax("/query", {type:"POST", data: roomsquery, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    // generateTable(data["result"]);
                    roomsSet = data["result"];
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }

        // now scheulde room
    });

    function calculateCourses(courseResult){
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
