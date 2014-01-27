var qs = require ("querystring");
var handlebars = require ("handlebars");
var fs = require ("fs");

function agregar(request, response, cookies, db) {
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
}

function borrar(request, response, cookies, db) {
  var signo = request.url.indexOf("?");
  var numFila = request.url.substring(signo+1);
  var idFila = qs.parse(numFila).fila;
  db.run("DELETE FROM notas WHERE id=? and idusuario=?", [idFila, cookies.get("idusuario")], function(error) {
    if (!error){ 
      response.writeHead(200, {'Content-type': 'text/plain'});
      response.end("ok");
    }
  });
}

function showForm(idusuario, response, db) {
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
}


module.exports = {
  agregar: agregar,
  borrar: borrar,
  mostrar: showForm
};

