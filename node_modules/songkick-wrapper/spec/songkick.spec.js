var SK = require("../index");
var q = require("q");
describe("SongKick", function() {
	SK.mock.setRequestFn(function(url){
		var def = q.defer();
		def.resolve({
      "resultsPage": {
        "results": {
          "venue": {
            "id":17522,
            "displayName":"O2 Academy Brixton",
            "city":{"uri":"http://www.songkick.com/metro_areas/24426-uk-london",
                    "displayName":"London","country":{"displayName":"UK"},"id":24426},
            "metroArea":{"uri":"http://www.songkick.com/metro_areas/24426-uk-london",
                         "displayName":"London","country":{"displayName":"UK"},"id":24426},
            "uri":"http://www.songkick.com/venues/17522-o2-academy-brixton",
             "street":"211 Stockwell Road", "zip":"SW9 9SL",
             "lat":51.4651268, "lng":-0.115187,
             "phone":"020 7771 3000",
             "website":"http://www.brixton-academy.co.uk",
             "capacity":4921,
             "description": "Brixton Academy is an award winning music venue situated in the heart of Brixton, South London."
          }
        },
        "status": "ok"
      }
    });
		return def.promise;
	});
	SongKick = SK.create("uDXZYe1gTZl1kk8P");
	it("should perform a venue details request", function() {
		SongKick.getVenueDetails(17522,"json")
			.then(function(e){
				expect(e.resultsPage.results.id).toEqual(17522);
			});
	});

	// it("should perform a venue details")
});