all:
	jade index.jade
	jade create.jade
	livescript -cp relation.ls > relation.js
