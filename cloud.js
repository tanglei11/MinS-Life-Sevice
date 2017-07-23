var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
var Banner = AV.Object.extend('Banner');

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