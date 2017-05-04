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

// Initial songkick object
// not sure how much I like using the wrapper
var songkick = songkick_wrapper.create(secrets.songkick_apiKey);




console.log("Server starting.");
//console.log(secrets.songkick_apiKey);

// Takes in an eventId and runs a callback with an array of artists and the event name as params

function songkick_retrieveEventArtists(eventId, callback) {
    
    var url = 'http://api.songkick.com/api/3.0/events/'+eventId+'.json?apikey='+secrets.songkick_apiKey;
    
    console.log('Spotify API URL: ' + url);
    
    request.get(url, function(error, response, body) {
        //console.log();
        
        var resArtists = JSON.parse(body).resultsPage.results.event.performance;
        var resEventName = JSON.parse(body).resultsPage.results.event.displayName;
        var artists = [];
        var count = 0;
        
        resArtists.forEach(function(artist, i) {
            //console.log(artist.displayName);
            
            // add spotify ID (sid) to the artist's object in artists[]
            getSpotifyArtistId(artist.displayName, function(sid) {
                
                // add the artist to the artists[] list
                artists[i] = {displayName: artist.displayName,
                                            billing: i,
                                            sid: sid};

                //console.log(artists[i]);
                                
                count++;
                
                if (count == resArtists.length) {
                    
                    console.log(artists);
                    
                    if (callback) {
                        callback(resEventName, artists);
                    }
                    
                }
            });

        });

        //console.log(artists);
        
        
        
    })
    
    
}






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
            //console.log(chunk);
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
// Runs a callback with the playlist's ID
// 
function spotify_createPlaylist(name, callback) {
    
    var options = {
        url:'https://api.spotify.com/v1/users/'+owner_Id+'/playlists',
        body: { // need to use "body" instead of "form, see https://github.com/spotify/web-api/issues/360
            "description": "Created by Playlister",
            "public": false,
            "name": name
        },
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: true
    };
    
    request.post(options, function(error, response, body) {
        if (!error && response.statusCode === 201) { // lol gotta check what the http codes mean. I was checking for 200 and this branch was never running...
            console.log('Successfully created playlist: ' + body.name);
            if (callback) {
                callback(body.id);
            }
        }
        else {
            console.log('error: ' + error);
            console.log('status: ' + response.statusCode);
            console.log(body);
        }
    })
}


// add an array of songs to a playlist
// none of my functions have good error handling and this is no exception :/
function spotify_addSongToPlaylist(songIds, playlistId, callback) {
    
    // turn IDs into URIs
    songIds.map(function(id) {
        return 'spotify:track:'+id;
    })
    
    // testing
    songIds = ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
"spotify:track:1301WleyT98MSxVHPZCA6M"];
    
    var options = {
        url: 'https://api.spotify.com/v1/users/' +owner_Id +'/playlists/' +playlistId +'/tracks',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        body: {
            'uris' : songIds
        },
        json: true
    }
    
    request.post(options, function(error, response, body) {
        console.log('Adding song to playlist, response: ' + response.statusCode);
        if (!error && response.statusCode === 201) {
            console.log('Successfully added songs');
            if (callback) {
                callback();
            }
        }
        else {
            console.log('error: ' + error);
            console.log('status: ' + response.statusCode);
            console.log(body);
        }
    })
    
    
}




// -------------------
// APP
// -------------------

// Gotta authenticate first!
spotify_refreshToken(null, application);

// do the app things
function application() {
    songkick_retrieveEventArtists(process.argv[2], function(eventName, artists){
        spotify_createPlaylist(eventName, function(id) {
            spotify_addSongToPlaylist([], id);
        });
    });
}
