var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 20, bottom: 30, left: 80};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height + 500)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawClubBarchartPlayers() {
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

  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  x.domain(data.map(function(d) { return d.player.name; }));
  y.domain([0, d3.max(data, function(d) { return getPlayerValue(d.transfer.value); })]);

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
    .attr("x", function(d) { return x(d.player.name); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(getPlayerValue(d.transfer.value)); })
    .attr("height", function(d) { return height - y(getPlayerValue(d.transfer.value)); })
    .on("mouseenter", handleMouseEnter)
    .on("mouseleave", handleMouseLeave)
    .on("mousemove", handleMouseMove);
}

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

function drawClubBarchartLeagues() {
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

function drawClubBarchartClub() {
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

  var clubData = {};
  data.forEach(function (val) {
    if (val.to.league in clubData) {
      clubData[val.to.name].amount += 1;
      clubData[val.to.name].value += getPlayerValue(val.transfer.value);
      clubData[val.to.name].transfers.push(val);
    } else {
      clubData[val.to.name] = {name: val.to.name, amount: 1, value: getPlayerValue(val.transfer.value), transfers: [val]};
    }
  });
  var data = Object.values(clubData);

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

function resize() {
  //This function is called if the window is resized
  //You can update your scatterplot here
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
  var svg = d3.select("svg").selectAll("*").remove();
  drawClubBarchartPlayers();
}

drawClubBarchartPlayers();
