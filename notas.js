var http = require('http');
var handlebars = require('handlebars');
var sqlite = require('sqlite3');
var fs = require('fs');
var qs = require('querystring');
var crypto = require ('crypto');
var Cookies = require ('cookies');

var db = new sqlite.Database("notas.db");

var md5 = function(x) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(x);
  return md5sum.digest('hex');
};

function error (response) {
  response.writeHead(200, {'Content-type': 'text/plain'});
  response.end("error. la pagina no existe.");
}

http.createServer(function(request, response) {
  var staticFiles = ["/notas.css", "/borrado.js", "/bootstrap-confirmation.js", '/', "/inicio.css"];
  var cookies = new Cookies (request, response);

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
      db.run("INSERT INTO notas (descripcion, fecha, idusuario) VALUES (?, ?, ?)", [datos.descripcion, datos.fecha, cookies.get("idusuario")], function () { 
          response.writeHead(302, {"Location": "/vernotas"});
          response.end();
      });
    });
  } else if (request.url == "/signin"){
    var body = '';
    request.on('data', function(chunk) {
      body += chunk;
    });
    request.on('end', function() {
      var datos = qs.parse(body);
      if (datos.accion == "iniciar") {
        if (!datos.password) {
          datos.password = "";
        }         
        db.get("SELECT * FROM usuarios WHERE usuario = ? AND password = ?", [datos.usuario, md5(datos.password)], function (error, row) {
          if (error) throw error;
          if (row) {
            cookies.set("idusuario", row.id);
            response.writeHead(302, {"Location": "/vernotas"});
            response.end();
          } else {
            response.writeHead(200, {'Content-type': 'text/plain'});
            response.end("Usuario o contraseña no existen.");
          }
        });
      } else if (datos.accion == "registrar") {
        db.get("SELECT * FROM usuarios WHERE usuario = ?", [datos.usuario], function (error, row) {
          if (error) throw error;
          if (row) {
            response.writeHead(200, {'Content-type': 'text/plain'});
            response.end("El nombre de usuario ya existe.");  
          } else {
            db.run("INSERT INTO usuarios (usuario, password) VALUES (?, ?)", [datos.usuario,  md5(datos.password)], function(error) {
              if (error) throw error;
              db.get("SELECT id FROM usuarios WHERE usuario = ?", [datos.usuario], function(error, row) {
                cookies.set("idusuario", row.id);
                response.writeHead(302, {"Location": "/vernotas"});
                response.end(); 
              });
            });
          }
        }); 
      }
    })
   
  } else if (request.url.substring(0,11) == "/borrarFila"){
    var signo = request.url.indexOf("?");
    var numFila = request.url.substring(signo+1);
    var idFila = qs.parse(numFila).fila;
    db.run("DELETE FROM notas WHERE id=? and idusuario=?", [idFila, cookies.get("idusuario")], function(error) {
      if (!error){ 
        response.writeHead(200, {'Content-type': 'text/plain'});
        response.end("ok");
      }
    });
  
  } else if (request.url == "/vernotas"){
    showForm(cookies.get("idusuario"));
      
  } else {
    error(response);
  }

  function showForm(idusuario) {
    fs.readFile('notas.html', {encoding: 'utf-8'}, function(error, source) {
      if (error) throw error;  
      var template = handlebars.compile(source);
      
      var sql = 'select id, descripcion, fecha from notas where idusuario = ? order by fecha asc';
      db.all(sql, [idusuario], function(error, rows) {
        if (error) throw error;
        var html = template({'notas': rows});
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(html);
      });
    });
  };
}).listen(1337, '0.0.0.0');