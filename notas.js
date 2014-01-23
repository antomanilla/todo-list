var http = require('http');
var handlebars = require('handlebars');
var sqlite = require('sqlite3');
var fs = require('fs');
var qs = require('querystring');
var crypto = require ('crypto');

var db = new sqlite.Database("notas.db");

var md5 = function(x) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(x);
  return md5sum.digest('hex');
}

http.createServer(function(request, response) {
  var staticFiles = ["/notas.css", "/borrado.js", "/bootstrap-confirmation.js", '/', "/inicio.css"];

  if ( staticFiles.indexOf(request.url) !== -1) {
    if (request.url == '/') {
      request.url = "/inicio.html";
    }
    var file = request.url.substring(1);
    var extension = file.substring(file.indexOf(".") + 1);
    fs.readFile(file, {encoding: 'utf-8'}, function(error, source) {
      response.writeHead(200, {'Content-type': 'text/' + extension});
      response.end(source);
    });
  } else if (request.url == "/agregarnota") {
    console.log("Holaaaa...");
    var body = '';
    request.on('data', function(chunk) {
      body += chunk;
    });
    request.on('end', function() {
      // aca tengo todo el request del chabon en body
      var datos = qs.parse(body);
      console.log(datos);
      db.run("INSERT INTO notas (descripcion, fecha) VALUES (?, ?)", [datos.descripcion, datos.fecha], showForm);
    });
  } else if (request.url == "/signin"){
    var body = '';
    request.on('data', function(chunk) {
      body += chunk;
    });
    request.on('end', function() {
      var datos = qs.parse(body);
      db.get("SELECT * FROM usuarios WHERE usuario = ? AND password = ?", [datos.usuario, md5(datos.password)], function (error, row) {
        if (error) throw error;
        if (row) { 
          showForm();
        } else {
          response.writeHead(200, {'Content-type': 'text/plain'});
          response.end("Usuario o contraseña no existen.");
        }
      } );
    })

   
  } else if (request.url.substring(0,11) == "/borrarFila"){
      var signo = request.url.indexOf("?");
      var numFila = request.url.substring(signo+1);
      var idFila = qs.parse(numFila).fila;
      db.run("DELETE FROM notas WHERE id=?", [idFila], function(error) {
        if (!error){ 
          response.writeHead(200, {'Content-type': 'text/plain'});
          response.end("ok");
        }
      });
  } else {
    showForm();
  }
  function showForm() {
    fs.readFile('notas.html', {encoding: 'utf-8'}, function(error, source) {
      if (error) throw error;  
      var template = handlebars.compile(source);

      var sql = 'select id, descripcion, fecha from notas order by fecha asc';
      db.all(sql, [], function(error, rows) {
        if (error) throw error;
        var html = template({'notas': rows});
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(html);
      });
    });
  };
}).listen(1337, '0.0.0.0');