var http = require('http');
var handlebars = require('handlebars');
var sqlite = require('sqlite3');
var fs = require('fs');
var qs = require('querystring');

var db = new sqlite.Database("notas.db");

http.createServer(function(request, response) {
  var staticFiles = ["/notas.css", "/borrado.js", "/bootstrap-confirmation.js" ];

  if ( staticFiles.indexOf(request.url) !== -1) {
    var file = request.url.substring(1);
    var extension = file.substring(file.indexOf(".") + 1);
    fs.readFile(file, {encoding: 'utf-8'}, function(error, source) {
      response.writeHead(200, {'Content-type': 'text/' + extension});
      response.end(source);
    });
  } else if (request.method == "POST") {
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