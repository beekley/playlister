var songkick_wrapper = require('songkick-wrapper');
var http = require('http');
var https = require('https');
var keys = require('./apiKeys.js');

var songkick = songkick_wrapper.create(keys.songkick);

var event = songkick.getEventDetails(process.argv[2]);

var artists = [];

// get list of artists for the inputted event ID
event.then(function(value) {
    
    value.results.event.performance.forEach(function(artist, i) {
        console.log(artist.displayName);
        artists.push({displayName: artist.displayName,
                     billing: i});
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
    response.write('Billing: Artist');
    artists.forEach(function(artist) {
        response.write(artist.billing + ': ' + artist.displayName + '\n');
    })
    response.end();
}).listen(8888);

// testing spotify endpoint
function getArtist(artistName) {
    var options = {
        host: 'api.spotify.com',
        path: '/v1/search?q=' + artistName + '&type=artist&market=US&limit=1',
        port: 443,
        method: 'GET'
    }

    var request = https.request(options, function(response) {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            console.log(JSON.parse(chunk).artists.items[0].id);
        });
    });

    request.on('error', function(error) {
        console.log('ERROR: ' + error);
    })

    request.end();
}

