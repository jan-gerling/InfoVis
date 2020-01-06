var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;

var margin = {top: 20, right: 20, bottom: 30, left: 80};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height + 500)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

load_data(2000, 2019, function() {
  console.log("Data ready for chart");
  drawClubBarchartClub(svg, width, height, {club: "Everton FC", y: "value", x: "league", sortBy: "combined"});
  // drawLineChart(svg, width, height, "Everton FC");
});

function drawClubBarchartClub(svg, width, height, options) {
  var new_data = get_club(options.club);
  var arrivals = [];
  var departures = [];
  for (var season in new_data) {
    arrivals = arrivals.concat(new_data[season].season_transfers.Arrivals);
    departures = departures.concat(new_data[season].season_transfers.Departures);
  }
  var all_transfers = arrivals.concat(departures);

  // Aggregate the data per club/league
  var clubData = {};
  all_transfers.forEach(function (val) {
    var to_name = options.x === "club" ? "to_club_name" : "to_club_league";
    var from_name = options.x === "club" ? "from_club_name" : "from_club_league";
    if (val[to_name] !== undefined) {
      if (val[to_name] in clubData) {
        clubData[val[to_name]].to.amount += 1;
        clubData[val[to_name]].to.value += getPlayerValue(val.transfer_fee);
        clubData[val[to_name]].to.transfers.push(val);
      } else {
        clubData[val[to_name]] = {name: val[to_name], to: {amount: 1, value: getPlayerValue(val.transfer_fee), transfers: [val]}, from:{amount: 0, value: 0, transfers: []}};
      }
    } else {
      if (val[from_name] in clubData) {
        clubData[val[from_name]].from.amount += 1;
        clubData[val[from_name]].from.value += getPlayerValue(val.transfer_fee);
        clubData[val[from_name]].from.transfers.push(val);
      } else {
        clubData[val[from_name]] = {name: val[from_name] , from: {amount: 1, value: getPlayerValue(val.transfer_fee), transfers: [val]}, to: {amount: 0, value: 0, transfers: []}};
      }
    }
  });

  // Sort the clubs by value or amount according to options
  var data = Object.values(clubData);
  data.sort(getSortFunction(options));
  data.splice(10);

  // Put all the transfers sorted into a single list for d3
  var sortedData = [];
  data.forEach(function (val) {
    val.from.transfers.sort(function (e1, e2) {
      return getPlayerValue(e2.transfer_fee) - getPlayerValue(e1.transfer_fee);
    });
    val.to.transfers.sort(function (e1, e2) {
      return getPlayerValue(e2.transfer_fee) - getPlayerValue(e1.transfer_fee);
    });
    val.from.transfers.forEach(function (t) {
      sortedData.push(t);
    });
    val.to.transfers.forEach(function (t) {
      sortedData.push(t);
    });
  });

  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(data.map(function(d) { return d.name; }));
  setYDomain(y, data, options);

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
      .scale(y);

  // gridlines in x axis function
  function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5)
  }

  // gridlines in y axis function
  function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
  }

  svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      );

  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      );

  svg.append("g")
    .call(yAxis);
  svg.append("g")
    .call(xAxis)
    .attr("transform", "translate(0, " + height + ")");

  // Keeps track of where the seperator lines should come
  var seperatorHeights = [];
  // Heightcounter remembers how high the next block of the same club should be placed
  var heightCounter = {};
  for (var i = 0; i < all_transfers.length; i++) {
    var f = all_transfers[i].to_club_name === undefined;
    var name = f ? all_transfers[i].from_club_name : all_transfers[i].to_club_name;
    heightCounter[name] = {};
    heightCounter[name].to = 0;
    heightCounter[name].from = 0;
  }

  svg.selectAll("bar")
    .data(sortedData).enter()
    .append("rect")
    // Categorical colors found on https://vega.github.io/vega/docs/schemes/#categorical
    .attr("fill", function(d) { return d.to_club_name === undefined ? "#1f77b4" : "#ff7f0e"; })
    .attr("x", function(d) { return d.from_club_name === undefined ? x(d.to_club_name) + x.bandwidth() / 2 : x(d.from_club_name); })
    .attr("width", x.bandwidth()/2)
    .attr("y", getBarY(heightCounter, seperatorHeights, x, y, height, options))
    .attr("height", getBarHeight(y, height, options))
    .on("mouseenter", handleMouseEnter)
    .on("mouseleave", handleMouseLeave)
    .on("mousemove", handleMouseMove)
    .on("click", handleMouseClick);

  svg.selectAll("bar").data(seperatorHeights).enter().append("line")
    .style("stroke", "black")  // colour the line
    .attr("x1", function(d){return d[0];})     // x position of the first end of the line
    .attr("y1", function(d){return d[1];})      // y position of the first end of the line
    .attr("x2", function(d){return d[0] + x.bandwidth() / 2;})     // x position of the second end of the line
    .attr("y2", function(d){return d[1];});    // y position of the second end of the line
}

function drawLineChart(svg, width, height, club) {
  var new_data = get_club(club);
  var arrivals = [];
  var departures = [];
  var data_vals = Object.values(new_data);
  var data_keys = Object.keys(new_data);

  for (var i = 0; i < data_vals.length; i++) {
    arrivals.push({season: data_keys[i], value: 0, amount: 0});
    departures.push({season: data_keys[i], value: 0, amount: 0});
    data_vals[i].season_transfers.Arrivals.forEach(function(v) {
      arrivals[i].value += getPlayerValue(v.transfer_fee);
      arrivals[i].amount += 1;
    });
    data_vals[i].season_transfers.Departures.forEach(function(v) {
      departures[i].value += getPlayerValue(v.transfer_fee);
      departures[i].amount += 1;
    });
  }
  
  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(arrivals.map(function(d) { return d.season; }));
  var max_arrival = d3.max(arrivals, function(d) {return d.value;});
  var max_departures = d3.max(departures, function(d) {return d.value});
  y.domain([0, Math.max(max_arrival, max_departures)]);

  // gridlines in x axis function
  function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5);
  }

  // gridlines in y axis function
  function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(10);
  }

  svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      );

  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      );

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
      .scale(y);

  svg.append("g")
    .call(yAxis);
  svg.append("g")
    .call(xAxis)
    .attr("transform", "translate(0, " + height + ")");
  
  var line = d3.line()
    .x(function(d) { return x(d.season) + 0.5 * x.bandwidth(); })
    .y(function(d) { return y(d.value); })

  svg.append("path")
    .datum(arrivals)
    .attr("d", line)
    .attr("class", "line");

  svg.append("path")
    .datum(departures)
    .attr("d", line)
    .attr("class", "line");
}

function setYDomain(y, data, options) {
  if (options.y === "value") {
    y.domain([0, d3.max(data, function(d) { return d.from.value > d.to.value ? d.from.value : d.to.value; })]);
  } else {
    y.domain([0, d3.max(data, function(d) { return d.from.amount > d.to.amount ? d.from.amount : d.to.amount; })]);
  }
}

function getSortFunction(options) {
  if (options.y === "value") {
    return function (e1, e2) {
      return e2.from.value + e2.to.value - (e1.from.value + e1.to.value);
    }
  } else {
    return function (e1, e2) {
      return e2.from.amount + e2.to.amount - (e1.from.amount + e1.to.amount);
    }
  }
}

function getValueSortFunction(options) {
  if (options.sortBy === "combined") {
    return function (e1, e2) {
      return e2.from.value + e2.to.value - (e1.from.value + e1.to.value);
    }
  } else if (options.sortBy === "in") {
    return function (e1, e2) {
      return e2.from.value - e1.from.value;
    }
  } else {
    return function (e1, e2) {
      return e2.to.value - e1.to.value;
    }
  }
}

function getAmountSortFunction(options) {
  if (options.sortBy === "combined") {
    return function (e1, e2) {
      return e2.from.amount + e2.to.amount - (e1.from.amount + e1.to.amount);
    }
  } else if (options.sortBy === "in") {
    return function (e1, e2) {
      return e2.from.amount - e1.from.amount;
    }
  } else {
    return function (e1, e2) {
      return e2.to.amount - e1.to.amount;
    }
  }
}

function getBarY(heightCounter, seperatorHeights, x, y, height, options) {
  if (options.y === "value") {
    return function(d) {
      var xSep = d.from_club_name === undefined ? x(d.to_club_name) + x.bandwidth() / 2 : x(d.from_club_name);
      var f = d.to_club_name === undefined;
      var res = f ? y(getPlayerValue(d.transfer_fee)) - heightCounter[d.from_club_name].to : y(getPlayerValue(d.transfer_fee)) - heightCounter[d.to_club_name].from;
      if (!f) {
        heightCounter[d.to_club_name].from += height - y(getPlayerValue(d.transfer_fee));
      } else {
        heightCounter[d.from_club_name].to += height - y(getPlayerValue(d.transfer_fee));
      }
      seperatorHeights.push([xSep, res]);
      return res;
    }
  } else {
    return function(d) {
      var xSep = d.from_club_name === undefined ? x(d.to_club_name) + x.bandwidth() / 2 : x(d.from_club_name);
      var f = d.to_club_name === undefined;
      var res = f ? y(1) - heightCounter[d.from_club_name].to : y(1) - heightCounter[d.to_club_name].from;
      if (!f) {
        heightCounter[d.to_club_name].from += height - y(1);
      } else {
        heightCounter[d.from_club_name].to += height - y(1);
      }
      seperatorHeights.push([xSep, res]);
      return res;
    }
  }
}

function getBarHeight(y, height, options) {
  if (options.y === "value") {
    return function(d) {return height - y(getPlayerValue(d.transfer_fee)); }
  } else {
    return function(d) {return height - y(1); }
  }
}

function handleMouseEnter(transfer) {
  var tiny = document.getElementById("tinyWindow");
  var tinyName = document.getElementById("tinyWindow_name");
  var tinyAge = document.getElementById("tinyWindow_age");
  var tinyAmount = document.getElementById("tinyWindow_value");
  var tinyImage = document.getElementById("tinyImage");
  tinyImage.src = transfer.player_image;
  tinyName.innerHTML = transfer.player_name;
  tinyAge.innerHTML = transfer.player_age;
  tinyAmount.innerHTML = transfer.transfer_fee;
  tiny.style.display = "block";
}

function handleMouseClick(transfer) {
  window.open("https://www.transfermarkt.com" + transfer.transfer_href);
}

function handleMouseLeave() {
  var tiny = document.getElementById("tinyWindow");
  tiny.style.display = "none";
}

function handleMouseMove() {
  var tiny = document.getElementById("tinyWindow");
  var e = window.event;
  var x = e.clientX,
    y = e.clientY;
  tiny.style.top = (y + 20) + 'px';
  tiny.style.left = (x + 20) + 'px';
}

function getPlayerValue(val) {
  var re = /-|\?|Free transfer|draft|Loan|End of loan/g;
  var res;
  if (val === "" || re.exec(val)) {
    res =  0;
  } else {
    var amount = val[val.length - 1];
    res  = val.slice(1, val.length - 1);
    if (amount === "k"){
      res = res * 1000;
    } else if (amount === "m") {
      res = res * 1000000;
    }
  }
  return res;
}