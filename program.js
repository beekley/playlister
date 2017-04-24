var songkick_wrapper = require('songkick-wrapper');
var http = require('http');
var https = require('https');
var request = require('request');

var secrets = require('./secrets.js');
// current secrets:
// songkick_apiKey
// spotify_clientId
// spotify_secret

var songkick = songkick_wrapper.create(secrets.songkick_apiKey);

var event = songkick.getEventDetails(process.argv[2]);

var artists = [];

// Initial access token. When expired, will be refreshed
var access_token = secrets.spotify_accessToken;

console.log("Server starting.");

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
            
            //console.log(artists[i]);
        });
        
    });
    
    //console.log(artists);
});


// Gets an artists's spotify ID by doingn a search for the artist's displayname
//
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
            //console.log(request);
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


// Creates a spotify playlist with the event name
//
// 
function spotify_createPlaylist() {
    
}



// Retrieve access and refresh tokens
// 
//
// PREP: Retrieve code by authenticating here https://accounts.spotify.com/authorize/?client_id= [CLIENT ID] &response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=playlist-read-private%20playlist-modify-private%20playlist-read-collaborative%20playlist-modify-public%20user-top-read
function spotify_authenticate(code) {
    
    // Using https to make the request
    /*var options = {
        host: 'accounts.spotify.com',
        path: '/authorize',
        port: 443,
        method: 'POST',
        headers: {
            'Authorization': 'Baisc ' + (new Buffer(secrets.spotify_clientId + ':'+secrets.spotify_secret).toString('base64'))
        },
        json: true
    }
    
    var body = {
        code: secrets.spotify_code,
        redirect_uri: 'http://localhost/',
        grant_type: 'authorization_code'
    }
    
    var authRequest = https.request(options, function(response) {
        
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            console.log(chunk);
        })
    })
    
    authRequest.write(JSON.stringify(body));
    authRequest.end();*/
    
    // Using Request, since that's what the spotify api example uses
    // https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js
    
    var authOptions = {
        url:'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: 'https://example.com/callback',
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(secrets.spotify_clientId + ':' + secrets.spotify_secret).toString('base64'))
        },
        json: true
    };
    
    
    
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            
            access_token = body.access_token;
            console.log('access token: ' + body.access_token);
            console.log('refresh token: ' + body.refresh_token);
        }
        else {
            console.log('error: ' + error);
            console.log('status: ' + response.statusCode);
            console.log(body);
        }
    })
    
}


// Refresh access token
// Returns new access token
function spotify_refreshToken() {
    
    var refreshOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: secrets.spotify_refreshToken
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(secrets.spotify_clientId + ':' + secrets.spotify_secret).toString('base64'))
        },
        json: true
    }
    
    request.post(refreshOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            
            access_token = body.access_token;
            console.log('access token: ' + body.access_token);
        }
        else {
            console.log('error: ' + error);
            console.log('status: ' + response.statusCode);
            console.log(body);
        }
    })
}

spotify_refreshToken();




// testing http
/*http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write('Billing: Artist');
    for (var artist in artists) {
        response.write(artist.billing + ': ' + artist.displayName + ': ' + artist.sid + '\n');
    }
    response.end();
}).listen(8888);*/