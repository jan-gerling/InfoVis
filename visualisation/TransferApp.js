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

drawClubBarchartClub(svg, width, height, {club: "Man Utd"});

function handleMouseEnter(transfer) {
  var tiny = document.getElementById("tinyWindow");
  var tinyName = document.getElementById("tinyWindow_name");
  var tinyAge = document.getElementById("tinyWindow_age");
  var tinyImage = document.getElementById("tinyImage");
  tinyImage.src = transfer.player.image;
  tinyName.innerHTML = transfer.player.name;
  tinyAge.innerHTML = transfer.player.age;
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
  var re = /-|\?|Free transfer|draft/g;
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

function drawClubBarchartLeagues(svg, width, height) {
  var data = transfer_data["2004-2005"].concat(transfer_data["2003-2004"]).concat(transfer_data["2005-2006"]);
  function checkClub(x) {
    return x.from.name === "Man Utd";
  }
  data = data.filter(checkClub);
  var seenTransfers = {};

  data = data.filter(function(currentObject) {
    if (currentObject.player.name in seenTransfers) {
        return false;
    } else {
        seenTransfers[currentObject.player.name] = true;
        return true;
    }
  });

  var leagueData = {};
  data.forEach(function (val) {
    if (val.to.league in leagueData) {
      leagueData[val.to.league].amount += 1;
      leagueData[val.to.league].value += getPlayerValue(val.transfer.value);
      leagueData[val.to.league].transfers.push(val);
    } else {
      leagueData[val.to.league] = {name: val.to.league, amount: 1, value: getPlayerValue(val.transfer.value), transfers: [val]};
    }
  });
  var data = Object.values(leagueData);

  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(data.map(function(d) { return d.name; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
      .scale(y);

  svg.append("g")
    .call(yAxis);
  svg.append("g")
    .call(xAxis)
    .attr("transform", "translate(0, " + height + ")");

  var bars = svg.selectAll("bar")
    .data(data);
  bars.enter().append("rect")
    .attr("fill", "steelblue")
    .attr("x", function(d) { return x(d.name); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); });
}

function drawClubBarchartClub(svg, width, height, options) {
  var ogdata = transfer_data["2004-2005"].concat(transfer_data["2003-2004"]).concat(transfer_data["2005-2006"]);
  function checkClub(x) {
    return x.from.name === options.club || x.to.name === options.club;
  }
  ogdata = ogdata.filter(checkClub);
  var seenTransfers = {};

  ogdata = ogdata.filter(function(currentObject) {
    if (currentObject.player.name in seenTransfers) {
        return false;
    } else {
        seenTransfers[currentObject.player.name] = true;
        return true;
    }
  });

  var clubData = {};
  ogdata.forEach(function (val) {
    if (val.from.name === options.club) {
      if (val.to.name in clubData) {
        clubData[val.to.name].to.amount += 1;
        clubData[val.to.name].to.value += getPlayerValue(val.transfer.value);
        clubData[val.to.name].to.transfers.push(val);
      } else {
        clubData[val.to.name] = {name: val.to.name, to: {amount: 1, value: getPlayerValue(val.transfer.value), transfers: [val]}, from:{amount: 0, value: 0, transfers: []}};
      }
    } else {
      if (val.from.name in clubData) {
        clubData[val.from.name].from.amount += 1;
        clubData[val.from.name].from.value += getPlayerValue(val.transfer.value);
        clubData[val.from.name].from.transfers.push(val);
      } else {
        clubData[val.from.name] = {name: val.from.name, from: {amount: 1, value: getPlayerValue(val.transfer.value), transfers: [val]}, to: {amount: 0, value: 0, transfers: []}};
      }
    }
  });
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

  var heightCounter = {};
  for (var i = 0; i < ogdata.length; i++) {
    var f = ogdata[i].to.name === options.club;
    var name = f ? ogdata[i].from.name : ogdata[i].to.name;
    heightCounter[name] = {};
    heightCounter[name].to = 0;
    heightCounter[name].from = 0;
  }
  var bars = svg.selectAll("bar")
    .data(sortedData).enter();
  bars.append("rect")
    .attr("fill", function(d) { return d.to.name === options.club ? "steelblue" : "red"; })
    .attr("x", function(d) { return d.from.name === options.club ? x(d.to.name) + x.bandwidth() / 2 : x(d.from.name); })
    .attr("width", x.bandwidth()/2)
    .attr("y", function(d) {
      var f = d.to.name === options.club;
      var res = f ? y(getPlayerValue(d.transfer.value)) - heightCounter[d.from.name].to : y(getPlayerValue(d.transfer.value)) - heightCounter[d.to.name].from;
      if (!f) {
        heightCounter[d.to.name].from += height - y(getPlayerValue(d.transfer.value));
      } else {
        heightCounter[d.from.name].to += height - y(getPlayerValue(d.transfer.value));
      }
      return res;
    })
    // .attr("y", function(d) {
    //   var f = d.to.name === options.club;
    //   var res = f ? y(1) - heightCounter[d.from.name].to : y(1) - heightCounter[d.to.name].from;
    //   if (!f) {
    //     heightCounter[d.to.name].from += height - y(1);
    //   } else {
    //     heightCounter[d.from.name].to += height - y(1);
    //   }
    //   return res;
    // })
    // .attr("height", function(d) {return height - y(1); })
    .attr("height", function(d) {return height - y(getPlayerValue(d.transfer.value)); })
    .on("mouseenter", handleMouseEnter)
    .on("mouseleave", handleMouseLeave)
    .on("mousemove", handleMouseMove);
}
