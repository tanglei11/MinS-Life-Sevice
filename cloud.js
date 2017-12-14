var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
var Banner = AV.Object.extend('Banner');
var Place = AV.Object.extend('Place');
var Dynamic = AV.Object.extend('Dynamic');
var User = AV.Object.extend('User');
var Collect	= AV.Object.extend('Collect');
var Comment = AV.Object.extend('Comment');
var Like = AV.Object.extend('Like');
var Market = AV.Object.extend('Market');

async = require('asyncawait').async ;
await = require('asyncawait').await ;

//------------------------------------------------------------------------------------------------------------------------公共方法

//关联用户查询方法
function _get_userinfo(userid) {
	return new Promise(async(function(next, fail) {
		var _query = new AV.Query(User) ;
		await(_query.equalTo('objectId', userid)) ;
		var _user = await(_query.first()) ;
		next(_user) ;
	})) ;
}

//关联收藏查询方法
function _get_isCollect(currectUserId,dynamicId,collectType){
	return new Promise(async(function(next,fail){
		var userQuery = new AV.Query(Collect);
		userQuery.equalTo('collectUserId',currectUserId);
		var typeQuery = new AV.Query(Collect);
		typeQuery.equalTo('collectType',collectType);
		var query = AV.Query.and(userQuery, typeQuery);
		var collectList = await(query.find());
		var isCollect = '0';
		for (var i = 0; i < collectList.length; i++) {
			var collectItem = collectList[i];
			console.log(collectItem.get('dynamicId') + '-------' + dynamicId);
			if (dynamicId == collectItem.get('dynamicId')) {
				isCollect = '1';
				break;
			}
		}
		next(isCollect);
	}));
}

//------------------------------------------------------------------------------------------------------------------------首页模块

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

//------------------------------------------------------------------------------------------------------------------------动态模块

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
	dynamic.set('likeCount',0);
	dynamic.set('commentCount',0);
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
			var is_collect = await(_get_isCollect(request.params.currectUserId,_item.get('objectId'),'dynamic'));
			// console.log(is_collect);
			_item.set('user', {"objectId":_user.get("objectId"),"username":_user.get('username'),"nickname":_user.get('nickname'),"profileUrl":_user.get('profileUrl')}) ;
			_item.set('isCollect',is_collect);
		}
		next(_list) ;
	})) ;
});

//删除动态
AV.Cloud.define('deleteDynamic',function(request){
		//删除该动态
		var dynamicQuery = new AV.Query(Dynamic);
		dynamicQuery.equalTo('objectId', request.params.dynamicId);
		dynamicQuery.first().then(function (dynamicData) {
			dynamicData.destroy().then(function (success) {
				// console.log('11111');
	    		// 删除成功
	  		}, function (error) {
	  			// console.log('22222');
	    		// 删除失败
	  		});
		}, function (error) {
		
		});
		//删除关联的收藏
		var collectQuery = new AV.Query(Collect);
		collectQuery.equalTo('dynamicId',request.params.dynamicId);
		collectQuery.find().then(function (collectDatas) {
			for (var i = 0; i < collectDatas.length; i++) {
				var _collect = collectDatas[i];
				_collect.destroy().then(function (success) {
					// console.log('11111');
		    		// 删除成功
	  			}, function (error) {
		  			// console.log('22222');
		    		// 删除失败
	  			});
			}
		}, function (error) {
		
		});
		//删除关联的评论
		var commentQuery = new AV.Query(Comment);
		commentQuery.equalTo('relationId',request.params.dynamicId);
		commentQuery.find().then(function (commentDatas) {
			for (var i = 0; i < commentDatas.length; i++) {
				var _comment = commentDatas[i];
				_comment.destroy().then(function (success) {
					// console.log('11111');
		    		// 删除成功
	  			}, function (error) {
		  			// console.log('22222');
		    		// 删除失败
	  			});
			}
		}, function (error) {
		
		});
		//删除关联的赞
		var likeQuery = new AV.Query(Like);
		likeQuery.equalTo('relationId',request.params.dynamicId);
		likeQuery.find().then(function (likeDatas) {
			for (var i = 0; i < likeDatas.length; i++) {
				var _like = likeDatas[i];
				_like.destroy().then(function (success) {
					// console.log('11111');
		    		// 删除成功
	  			}, function (error) {
		  			// console.log('22222');
		    		// 删除失败
	  			});
			}
		}, function (error) {
		
		});
});

//保存收藏
AV.Cloud.define('saveCollect',function(request){
	var collect = new Collect();
	collect.set('dynamicId',request.params.dynamicId);
	collect.set('collectUserId',request.params.collectUserId);
	collect.set('collectType',request.params.collectType);
	collect.save().then(function(clt){
		console.log('objectId is ' + clt.id);
	},function(error){
		console.error(error);
	});
});

//取消收藏
AV.Cloud.define('deleteCollect',function(request){
	console.log(request.params.dynamicId);
	var query = new AV.Query(Collect) ;
	query.equalTo('dynamicId', request.params.dynamicId);
	query.first().then(function (data) {
		data.destroy().then(function (success) {
			// console.log('11111');
    		// 删除成功
  		}, function (error) {
  			// console.log('22222');
    		// 删除失败
  		});
	}, function (error) {
		
	});
});

//保存评论
AV.Cloud.define('saveComment',function(request){
	return new Promise(async(function(next, fail) {
		var comment = new Comment();
		comment.set('relationId',request.params.relationId);
		comment.set('commentUserId',request.params.commentUserId);
		comment.set('beCommentUserId',request.params.beCommentUserId);
		comment.set('beCommentUserName',request.params.beCommentUserName);
		comment.set('commentContent',request.params.commentContent);
		comment.set('commentType',request.params.commentType);
		comment.set('commentStatus','0');
		_cmt = await(comment.save());
		if (request.params.commentType == 'dynamic') {
			var query = new AV.Query(Dynamic) ;
			query.equalTo('objectId',request.params.relationId);
			dynamic = await(query.first());
			var commentCount = dynamic.get('commentCount');
			commentCount = commentCount + 1;
			dynamic.set('commentCount',commentCount);
			await(dynamic.save());
			next({"commentId":_cmt.id});
		}else if (request.params.commentType == 'market') {
			var query = new AV.Query(Market) ;
			query.equalTo('objectId',request.params.relationId);
			market = await(query.first());
			var commentCount = market.get('commentCount');
			commentCount = commentCount + 1;
			market.set('commentCount',commentCount);
			await(market.save());
			next({"commentId":_cmt.id});
		};
	})) ;
});

//获取评论列表
AV.Cloud.define('getComments',function(request){
	return new Promise(async(function(next, fail) {
		var relationQuery = new AV.Query(Comment);
		relationQuery.equalTo('relationId',request.params.relationId);
		var typeQuery = new AV.Query(Comment);
		typeQuery.equalTo('commentType',request.params.commentType);
		var query = AV.Query.and(relationQuery, typeQuery);
		query.limit(request.params.limit);
	  	query.skip(request.params.skip);
	  	query.descending('createdAt');
	  	var _list = await(query.find()) ;
		for(var i = 0; i < _list.length; i++) {
			var _item = _list[i] ;
			var _user = await(_get_userinfo(_item.get('commentUserId'))) ;
			_item.set('user', {"objectId":_user.get("objectId"),"username":_user.get('username'),"nickname":_user.get('nickname'),"profileUrl":_user.get('profileUrl')}) ;
		}
		next(_list) ;
	})) ;
});

//删除评论
AV.Cloud.define('deleteComment',function(request){
	var query = new AV.Query(Comment);
	query.equalTo('objectId', request.params.commentId);
	query.first().then(function (data) {
		console.log(data);
		data.destroy().then(function (success) {
			// console.log('11111');
    		// 删除成功
    		if (request.params.commentType == 'dynamic') {
				var query = new AV.Query(Dynamic) ;
				query.equalTo('objectId',request.params.relationId);
				query.first().then(function (dycData) {
					var dynamic = dycData;
					console.log('========' + dynamic);
					var commentCount = dynamic.get('commentCount');
					if (commentCount == 0) {

					}else{
						commentCount = commentCount - 1;
					}
					dynamic.set('commentCount',commentCount);
					dynamic.save();
				}, function (error) {
			
				});
			}
  		}, function (error) {
  			// console.log('22222');
    		// 删除失败
  		});
	}, function (error) {
		
	});
});

//保存点赞
AV.Cloud.define('saveLike',function(request){
	return new Promise(async(function(next, fail) {
		var like = new Like();
		like.set('relationId',request.params.relationId);
		like.set('userId',request.params.userId);
		like.set('likeType',request.params.likeType);
		_lk = await(like.save());
		if (request.params.likeType == 'dynamic') {
			var query = new AV.Query(Dynamic) ;
			query.equalTo('objectId',request.params.relationId);
			dynamic = await(query.first());
			var likeCount = dynamic.get('likeCount');
			likeCount = likeCount + 1;
			dynamic.set('likeCount',likeCount);
			await(dynamic.save());
			next({"likeId":_lk.id});
		}
	})) ;
});

//取消点赞
AV.Cloud.define('cancelLike',function(request){
	var relationQuery = new AV.Query(Like);
	relationQuery.equalTo('relationId',request.params.relationId);
	var userQuery = new AV.Query(Like);
	userQuery.equalTo('userId',request.params.userId);
	var typeQuery = new AV.Query(Like);
	typeQuery.equalTo('likeType',request.params.likeType);
	var query = AV.Query.and(relationQuery, userQuery,typeQuery);
	query.first().then(function (data) {
		console.log(data);
		data.destroy().then(function (success) {
			// console.log('11111');
    		// 删除成功
    		if (request.params.likeType == 'dynamic') {
				var query = new AV.Query(Dynamic);
				query.equalTo('objectId',request.params.relationId);
				query.first().then(function (dycData) {
					var dynamic = dycData;
					console.log('========' + dynamic);
					var likeCount = dynamic.get('likeCount');
					if (likeCount == 0) {

					}else{
						likeCount = likeCount - 1;
					}
					dynamic.set('likeCount',likeCount);
					dynamic.save();
				}, function (error) {
			
				});
			}
  		}, function (error) {
  			// console.log('22222');
    		// 删除失败
  		});
	}, function (error) {
		
	});
});

//判断当前用户是否赞过该动态
AV.Cloud.define('getLikeStatus',function(request){
	return new Promise(async(function(next, fail) {
		var relationQuery = new AV.Query(Like);
		relationQuery.equalTo('relationId',request.params.relationId);
		var userQuery = new AV.Query(Like);
		userQuery.equalTo('userId',request.params.userId);
		var typeQuery = new AV.Query(Like);
		typeQuery.equalTo('likeType',request.params.likeType);
		var query = AV.Query.and(relationQuery, userQuery,typeQuery);
		var _list = await(query.find());
		if (_list.length > 0) {
			next({"likeStatus":"1"});
		}else{
			next({"likeStatus":"0"});
		}
		
	})) ;
});

//------------------------------------------------------------------------------------------------------------------------跳蚤模块

//保存跳蚤信息

AV.Cloud.define('saveMarket',function(request){
	var market = new Market();
	market.set('title',request.params.title);
	market.set('content',request.params.content);
	market.set('price',request.params.price);
	market.set('imgs',request.params.imgs);
	market.set('addressName',request.params.addressName);
	market.set('address',request.params.address);
	market.set('latitude',request.params.latitude);
	market.set('longitude',request.params.longitude);
	market.set('userId',request.params.userId);
	market.set('likeCount',0);
	market.set('commentCount',0);
	market.save().then(function(dyn){
		console.log('objectId is' + dyn.id);
	},function(error){
		console.error(error);
	});
});

//获取跳蚤信息
AV.Cloud.define('getMarkets',function(request){
	return new Promise(async(function(next, fail) {
		var _query = new AV.Query(Market) ;
		_query.limit(request.params.limit);
  		_query.skip(request.params.skip);
  		_query.descending('createdAt');
		var _list = await(_query.find()) ;
		for(var i = 0; i < _list.length; i++) {
			var _item = _list[i] ;
			var _user = await(_get_userinfo(_item.get('userId'))) ;
			var is_collect = await(_get_isCollect(request.params.currectUserId,_item.get('objectId'),'market'));
			// console.log(is_collect);
			_item.set('user', {"objectId":_user.get("objectId"),"username":_user.get('username'),"nickname":_user.get('nickname'),"profileUrl":_user.get('profileUrl'),"mobilePhoneNumber":_user.get('mobilePhoneNumber')}) ;
			_item.set('isCollect',is_collect);
		}
		next(_list) ;
	})) ;
});