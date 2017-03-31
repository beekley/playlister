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
        //console.log(artist.displayName);
        
        // add spotify ID (sid) to the artist's object in artists[]
        getSpotifyArtistId(artist.displayName, function(sid) {
            
            // add the artist to the artists[] list
            artists[i] = {displayName: artist.displayName,
                                        billing: i,
                                        sid: sid};
            
            console.log(artists[i]);
        });
        
    });
    
    //console.log(artists);
});

// takes in an arist's displayname and callback function
// callback has one parameter, the spotify arist ID (sid)
function getSpotifyArtistId(artistName, callback) {
    
    var options = {
        host: 'api.spotify.com',
        path: '/v1/search?q=' + encodeURIComponent(artistName) + '&type=artist&market=US&limit=1',
        port: 443,
        method: 'GET'
    }
    
    //console.log(options);
    
    var request = https.request(options, function(response) {
        //console.log('STATUS: ' + response.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(response.headers));
        
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            
            if(JSON.parse(chunk).artists.total > 0) {
                var sid = JSON.parse(chunk).artists.items[0].id

                //console.log(sid);
                callback(sid);
            } else {
                console.log('No results found at ' + options.path);
            }
            
            
            
        });
    });

    request.on('error', function(error) {
        console.log('ERROR: ' + error);
    })

    request.end();
}

// testing http
/*http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write('Billing: Artist');
    for (var artist in artists) {
        response.write(artist.billing + ': ' + artist.displayName + ': ' + artist.sid + '\n');
    }
    response.end();
}).listen(8888);*/