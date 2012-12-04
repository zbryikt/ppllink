#!/usr/bin/env python

# TODO
#   error handling
#   unit test

"""
REST API:

GET '/names'
    list names of all nodes.

    Example:
        GET '/names'
    Result:
        ["foo", "bar"]

GET '/query'
    usage: GET '/query/<name>/<level>'
    get subgraph which centers at <name> within <level>-level relations

    Exapmle:
        GET '/query/foo/1'
    Result:
        {
            "nodes":[{"id":1, "name":"foo"}, {"id":2, "name":"bar"}],
            "links":[{"src":1, "des":2, "relation":"foobar", bidirect:true}]
        }

POST '/add/'
    usage: POST '/add/<name>'
    post-data:
        title = title of the node
        tags = list of tags in json format
    add a node with <name>, <title>, and optional tags

    Example:
        POST '/add/foo' data={"title":"test", "tags"="[\"tag1\", \"tag2\"]"}
    Result:
        ok

POST '/link'
    usage: POST '/link/<src>/<des>/<relation>/<bidirect>'
    create a relation from name <src> to name <des> with description <relation> and boolean <bidirect>

    Example:
        POST '/link/foo/bar/foobar/true'
    Result:
        ok

"""

import json
import socket
import pymongo
from bottle import run, post, get, template, debug, static_file, request, redirect

class DB(object):
    def __init__(self):
        self.db = pymongo.Connection().ppllink

    def names(self):
        return list(self.db.nodes.find({},{'name':1, '_id':0}))

    def node(self, name):
        return self.db.nodes.find_one({'name':name})

    def add(self, name, title, tags=[]):
        self.db.nodes.save({'name':name, 'title':title, 'tags':tags})

    def link(self, src, des, relation, bidirect):
        data = {
            'src':self.node(src)['id'],
            'des':self.node(des)['id'],
            'relation':relation,
            'bidirect':bool(bidirect)
        }
        self.db.links.save(data)

    def dump(self):
        return {
            'nodes':list(self.db.nodes.find({},{'_id':0})),
            'links':list(self.db.links.find({},{'_id':0}))
        }

    def subgraph(self, name, level):
        queue = [self.node(name)]
        nodes = []
        links = []
        for i in range(level):
            to_search = queue[:]
            queue = []
            for node in to_search:
                if node not in nodes:
                    nodes.append(node)
                for first, second in [('src', 'des'), ('des', 'src')]:
                    for link in self.db.links.find({first:node['id']}):
                        other = self.db.nodes.find_one({'id':link[second]})
                        if other not in nodes:
                            nodes.append(other)
                        if other not in queue:
                            queue.append(other)
                        if link not in links:
                            links.append(link)
        for doc in nodes + links:
            if '_id' in doc:
                doc.pop('_id')
        return {'nodes':nodes, 'links':links}

@get('/')
def root():
    redirect('/index.html')

@get('/<filename:re:.*\.html>')
def html(filename):
    return static_file(filename, root='.')

@get('/dump')
def dump():
    '''for debug'''
    return '<pre>%s</pre>' % json.dumps(DB().dump(), indent=2)

@get('/names')
def names():
    return json.dumps(DB().names())

@get('/query/<name>/<level>')
def query(name, level=6):
    '''Return json of subgraph.'''
    return json.dumps(DB().subgraph(name, int(level)))

@post('/link/<src>/<des>/<relation>/<bidirect>')
def link(src, des, relation, bidirect=False):
    bidirect = True if bidirect.lower() in ['1', 'true', 'yes', 'bidirect'] else False
    DB().links(src, des, relation, bidirect)
    return 'ok'

@post('/add/<name>')
def add(name):
    title = request.forms.title or ''
    tags = json.loads(request.forms.tags or '[]')
    DB().add(name, title, tags)
    return 'ok'

@get('/css/<filepath:path>')
def send_css(filepath):
    return static_file(filepath, root='./css')

@get('/img/<filepath:path>')
def send_img(filepath):
    return static_file(filepath, root='./img')

@get('/js/<filepath:path>')
def send_js(filepath):
    return static_file(filepath, root='./js')

debug(True)
run(host=socket.gethostname(), port=8080, reloader=True)

