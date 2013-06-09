(function(){
  var ref$, width, height, uiTest, charge, color, force, svg, gc1, gc2, mpl, reloadWorkaround, circleBox, lineBox, customDrag, currentDomain, clear, tmp2d3, playstate, depthvalue, depthmap, lockstate, nodes, gravitystate, generate, randomizer, updateSelect, initDb, init, headPayload, headName, headIconSelect, fu, join$ = [].join;
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
  mpl = null;
  reloadWorkaround = 0;
  circleBox = null;
  lineBox = null;
  customDrag = null;
  currentDomain = 'sandbox';
  this.relationData = {
    nodes: [],
    links: [],
    img: {}
  };
  this.nameHash = {};
  this.linkHash = {};
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
  this.xxblah = function(){
    return alert('hi');
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
      d3.select('#content').transition().duration(750).style('background', '#dfe');
      return force.gravity(0.1).start();
    case 2:
      gc1.transition().duration(750).attr('r', 3 * height / 5);
      gc2.transition().delay(100).duration(750).attr('fill', '#cdb').attr('r', 4 * height / 5);
      d3.select('#content').transition().duration(750).style('background', '#efd');
      return force.gravity(0.2).start();
    case 3:
      gc1.transition().duration(750).attr('r', 2 * height / 5);
      gc2.transition().delay(100).duration(750).attr('fill', '#dca').attr('r', 3 * height / 5);
      d3.select('#content').transition().duration(750).style('background', '#fed');
      return force.gravity(0.4).start();
    case 4:
      gc1.transition().duration(750).attr('r', 3 * height / 10);
      gc2.transition().delay(100).duration(750).attr('fill', '#eaa').attr('r', 2 * height / 5);
      d3.select('#content').transition().duration(750).style('background', '#fdd');
      return force.gravity(1.0).start();
    default:
      return force.gravity(1.5).start();
    }
  };
  generate = function(error, graph){
    var i$, ref$, len$, x;
    gc2 = svg.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', height).attr('fill', '#bec').style('opacity', '0');
    gc1 = svg.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 3 * height / 4).attr('fill', '#fff').style('opacity', '0');
    for (i$ = 0, len$ = (ref$ = [gc1, gc2]).length; i$ < len$; ++i$) {
      x = ref$[i$];
      x.transition().duration(750).style('opacity', 1);
    }
    d3.select('#content').transition().duration(750).style('background', '#dfe');
    lineBox = svg.append('g');
    return circleBox = svg.append('g');
  };
  this.updateRelations = function(data){
    var link, oldnode, defs, imgs, lines, circles, names, relations;
    data = tmp2d3(data);
    force.nodes(data.nodes).links(data.links).start();
    lineBox.selectAll('g.line-group').data(data.links).exit().remove();
    link = lineBox.selectAll('g.line-group').data(data.links).enter().append('g').attr('class', 'line-group');
    circleBox.selectAll('g.circle-group').data(data.nodes).exit().remove();
    nodes = circleBox.selectAll('g.circle-group').data(data.nodes).enter().append('g').attr('class', 'circle-group').attr('x', 100).attr('y', 100);
    oldnode = null;
    svg.selectAll('defs').data(data.nodes).exit().remove();
    defs = svg.selectAll('defs').data(data.nodes).enter().append('pattern').attr('id', function(it){
      return "defs-head-" + currentDomain + "-" + it.id;
    }).attr('patternUnits', 'userSpaceOnUse').attr('width', 100).attr('height', 100);
    imgs = defs.append('image').attr('xlink:href', function(it){
      return window.relationData.img[it.name] || 'img/head/unknown.png';
    }).attr('x', 0).attr('y', 0).attr('width', 60).attr('height', 60);
    defs.append('marker').attr('id', 'arrow').attr('viewBox', "-30 -5 10 10").attr('markerWidth', 20).attr('markerHeight', 7).attr('fill', '#bbb').attr('stroke', '#999').attr('stroke-width', 1).attr('orient', 'auto').append('path').attr('d', "M -27 -3 L -22 0 L -27 3 L -27 -3");
    defs.append('marker').attr('id', 'arrow2').attr('viewBox', "10 -5 30 10").attr('markerWidth', 20).attr('markerHeight', 7).attr('fill', '#bbb').attr('stroke', '#999').attr('stroke-width', 1).attr('orient', 'auto').append('path').attr('d', "M 27 -3 L 22 0 L 27 3 L 27 -3");
    defs = svg.selectAll('defs').each(function(it, i){
      this.attr('id', function(it){
        return "defs-head-" + currentDomain + "-" + it.id;
      });
      return d.selectAll('image').attr('xlink:href', function(it){
        return window.relationData.img[it.name];
      });
    });
    lines = link.append('line').attr('class', 'link').attr('marker-end', 'url(#arrow)').attr('marker-start', function(it){
      if (it.bidirect) {
        return 'url(#arrow2)';
      }
    }).style('stroke-width', function(){
      return 2;
    });
    circles = nodes.append('circle').attr('class', 'node').attr('cx', 30).attr('cy', 30).attr('r', 30).attr('fill', function(it){
      return "url(#defs-head-" + currentDomain + "-" + it.id + ")";
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
    names = nodes.append('g');
    names.append('rect').attr('x', -5).attr('y', 56).attr('rx', 5).attr('ry', 5).attr('width', 70).attr('height', 18).attr('fill', '#fff').attr('style', 'opacity:0.3');
    names.append('text').attr('class', 'text-name').attr('width', 200).attr('x', 30).attr('y', 70).attr('text-anchor', 'middle').on('mousemover', function(it){
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
    circleBox.selectAll('text.text-name').data(data.nodes).text(function(it){
      return it.name;
    });
    relations = link.append('g').attr('width', 100).attr('x', 0).attr('y', 0);
    relations.append('rect').attr('x', -35).attr('y', -14).attr('rx', 5).attr('ry', 5).attr('width', 70).attr('height', 18).attr('fill', '#fff').attr('style', 'opacity:0.3');
    relations.append('text').attr('class', 'text-relation').attr('text-anchor', 'middle').attr('font-size', 11);
    lineBox.selectAll('text.text-relation').data(data.links).text(function(it){
      return it.name;
    });
    nodes = circleBox.selectAll('g.circle-group');
    lines = lineBox.selectAll('line.link').data(data.links);
    circles = circleBox.selectAll('circle.node').attr('fill', function(){
      return '#999';
    }).attr('stroke', '#999').data(data.nodes);
    setTimeout(function(){
      return circles.attr('fill', function(it){
        return "url(#defs-head-" + currentDomain + "-" + it.id + ")";
      });
    }, 100);
    relations = lineBox.selectAll("g.line-group > g").data(data.links);
    return force.on('tick', function(){
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
      return relations.attr('transform', function(it){
        return (function(it){
          return join$.call(it, '');
        })([
          "translate(", it.bidirect
            ? (it.source.x + it.target.x) / 2
            : (2 * it.source.x + it.target.x) / 3, ",", it.bidirect
            ? (it.source.y + it.target.y) / 2
            : (2 * it.source.y + it.target.y) / 3, ")"
        ]);
      });
    });
  };
  this.toggleGenerate = function(){
    $('#loading').fadeIn(100);
    if (randomizer) {
      toggleRandomizer();
    }
    return clear();
  };
  this.toggleAdd = function(){
    var data, srcName, desName, linkName, i$, ref$, len$, name, obj, srcId, desId;
    data = this.relationData;
    srcName = $('select#source-chooser').val();
    desName = $('select#target-chooser').val();
    linkName = $('select#link-chooser').val();
    for (i$ = 0, len$ = (ref$ = [srcName, desName]).length; i$ < len$; ++i$) {
      name = ref$[i$];
      if (!this.nameHash[name]) {
        obj = {
          id: data.nodes.length,
          name: name
        };
        data.nodes.push(obj);
        this.nameHash[name] = obj;
        mpl.child('nodes').push(obj);
      }
    }
    srcId = this.nameHash[srcName].id;
    desId = this.nameHash[desName].id;
    name = srcId + " " + linkName + " " + desId;
    if (!this.linkHash[name]) {
      obj = {
        src: srcId,
        des: desId,
        name: linkName
      };
      data.links.push(obj);
      this.linkHash[name] = obj;
      return mpl.child('links').push(obj);
    }
  };
  randomizer = null;
  this.toggleRandomizer = function(){
    if (!randomizer) {
      $('#toggle-random').addClass('active');
      return randomizer = setInterval(function(){
        var value;
        value = 2 + parseInt(Math.random() * ($('select#name-chooser option').length - 1));
        return $('select#name-chooser').val($("select#name-chooser option:nth-child(" + value + ")}").val()).trigger('change');
      }, 100);
    } else {
      $('#toggle-random').removeClass('active');
      clearInterval(randomizer);
      return randomizer = null;
    }
  };
  updateSelect = function(data){
    var n, names, res$, i$, to$, x;
    n = data.nodes;
    names = [];
    res$ = [];
    for (i$ = 0, to$ = n.length; i$ < to$; ++i$) {
      x = i$;
      res$.push(n[x].name);
    }
    names = res$;
    d3.select('select#name-chooser').selectAll('option').data(names).exit().remove();
    d3.select('select#name-chooser').selectAll('option').data(names).enter().append('option');
    d3.select('select#name-chooser').selectAll('option').attr('value', function(it){
      return it;
    }).text(function(it){
      return it;
    });
    d3.select('select#source-chooser').selectAll('option').data(names).exit().remove();
    d3.select('select#source-chooser').selectAll('option').data(names).enter().append('option');
    d3.select('select#source-chooser').selectAll('option').attr('value', function(it){
      return it;
    }).text(function(it){
      return it;
    });
    d3.select('select#target-chooser').selectAll('option').data(names).exit().remove();
    d3.select('select#target-chooser').selectAll('option').data(names).enter().append('option');
    return d3.select('select#target-chooser').selectAll('option').attr('value', function(it){
      return it;
    }).text(function(it){
      return it;
    });
  };
  initDb = function(domain){
    currentDomain = domain;
    window.relationData = {
      nodes: [],
      links: [],
      img: {}
    };
    window.nameHash = {};
    window.linkHash = {};
    $('#loading').fadeIn(100);
    mpl = new Firebase("https://ppllink.firebaseio.com/" + domain);
    return mpl.on('value', function(s){
      var _d, data, k, ref$, v;
      reloadWorkaround = reloadWorkaround + 1;
      _d = s.val();
      if (_d === null) {
        _d = {
          nodes: [],
          links: [],
          img: {}
        };
      }
      data = window.relationData;
      for (k in ref$ = _d.nodes) {
        v = ref$[k];
        if (!window.nameHash[v.name]) {
          data.nodes.push(v);
        }
        window.nameHash[v.name] = v;
      }
      for (k in ref$ = _d.links) {
        v = ref$[k];
        if (!window.linkHash[v.name]) {
          data.links.push(v);
        }
        window.linkHash[v.src + " " + v.name + " " + v.des] = v;
      }
      for (k in ref$ = _d.img) {
        v = ref$[k];
        data.img[k] = v;
      }
      window.relationData = data;
      updateSelect(data);
      window.updateRelations(data);
      return $('#loading').fadeOut(400);
    });
  };
  init = function(error, graph){
    window.toggleGenerate();
    return generate(graph);
  };
  $.fn.disableSelect = function(){
    return this.attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
  };
  $(document).ready(function(){
    var formatNomatch, formatLinkSelect, formatLinkResult, domain;
    $(document).disableSelect();
    $('body').tooltip({
      selector: '[rel=tooltip]'
    });
    $('select#name-chooser').select2({
      placeholder: "選擇主角",
      allowClear: true,
      width: '110px'
    });
    formatNomatch = function(){
      return "將新增名稱";
    };
    $('select#domain-chooser').select2({
      width: '110px',
      placeholder: '選擇領域',
      formatNoMatches: formatNomatch
    }).on('change', function(e){
      return initDb(e.val);
    });
    $('select#source-chooser').select2({
      width: '110px',
      placeholder: '加或選主角',
      formatNoMatches: formatNomatch,
      createSearchChioce: function(it){
        return it;
      },
      change: function(){
        return $('#blah').text('hihi');
      }
    });
    formatLinkSelect = function(it){
      var bk;
      if (!it.id) {
        return it.text;
      }
      bk = (function(){
        var ref$;
        switch ((ref$ = $(it.element)) != null && ref$.data('type')) {
        case 1:
          return '#9c7';
        case -1:
          return '#c97';
        default:
          return '#bbb';
        }
      }());
      return ("<i class='link-attr' style='background:" + bk + "'></i> ") + it.text;
    };
    formatLinkResult = function(it){
      return it.text;
    };
    $('select#link-chooser').select2({
      placeholder: '設定關係',
      allowClear: true,
      width: '120px',
      formatSelection: formatLinkSelect,
      formatResult: formatLinkSelect,
      formatNoMatches: formatNomatch
    });
    $('select#target-chooser').select2({
      width: '110px',
      placeholder: '加或選目標',
      formatNoMatches: formatNomatch
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
    init(null, window.relationData);
    domain = window.location.href.split("?")[1];
    if (!domain) {
      domain = 'sandbox';
    }
    return initDb(domain);
  });
  headPayload = null;
  headName = null;
  this.headIconUpload = function(name){
    var val;
    val = $(headName).val();
    if (!val) {
      return;
    }
    mpl.child('img').child(val).set(headPayload);
    return window.relationData.img[val] = headPayload;
  };
  headIconSelect = function(evt){
    var f, reader;
    f = evt.target.files[0];
    reader = new FileReader();
    reader.onload = function(e){
      var fsize;
      fsize = e.total > 1000000
        ? parseInt(e.total / 1000000) + "MB"
        : parseInt(e.total / 1000) + "KB";
      $('#head-icon-size').text("檔案大小: " + fsize);
      if (e.total < 100000) {
        headPayload = e.target.result;
        document.getElementById('upload-preview').src = headPayload;
        $('#head-icon-size').css('color', '#000');
        return $('#head-upload-btn').removeClass('disabled').addClass('btn-primary').prop('disabled', false);
      } else {
        $('#head-icon-size').css('color', '#900');
        return $('#head-upload-btn').addClass('disabled').removeClass('btn-primary').prop('disabled', true);
      }
    };
    return reader.readAsDataURL(f);
  };
  fu = document.getElementById('head-upload');
  fu.addEventListener('change', headIconSelect, false);
  this.setIcon = function(name){
    if (name) {
      headName = name;
    }
    return $('#head-upload-modal').modal('toggle');
  };
}).call(this);
