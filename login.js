var qs = require ("querystring"); 
var utils = require ("./utils");

function handle (request, response, cookies, db) {
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
      db.get("SELECT * FROM usuarios WHERE usuario = ? AND password = ?", [datos.usuario, utils.md5(datos.password)], function (error, row) {
        if (error) throw error;
        if (row) {
          cookies.set("idusuario", row.id);
          response.writeHead(302, {"Location": "/vernotas"});
          response.end();
        } else {
          response.writeHead(200, {'Content-type': 'text/plain; charset = utf-8'});
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
          db.run("INSERT INTO usuarios (usuario, password) VALUES (?, ?)", [datos.usuario,  utils.md5(datos.password)], function(error) {
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
}

module.exports = {
  handle: handle
};

