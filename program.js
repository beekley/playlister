var songkick_wrapper = require('songkick-wrapper');
var http = require('http');
var keys = require('./apiKeys.js');

var songkick = songkick_wrapper.create(keys.songkick);

var event = songkick.getEventDetails(process.argv[2]);

var artists = [];

/*http.get('http://api.spotify.com/v1/search?q=Muse&type=track,artist&market=US', function(response) {
    response.setEncoding('utf8');
    response.on('data', function (body) {
        console.log(body);
    });
});*/

// get list of artists for the inputted event ID
event.then(function(value) {
    
    value.results.event.performance.forEach(function(artist) {
        console.log(artist.displayName);
        artists.push(artist.displayName);
    });
    
    // search for top artist in spotify
    /*var options = {
        'path':'/v1/search?q=Muse&type=track,artist&market=US HTTP/1.1',
        'Host': 'api.spotify.com',
        'Accept-Encoding': 'gzip, deflate, compress',
        'Accept': 'application/json'
    };*/
    
});

// testing http
http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type":"text/plain"});
    artists.forEach(function(artist) {
        response.write(artist + '\n');
    })
    response.end();
}).listen(8888);