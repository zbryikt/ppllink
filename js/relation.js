(function(){
  var ref$, width, height, uiTest, charge, color, force, svg, gc1, gc2, customDrag, clear, tmp2d3, playstate, depthvalue, depthmap, lockstate, nodes, gravitystate, generate, init;
  ref$ = [$('#content').width(), $('#content').height()], width = ref$[0], height = ref$[1];
  uiTest = true;
  charge = function(d){
    return -1000 - ((d['hover'] || 0) && 8000);
  };
  color = d3.scale.category20();
  force = null;
  svg = null;
  gc1 = null;
  gc2 = null;
  customDrag = null;
  clear = function(){
    $('svg').remove();
    force = d3.layout.force().charge(charge).linkDistance(100).gravity(0.1).linkStrength(0.1).size([width, height]);
    svg = d3.select('#content').append('svg').attr('width', "100%").attr('height', "100%");
    return force.customDrag = function(){
      if (!customDrag) {
        customDrag = d3.behavior.drag().origin(function(it){
          return it;
        }).on('dragstart', function(it){
          return it.fixed |= 2;
        }).on('drag', function(it){
          it.px = d3.event.x;
          it.py = d3.event.y;
          return force.resume();
        }).on('dragend', function(it){
          if (!playstate) {
            force.stop();
          }
          return it.fixed &= 1;
        });
      }
      return this.on('mouseover.force', function(it){
        return it.fixed |= 4;
      }).on('mouseout.force', function(it){
        return it.fixed &= 3;
      }).call(customDrag);
    };
  };
  tmp2d3 = function(it){
    var position, i$, to$, i;
    position = {};
    for (i$ = 0, to$ = it.nodes.length; i$ < to$; ++i$) {
      i = i$;
      position[it.nodes[i].id] = i;
    }
    return {
      nodes: (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = it.nodes.length; i$ < to$; ++i$) {
          i = i$;
          results$.push({
            id: position[it.nodes[i].id],
            gid: it.nodes[i].id,
            name: it.nodes[i].name,
            group: i
          });
        }
        return results$;
      }()),
      links: (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = it.links.length; i$ < to$; ++i$) {
          i = i$;
          results$.push({
            source: position[it.links[i].src],
            target: position[it.links[i].des],
            name: it.links[i].name,
            bidirect: it.links[i].bidirect,
            value: 1
          });
        }
        return results$;
      }())
    };
  };
  playstate = 1;
  this.togglePlay = function(){
    if (!force) {
      return;
    }
    playstate = 1 - playstate;
    if (playstate) {
      force.start();
      return $('#toggle-play').removeClass('active');
    } else {
      force.stop();
      return $('#toggle-play').addClass('active');
    }
  };
  depthvalue = 1;
  depthmap = [0, 1, 2, 3, 4, 6, 12, 20, '&#x221E'];
  this.toggleDepth = function(v){
    $("#toggle-depth li:nth-child(" + depthvalue + ")").removeClass('active');
    depthvalue = v;
    $("#toggle-depth li:nth-child(" + depthvalue + ")").addClass('active');
    return $('#depth-note').html(depthmap[depthvalue]);
  };
  lockstate = 0;
  nodes = null;
  this.toggleLock = function(){
    if (!force) {
      return;
    }
    lockstate = 1 - lockstate;
    if (lockstate) {
      $('#toggle-lock').addClass('active');
    } else {
      $('#toggle-lock').removeClass('active');
    }
    nodes.each(function(d, i){
      return d.fixed = lockstate ? true : false;
    });
    return nodes.selectAll('circle').attr('stroke', lockstate ? '#f00' : '#999');
  };
  gravitystate = 1;
  this.toggleGravity = function(v){
    if (!gc1 || !playstate) {
      return;
    }
    $("#toggle-gravity li:nth-child(" + gravitystate + ")").removeClass('active');
    gravitystate = v;
    $("#toggle-gravity li:nth-child(" + gravitystate + ")").addClass('active');
    switch (v) {
    case 1:
      gc1.transition().duration(750).attr('r', 3 * height / 4);
      gc2.transition().delay(100).duration(750).attr('fill', '#bec').attr('r', height);
      return force.gravity(0.1).start();
    case 2:
      gc1.transition().duration(750).attr('r', 3 * height / 5);
      gc2.transition().delay(100).duration(750).attr('fill', '#cdb').attr('r', 4 * height / 5);
      return force.gravity(0.2).start();
    case 3:
      gc1.transition().duration(750).attr('r', 2 * height / 5);
      gc2.transition().delay(100).duration(750).attr('fill', '#dca').attr('r', 3 * height / 5);
      return force.gravity(0.4).start();
    case 4:
      gc1.transition().duration(750).attr('r', 3 * height / 10);
      gc2.transition().delay(100).duration(750).attr('fill', '#eaa').attr('r', 2 * height / 5);
      return force.gravity(1.0).start();
    default:
      return force.gravity(1.5).start();
    }
  };
  generate = function(error, graph){
    var defs, imgs, link, oldnode, circles, lines, names, relations;
    graph = tmp2d3(graph);
    force.nodes(graph.nodes).links(graph.links).start();
    gc2 = svg.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', height).attr('fill', '#bec');
    gc1 = svg.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 3 * height / 4).attr('fill', '#fff');
    defs = svg.selectAll('defs').data(graph.nodes).enter().append('pattern').attr('id', function(it){
      return 'defs_h' + it.id;
    }).attr('patternUnits', 'userSpaceOnUse').attr('width', 100).attr('height', 100);
    imgs = defs.append('image').attr('xlink:href', function(it){
      return 'img/head/h' + it.gid + '.png';
    }).attr('x', 0).attr('y', 0).attr('width', 60).attr('height', 60);
    defs.append('marker').attr('id', 'arrow').attr('viewBox', "-30 -5 10 10").attr('markerWidth', 20).attr('markerHeight', 7).attr('fill', 'none').attr('stroke', '#999').attr('stroke-width', 1).attr('orient', 'auto').append('path').attr('d', "M -30 -3 L -25 0 L -30 3");
    defs.append('marker').attr('id', 'arrow2').attr('viewBox', "10 -5 30 10").attr('markerWidth', 20).attr('markerHeight', 7).attr('fill', 'none').attr('stroke', '#999').attr('stroke-width', 1).attr('orient', 'auto').append('path').attr('d', "M 30 -3 L 25 0 L 30 3");
    link = svg.selectAll('line.link').data(graph.links).enter().append('g');
    nodes = svg.selectAll('circle.node').data(graph.nodes).enter().append('g').attr('x', 100).attr('y', 100);
    oldnode = null;
    circles = nodes.append('circle').attr('class', 'node').attr('cx', 30).attr('cy', 30).attr('r', 30).attr('fill', function(it){
      return "url(#defs_h" + it.id + ")";
    }).attr('stroke', '#999').attr('stroke-width', '2.5px').on('mouseover', function(it){
      if (oldnode === it) {
        return;
      }
      if (oldnode) {
        oldnode.hover = 0;
      }
      it.hover = 1;
      oldnode = it;
      if (playstate) {
        return force.start();
      }
    }).on('click', function(it){
      if (it.fixed) {
        $(d3.event.target).attr('stroke', '#999');
        return it.fixed = false;
      } else {
        $(d3.event.target).attr('stroke', '#f00');
        return it.fixed = true;
      }
    }).call(force.customDrag);
    lines = link.append('line').attr('class', 'link').attr('marker-end', 'url(#arrow)').attr('marker-start', function(it){
      if (it.bidirect) {
        return 'url(#arrow2)';
      }
    }).style('stroke-width', function(){
      return 2;
    });
    names = nodes.append('text').attr('width', 200).attr('x', 30).attr('y', 70).attr('text-anchor', 'middle').text(function(it){
      return it.name;
    }).on('mousemover', function(it){
      if (oldnode === it) {
        return;
      }
      if (oldnode) {
        oldnode.hover = 0;
      }
      oldnode = it;
      it.hover = 1;
      if (playstate) {
        return force.start();
      }
    });
    relations = link.append('text').attr('width', 2000).attr('x', 300).attr('y', 100).attr('text-anchor', 'middle').attr('font-size', 11).text(function(it){
      return it.name;
    });
    force.on('tick', function(){
      lines.attr('x1', function(it){
        return it.source.x;
      }).attr('y1', function(it){
        return it.source.y;
      }).attr('x2', function(it){
        return it.target.x;
      }).attr('y2', function(it){
        return it.target.y;
      });
      nodes.attr('transform', function(it){
        return "translate(" + (it.x - 30) + "," + (it.y - 30) + ")";
      });
      return relations.attr('x', function(it){
        if (it.bidirect) {
          return (it.source.x + it.target.x) / 2;
        } else {
          return (2 * it.source.x + it.target.x) / 3;
        }
      }).attr('y', function(it){
        if (it.bidirect) {
          return (it.source.y + it.target.y) / 2;
        } else {
          return (2 * it.source.y + it.target.y) / 3;
        }
      });
    });
    return $('#loading').fadeOut(400);
  };
  this.toggleGenerate = function(){
    $('#loading').fadeIn(100);
    clear();
    return setTimeout(function(){
      if (uiTest) {
        return d3.json("/ppllink/relation.json?timestamp=" + new Date().getTime(), generate);
      } else {
        return d3.json("/query/" + $('select#name-chooser').val() + "/2", generate);
      }
    }, 400);
  };
  init = function(error, graph){
    var names, res$, i$, to$, x;
    names = [];
    res$ = [];
    for (i$ = 0, to$ = graph.length; i$ < to$; ++i$) {
      x = i$;
      res$.push(graph[x].name);
    }
    names = res$;
    return d3.select('select#name-chooser').selectAll('option').data(names).enter().append('option').attr('value', function(it){
      return it;
    }).text(function(it){
      return it;
    });
  };
  $.fn.disableSelect = function(){
    return this.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
  };
  $(document).ready(function(){
    $(document).disableSelect();
    $('body').tooltip({
      selector: '[rel=tooltip]'
    });
    $('select#name-chooser').select2({
      placeholder: "select a person",
      allowClear: true,
      width: '110px'
    });
    $('select#source-chooser').select2({
      width: '110px'
    });
    $('select#link-chooser').select2({
      width: '60px'
    });
    $('select#target-chooser').select2({
      width: '110px'
    });
    height = $('body').height() - $('#content').position().top - 30;
    $('#content').height(height);
    $(window).resize(function(){
      var x$;
      height = $('body').height() - $('#content').position().top - 30;
      $('#content').height(height);
      if (gc2 != null) {
        gc2.attr('cx', width / 2).attr('cy', height / 2);
      }
      if (gc1 != null) {
        gc1.attr('cx', width / 2).attr('cy', height / 2);
      }
      x$ = force != null ? force.size([width, height]) : void 8;
      if (playstate) {
        x$.start();
      }
      return x$;
    });
    return d3.json("/" + (uiTest ? "ppllink/" : "") + "names", init);
  });
}).call(this);
