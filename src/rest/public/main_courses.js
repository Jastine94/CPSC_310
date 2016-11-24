$(function () {
    $("#datasetAdd").click(function () {
        var id = $("#datasetId").val();
        console.log(id);
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

    $("#datasetAddCourses").click(function () {
        var id = "courses";
        console.log("adding course" + id);
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
        var id = "courses";
        $.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $("#queryForm").submit(function (e) {
        e.preventDefault();
        var courseDepartment = $("#courseDept").val();
        var courseNumber = $("#courseNumber").val();
        var courseInstructor = $("#courseInstructor").val();
        var courseTitle = $("#courseTitle").val();
        var courseSize = $("#courseSize").val();
        var querySkeleton;

        // handle ordering
        var orderBy = $("#orderBy").val();
        var order = "\"ORDER\": null,";

        if ( String(orderBy) !== "None"){
            var order = "\"ORDER\": {\"dir\": \"DOWN\", \"keys\": [";
            var comma = false;

            var orders = String(orderBy).split(",");

            for (var part of orders)
            {
                console.log(part);
                if (String(part) == "MostFailing"){
                    if (comma){
                        order = order + ",\"courses_fail\"";
                    }
                    else{
                        order = order + "\"courses_fail\"";
                    }
                    comma = true;
                }
                else if (String(part) == "MostPassing"){
                    if (comma){
                        order = order + ",\"courses_pass\"";
                    }
                    else{
                        order = order + "\"courses_pass\"";
                    }
                    comma = true;

                }
                else if(String(part) == "AverageGrade")
                {
                    if (comma){
                        order = order + ",\"courses_avg\"";
                    }
                    else{
                        order = order + "\"courses_avg\"";
                    }
                    comma = true;
                }
            }
            order = order + "]},";
        }

        console.log(String(orderBy));

        if (courseDepartment === '' &&
            courseNumber === '' &&
            courseInstructor === '' &&
            courseTitle === '' &&
            courseSize === '')
        {
            querySkeleton = "{\"GET\": [\"courses_dept\", \"courses_id\", \"courses_pass\",\"courses_fail\",\"courses_avg\"],\
                    \"WHERE\": {},\
                    "+ order+"\"AS\": \"TABLE\"}";
        }
        else
        {
            var where = "\"WHERE\": {\"AND\":[";
            var comma = false
            // handle where
            if (courseDepartment !== '')
            {
                where = where + "{\"IS\" : {\"courses_dept\" :\""+String(courseDepartment)+"\"}}";
                comma = true;
            }
            if (courseInstructor !== '')
            {
                comma = true;
                if (comma){
                    where = where + ",{\"IS\" : {\"courses_instructor\" :\""+String(courseInstructor)+"\"}}";
                }
                else{
                    where = where + "{\"IS\" : {\"courses_instructor\" :\""+String(courseInstructor)+"\"}}";
                }

            }
            if (courseTitle !== '')
            {
                comma = true;
                if (comma){
                    where = where + ",{\"IS\" : {\"courses_title\" :\""+String(courseTitle)+"\"}}";
                }
                else{
                    where = where + "{\"IS\" : {\"courses_title\" :\""+String(courseTitle)+"\"}}";
                }
            }
            if (courseNumber !== '')
            {
                comma = true;
                if (comma){
                    where = where + ",{\"IS\" : {\"courses_id\" :\""+String(courseNumber)+"\"}}";
                }
                else{
                    where = where + "{\"IS\" : {\"courses_id\" :\""+String(courseNumber)+"\"}}";
                }
            }
            if (courseSize !== '')
            {
                comma = true;
                if (comma){
                    where = where + ",{\"GT\" : {\"courses_size\" :\""+String(courseSize)+"\"}}";
                }
                else{
                    where = where + "{\"GT\" : {\"courses_size\" :\""+String(courseSize)+"\"}}";
                }
            }

            where = where + "]},";
            console.log(where);
            querySkeleton = "{\"GET\": [\"courses_dept\", \"courses_id\", \"courses_pass\",\"courses_fail\",\"courses_avg\"],\
                            "+ where + order+"\"AS\": \"TABLE\"}";
        }

        var query = querySkeleton;

        try {
            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

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

