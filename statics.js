var fs = require ("fs");
var staticFiles = ["/notas.css", "/borrado.js", "/bootstrap-confirmation.js", '/', "/inicio.css"];

function isStatic (request) {
  return staticFiles.indexOf(request.url) !== -1;
}

function handle (request, response ) {   
  if (request.url == '/') {
    request.url = "/inicio.html";
  }
  var file = request.url.substring(1);
  var extension = file.substring(file.indexOf(".") + 1);
  fs.readFile(file, {encoding: 'utf-8'}, function(error, source) {
    response.writeHead(200, {'Content-type': 'text/' + extension});
    response.end(source);
  });
}

module.exports = {
  isStatic: isStatic,
  handle: handle
}