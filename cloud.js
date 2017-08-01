var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
var Banner = AV.Object.extend('Banner');
var Place = AV.Object.extend('Place');

AV.Cloud.define('saveBanner', function(request) {
	var banner = new Banner();
	banner.set('title',request.params.title);
	banner.set('link',request.params.link);
	banner.set('imageUrl',request.params.imageUrl);
	banner.save().then(function(ban){
		console.log('objectId is' + ban.id);
	},function(error){
		console.error(error);
	});
});

AV.Cloud.define('getBanner', function(request) {
  var query = new AV.Query(Banner);
  return query.find().then(function(results) {
    return results;
  }).catch(function(error) {
    throw new AV.Cloud.Error('查询失败');
  });
});

AV.Cloud.define('savePlace',function(request){
	var place = new Place();
	place.set('name',request.params.name);
	place.set('longitude',request.params.longitude);
	place.set('latitude',request.params.latitude);
	place.set('address',request.params.address);
	place.set('phone',request.params.phone);
	place.set('imgs',request.params.imgs);
	place.set('bgImg',request.params.bgImg);
	place.set('introduce',request.params.introduce);
	place.set('placeType',request.params.placeType);
	place.save().then(function(pla){
		console.log('objectId is' + pla.id);
	},function(error){
		console.error(error);
	});
});

AV.Cloud.define('getPlaces',function(request){
	var query;
	if (request.params.category == '校园建筑') {
		var officeQuery = new AV.Query(Place);
		var playgroundQuery  = new AV.Query(Place);
		var houseQuery = new AV.Query(Place);
		var bridgeQuery = new AV.Query(Place);
		var doorwayQuery = new AV.Query(Place);
		officeQuery.equalTo('placeType','office');
		playgroundQuery.equalTo('placeType','playground');
		houseQuery.equalTo('placeType','house');
		bridgeQuery.equalTo('placeType','bridge');
		doorwayQuery.equalTo('placeType','doorway');
		query = AV.Query.or(officeQuery, playgroundQuery,houseQuery,bridgeQuery,doorwayQuery);
	}else if (request.params.category == '美食') {
		var foodQuery = new AV.Query(Place);
		foodQuery.equalTo('placeType','food');
		query = foodQuery;
	}else if (request.params.category == '购物') {
		var shopQuery = new AV.Query(Place);
		shopQuery.equalTo('placeType','shop');
		query = shopQuery;
	}else{
		var organizationQuery = new AV.Query(Place);
		organizationQuery.equalTo('placeType','organization');
		query = organizationQuery
	}
	return query.find().then(function(results) {
    return results;
  }).catch(function(error) {
    throw new AV.Cloud.Error('查询失败');
  });
});