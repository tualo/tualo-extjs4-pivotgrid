Description
===========

tualo-webmail is a web IMAP client. Actualy the server is in development and may not work like expected.


Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.0 or newer
* An IMAP Account


Installation
============

If you have installed git:

	git clone git://github.com/tualo/tualo-webmail.git
	cd tualo-webmail
	npm update 

If you done have installed git:

	wget https://github.com/tualo/tualo-webmail/archive/master.zip
	unzip master.zip
	cd tualo-webmail-master
	npm update

Configuration
=============

Before you run the server the first time, you must configure it. You can configure them by editing the config/server.js file.

	nano config/server.js

If you start the server the first time, the first user login will create the an administrator account. With that account you 
can create the other users.

How to run
============

Start the server with the commandline:

    node app.js


LICENSE
============
GPL v3, see http://fsf.org