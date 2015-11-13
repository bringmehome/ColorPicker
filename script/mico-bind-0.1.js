/*
 * JavaScript Library
 * Copyright (c) 2015 mxchip.com
 */
(function(window) {
	var m = {};

	//获取设备列表
	m.getDevList = function(userToken, callback) {
		var sucm;
		var errm;
		//创建deviceid的json数组，供前端调用
		var devinfo = {
			devId : [],
			online : []
		};
		AV.Cloud.run('getDevList', {
			userToken : userToken,
		}, {
			success : function(ret) {
				//将获得的设备列表按照APICloud的listview的格式组装
				var arrayObj = new Array();
				var alias;
				if (0 != ret.data.length) {
					var i = 0;
					var index = 0;
					var color = ["23c3e0", "18ae9f", "f4378b", "37a2f4", "ca37f4"];
					$(ret.data).each(function() {
						index = ((i++) % 5 + 1);
						//设备图标
						var imgPath;
						//设备名字
						var devName;
						var titleColor;
						var subTitleColor;
						if (this.online == "1") {
							imgPath = "widget://image/devimg" + index + ".png";
							devName = this.alias;
							titleColor = "#" + color[index - 1];
							subTitleColor = "#4A494D";
						} else {
							imgPath = "widget://image/devoffline.png";
							devName = this.alias;
							//devName = "(Offline)" + this.alias;
							titleColor = "#afafaf";
							subTitleColor = "#afafaf";
						}

						alias = {
							"img" : imgPath,
							"title" : devName,
							"titleSize" : "15",
							"subTitle" : "MAC:" + this.bssid + " (IP:" + this.ip + ")",
							"titleColor" : titleColor,
							"subTitleColor" : subTitleColor
							//"subTitle" : "MAC:" + this.bssid + "\r\nIP:" + this.ip
						};
						devinfo.devId.push(this.id);
						devinfo.online.push(this.online);
						arrayObj.push(alias);
					});
					//alert('Hello = ' + JSON.stringify(arrayObj));
					callback(arrayObj, errm, devinfo);
				} else {
					alias = {
						"img" : "widget://image/devimg1.png",
						"title" : "Virtual device",
						"titleSize" : "15",
						"subTitle" : "MAC:00:01:6C:06:A6:29 (IP:192.168.1.2)",
						"titleColor" : "#24C5C1",
						"subTitleColor" : "#4A494D"
						//"subTitle" : "MAC:" + this.bssid + "\r\nIP:" + this.ip
					};
					arrayObj.push(alias);
					devinfo.devId.push("virtual");
					devinfo.online.push("virtual");
					callback(arrayObj, errm, devinfo);
				}
			},
			error : function(err) {
				//处理调用失败
				callback(sucm, err, devinfo);
			}
		});
	};

	//获取owner权限的设备
	m.getAuthDev = function(userToken, callback) {
		var sucm;
		var errm;
		//创建deviceid的json数组，供前端调用
		var devinfo = {
			devId : []
		};
		AV.Cloud.run('getAuthDev', {
			userToken : userToken,
		}, {
			success : function(ret) {
				//将获得的设备列表按照APICloud的listview的格式组装
				if (ret.data) {
					var arrayObj = new Array();
					var alias;
					var i = 0;
					var index = 0;
					var color = ["3cb65c", "23c3e0", "32dec0", "a732de", "de328b" ,"decc32"];
					$(ret.data).each(function() {
						index = ((i++) % 6 + 1);
						alias = {
							"img" : "widget://image/authdev" + index + ".png",
							"title" : this.alias,
							"titleSize" : "15",
							//"subTitle" : "MAC:" + this.bssid + "\r\nIP:" + this.ip
							"subTitle" : "MAC:" + this.bssid + " (IP:" + this.ip + ")",
							"titleColor" : "#" + color[index - 1],
							"subTitleColor" : "#4A494D"
						};
						devinfo.devId.push(this.id);
						arrayObj.push(alias);
					});
					callback(arrayObj, errm, devinfo);
				} else {
					callback(sucm, "数据格式不对", devinfo);
				}
			},
			error : function(err) {
				//处理调用失败
				callback(sucm, err, devinfo);
			}
		});
	};

	//修改设备名称
	m.editDevName = function(appid, usertoken, devname, devid, callback) {
		var sucm;
		var errm;
		$.ajax({
			url : "http://api.easylink.io/v1/device/modify",
			type : 'POST',
			data : JSON.stringify({
				device_id : devid,
				alias : devname
			}),
			headers : {
				"Content-Type" : "application/json",
				"X-Application-Id" : appid,
				"Authorization" : "token " + usertoken
			},
			success : function(ret) {
				callback("success", errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//列出设备下所有用户
	m.devUserQuery = function(appid, usertoken, devid, callback) {
		var sucm;
		var errm;
		$.ajax({
			url : "http://www.easylink.io/v1/device/user/query",
			type : 'POST',
			data : JSON.stringify({
				device_id : devid
			}),
			headers : {
				"Content-Type" : "application/json",
				"X-Application-Id" : appid,
				"Authorization" : "token " + usertoken
			},
			success : function(ret) {
				callback(ret, errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//删除设备下的某个用户
	m.deleteOneUser = function(appid,usertoken, userid, devid, callback) {
		var sucm;
		var errm;
		$.ajax({
			url : "http://www.easylink.io/v1/device/user/delete",
			type : 'POST',
			data : JSON.stringify({
				device_id : devid,
				user_id : userid
			}),
			headers : {
				"Content-Type" : "application/json",
				"X-Application-Id" : appid,
				"Authorization" : "token " + usertoken
			},
			success : function(ret) {
				callback(ret, errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//删除设备
	m.deleteDev = function(appid, usertoken, devid, callback) {
		var sucm;
		var errm;
		$.ajax({
			url : "http://api.easylink.io/v1/device/delete",
			type : 'POST',
			data : JSON.stringify({
				device_id : devid
			}),
			headers : {
				"Content-Type" : "application/json",
				"X-Application-Id" : appid,
				"Authorization" : "token " + usertoken
			},
			success : function(ret) {
				callback("success", errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//获取设备id
	m.getDevid = function(devip, devpsw, devtoken, callback) {
		var sucm;
		var errm;
		var ajaxurl = 'http://' + devip + ':8001/dev-activate';
		$.ajax({
			url : ajaxurl,
			type : 'POST',
			data : JSON.stringify({
				login_id : "admin",
				dev_passwd : devpsw,
				user_token : devtoken
			}),
			headers : {
				"Content-Type" : "application/json"
			},
			success : function(ret) {
				callback(ret, errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//获取设备激活状态
	m.getDevState = function(devip, devtoken, callback) {
		var sucm;
		var errm;
		var ajaxurl = 'http://' + devip + ':8001/dev-state';
		$.ajax({
			url : ajaxurl,
			type : 'POST',
			data : JSON.stringify({
				login_id : "admin",
				dev_passwd : "88888888",
				user_token : devtoken
			}),
			headers : {
				"Content-Type" : "application/json"
			},
			success : function(ret) {
				callback(ret, errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//去云端绑定设备
	m.bindDevCloud = function(appid, usertoken, devtoken, callback) {
		var sucm;
		var errm;
		$.ajax({
			url : 'http://api.easylink.io/v1/key/authorize',
			type : 'POST',
			data : {
				active_token : devtoken
			},
			headers : {
				"Authorization" : "token " + usertoken,
				"X-Application-Id" : appid
			},
			success : function(ret) {
				callback(ret, errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	//授权设备
	m.authDev = function(appid, usertoken, phone, devid, role, callback) {
		var sucm;
		var errm;
		$.ajax({
			url : 'http://api.easylink.io/v1/key/user/authorize',
			type : 'POST',
			data : {
				login_id : phone,
				owner_type : role,
				id : devid,
			},
			headers : {
				"Authorization" : "token " + usertoken,
				"X-Application-Id" : appid
			},
			success : function(ret) {
				callback(ret, errm);
			},
			error : function(err) {
				callback(sucm, err);
			}
		});
	};

	/*end*/
	window.$mico = m;

})(window);
