#!/usr/bin/env python

import json

import pymongo
from bottle import run, post, get, template, debug, static_file

class DB(object):
    def __init__(self):
        self.db = pymongo.Connection().ppllink

    def names(self):
        return list(self.db.node.find({},{'name':1, '_id':0}))

    def node(self, name):
        return self.db.node.find_one({'name':name})

    def link(self, src, dst, relation, bidirect):
        data = {
            'src':self.node(src)['id'],
            'dst':self.node(dst)['id'],
            'relation':relation,
            'bidirect':bool(bidirect)
        }
        self.db.link.save(data)

    def dump(self):
        return {
            'node':list(self.db.node.find({},{'_id':0})),
            'link':list(self.db.link.find({},{'_id':0}))
        }

    def subgraph(self, name, level):
        queue = [self.node(name)]
        nodes = [self.node(name)]
        links = []
        for i in range(level):
            while queue:
                node = queue.pop()
                if node in nodes:
                    continue
                name = node['name']
                for link in self.db.link.find({'src':name}):
                    other = self.db.node.find_one({'id':link['dst']})
                    if other not in nodes:
                        nodes.append(other)
                    if other not in queue:
                        queue.append(other)
                    if link not in links:
                        links.append(link)
                for link in self.db.link.find({'dst':name}):
                    other = self.db.node.find_one({'id':link['src']})
                    if other not in nodes:
                        nodes.append(other)
                    if other not in queue:
                        queue.append(other)
                    if link not in links:
                        links.append(link)
        for doc in nodes + links:
            if '_id' in doc:
                doc.pop('_id')
        return {'node':nodes, 'link':links}

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

@post('/link/<src>/<dst>/<relation>/<bidirect>')
def link(src, dst, relation, bidirect=False):
    bidirect = True if bidirect.lower() in ['1', 'true', 'yes'] else False
    DB().link(src, dst, relation, bidirect)
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

