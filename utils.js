var crypto = require ("crypto");

var md5 = function(x) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(x);
  return md5sum.digest('hex');
};


function error (response) {
  response.writeHead(200, {'Content-type': 'text/plain'});
  response.end("error. la pagina no existe.");
}

module.exports = {
  md5: md5,
  error: error
};