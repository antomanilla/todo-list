var http = require('http');
var sqlite = require('sqlite3');
var Cookies = require ('cookies');
var utils = require ("./utils");
var login = require ("./login");
var nota = require ("./nota");
var statics = require ("./statics");

var db = new sqlite.Database("notas.db");


http.createServer(function(request, response) {
  var cookies = new Cookies (request, response);

  if (statics.isStatic(request)) {
    statics.handle(request, response);

  } else if (request.url == "/agregarnota") {
    nota.agregar(request, response, cookies, db);
  
  } else if (request.url == "/signin"){
    login.handle(request, response, cookies, db);
  
  } else if (request.url.substring(0,11) == "/borrarFila"){
    nota.borrar(request, response, cookies, db);
  
  } else if (request.url == "/vernotas"){
    nota.mostrar(cookies.get("idusuario"), response, db);
      
  } else {
    utils.error(response);
  }

  
}).listen(1337, '0.0.0.0');
