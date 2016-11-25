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

	$("#datasetAddRooms").click(function () {
		var id = "rooms";
		var zip =  $("#datasetZip").prop('files')[0];
		console.log(String(zip));
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
		var id = "rooms";
		$.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
			spawnHttpErrorModal(e)
		});
	});

	$("#queryForm").submit(function (e) {
		e.preventDefault();

		var buildingName = $("#buildingName").val();
		var roomSize = $("#roomSize").val();
		var distance = $("#distance").val();
		var roomFurniture = $("#roomFurniture").val();
		var roomType = $("#roomType").val();
		var querySkeleton;

		if (distance !== '')
		{
			if (isNaN(distance))
			{
				alert("Distance must be number");
				return;
			}
		}

		if (distance !== '' && buildingName === '')
		{
			alert("Building Name must be defined");
			return;
		}

		if (buildingName === '' &&
			roomSize === '' &&
			distance === '' &&
			roomFurniture === '' &&
			roomType === '')
		{
			querySkeleton = "{\"GET\": [\"rooms_fullname\", \"rooms_name\", \"rooms_type\", \"rooms_furniture\",\"rooms_seats\"],\
					\"WHERE\": {},\
					\"ORDER\": null,\"AS\": \"TABLE\"}";
		}
		else
		{
			var where = "\"WHERE\": {\"AND\":[";
			var comma = false;
			var lat = 0;
			var lon = 0;

			if (distance !== '' && buildingName !== '')
			{
				querySkeleton = "{\"GET\": [\"rooms_fullname\", \"rooms_name\",  \"rooms_lat\", \"rooms_lon\"],\
					\"WHERE\": {\"OR\":[{\"IS\" : {\"rooms_shortname\" :\""+String(buildingName)+"\"}},\
								 {\"IS\" : {\"rooms_fullname\" :\""+String(buildingName)+"\"}}]},\
					\"ORDER\": null,\"AS\": \"TABLE\"}";

				try {
					$.ajax("/query", {type:"POST", data: querySkeleton, contentType: "application/json", dataType: "json", success: function(data) {
						console.log(data);
						var resultArray = data["result"];
						lat = resultArray[0]["rooms_lat"];
						lon = resultArray[0]["rooms_lon"];

						console.log("Lat" + lat);
						console.log("Lon" + lon);
						if (data["render"] === "TABLE") {
							generateTable(data["result"]);
						}
					}}).fail(function (e) {
						spawnHttpErrorModal(e)
					});
				} catch (err) {
					spawnErrorModal("Query Error", err);
				}
			}

			// handle where
			if (buildingName !== '')
			{
				where = where + "{\"OR\":[{\"IS\" : {\"rooms_shortname\" :\""+String(buildingName)+"\"}},\
								 {\"IS\" : {\"rooms_fullname\" :\""+String(buildingName)+"\"}}]}";
				comma = true;
			}

			if (roomSize !== '')
			{
				if (comma){
					where = where + ",{\"GT\" : {\"rooms_seats\" :\""+String(roomSize)+"\"}}";
				}
				else{
					where = where + "{\"GT\" : {\"rooms_seats\" :\""+String(roomSize)+"\"}}";
				}
				comma = true;
			}
			if (roomFurniture !== '')
			{
				if (comma){
					where = where + ",{\"IS\" : {\"rooms_furniture\" :\""+String(roomFurniture)+"\"}}";
				}
				else{
					where = where + "{\"IS\" : {\"rooms_furniture\" :\""+String(roomFurniture)+"\"}}";
				}
				comma = true;
			}
			if (roomType !== '' && roomType !== "None")
			{
				if (comma){
					where = where + ",{\"IS\" : {\"rooms_type\" :\""+String(roomType)+"\"}}";
				}
				else{
					where = where + "{\"IS\" : {\"rooms_type\" :\""+String(roomType)+"\"}}";
				}
				comma = true;
			}
			if (distance !== '')
			{
				/*
				if (comma){
					where = where + ",{\"IS\" : {\"rooms_types\" :\""+String(roomType)+"\"}}";
				}
				else{
					where = where + "{\"IS\" : {\"rooms_types\" :\""+String(roomType)+"\"}}";
				}
				*/
			}
			where = where + "]},";
			console.log(where);
			querySkeleton = "{\"GET\": [\"rooms_fullname\", \"rooms_name\", \"rooms_type\", \"rooms_furniture\",\"rooms_seats\"],\
					"+ where +
					"\"ORDER\": null,\"AS\": \"TABLE\"}";
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

