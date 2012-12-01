d3.json("/names", function(error,graph) {
  var names = [];
  for(x in graph) names.push(graph[x].name);
  d3.select("select#name1-chooser").selectAll("option").data(names).enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });
  d3.select("select#name2-chooser").selectAll("option").data(names).enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });
  $("select#name1-chooser").select2({
    placeholder: "Select a State",
    allowClear: true,
    width: "220px"
  });

  $("select#name2-chooser").select2({
    placeholder: "Select a State",
    allowClear: true,
    width: "220px"
  });
});
