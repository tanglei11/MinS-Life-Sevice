async = require('asyncawait').async ;
await = require('asyncawait').await ;




function test() {

	return new Promise(function(next) {
		setTimeout(function() {
			next(10086) ;
		}, 1000) 	
	}) 
}

async(function() {

	console.log('start .... ') ;
	var _value = await(test()) ;
	console.log('end....', _value) ;

})() ;
