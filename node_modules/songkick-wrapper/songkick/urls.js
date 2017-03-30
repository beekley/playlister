var Url = function(base){
	this.base = base;
};

Url.prototype = {
	field:function(regex,val){
		this.base = this.base.replace(regex,val);
		return this;
	},
	id:function(id){
		return this.field(/__ID__/,id||'__ID__');
	},
	dataType:function(type){
		var d = type || 'json';
		return this.field(/__DATATYPE__/,d);
	},
	key:function(key){
		return this.field(/__KEY__/,key||'__KEY__');
	},
	page:function(pageNo){
		this.base = pageNo? (this.base + "&page="+pageNo):this.base;
		return this;
	},
	order:function(oo){
		this.base = oo? (this.base + "&order="+oo):this.base;
		return this;
	},
	createdAfter:function(ff){
		this.base = ff? (this.base + "&created_after="+ff):this.base;	
		return this;
	},
	get:function(){
		return this.base;
	}
};

function create(base){
	return new Url(base);
}
var o = {

	artistUpcoming:function(key,artistId,dataType,createdAfter,page,order){
		return create('http://api.songkick.com/api/3.0/artists/__ID__/calendar.__DATATYPE__?apikey=__KEY__')
			.key(key)
		   	.dataType(dataType)
		   	.id(artistId)
		   	.createdAfter(createdAfter)
		   	.page(page)
		   	.order(order)
		   	.get();
	},
	artistUpcomingMusicBrainz:function(key,artistId,dataType,createdAfter,page,order){
		return o.artistUpcoming(key,'mbid:'+artistId,dataType,createdAfter,page,order);
	},
	venueUpcoming:function(key,venueId,dataType,createdAfter,page,order){
		return create('http://api.songkick.com/api/3.0/venues/__ID__/calendar.__DATATYPE__?apikey=__KEY__')
			.key(key)
		   	.dataType(dataType)
		   	.id(venueId)
		   	.page(page)
		   	.createdAfter(createdAfter)
		   	.order(order)
		   	.get();
	},
	metroAreaUpcoming:function(key,metroId,dataType,createdAfter,page,order){
		return create('http://api.songkick.com/api/3.0/metro_areas/__ID__/calendar.__DATATYPE__?apikey=__KEY__')
			.key(key)
		   	.dataType(dataType)
		   	.id(metroId)
		   	.page(page)
		   	.createdAfter(createdAfter)
		   	.order(order)
		   	.get();
	},
	userUpcoming:function(key,username,reason,dataType,createdAfter,page,order){
		return create('http://api.songkick.com/api/3.0/users/__ID__/calendar.__DATATYPE__?reason=__REASON__&apikey=__KEY__')
			.key(key)
		   	.dataType(dataType)
		   	.id(username)
		   	.field(/__REASON__/,reason)
		   	.page(page)
		   	.createdAfter(createdAfter)
		   	.order(order)
		   	.get();
	},
	userUpcomingTrackedArtist:function(key,username,dataType,createdAfter,page,order){
		return o.userUpcoming(key,username,'tracked_artist',dataType);
	},
	userUpcomingAttendance:function(key,username,dataType,createdAfter,page,order){
		return o.userUpcoming(key,username,'attendance',dataType);
	},
	userEvents:function(key,username,dataType,createdAfter,page,order){
		return create('http://api.songkick.com/api/3.0/users/__ID__/events.__DATATYPE__?apikey=__KEY__')
			.key(key)
		   	.dataType(dataType)
		   	.id(username)
		   	.page(page)
		   	.order(order)
		   	.createdAfter(createdAfter)
		   	.get();
	},
	artistPastEvents:function(key,id,dataType,page,order){
		return create('http://api.songkick.com/api/3.0/users/__ID__/events.__DATATYPE__?apikey=__KEY__')
			.key(key)
		   	.dataType(dataType)
		   	.id(username)
		   	.page(page)
		   	.order(order)
		   	.createdAfter(createdAfter)
		   	.get();
	},
	artistPastEventsMusicBrainz:function(key,id,dataType,page,order){
		return o.artistPastEvents(key,'mbid:'+id,dataType,page,order);
	},
	userPastEvents:function(key,id,dataType,page,order){
		return create('http://api.songkick.com/api/3.0/users/__ID__/gigography.__DATATYPE__?apikey=__KEY__')
				.key(key)
				.dataType(dataType)
				.id(id)
				.page(page)
				.order(order)
				.createdAfter(createdAfter)
				.get();
	},
	eventSetList:function(key,id,dataType,page,order){
		return create('http://api.songkick.com/api/3.0/events/__ID__/setlists.__DATATYPE__?apikey=__KEY__')
				.key(key)
				.dataType(dataType)
				.id(id)
				.page(page)
				.order(order)
				.get();
	},
	eventDetails:function(key,id,dataType){
		return create('http://api.songkick.com/api/3.0/events/__ID__.__DATATYPE__?apikey=__KEY__')
				.key(key)
				.dataType(dataType)
				.id(id)
				.get();
	},
	venueDetails:function(key,id,dataType){
		return create('http://api.songkick.com/api/3.0/venues/__ID__.__DATATYPE__?apikey=__KEY__')
				.key(key)
				.dataType(dataType)
				.id(id)
				.get();
	},
	similarArtists:function(key,id,dataType){
		return create('http://api.songkick.com/api/3.0/artists/__ID__/similar_artists.__DATATYPE__?apikey=__KEY__')
				.key(key)
				.dataType(dataType)
				.id(id)
				.get();
	},

};

module.exports = o;