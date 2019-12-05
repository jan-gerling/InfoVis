var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawScatterplot() {
  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot");

  var plotWidth = viewWidth * 0.8;
  var plotHeight = viewHeight * 0.8;
  var xScale = d3.scaleLinear()
    .domain([0, 400])
    .range([0, plotWidth]);
  var yScale = d3.scaleLinear()
    .domain([0, 400])
    .range([plotHeight, 0]);
  var mScale = d3.scaleLinear()
    .domain([0, 5])
    .range(["blue", "red"]);
  //You can start with a simple scatterplot that shows the x and y attributes in boat_data.boats
  var vis = d3.select("svg");
  var points = vis.selectAll("rect")
    .data(boat_data.boats);
  points.enter()
    .append("rect")
    .attr("fill", function(d){return mScale(d.m)})
    .attr("x", function(d){return xScale(d.x)})
    .attr("y", function(d){return yScale(d.y)})
    .attr("transform", "translate(50, 50)")
    .attr("width", 10)
    .attr("height", 10);
  points.enter()
    .append("line")
    .attr("transform", "translate(50, 50)")
    .attr("x1", function(d){return xScale(d.x) + 5})
    .attr("y1", function(d){return yScale(d.y) + 5})
    .attr("x2", function(d){return xScale(d.x) + xScale(d.u);})
    .attr("y2", function(d){return yScale(d.y + d.v);}
    )
    .attr("stroke", "grey")
    .attr("stroke-width", 2);

    //<line x1="5" y1="5" x2="40" y2="40" stroke="gray" stroke-width="5"  />
  var x_axis = d3.axisBottom()
    .scale(xScale);
  var y_axis = d3.axisLeft()
    .scale(yScale);

  vis.append("g")
    .attr("transform", "translate(50, " + (plotHeight + 50) + ")")
    .call(x_axis);
  vis.append("g")
    .attr("transform", "translate(50, 50)")
    .call(y_axis);

  //Additional tasks are given at the end of this file
}

function resize() {
  //This function is called if the window is resized
  //You can update your scatterplot here
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
  var svg = d3.select("svg").selectAll("*").remove();
  drawScatterplot();
}


drawScatterplot();
