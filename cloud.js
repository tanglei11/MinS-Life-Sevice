var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
var Banner = AV.Object.extend('Banner');
var Place = AV.Object.extend('Place');
var Dynamic = AV.Object.extend('Dynamic');
var User = AV.Object.extend('User');

async = require('asyncawait').async ;
await = require('asyncawait').await ;

//---------------------------------------------------公共方法

//关联用户查询方法
function _get_userinfo(userid) {
	return new Promise(async(function(next, fail) {
		var _query = new AV.Query(User) ;
		await(_query.equalTo('objectId', userid)) ;
		var _user = await(_query.first()) ;
		next(_user) ;
	})) ;
}

//---------------------------------------------------云函数

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

//保存动态
AV.Cloud.define('saveDynamic',function(request){
	var dynamic = new Dynamic();
	dynamic.set('content',request.params.content);
	dynamic.set('imgs',request.params.imgs);
	dynamic.set('addressName',request.params.addressName);
	dynamic.set('address',request.params.address);
	dynamic.set('latitude',request.params.latitude);
	dynamic.set('longitude',request.params.longitude);
	dynamic.set('userId',request.params.userId);
	dynamic.save().then(function(dyn){
		console.log('objectId is' + dyn.id);
	},function(error){
		console.error(error);
	});
});

//获取动态
AV.Cloud.define('getDynamics',function(request) {
	return new Promise(async(function(next, fail) {
		var _query = new AV.Query(Dynamic) ;
		_query.limit(request.params.limit);
  		_query.skip(request.params.skip);
  		_query.descending('createdAt');
		var _list = await(_query.find()) ;
		for(var i = 0; i < _list.length; i++) {
			var _item = _list[i] ;
			var _user = await(_get_userinfo(_item.get('userId'))) ;
			_item.set('user', {"objectId":_user.get("objectId"),"username":_user.get('username'),"nickname":_user.get('nickname'),"profileUrl":_user.get('profileUrl')}) ;
		}
		next(_list) ;
	})) ;
});