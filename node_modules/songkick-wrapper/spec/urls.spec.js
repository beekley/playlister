var Urls = require('../songkick/urls');
describe('URLs',function(){
	
	it('should create a fully usable url with no missing fields',function(){
		var u = Urls.artistUpcoming('123123123','10001','json');
		expect(u).toEqual('http://api.songkick.com/api/3.0/artists/10001/calendar.json?apikey=123123123')
	});

	it('should create a url with missing fields',function(){
		var u = Urls.artistUpcoming('123123123');
		expect(u).toEqual('http://api.songkick.com/api/3.0/artists/__ID__/calendar.json?apikey=123123123')
	});

	it('should create a url with different response type (XML)',function(){
		var u = Urls.artistUpcoming('123123123','123123','xml');
		expect(u).toEqual('http://api.songkick.com/api/3.0/artists/123123/calendar.xml?apikey=123123123')
	});

});