var width = 900;
var height = 550;

function charge(d) {
  return -1000-(d["hover"]?8000:0);
}

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(charge)
    .linkDistance(100)
    .friction(0.6)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

function tmp2d3(graph) {
  var ret = {"nodes": [], "links": []};
  for(i=0;i<graph.nodes.length;i++) {
    ret.nodes.push({"id": graph.nodes[i].id, "name": graph.nodes[i].name, "group": i});
  }
  for(i=0;i<graph.links.length;i++) {
    ret.links.push({"source": graph.links[i].src, "target": graph.links[i].des, "value": 1, "name": graph.links[i].name});
  }
  return ret;
}

//d3.json("relation.json", function(error,graph) {
d3.json("/query/高國華/2", function(error,graph) {
  graph = tmp2d3(graph);
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var defs = svg.selectAll("defs").data(graph.nodes).enter().append("pattern")
      .attr("id", function(d) { return "defs_h"+d.id; })
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", "100")
      .attr("height", "100");
  var imgs = defs.append("image")
      .attr("xlink:href", function(d) { return "img/head/h"+d.id+".png"; })
      .attr("x", "0")
      .attr("y", "0")
      .attr("width", "60")
      .attr("height", "60");
  

  var link = svg.selectAll("line.link")
      .data(graph.links).enter().append("g");

  var nodes = svg.selectAll("circle.node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("x", 100)
      .attr("y", 100);

  var circles = nodes.append("circle")
      .attr("class", "node")
      .attr("cx",30)
      .attr("cy",30)
      .attr("r", 30)
      .attr("fill", function(d) { return "url(#defs_h"+d.id+")"; })
      .call(force.drag)
      .on("mousemove",function(d) { d.hover=1; d.fixed=true; force.start(); })
      .on("mouseout",function(d) { d.hover=0; d.fixed=false; });

  var lines = link.append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var names = nodes.append("text")
      .attr("width", 200)
      .attr("x", 30)
      .attr("y", 65)
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; })
      .on("mousemove",function(d) { d.hover=1; d.fixed=true; force.start(); })
      .on("mouseout",function(d) { d.hover=0; d.fixed=false; });

  var relations = link.append("text")
      .attr("width", 2000)
      .attr("x", 300)
      .attr("y", 100)
      .attr("text-anchor", "middle")
      .attr("font-size", "11")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    lines.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodes.attr("transform", function(d) { return "translate("+(d.x-30)+","+(d.y-30)+")"; });
/*
    circles.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    names.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y+5; });
*/
    relations.attr("x", function(d) { return (d.source.x+d.target.x)/2; })
        .attr("y", function(d) { return (d.source.y+d.target.y)/2; });
  });
});

