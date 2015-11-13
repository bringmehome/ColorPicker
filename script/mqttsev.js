/**
 * Created by rocke on 15-5-1.
 */

/*
 *以下是APICloud模块连接的方式
 * */
var micoMqtt;
//publish的功能
function micoPublish(topicStr, payloadStr) {
	//	apiToast("Publish", 1000);

	//	var micoMqtt = api.require("micoMqtt");
	var topic = topicStr;
	var command = payloadStr;
	//	apiToast("Publish 01", 1000);
	micoMqtt.publish({
		topic : topic,
		command : command
	}, function(ret, err) {
		//		apiToast("Publish ret = " + ret.status, 1000);
		if (ret.status) {
			//			apiToast("Success", 1000);
		}
	});
}

//subscribe的功能
function micoSubscribe(host, username, password, topicStr, clientID) {
	//	apiToast("Subscribe", 1000);

	micoMqtt = api.require("micoMqtt");
	var host = host;
	var username = username;
	var password = password;
	var clientID = clientID;
	var topic = topicStr;
	//	apiToast("Subscribe 01", 1000);
	//	alert("进入Subscribe---> host = " + host + "username " + username + "password " + password + "clientID " + clientID + "topic " + topic)
	micoMqtt.startMqtt({
		micoMqtt : micoMqtt,
		host : host,
		username : username,
		password : password,
		clientID : clientID,
		topic : topic
	}, function(rets, errs) {
		//		alert("Subscribe有返回");
		if (rets.status) {
			//			apiToast("Subscribe ret = " + JSON.stringify(rets), 1000);
			micoMqtt.recvMqttMsg(function(retr, errr) {
				//				apiToast("recvMqttMsg ret = " + JSON.stringify(retr.subs), 1000);
				//				if(errr){alert("返回错误" + JSON.stringify(errr));}
				chgtxt(retr.subs);
			});
		} else {
			//			apiToast("Subscribe err --> " + JSON.stringify(errs), 5000);
		}
	});
}

//subscribe的功能
function micoSubscribets(host, username, password, topicStr, clientID) {
	var subs = '{ "services": [ { "type": "public.map.service.dev_info", "iid": 1, "properties": [ { "type": "public.map.property.name", "iid": 2, "format": "string", "perms": [ "pr", "pw" ], "maxStringLen": 16 }, { "type": "public.map.property.manufacturer", "iid": 3, "format": "string", "perms": [ "pr" ], "maxStringLen": 16 } ] }, { "type": "public.map.service.rgb_led", "iid": 4, "properties": [ { "type": "public.map.property.switch", "iid": 5, "format": "bool", "perms": [ "pr", "pw" ] }, { "type": "public.map.property.hues", "iid": 6, "format": "int", "perms": [ "pr", "pw" ], "maxValue": 360, "minValue": 0, "minStep": 1 }, { "type": "public.map.property.saturation", "iid": 7, "format": "int", "perms": [ "pr", "pw" ], "maxValue": 100, "minValue": 0, "minStep": 1 }, { "type": "public.map.property.brightness", "iid": 8, "format": "int", "perms": [ "pr", "pw" ], "maxValue": 100, "minValue": 0, "minStep": 1 } ] }, { "type": "public.map.service.light_sensor", "iid": 9, "properties": [ { "type": "public.map.property.value", "iid": 10, "format": "int", "perms": [ "pr", "ev" ] }, { "type": "public.map.property.reserved", "iid": 11, "format": "int", "perms": [ "pr" ] } ] }, { "type": "public.map.service.uart", "iid": 12, "properties": [ { "type": "public.map.property.message", "iid": 13, "format": "string", "perms": [ "pw", "ev" ], "maxStringLen": 512 } ] }, { "type": "public.map.service.motor", "iid": 14, "properties": [ { "type": "public.map.property.value", "iid": 15, "format": "int", "perms": [ "pr", "pw" ] } ] }, { "type": "public.map.service.infrared", "iid": 16, "properties": [ { "type": "public.map.property.value", "iid": 17, "format": "int", "perms": [ "pr", "ev" ] } ] }, { "type": "public.map.service.temperature", "iid": 18, "properties": [ { "type": "public.map.property.value", "iid": 19, "format": "int", "perms": [ "pr", "ev" ] } ] }, { "type": "public.map.service.humidity", "iid": 20, "properties": [ { "type": "public.map.property.value", "iid": 21, "format": "int", "perms": [ "pr", "ev" ] } ] } ] }';
	chgtxt(subs);
}

//stop mqtt
function stopMqtt() {
	//	apiToast("stopMqtt", 1000);

	//	var micoMqtt = api.require("micoMqtt");
	micoMqtt.stopRecvMqttMsg(function(ret, err) {
	});
	micoMqtt.stopMqtt(function(ret, err) {
	});
}

///*
// *以下是张伟云端设置的方式
// * */
////publish的功能
//function micoPublish(topicStr, payloadStr) {
//	//	alert("micoPublish");
//	var pos = 0;
//	var xhr = new XMLHttpRequest();
//	var topic = encodeURIComponent(topicStr);
//	var payload = encodeURIComponent(payloadStr);
//	xhr.open("GET", "http://api.easylink.io/mqtt/publish/?topic=" + topic + "&payload=" + payload, true);
//	xhr.onprogress = function() {
//		//				var data = xhr.responseText;
//		var data = xhr.responseText.substr(pos).split('\r\n', 2);
//		pos = xhr.responseText.length;
//		//		console.log("PROGRESS:", data);
//		//		alert("data = " +xhr.responseText);
//		checkData(data[1]);
//	};
//	xhr.send();
//}
//
////subscribe的功能
//function micoSubscribe(topicStr) {
//	//	alert("micoSubscribe");
//	var pos = 0;
//	var xhr = new XMLHttpRequest();
//	var topic = encodeURIComponent(topicStr);
//	xhr.open("GET", "http://api.easylink.io/mqtt/subscribe/?topic=" + topic, true);
//	xhr.onprogress = function() {
//		//				var data = xhr.responseText;
//		var data = xhr.responseText.substr(pos).split('\r\n', 2);
//		pos = xhr.responseText.length;
//		//		console.log("PROGRESS:", data);
//		//		alert("data = " +xhr.responseText);
//		checkData(data[1]);
//	};
//	xhr.send();
//}

////check mqtt data and send to the devinfo
//function checkData(data) {
//	//	alert("checkData = " + data);
//	if (data === undefined) {
//		//			alert(data);
//	} else {
//		if (data.charAt(data.length - 1) != "}") {
//			//				alert(data);
//		} else {
//			chgtxt(data);
//		}
//	}
//}
