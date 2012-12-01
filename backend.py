#!/usr/bin/env python

import json

import pymongo
from bottle import run, post, get, template, debug, static_file

class DB(object):
    def __init__(self):
        self.db = pymongo.Connection().ppllink

    def names(self):
        return list(self.db.nodes.find({},{'name':1, '_id':0}))

    def node(self, name):
        return self.db.nodes.find_one({'name':name})

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
                if node in nodes:
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
    return template('index.html')

@get('/names')
def names():
    return json.dumps(DB().names())

@get('/dump')
def dump():
    '''for debug'''
    return '<pre>%s</pre>' % json.dumps(DB().dump(), indent=2)

@get('/query/<name>/<level>')
def query(name, level=6):
    '''Return json of subgraph.'''
    return json.dumps(DB().subgraph(name, int(level)))

@post('/link/<src>/<des>/<relation>/<bidirect>')
def link(src, des, relation, bidirect=False):
    bidirect = True if bidirect.lower() in ['1', 'true', 'yes'] else False
    DB().links(src, des, relation, bidirect)
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
run(reloader=True)

