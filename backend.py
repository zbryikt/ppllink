#!/usr/bin/env python

from bottle import run, post, get, template

@get('/')
def root():
    return template('index.html')

@get('/query/<name>')
def query(name):
    return 'hello %s' % name

run()

