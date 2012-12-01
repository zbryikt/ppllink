#!/usr/bin/env python

import json
import pymongo
import sys

def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ['import', 'export']:
        print 'usage: %s import|export [db.json]' % sys.argv[0]
        return 0

    if len(sys.argv) < 3:
        filename = 'db.json'
    else:
        filename = sys.argv[2]

    db = pymongo.Connection().ppllink

    if sys.argv[1] == 'import':
        data = json.load(open(filename))
        for node in data.get('nodes'):
            db.nodes.save(node)
        for link in data.get('links'):
            db.links.save(link)
    elif sys.argv[1] == 'export':
        nodes = list(db.nodes.find({}, {'_id':0}))
        links = list(db.links.find({}, {'_id':0}))
        json.dump({'nodes':nodes, 'links':links}, open(filename, 'w'), indent=2)
    else:
        assert 0

if __name__ == '__main__':
    sys.exit(main())

