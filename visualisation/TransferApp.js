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
  drawClubBarchartClub(svg, width, height, {club: "Everton FC"});
});

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

function drawClubBarchartClub(svg, width, height, options) {
  var ogdata = transfer_data_old["2004-2005"].concat(transfer_data_old["2003-2004"]).concat(transfer_data_old["2005-2006"]);
  var new_data = get_club(options.club);
  console.log(new_data);
  var arrivals = [];
  var departures = [];
  for (var season in new_data) {
    arrivals = arrivals.concat(new_data[season].season_transfers.Arrivals);
    departures = departures.concat(new_data[season].season_transfers.Departures);
  }
  var all_transfers = arrivals.concat(departures);
  console.log(all_transfers);
  var clubData = {};
  all_transfers.forEach(function (val) {
    if (val.to_club_name !== undefined) {
      if (val.to_club_name in clubData) {
        clubData[val.to_club_name].to.amount += 1;
        clubData[val.to_club_name].to.value += getPlayerValue(val.transfer_fee);
        clubData[val.to_club_name].to.transfers.push(val);
      } else {
        clubData[val.to_club_name] = {name: val.to_club_name, to: {amount: 1, value: getPlayerValue(val.transfer_fee), transfers: [val]}, from:{amount: 0, value: 0, transfers: []}};
      }
    } else {
      if (val.from_club_name in clubData) {
        clubData[val.from_club_name].from.amount += 1;
        clubData[val.from_club_name].from.value += getPlayerValue(val.transfer_fee);
        clubData[val.from_club_name].from.transfers.push(val);
      } else {
        clubData[val.from_club_name] = {name: val.from_club_name, from: {amount: 1, value: getPlayerValue(val.transfer_fee), transfers: [val]}, to: {amount: 0, value: 0, transfers: []}};
      }
    }
  });
  console.log(clubData);
  var data = Object.values(clubData);
  data.sort(function(e1, e2) {
    return e2.from.value + e2.to.value - (e1.from.value + e1.to.value);
  });
  var sortedData = [];
  data.forEach(function (val) {
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
  y.domain([0, d3.max(data, function(d) { return d.from.value > d.to.value ? d.from.value : d.to.value; })]);
  // y.domain([0, d3.max(data, function(d) { return d.from.amount > d.to.amount ? d.from.amount : d.to.amount; })]);

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
      .scale(y);

  svg.append("g")
    .call(yAxis);
  svg.append("g")
    .call(xAxis)
    .attr("transform", "translate(0, " + height + ")");

  var seperatorHeights = [];
  var heightCounter = {};
  for (var i = 0; i < all_transfers.length; i++) {
    var f = all_transfers[i].to_club_name === undefined;
    var name = f ? all_transfers[i].from_club_name : all_transfers[i].to_club_name;
    heightCounter[name] = {};
    heightCounter[name].to = 0;
    heightCounter[name].from = 0;
  }
  console.log(sortedData);
  var bars = svg.selectAll("bar")
    .data(sortedData).enter();
  bars.append("rect")
    // Categorical colors found on https://vega.github.io/vega/docs/schemes/#categorical
    .attr("fill", function(d) { return d.to_club_name === undefined ? "#1f77b4" : "#ff7f0e"; })
    .attr("x", function(d) { return d.from_club_name === undefined ? x(d.to_club_name) + x.bandwidth() / 2 : x(d.from_club_name); })
    .attr("width", x.bandwidth()/2)
    .attr("y", function(d) {
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
    })
    // .attr("y", function(d) {
    //   var f = d.to_club_name === options.club;
    //   var res = f ? y(1) - heightCounter[d.from_club_name].to : y(1) - heightCounter[d.to_club_name].from;
    //   if (!f) {
    //     heightCounter[d.to_club_name].from += height - y(1);
    //   } else {
    //     heightCounter[d.from_club_name].to += height - y(1);
    //   }
    //   return res;
    // })
    // .attr("height", function(d) {return height - y(1); })
    .attr("height", function(d) {return height - y(getPlayerValue(d.transfer_fee)); })
    .on("mouseenter", handleMouseEnter)
    .on("mouseleave", handleMouseLeave)
    .on("mousemove", handleMouseMove);

  svg.selectAll("bar").data(seperatorHeights).enter().append("line")
    .style("stroke", "black")  // colour the line
    .attr("x1", function(d){return d[0];})     // x position of the first end of the line
    .attr("y1", function(d){return d[1];})      // y position of the first end of the line
    .attr("x2", function(d){return d[0] + x.bandwidth() / 2;})     // x position of the second end of the line
    .attr("y2", function(d){return d[1];});    // y position of the second end of the line
}
