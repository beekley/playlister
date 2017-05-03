// Let's try using strict
"use strict";

var songkick_wrapper = require('songkick-wrapper');
var http = require('http');
var https = require('https');
var request = require('request');

var secrets = require('./secrets.js');
// current secrets:
// songkick_apiKey
// spotify_clientId
// spotify_secret (not really used)
// spotify_accessToken (should be replaced on refresh anyway)
// spotify_refreshToken


// Initial access token. When expired, will be refreshed
var access_token = secrets.spotify_accessToken;
var owner_Id = 129048914;


// -------------------
// SONGKICK
// -------------------


// Make songkick request
var songkick = songkick_wrapper.create(secrets.songkick_apiKey);
var event = songkick.getEventDetails(process.argv[2]);

var artists = [];



console.log("Server starting.");
//console.log(secrets.songkick_apiKey);

// get list of artists for the inputted event ID
// should probably add a branch in case the promise is rejected
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
    
    console.log(artists);
});






// -------------------
// SPOTIFY
// -------------------


// -------------------
// SPOTIFY - AUTHENTICATION
// -------------------

// Retrieve access and refresh tokens
// (currently not used)
//
// PREP: Retrieve code by authenticating here https://accounts.spotify.com/authorize/?client_id= [CLIENT ID] &response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=playlist-read-private%20playlist-modify-private%20playlist-read-collaborative%20playlist-modify-public%20user-top-read
//
// then running spotify_authenticate([CODE]);
// where [CODE] is everything after "https://example.com/callback?code="
//
function spotify_authenticate(code) {
    
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
            console.log('options: ' + JSON.stringify(authOptions));
            console.log(secrets.spotify_clientId);
            console.log(secrets.spotify_secret);
            console.log('error: ' + error);
            console.log('status: ' + response.statusCode);
            console.log(body);
        }
    })
    
}



// Refresh access token
//
// Updates the global access token variable using the refresh token
// see: https://developer.spotify.com/web-api/authorization-guide/
//
// Executes callback function (should switch to promises)
// This should be run before any other spotify API calls that require user auth
function spotify_refreshToken(params, callback) {
    
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
            callback(params);
        }
        else {
            console.log('error: ' + error);
            console.log('status: ' + response.statusCode);
            console.log(body);
        }
    })
}

spotify_refreshToken('test', spotify_createPlaylist);

//spotify_authenticate();





// -------------------
// SPOTIFY - FUNCTIONS
// -------------------


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
function spotify_createPlaylist(name) {
    
    var options = {
        url:'https://api.spotify.com/v1/users/'+owner_Id+'/playlists',
        form: {
            "description": "Created by Playlister",
            "public": false,
            "name": name
        },
        headers: {
            'Authorization': 'Bearer ' + (new Buffer(access_token).toString('base64'))
        },
        json: true
    };
    
    request.post(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('response: ' + response);
        }
        else {
            console.log(response.statusCode);
        }
    })
}




