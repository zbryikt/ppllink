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
    return 'hello %s' % name

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

