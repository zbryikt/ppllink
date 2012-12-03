[width,height] = [900 550]

charge = (d) -> -1000 - ((d[\hover] || 0) && 8000)
color = d3.scale.category20!

force = d3.layout.force!
    .charge       charge
    .linkDistance 100
    .friction     0.6
    .size         [width,height]

svg = d3.selection \body .append \svg
    .attr \width, width
    .attr \height, height

tmp2d3 = ->
  nodes: [{
    id:     it.nodes[i].id
    name:   it.nodes[i].name
    group:  i
  } for i til it.nodes.length] 
  links: [{
    source: it.links[i].src
    target: it.links[i].des
    name:   it.links[i].name
    value:  1
  } for i til it.links.length]

d3.json \/query/高國華/2, (error,graph) ->
  graph = tmp2d3 graph
  force.nodes graph.nodes
       .links graph.links .start!

  defs = svg.selectAll \defs .data graph.nodes .enter! .append \pattern
      .attr \id -> \defs_h + it.id
      .attr \patternUnits \userSpaceOnUse
      .attr \width 100
      .attr \height 100

  imgs = defs.append \image
      .attr \xlink:href -> \img/head/h +it.id + \.png
      .attr \x 0
      .attr \y 0
      .attr \width 60
      .attr \height 60

  link = svg.selectAll \line.link .data graph.links .enter! .append \g

  nodes = svg.selectAll \circle.node .data graph.nodes .enter! .append \g
      .attr \x 100
      .attr \y 100

  circles = nodes.append \circle
      .attr \class \node
      .attr \cx 30
      .attr \cy 30
      .attr \r 30
      .attr \fill -> "url(\#defs_h#{it.id})"
      .catt force.drag
      .on \mouseover -> it <<< hover: 1, fixed: true; force.start!
      .on \mouseout -> it <<< hover: 0, fixed: false

  lines = link.append \line
      .attr \class \link
      .style \stroke-width -> Math.sqrt it.value
  
  names = nodes.append \text
      .attr \width 200
      .attr \x 30
      .attr \y 65
      .attr \text-anchor \middle
      .text -> it.name
      .on \mousemover -> it <<< hover: 1, fixed: true; force.start!
      .on \mouseout -> it <<< hover: 0, fixed: false

  relations = link.append \text
      .attr \width 2000
      .attr \x 300
      .attr \y 100
      .attr \text-anchor \middle
      .attr \font-size 11
      .text -> it.name

  force.on \tick ->
    lines.attr \x1 -> it.source.x
      .attr \y1 -> it.source.y
      .attr \x2 -> it.target.x
      .attr \y2 -> it.target.y
    nodes.attr \transform -> "translate(#{it.x-30},#{it.y-30})"
    relations.attr \x -> (it.source.x + it.target.x)/2
      .attr \y -> (it.source.y + it.target.y)/2

