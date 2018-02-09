module.exports = {
	route: function(handle,pathname,res,reqData,req){
		console.log(pathname);
		if(typeof handle[pathname] === 'function'){
			 return handle[pathname](res,reqData,req);
		}else{
			console.log("No request handler found for " + pathname);
		    res.writeHead(404, {"Content-Type": "text/plain"});
		    res.write("404 Not found");
		    res.end();
		}
	}
};