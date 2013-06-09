[width,height] = [$ \#content .width!, $ \#content .height!]

ui-test = true

charge = (d) -> -1000 - ((d[\hover] || 0) && 8000)
color  = d3.scale.category20!
force  = null
svg    = null
gc1    = null
gc2    = null
mpl    = null
reload-workaround = 0
circle-box    = null
line-box    = null
custom-drag = null
current-domain = \sandbox
@relation-data = nodes:[], links:[], img: {}
@name-hash = {}
@link-hash = {}

clear = ->
  $ \svg .remove!
  force := d3.layout.force!
     .charge       charge
     .linkDistance 100
     .gravity      0.1
     .linkStrength 0.1
     .size         [width,height]
  svg := d3.select \#content .append \svg
     .attr \width "100%"
     .attr \height "100%"
  force.custom-drag = ->
    if !custom-drag
      custom-drag := d3.behavior.drag!.origin(-> it) .on \dragstart  -> it.fixed .|.=2
        .on \drag ->
          it.px = d3.event.x
          it.py = d3.event.y
          force.resume!
        .on \dragend   -> 
          if !playstate then force.stop!
          it.fixed .&.=1
    this.on \mouseover.force -> it.fixed .|.=4
      .on \mouseout.force -> it.fixed .&.=3
      .call custom-drag

tmp2d3 = ->
  position = {}
  for i til it.nodes.length
    position[it.nodes[i].id] = i
  nodes: [{
    id:       position[it.nodes[i].id]
    gid:      it.nodes[i].id
    name:     it.nodes[i].name
    group:    i
  } for i til it.nodes.length] 
  links: [{
    source:   position[it.links[i].src]
    target:   position[it.links[i].des]
    name:     it.links[i].name
    bidirect: it.links[i].bidirect
    value:  1
  } for i til it.links.length]

playstate = 1
@toggle-play = ->
  if !force then return
  playstate := 1-playstate
  if playstate 
    force.start!
    $ \#toggle-play .removeClass \active
  else
    force.stop!
    $ \#toggle-play .addClass \active
@xxblah = ->
  alert \hi

depthvalue = 1
depthmap = [0 1 2 3 4 6 12 20 \&#x221E; ]
@toggle-depth = (v) ->
   $ "\#toggle-depth li:nth-child(#{depthvalue})" .removeClass \active
   depthvalue := v
   $ "\#toggle-depth li:nth-child(#{depthvalue})" .addClass \active
   $ \#depth-note .html depthmap[depthvalue]

lockstate = 0
nodes = null
@toggleLock = ->
  if !force then return
  lockstate := 1 - lockstate
  if lockstate then $ \#toggle-lock .addClass \active
  else $ \#toggle-lock .removeClass \active
  nodes.each (d,i)->
    d.fixed = if lockstate then true
    else false
  nodes.selectAll \circle .attr \stroke if lockstate then \#f00 else \#999

gravitystate = 1
@toggle-gravity = (v) ->
  if !gc1 or !playstate then return
  $ "\#toggle-gravity li:nth-child(#{gravitystate})" .removeClass \active
  gravitystate := v
  $ "\#toggle-gravity li:nth-child(#{gravitystate})" .addClass \active
  switch v
  |1 => 
    gc1.transition! .duration 750
      .attr \r 3*height/4
    gc2.transition! .delay 100 .duration 750
      .attr \fill \#bec
      .attr \r height
    d3.select \#content .transition! .duration 750 .style \background \#dfe
    force.gravity 0.1 .start!
  |2 => 
    gc1.transition! .duration 750
      .attr \r 3*height/5
    gc2.transition! .delay 100 .duration 750
      .attr \fill \#cdb
      .attr \r 4*height/5
    d3.select \#content .transition! .duration 750 .style \background \#efd
    force.gravity 0.2 .start!
  |3 => 
    gc1.transition! .duration 750
      .attr \r 2*height/5
    gc2.transition! .delay 100 .duration 750
      .attr \fill \#dca
      .attr \r 3*height/5
    d3.select \#content .transition! .duration 750 .style \background \#fed
    force.gravity 0.4 .start!
  |4 =>
    gc1.transition! .duration 750
      .attr \r 3*height/10
    gc2.transition! .delay 100 .duration 750
      .attr \fill \#eaa
      .attr \r 2*height/5
    d3.select \#content .transition! .duration 750 .style \background \#fdd
    force.gravity 1.0 .start!
  | _ => force.gravity 1.5 .start!

generate = (error, graph) ->
  #graph = tmp2d3 graph
  #force.nodes graph.nodes
  #     .links graph.links .start!

  gc2 := svg.append \circle
      .attr \cx width/2 
      .attr \cy height/2
      .attr \r  height
      .attr \fill \#bec
      .style \opacity \0

  gc1 := svg.append \circle
      .attr \cx width/2 
      .attr \cy height/2
      .attr \r  3*height/4
      .attr \fill \#fff
      .style \opacity \0

  [x.transition! .duration 750 .style \opacity 1 for x in [gc1,gc2]]
  d3.select \#content .transition! .duration 750 .style \background \#dfe

  line-box := svg.append \g
  circle-box := svg.append \g
  #window.update-relations graph
  #$ \#loading .fadeOut 400

@update-relations = (data) ->
  data = tmp2d3 data
  force.nodes data.nodes
       .links data.links .start!
  line-box.selectAll \g.line-group .data data.links .exit!remove!
  link = line-box.selectAll \g.line-group .data data.links .enter! .append \g .attr \class \line-group
  circle-box.selectAll \g.circle-group .data data.nodes .exit!remove!
  nodes := circle-box.selectAll \g.circle-group .data data.nodes .enter! .append \g
      .attr \class \circle-group
      .attr \x 100
      .attr \y 100

  oldnode = null
  svg.selectAll \defs .data data.nodes .exit!remove!
  defs = svg.selectAll \defs .data data.nodes .enter! .append \pattern
      .attr \id -> "defs-head-#{current-domain}-#{it.id}"
      .attr \patternUnits \userSpaceOnUse
      .attr \width 100
      .attr \height 100
  imgs = defs.append \image
      .attr \xlink:href -> window.relation-data.img[it.name] or \img/head/unknown.png
      .attr \x 0
      .attr \y 0
      .attr \width 60
      .attr \height 60
  defs.append \marker
      .attr \id \arrow
      .attr \viewBox "-30 -5 10 10"
      .attr \markerWidth 20
      .attr \markerHeight 7
      .attr \fill \#bbb
      .attr \stroke \#999
      .attr \stroke-width 1
      .attr \orient \auto
      .append \path
      .attr \d "M -27 -3 L -22 0 L -27 3 L -27 -3"
  defs.append \marker
      .attr \id \arrow2
      .attr \viewBox "10 -5 30 10"
      .attr \markerWidth 20
      .attr \markerHeight 7
      .attr \fill \#bbb
      .attr \stroke \#999
      .attr \stroke-width 1
      .attr \orient \auto
      .append \path
      .attr \d "M 27 -3 L 22 0 L 27 3 L 27 -3"
  
  defs = svg.selectAll \defs .each (it,i) ->
    this.attr \id -> "defs-head-#{current-domain}-#{it.id}"
    d.selectAll \image
      .attr \xlink:href -> window.relation-data.img[it.name]#\img/head/h +it.gid + \.png

  lines = link.append \line
      .attr \class \link
      .attr \marker-end 'url(#arrow)'
      .attr \marker-start -> if it.bidirect then 'url(#arrow2)'
      .style \stroke-width -> 2 #Math.sqrt it.value
  circles = nodes.append \circle
      .attr \class \node
      .attr \cx 30
      .attr \cy 30
      .attr \r 30
      .attr \fill -> "url(\#defs-head-#{current-domain}-#{it.id})"
      .attr \stroke \#999
      .attr \stroke-width \2.5px
      .on \mouseover -> 
        if oldnode==it then return
        if oldnode then oldnode.hover = 0
        it <<< hover: 1
        oldnode := it
        if playstate then force.start!
      #.on \mouseout -> it <<< hover: 0, fixed: false; force.start!
      .on \click -> 
        # $ d3.event.target .popover title: "test"
        # $ d4.event.target .popover \show
        if it.fixed
          $ d3.event.target .attr \stroke \#999
          it.fixed = false
        else
          $ d3.event.target .attr \stroke \#f00
          it.fixed = true
      .call force.custom-drag 

  names = nodes.append \g
  names.append \rect
      .attr \x -5    .attr \y 56
      .attr \rx 5     .attr \ry 5
      .attr \width 70 .attr \height 18
      .attr \fill \#fff
      .attr \style \opacity:0.3
  names.append \text
      .attr \class \text-name
      .attr \width 200
      .attr \x 30  .attr \y 70
      .attr \text-anchor \middle
      .on \mousemover -> 
        if oldnode==it then return
        if oldnode then oldnode.hover = 0
        oldnode := it
        it <<< hover: 1
        if playstate then force.start!
  circle-box.selectAll \text.text-name .data data.nodes
      .text -> it.name

  relations = link.append \g
      .attr \width 100
      .attr \x 0 .attr \y 0

  relations.append \rect
      .attr \x -35    .attr \y -14
      .attr \rx 5     .attr \ry 5
      .attr \width 70 .attr \height 18
      .attr \fill \#fff
      .attr \style \opacity:0.3
  relations.append \text
      .attr \class \text-relation
      .attr \text-anchor \middle
      .attr \font-size 11
  line-box.selectAll \text.text-relation .data data.links
      .text -> it.name

  nodes := circle-box.selectAll \g.circle-group
  lines = line-box.selectAll \line.link .data data.links
  circles = circle-box.selectAll \circle.node 
      .attr \fill -> \#999
      .attr \stroke \#999 .data data.nodes
  setTimeout -> circles.attr \fill -> "url(\#defs-head-#{current-domain}-#{it.id})"
  ,100
  relations = line-box.selectAll "g.line-group > g" .data data.links
  force.on \tick ->
    lines.attr \x1 -> it.source.x
      .attr \y1 -> it.source.y
      .attr \x2 -> it.target.x
      .attr \y2 -> it.target.y
    nodes.attr \transform -> "translate(#{it.x-30},#{it.y-30})"
    relations.attr \transform ->
      (* '') ["translate("
      if it.bidirect then (it.source.x + it.target.x)/2 else (2*it.source.x + it.target.x)/3
      ","
      if it.bidirect then (it.source.y + it.target.y)/2 else (2*it.source.y + it.target.y)/3
      ")" ]



@toggle-generate = ->
  $ \#loading .fadeIn 100
  if randomizer then toggle-randomizer!
  clear!
  #<- setTimeout _, 400
  #generate null,@relation-data
  #if ui-test then d3.json "/ppllink/relation.json?timestamp=#{new Date! .getTime!}" generate
  #else d3.json "/query/#{$ \select#name-chooser .val!}/2" generate
  
@toggle-add = ->
  data = @relation-data
  src-name = $ \select#source-chooser .val!
  des-name = $ \select#target-chooser .val!
  link-name = $ \select#link-chooser .val!
  for name in [src-name, des-name]
    #console.log "test #name"
    if !@name-hash[name]
      obj = id: data.nodes.length, name: name
      data.nodes.push obj
      @name-hash[name] = obj
      mpl.child \nodes .push obj
      #console.log "add people #name"
  src-id = @name-hash[src-name]id
  des-id = @name-hash[des-name]id
  name = "#src-id #link-name #des-id"
  if !@link-hash[name]
    obj = src: src-id, des: des-id, name: link-name
    data.links.push obj
    @link-hash[name] = obj
    mpl.child \links .push obj
    #console.log "add link #link-name"
  #@update-relations @relation-data

randomizer = null
@toggle-randomizer = ->
  if !randomizer
    $ \#toggle-random .addClass \active
    randomizer := do
      <- setInterval _, 100
      value = 2+parseInt(Math.random! * ($ '\select#name-chooser option' .length-1))
      $ \select#name-chooser .val($ "select\#name-chooser option:nth-child(#{value})}" .val!) .trigger \change
  else
    $ \#toggle-random .removeClass \active
    clearInterval randomizer
    randomizer := null
  
#d3.json "/#{if ui-test then "ppllink/" else ""}names" (error,graph) ->
update-select = (data) ->
  n = data.nodes
  names = []
  names = [n[x].name for x til n.length]
  d3.select \select#name-chooser .selectAll \option .data names .exit!remove!
  d3.select \select#name-chooser .selectAll \option .data names .enter! .append \option
  d3.select \select#name-chooser .selectAll \option
      .attr \value -> it
      .text -> it
  d3.select \select#source-chooser .selectAll \option .data names .exit!remove!
  d3.select \select#source-chooser .selectAll \option .data names .enter! .append \option
  d3.select \select#source-chooser .selectAll \option
      .attr \value -> it
      .text -> it
  d3.select \select#target-chooser .selectAll \option .data names .exit!remove!
  d3.select \select#target-chooser .selectAll \option .data names .enter! .append \option
  d3.select \select#target-chooser .selectAll \option
      .attr \value -> it
      .text -> it

init-db = (domain) ->
  current-domain := domain
  window.relation-data = nodes:[], links:[], img: {}
  window.name-hash = {}
  window.link-hash = {}
  $ \#loading .fadeIn 100
  mpl := new Firebase "https://ppllink.firebaseio.com/#{domain}"
  mpl.on \value, (s) ->
    reload-workaround := reload-workaround + 1
    #if reload-workaround > 3 then window.location.reload!
    _d = s.val!
    if _d == null then _d = nodes: [], links: [], img: {}
    data = window.relation-data
    for k,v of _d.nodes
      if !window.name-hash[v.name] then data.nodes.push v
      window.name-hash[v.name] = v
    for k,v of _d.links
      if !window.link-hash[v.name] then data.links.push v
      window.link-hash["#{v.src} #{v.name} #{v.des}"] = v
    for k,v of _d.img
      data.img[k] = v
    window.relation-data = data
    update-select data
    window.update-relations data
    $ \#loading .fadeOut 400

init = (error,graph) ->
  window.toggle-generate!
  generate graph
  #$ \select#name-chooser .change ->
  #  clear!
  #  if ui-test then d3.json "/ppllink/relation.json?timestamp=#{new Date! .getTime!}" generate
  #  else d3.json "/query/#{$ \select#name-chooser .val!}/2" generate

$.fn.disableSelect = ->
  this.attr \unselectable \on
      .css \user-select \none
      .on \selectstart false
$ document .ready ->
  $ document .disableSelect!
  $ \body .tooltip selector: '[rel=tooltip]'
  $ \select#name-chooser .select2 do
    placeholder: "選擇主角"
    allowClear: true
    width: \110px
  format-nomatch = ->
    "將新增名稱"
  $ \select#domain-chooser .select2 do
    width: \110px placeholder: \選擇領域 formatNoMatches: format-nomatch
  .on \change (e) -> init-db e.val
  $ \select#source-chooser .select2 do
    width: \110px placeholder: \加或選主角 formatNoMatches: format-nomatch
    createSearchChioce: -> it
    change: -> $ \#blah .text \hihi
  format-link-select = ->
    if !it.id then return it.text
    bk = switch $(it.element)?.data \type
    | 1  => \#9c7
    | -1 => \#c97
    | otherwise => \#bbb
    "<i class='link-attr' style='background:#{bk}'></i> "+it.text
  format-link-result = ->
    it.text
  $ \select#link-chooser .select2 do
    placeholder: \設定關係
    allowClear: true
    width: \120px 
    formatSelection: format-link-select
    formatResult: format-link-select
    formatNoMatches: format-nomatch
  $ \select#target-chooser .select2 do
    width: \110px
    placeholder: \加或選目標 formatNoMatches: format-nomatch
  height := ($ \body .height!) - ($ \#content .position! .top) - 30
  $ \#content .height height
  $ window .resize ->
    height := ($ \body .height!) - ($ \#content .position! .top) - 30
    $ \#content .height height
    gc2?.attr \cx width/2
        .attr \cy height/2
    gc1?.attr \cx width/2
        .attr \cy height/2
    force?.size [width,height] 
        ..start! if playstate
  init null, window.relation-data
  domain = window.location.href.split("?")[1]
  if !domain then domain = \sandbox

  init-db domain

  #if ui-test then d3.json "/ppllink/names.json" init
  #else d3.json "/names" init

head-payload = null
head-name = null
@head-icon-upload = (name) ->
  val = $ head-name .val!
  if !val then return
  mpl.child \img .child val .set head-payload
  window.relation-data.img[val] = head-payload
    
head-icon-select = (evt) ->
  f = evt.target.files.0
  reader = new FileReader!
  reader.onload = (e) ->
    fsize = if e.total>1000000 then "#{parseInt e.total/1000000}MB" else "#{parseInt e.total/1000}KB"
    $ \#head-icon-size .text "檔案大小: #fsize"
    if e.total < 100000 then
      head-payload := e.target.result
      document.getElementById \upload-preview .src = head-payload
      $ \#head-icon-size .css \color, \#000
      $ \#head-upload-btn .removeClass \disabled .addClass \btn-primary .prop \disabled false
    else
      $ \#head-icon-size .css \color, \#900
      $ \#head-upload-btn .addClass \disabled .removeClass \btn-primary .prop \disabled true
    
  reader.readAsDataURL f

fu = document.getElementById \head-upload
fu.addEventListener \change, head-icon-select, false

@set-icon = (name) ->
  if name then head-name := name
  $ \#head-upload-modal .modal \toggle
