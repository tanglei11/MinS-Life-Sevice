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
	var query = new AV.Query(Place);
	return query.find().then(function(results) {
    return results;
  }).catch(function(error) {
    throw new AV.Cloud.Error('查询失败');
  });
});