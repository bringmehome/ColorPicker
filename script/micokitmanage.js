/**
 * Created by rocke on 15-5-1.
 */

//全局deviceid
var DEVID_GLOBAL = "";
//当前div页面的标识
//0 不允许返回
//1 homepage
//2 devicelist
//3 devicecontrol
//4 uartchat
//5 EasyLink
//6 myself
//7 feedback
//8 authpage
//100 EasyLink配网
//101 EasyLink给设备设置密码
//9 设备下用户列表
var PAGETAG = 1;
//js页面定时2秒publish
var selfInterval;
//rgb控制的2秒publish一次
var rgbctrlinterval;
//去云端绑定设备时候发的用户token
var userToken;
//设备列表obj
var devlistobj;
//owner权限设备列表obj
var authdevobj;
//uartchat的obj
var chatobj;

//是否开灯
var rgb_switch;
//灯颜色
var rgb_hues;
//灯的饱和度
var rgb_statu;
//灯的亮度
var rgb_bright;
//uartchat的数量标识
var linum = 1;
//设备IP
var dev_ip;
//去设备获取devid时候发的token
var dev_token;
//listview高度
var listy;
//app1当前用户回执
var app1;
//rgb read subscribe
var rgbreadtag = 1;
//MQTT's overtime tag
var mqttSign = 0;
//EasyLink's overtime tag
var getdevipSign = 0;
//临时存储wifi名字
var wifiNameTmp = "";
//easylinkobj
var micobindobj;
//是否显示loading
var devlisttag;
//是否显示loading
var devAuthtag;
//防止设备离线所定义的全局设备信息标记
var devinfo;
//系统版本标记
var sysverid = 0;
//mdns的对象
var micoMmdns;
//是否提示找到设备
var saytag = 0;
//授权页面的devid
var _currentDevid;
//界面是否可以touchmove
var touchmove_listener = function(event) {
	event.preventDefault();
};

/*
* 首页列表部分
*/
/**
 * 0,都不显示
 * 1，显示loading
 * 2、显示刷新
 */
function showRefreshImg(tag) {
	if (0 == tag) {
		$("#devlistlodingid").css("display", "none");
		$("#devlistshowid").css("display", "none");
	} else if ((1 == tag) && (0 == devlisttag)) {
		$("#devlistlodingid").css("display", "block");
		$("#devlistshowid").css("display", "none");
	} else if ((2 == tag) && (0 == devlisttag)) {
		$("#devlistlodingid").css("display", "none");
		$("#devlistshowid").css("display", "block");
	}
}

/**
 * 0,都不显示
 * 1，显示loading
 * 2、显示刷新
 */
function showAuthRefreshImg(tag) {
	if (0 == tag) {
		$("#devAuthlodingid").css("display", "none");
		$("#devAuthshowid").css("display", "none");
	} else if ((1 == tag) && (0 == devAuthtag)) {
		$("#devAuthlodingid").css("display", "block");
		$("#devAuthshowid").css("display", "none");
	} else if ((2 == tag) && (0 == devAuthtag)) {
		$("#devAuthlodingid").css("display", "none");
		$("#devAuthshowid").css("display", "block");
	}
}

//获取账号下所有可以控制的设备
function devicelist_getDevList() {
	//		alert("devicelist_getDevList");
	devlistobj = api.require('listView');
	devlisttag = 0;
	showRefreshImg(1);
	var t = setTimeout("showRefreshImg(2)", 3 * 1000)
	$mico.getDevList(userToken, function(ret, err, devinfocb) {
		//				alert(JSON.stringify(ret));
		if (ret && (1 == PAGETAG)) {
			devinfo = devinfocb;
			devlisttag = 1;
			showRefreshImg(0);
			devlistobj.open({
				//				h : 'auto',
				h : 800,
				y : listy,
				cellHeight : 85,
				cellSelectColor : '#18161d',
				//				leftBtn : [{}],
				rightBtn : [{
					bg : '#d4257f',
					color : '#d4257f',
					title : '解绑',
					icon : "widget://image/smallicon-8.png"
				}, {
					bg : '#d35f84',
					color : '#d35f84',
					title : '改名',
					icon : "widget://image/smallicon-9.png"
				}],
				"borderColor" : "#18161d",
				"cellBgColor" : "#222028",
				imgHeight : '53',
				imgWidth : '53',
				data : ret
			}, function(openret, err) {
				//openret.index //点击某个cell或其内部按钮返回其下标
				//openret.clickType //点击类型，0-cell；1-右边按钮；2-左边的按钮
				//openret.btnIndex //点击按钮时返回其下标 左1 右0
				//apiToast(openret.index + " " + openret.clickType + " " + openret.btnIndex, 2000);
				var cellIndex = openret.index;
				var clickType = openret.clickType;
				var btnIndex = openret.btnIndex;

				//整行选择
				if (clickType == 0) {
					//					alert("online = "+devinfo.online[openret.index]);
					if ("virtual" == devinfo.devId[openret.index]) {
						changpage("virtualdev", ret[openret.index].title);
						devlistobj.close();
					} else {
						if (devinfo.online[openret.index] == 1) {
							changpage("deviceinfo", ret[openret.index].title);
							devlistobj.close();
							mqttconnect(devinfo.devId[openret.index]);
						} else {
							apiToast("设备离线中", 2000);
						}
					}
				}
				//按钮
				else if (clickType == 1) {
					//edit按钮
					if (btnIndex == 1) {
						if ("virtual" == devinfo.devId[openret.index]) {
						} else {
							modifyDevName(devinfo.devId[openret.index], openret.index);
						}
					}
					//delete按钮
					else if (btnIndex == 0) {
						if ("virtual" == devinfo.devId[openret.index]) {
						} else {
							deleteDevName(devinfo.devId[openret.index], openret.index);
						}
					}
				}
			});

			//刷新的小箭头，不可为空
			var loadingImgae = 'widget://image/jiantou.png';
			//下拉刷新的背景颜色 ，有默认值，可为空
			var bgColor = '#18161d';
			//提示语颜色，有默认值，可为空
			var textColor = '#8E8E8E';
			//尚未触发刷新时间的提示语，有默认值，可为空
			var textDown = PULL_DOWN;
			//触发刷新事件的提示语，有默认值，可为空
			var textUp = RELEASE_HAND;
			//是否显示时间，有默认值，可为空
			var showTime = true;
			devlistobj.setRefreshHeader({
				loadingImg : loadingImgae,
				bgColor : bgColor,
				textColor : textColor,
				textDown : textDown,
				textUp : textUp,
				showTime : showTime
			}, function(ret, err) {
				//devicelist_getDevList();
				//触发加载事件
				//micokit
				$mico.getDevList(userToken, function(ret, err, devinforl) {
					if (ret) {
						devinfo = devinforl;
						devlistobj.reloadData({
							data : ret
						});
					} else {
					}
				});
			});
		} else {
		}
	});
}

//获取所有可以授权的设备
function devicelist_getAuthDev() {
	//			alert("devicelist_getAuthDev");
	authdevobj = api.require('listView');
	devAuthtag = 0;
	showAuthRefreshImg(1);
	var t = setTimeout("showAuthRefreshImg(2)", 3 * 1000)
	$mico.getAuthDev(userToken, function(ret, err, devinfo) {
		if (ret && (8 == PAGETAG)) {
			devAuthtag = 1;
			showAuthRefreshImg(0);
			authdevobj.open({
				h : 800,
				y : listy,
				cellHeight : 85,
				cellSelectColor : '#18161d',
				"borderColor" : "#18161d",
				"cellBgColor" : "#222028",
				imgHeight : '53',
				imgWidth : '53',
				data : ret
			}, function(openret, err) {
				var clickIndex = openret.index;
				//整行选择
				if (clickIndex >= 0) {
					//					api.prompt({
					//						title : GIVE_AUTH,
					//						msg : ENTER_PHONE,
					//						buttons : [OK_BTN, CANCEL_BTN]
					//					}, function(ret, err) {
					//						if (ret.buttonIndex == 1) {
					//							var phone = ret.text;
					//							if (true != isphone2(phone)) {
					//								apiToast(CONFIRM_PHONE, 1000);
					//							} else {
					//								remoteAuthdev(devinfo.devId[clickIndex], phone);
					//							}
					//						}
					//					});
					changpage("authuserlist", ret[openret.index].title + "下的用户");
					authdevobj.close();
					PAGETAG = 9;
					getDevUserQUery(devinfo.devId[clickIndex]);
					removeTouchMove();
				}
			});
			//刷新的小箭头，不可为空
			var loadingImgae = 'widget://image/jiantou.png';
			//刷新的小箭头，不可为空
			var bgColor = '#18161d';
			//下拉刷新的背景颜色 ，有默认值，可为空
			var textColor = '#8E8E8E';
			//提示语颜色，有默认值，可为空
			var textDown = PULL_DOWN;
			//尚未触发刷新时间的提示语，有默认值，可为空
			var textUp = RELEASE_HAND;
			//触发刷新事件的提示语，有默认值，可为空
			var showTime = true;
			//是否显示时间，有默认值，可为空
			authdevobj.setRefreshHeader({
				loadingImg : loadingImgae,
				bgColor : bgColor,
				textColor : textColor,
				textDown : textDown,
				textUp : textUp,
				showTime : showTime
			}, function(ret, err) {
				//触发加载事件
				//micokit
				$mico.getAuthDev(userToken, function(ret, err, devinfo) {
					if (ret) {
						authdevobj.reloadData({
							data : ret
						});
					} else {
					}
				});
			});
		} else {
		}
	});
}

//列出设备下所有用户
function getDevUserQUery(devid) {
	$mico.devUserQuery(APP_ID, userToken, devid, function(ret, err) {
		if (ret) {
			//			alert(JSON.stringify(ret));
			var html = "";
			var i = 0;
			var index = 0;
			var color = ["24c5c1", "882ab4", "23c3e0", "c73652", "2fb172", "b1a62f"];
			$.each(ret, function(n, value) {
				index = ((i++) % 6 + 1);
				html += '<ul>' + '<li class="mdnsdevcls">' + '<a>' + '<img src="../image/userquery' + index + '.png"/>' + '<div class="aunamecls"><p style="color:#' + color[index - 1] + '">' + value.username + '</p></div>';
				if ("share" == value.role) {
					html += '<img class="authctrlcls" onclick="deleteThisUser(\'' + devid + '\',\'' + value.id + '\')" src="../image/authdelete.svg"/>';
				}
				html += '</a>' + '</li>' + '</ul>';
			});
			$("#authlistid").html(html);
			_currentDevid = devid;
		} else {
			alert(JSON.stringify(err));
		}
	});
}

//为当前设备添加一个用户
function addNewUser() {
	api.prompt({
		title : GIVE_AUTH,
		msg : ENTER_PHONE,
		buttons : ["变管理员", "变用户", CANCEL_BTN]
	}, function(ret, err) {
		var phone = ret.text;
		if (ret.buttonIndex == 1) {
			if (true != isphone2(phone)) {
				apiToast(CONFIRM_PHONE, 1000);
			} else {
				remoteAuthdev(_currentDevid, phone, "owner");
			}
		} else if (ret.buttonIndex == 2) {
			if (true != isphone2(phone)) {
				apiToast(CONFIRM_PHONE, 1000);
			} else {
				remoteAuthdev(_currentDevid, phone, "share");
			}
		}
	});
}

//删除此设备的一个用户
function deleteThisUser(devid, userid) {
	//	alert(devid);
	//	alert(userid);
	$mico.deleteOneUser(APP_ID, userToken, userid, devid, function(ret, err) {
		if (ret) {
			apiToast(DEL_DEV_USER_SUC, 2000);
			getDevUserQUery(_currentDevid);
		} else {
			apiToast(DEL_DEV_USER_ERR, 2000);
		}
	});
}

//修改设备名字
function modifyDevName(devid, indexNo) {
	api.prompt({
		title : CHANGE_DEV_NAME,
		msg : ENTER_DEV_NAME,
		buttons : [OK_BTN, CANCEL_BTN]
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			var inputname = ret.text;
			if (inputname) {
				$mico.editDevName(APP_ID, userToken, inputname, devid, function(ret, err) {
					if (ret) {
						apiToast('好名字', 3000);
						devlistobj.refreshItem({
							index : indexNo,
							data : {
								title : inputname
							}
						});
						//						devicelist_getDevList();
					} else {
						alert(JSON.stringify(err));
					}
				});
			} else {
				apiToast(R_U_SURE, 2000);
			}
		}
	});
}

//解绑设备
function deleteDevName(devid, indexNo) {
	api.confirm({
		title : DEL_DEV,
		msg : R_U_SURE,
		buttons : [OK_BTN, CANCEL_BTN]
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			$mico.deleteDev(APP_ID, userToken, devid, function(ret, err) {
				if (ret) {
					apiToast('好吧', 3000);
					devlistobj.deleteItem({
						index : indexNo
					});
					//					devicelist_getDevList();
				} else {
					alert(JSON.stringify(err));
				}
			});
		} else {
			apiToast(GOOD_JOB, 2000);
		}
	});

	//	var ifdelete = window.confirm(R_U_SURE);
	//	if (ifdelete) {
	//		$mico.deleteDev(APP_ID, userToken, devid, function(ret, err) {
	//			if (ret) {
	//				apiToast('All right', 3000);
	//				devicelist_getDevList();
	//			} else {
	//				alert(JSON.stringify(err));
	//			}
	//		});
	//	} else {
	//		apiToast("Well", 2000);
	//	}
}

/*
* 设备详细列表部分
*/
//连接MQTT，并设置订阅
function mqttconnect(deviceid) {
	showProgress(GETDEVINFO, false);
	DEVID_GLOBAL = deviceid;
	var host = "api.easylink.io";
	var username = userToken;
	var password = "";
	var clientID = VISION_INDEX + "-app-" + api.deviceId.substring(0, 12);
	//	var clientID = userToken.split("-")[0];
	app1 = clientID;
	//	var clientID = deviceid.split("/")[1];
	//	apiToast(clientID, 2000);
	//	alert("准备Subscribe");
	micoSubscribe(host, username, password, deviceid + "/out/#", clientID);
	sleeprun(deviceid);
	mqttSign = 1;
	setTimeout("overTime('mqttSign',mqttSign)", 15000);
}

//设置2秒执行一次的publish操作获取设备状态
function sleeprun(deviceid) {
	selfInterval = self.setInterval("publishService('" + deviceid + "')", 2 * 1000);
}

//MQTT的publish请求，获取设备的所有状态
function publishService(deviceid) {
	micoPublish(deviceid + "/in/read/" + app1, "{}");
}

//MQTT里onMessageArrived回调的函数
function chgtxt(messageObj) {
	jsondeal(messageObj);
	mqttSign = 0;
}

function jsondeal(strjson) {
	//传来的是String型的要转成json
	//	alert(JSON.stringify(strjson));
	//apiToast("strjson = "+JSON.stringify(strjson), 5000);
	var jsonstr = strjson;
	//	var jsonstr = $api.strToJson(strjson);
	for (var key in jsonstr) {
		if (key == "services") {
			$(jsonstr.services).each(function() {
				initKey(this.type, this.properties);
				switch(this.type) {
					case UARTMSG:
						//						$("#chatliid").css("display", "block");
						break;
					case RGB_DIC:
						//						$("#rgbliid").css("display", "block");
						//主动读取rgb设备的信息
						readDevInfo('{"' + RGB_SWI_KEY + '":false,"' + RGB_HUES_KEY + '":0,"' + RGB_SATU_KEY + '":0,"' + RGB_BRIGHT_KEY + '":0}');
						break;
					case LIGHT_DIC:
						$("#devdataid").css("display", "block");
						$("#adcclsid").css("display", "block");
						break;
					//温度
					case TEMP_DIC:
						//						$("#devdataid").css("display", "block");
						$("#tempclsid").css("display", "block");
						break;
					//湿度
					case HUMI_DIC:
						//						$("#devdataid").css("display", "block");
						$("#humiclsid").css("display", "block");
						break;
					//距离
					case PRO_SENSOR_DIC:
						//						$("#devdataid").css("display", "block");
						$("#pro_sensorclsid").css("display", "block");
						break;
					//大气
					case ATMO_SENSOR_DIC:
						//						$("#devdataid").css("display", "block");
						$("#atmo_sensorclsid").css("display", "block");
						break;
					//三轴加速
					case MONTION_SENSOR_DIC:
						//						$("#devdataid").css("display", "block");
						$("#montion_sensorclsid").css("display", "block");
						break;
					//电机
					case MOTOR_SENSOR_DIC:
						//						$("#devdataid").css("display", "block");
						$("#motor_sensorclsid").css("display", "block");
						break;
					//红外
					case INFRARED_DIC:
						//						$("#devdataid").css("display", "block");
						$("#infraedclsid").css("display", "block");
						break;
				}
			});
			//	apiToast("Update Device", 2000);
			//	删除定时publish
			window.clearInterval(selfInterval);
			hidPro();
			//			alert("ADC_KEY = " + ADC_KEY + "UART_KEY = " + UART_KEY + "RGB_SWI_KEY = " + RGB_SWI_KEY + "RGB_HUES_KEY = " + RGB_HUES_KEY + "RGB_SATU_KEY = " + RGB_SATU_KEY + "RGB_BRIGHT_KEY = " + RGB_BRIGHT_KEY);
		} else {
			if (key == ADC_KEY) {
				$("#adcid").text(jsonstr[key]);
			} else if (key == INFRARED_KEY) {
				$("#infraedid").text(jsonstr[key]);
			} else if (key == TEMP_KEY) {
				$("#tempid").text(jsonstr[key] + "°C");
			} else if (key == HUMI_KEY) {
				$("#humiid").text(jsonstr[key] + "%RH");
			} else if (key == PRO_SENSOR_DIC) {
				$("#pro_sensorid").text(jsonstr[key]);
			} else if (key == ATMO_SENSOR_DIC) {
				$("#atmo_sensorid").text(jsonstr[key]);
			} else if (key == MONTION_SENSOR_DIC) {
				$("#montion_sensorid").text(jsonstr[key]);
			} else if (key == UART_KEY) {
				if (linum < 50) {
					linum++;
				} else {
					linum = 0;
					$("#chatmsg").empty();
				}
				var html = "<li class='devchatmsglicls' id='devsayli'><span>" + jsonstr[key] + "</span></li>";
				$("#chatmsg").append(html);
			} else if (key == RGB_SWI_KEY && (1 == rgbreadtag)) {
				rgb_switch = jsonstr[key];
				if (jsonstr[key] == true) {
					//					$("#rgbonoffbtn").get(0).options[1].selected = true;
					$("#rgbonoffbtn").attr("src", "../image/switchon.svg");
				} else {
					//					$("#rgbonoffbtn").get(0).options[0].selected = true;
					$("#rgbonoffbtn").attr("src", "../image/switchoff.svg");
				}
			} else if (key == RGB_HUES_KEY && (1 == rgbreadtag)) {
				rgb_hues = (jsonstr[key] / 360).toFixed(4);
				setcirclesit(rgb_hues);
			} else if (key == RGB_SATU_KEY && (1 == rgbreadtag)) {
				rgb_statu = (jsonstr[key] / 100).toFixed(2);
				if (ssliderMask) {
					ssliderMask.setValue(rgb_statu, 0, true);
				}
			} else if (key == RGB_BRIGHT_KEY && (1 == rgbreadtag)) {
				rgb_bright = (jsonstr[key] / 100).toFixed(2);
				if (bsliderMask) {
					bsliderMask.setValue(rgb_bright, 0, true);
				}
			} else if (key == MOTOR_KEY) {
				if ("0" == jsonstr[key]) {
					$("#motorbtn").attr("src", "../image/smallicon-8kaiguan.png");
				} else {
					$("#motorbtn").attr("src", "../image/smallicon-9kaiguan.png");
				}
			}
		}
	}
}

//初始化key值
function initKey(keytype, properties) {
	$(properties).each(function() {
		switch(this.type) {
			case RGB_SWITCH_DIC:
				RGB_SWI_KEY = this.iid;
				break;
			case RGB_HUES_DIC:
				RGB_HUES_KEY = this.iid;
				break;
			case RGB_SATU_DIC:
				RGB_SATU_KEY = this.iid;
				break;
			case RGB_BRIGHT_DIC:
				RGB_BRIGHT_KEY = this.iid;
				break;
			case UARTMSG_DIC:
				UART_KEY = this.iid;
				break;
			case OTHER_VAL_DIC:
				//所有type为的value
				if (keytype == LIGHT_DIC) {
					ADC_KEY = this.iid;
					if (this.value) {
						$("#adcid").text(this.value);
					}
				} else if (keytype == MOTOR_SENSOR_DIC) {
					MOTOR_KEY = this.iid;
					if (this.value) {
						if ("0" == this.value) {
							$("#motorbtn").attr("src", "../image/smallicon-8kaiguan.png");
						} else {
							$("#motorbtn").attr("src", "../image/smallicon-9kaiguan.png");
						}
					}
				} else if (keytype == INFRARED_DIC) {
					INFRARED_KEY = this.iid;
					if (this.value) {
						$("#infraedid").text(this.value);
					}
				} else if (keytype == TEMP_DIC) {
					TEMP_KEY = this.iid;
					if (this.value) {
						$("#tempid").text(this.value + "°C");
					}
				} else if (keytype == HUMI_DIC) {
					HUMI_KEY = this.iid;
					if (this.value) {
						$("#humiid").text(this.value + "%RH");
					}
				} else if (keytype == PRO_SENSOR_DIC) {
					PRO_KEY = this.iid;
					if (this.value) {
						$("#pro_sensorid").text(this.value);
					}
				} else if (keytype == ATMO_SENSOR_DIC) {
					ATMO_KEY = this.iid;
					if (this.value) {
						$("#atmo_sensorid").text(this.value);
					}
				} else if (keytype == MONTION_SENSOR_DIC) {
					MONTION_KEY = this.iid;
					if (this.value) {
						$("#montion_sensorid").text(this.value);
					}
				}
				break;
		}
	});
}

//读出设备的RGB的值
function readDevInfo(pubcode) {
	micoPublish(DEVID_GLOBAL + "/in/read/" + app1, pubcode);
}

//deal with rgbinfo
//function getrgbinfo(properties) {
//	$(properties).each(function() {
//		switch(this.type) {
//			case RGB_SWITCH_DIC:
//				rgb_switch = this.value;
//				if (this.value == true) {
//					$("#rgbonoffbtn").get(0).options[0].selected = true;
//				} else {
//					$("#rgbonoffbtn").get(0).options[1].selected = true;
//				}
//				break;
//			case RGB_HUES_DIC:
//				rgb_hues = (this.value / 360).toFixed(4);
//				setcirclesit(rgb_hues);
//				break;
//			case RGB_SATU_DIC:
//				rgb_statu = (this.value / 100).toFixed(2);
//				break;
//			case RGB_BRIGHT_DIC:
//				rgb_bright = (this.value / 100).toFixed(2);
//				break;
//		}
//	});
//}

/*
* uartChat部分
*/
//以下是聊天控制的
function chatctrl() {
	changpage("chatlist", "");
	if ("undefined" == typeof (chatobj)) {
		chatobj = api.require('inputField');
		chatobj.open({
			bgColor : '#F4F4F4',
			lineColor : '#CCCCCC',
			fileBgColor : '#FFFFFF',
			borderColor : '#CCCCCC',
			sendImg : 'widget://image/tubiao2.png',
			sendImgHighlight : 'widget://image/tubiao1.png',
			maxLines : 8
		}, function(ret, err) {
			addchatmsg(ret.msg);
		});
	} else {
		chatobj.show();
	}
}

function addchatmsg(msg) {
	if (linum < 50) {
		linum++;
	} else {
		linum = 0;
		$("#chatmsg").empty();
	}
	if (msg != "") {
		var html = "<li class='devchatmsglicls'><span>" + msg + "</span></li>";
		$("#chatmsg").append(html);
		var uartcode = '{"' + UART_KEY + '":"' + msg + '"}';
		micoPublish(DEVID_GLOBAL + "/in/write/" + app1, uartcode);
	}
}

/*
* RGB控制部分
*/
//开关灯按钮
//function checkrgbbtn() {
//	var rgbbtn = $("#rgbonoffbtn").find("option:selected").text();
//	if (rgbbtn == "On") {
//		dealwithrgbbtn(true);
//		ctrlrgb();
//	} else if (rgbbtn == "Off") {
//		window.clearInterval(rgbctrlinterval);
//		dealwithrgbbtn(false);
//	}
//}

//专门服务于开关灯
function dealwithrgbbtn(ifopen) {
	var color = colorPicker.getColorHSV();
	var colorcode = parseInt(color.h * 360);
	var brightcode = $('#brightspanid').val();
	var satcode = $('#satspanid').val();
	var rgbcode = '{"' + RGB_SWI_KEY + '":' + ifopen + ',"' + RGB_HUES_KEY + '":' + colorcode + ',"' + RGB_SATU_KEY + '":' + satcode + ',"' + RGB_BRIGHT_KEY + '":' + brightcode + '}';
	micoPublish(DEVID_GLOBAL + "/in/write/" + app1, rgbcode);
}

/*
* EasyLink部分
*/
/*micobind部分*/
//		获取ssid
function getWifiSsid() {
	var wifissid = api.require('wifiSsid');
	wifissid.getSsid(function(ret, err) {
		if (ret.ssid) {
			$("#wifi_ssid").val(ret.ssid);
			if (wifiNameTmp != ret.ssid) {
				$("#wifi_psw").val("");
			}
			wifiNameTmp = ret.ssid;
		} else {
			api.alert({
				msg : err.msg
			});
		}
	});
}

//获取设备ip
function getdevip() {
	//	$("#popupeasy").popup("open");

	//	alert(api.systemType+" "+api.systemVersion);
	//	if (api.systemVersion > "4.3" && (api.systemType != 'ios')) {
	//		setTimeout('$("#popupeasy").popup("open")', 1000);
	//	} else {
	showProgress(CONNECT_NET, false);
	//		setTimeout("overTime('getdevipSign',getdevipSign)", 45000);
	sysverid = 1;
	//	}

	//	if (api.systemVersion < "4.4") {
	//		showProgress(CONNECT_NET, false);
	//		//		setTimeout("overTime('getdevipSign',getdevipSign)", 45000);
	//		sysverid = 1;
	//	} else {
	//		setTimeout('$("#popupeasy").popup("open")', 1000);
	//	}
	//此时正在搜索设备，不允许返回
	PAGETAG = 100;
	getdevipSign = 1;

	micobindobj = api.require('micoBind');
	var wifi_ssid = $("#wifi_ssid").val();
	var wifi_psw = $("#wifi_psw").val();
	micobindobj.getDevip({
		wifi_ssid : wifi_ssid,
		wifi_password : wifi_psw
	}, function(ret, err) {
		//		if (1 == getdevipSign) {
		//			getdevipSign = 0;
		//			sysverid = 0;
		//			if (ret.devip) {
		//				dev_token = $.md5(ret.devip + userToken);
		//				dev_ip = ret.devip;
		//				//changpage("devmanage", "设置设备密码");
		//				if (1 == sysverid) {
		//					hidPro();
		//				}
		//				//				$("#backleft").css("display", "none");
		//			} else {
		//				$("#backleft").css("display", "block");
		//				if (1 == sysverid) {
		//					hidPro();
		//				}
		//				api.alert({
		//					msg : err.msg
		//				});
		//			}
		//			$("#popupeasy").popup("close");
		//			PAGETAG = 5;
		//		}
	});
}

//获取deviceid
function ajaxgetdveid(devip) {
	//	alert(devip);
	api.confirm({
		title : ACTIVATE_DEV,
		msg : SURE_ACTIV_DEV,
		buttons : [OK_BTN, CANCEL_BTN]
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			showProgress(SET_DEV_PSW, false);
			//此时正在搜索设备，不允许返回
			//	PAGETAG = 101;
			//	var dev_psw = $("#dev_psw").val();
			dev_token = $.md5(devip + userToken);
			var dev_psw = "1234";
			if (dev_psw != "" && isNum(dev_psw)) {
				//		alert("devip = " + devip + " psw = " + dev_psw + " dev_token = " + dev_token);
				$mico.getDevid(devip, dev_psw, dev_token, function(ret, err) {
					if (ret) {
						var devid = ret.device_id;
						bindtocloud(devid);
					} else {
						$("#backleft").css("display", "block");
						hidPro();
						apiToast(W_AND_TRY, 2000);
						//				alert(JSON.stringify(err));
					}
				});
			} else {
				$("#backleft").css("display", "block");
				hidPro();
				apiToast(PSW_M_DIG, 2000);
			}
		}
	});

}

//去云端绑定设备
function bindtocloud(devid) {
	$mico.bindDevCloud(APP_ID, userToken, dev_token, function(ret, err) {
		if (ret) {
			//页面跳转
			//			changpage("homePage", "MiCOKit");
			apiToast(ACTIVATE_SUCC, 2000);
			hidPro();
			//	刷新内容
			//			devicelist_getDevList();
		} else {
			$("#backleft").css("display", "block");
			hidPro();
			alert(JSON.stringify(err));
		}
	});
}

/*
* 设备授权部分
*/
//设备授权
function remoteAuthdev(devid, phone, role) {
	$mico.authDev(APP_ID, userToken, phone, devid, role, function(ret, err) {
		if (ret) {
			apiToast(AUTH_SUCCESS, 2000);
			getDevUserQUery(_currentDevid);
		} else {
			apiToast(NOT_EXIST, 2000);
			//			alert(JSON.stringify(err));
		}
	});
}

/*
* 用户管理部分
*/
//读取更新日日志
function readHisFile(filepath, showid) {
	api.readFile({
		path : 'widget://his/' + filepath
	}, function(ret, err) {
		if (ret.status) {
			var data = ret.data;
			//			data = '<span>' + data + '</span>'
			showid.html('<span>' + data + '</span>');
		}
	});
}

/**
 *页面跳转
 */
//转换显示的page页面
function changpage(pageid, titleName) {

	if (pageid == "homePage") {
		PAGETAG = 1;
		$("#backleft").css("display", "none");
		$("#tohomepage").css("display", "none");
		$("#tomyself").css("display", "block");
		$("#toeasylink").css("display", "block");
		//		$("#headerright").attr("src", "../image/smallicon-4.png");
		displayalldev();
	} else if (pageid == "deviceinfo") {
		PAGETAG = 2;
		removeTouchMove();
		$("#backleft").css("display", "block");
		$("#tomyself").css("display", "none");
		$("#toeasylink").css("display", "none");
		//		$("#headerright").attr("src", "");
	} else if (pageid == "virtualdev") {
		PAGETAG = 2;
		removeTouchMove();
		$("#backleft").css("display", "block");
		$("#tomyself").css("display", "none");
		$("#toeasylink").css("display", "none");
		$(".devctrlrow ul li").css("display", "block");
	} else if (pageid == "myselfpage") {
		$("#tomyself").css("display", "none");
		$("#backleft").css("display", "none");
		$("#toeasylink").css("display", "none");
		$("#tohomepage").css("display", "block");
		$("#header").css("background", "#2addb0");
		//		$("#headerright").attr("src", "");
		$("#titleName").html("");
		$("#mynickname").text(getNickName());
		$("#nicknameid").text(getNickName());
		$("#emailid").text(getEmail());
	} else if (pageid == "ssidmanage") {
		$("#backleft").css("display", "block");
		$("#tomyself").css("display", "none");
		$("#toeasylink").css("display", "none");
		//		$("#headerright").attr("src", "");
	} else if (pageid == "feedbackpage") {
		$("#backleft").css("display", "block");
		$("#tohomepage").css("display", "none");
		$("#header").css("background", "-webkit-linear-gradient(#2addb0,#24c5c1)");
	} else if (pageid == "editaccount") {
		$("#backleft").css("display", "block");
		$("#tohomepage").css("display", "none");
		$("#header").css("background", "-webkit-linear-gradient(#2addb0,#24c5c1)");
	} else if (pageid == "uphispage") {
		$("#backleft").css("display", "block");
		$("#tohomepage").css("display", "none");
		$("#header").css("background", "-webkit-linear-gradient(#2addb0,#24c5c1)");
	} else if (pageid == "authpage") {
		$("#backleft").css("display", "block");
		$("#tohomepage").css("display", "none");
		$("#header").css("background", "-webkit-linear-gradient(#2addb0,#24c5c1)");
	}
	if (titleName != "") {
		$("#titleName").html(titleName);
	}
	$.mobile.changePage("#" + pageid + "", {
		transition : "none"
	});
}

/**
 *监听goback的返回跳转
 */
function checkpage() {
	//			hidPro();
	if (PAGETAG == 2) {
		infoToList();
		addTouchMove();
		hidPro();
	} else if (PAGETAG == 1) {
		//apicloud云编辑时候不需要判断界面
		closeApp();
		//当点击确定时 返回 true
		//				if (window.confirm("确定退出")) {
		//					//do something 点确定
		//					closeApp();
		//				} else {
		//					//do otherthing 点取消
		//					apiToast("你做的对", 2000);
		//				}
	} else if (PAGETAG == 3) {
		rgbctrltoinfo();
		removeTouchMove();
	} else if (PAGETAG == 4) {
		uartctrltoinfo();
	} else if (PAGETAG == 5) {
		easylinktoList();
	} else if (PAGETAG == 6) {
		myselfToList();
	} else if (PAGETAG == 7) {
		feedtomyself();
	} else if (PAGETAG == 8) {
		authtomyself();
	} else if (PAGETAG == 9) {
		devusertoauto();
	} else if (PAGETAG == 0) {
		apiToast(NOT_ALW_RT, 2000);
	} else if (PAGETAG == 100) {
		if (1 == sysverid) {
			hidPro();
			api.confirm({
				title : SETTING,
				msg : WAIT_THIRTY_SEC,
				buttons : [OK_BTN, CANCEL_BTN]
			}, function(ret, err) {
				if (ret.buttonIndex == 1) {
					//do something 点确定
					apiToast(GOOD_JOB, 2000);
					showProgress(CONNECT_NET, false);
				} else {
					//		do otherthing 点取消
					stopEasyLink();
					apiToast(AGA_T_DEVLIST, 2000);
					PAGETAG = 5;
				}
			});
		} else {
			apiToast(CANCLE_FIRST, 2000);
		}
		//	} else if (PAGETAG == 101) {
		//		hidPro();
		//		api.confirm({
		//			title : SETTING,
		//			msg : WAIT_TEN_SEC,
		//			buttons : [OK_BTN, CANCEL_BTN]
		//		}, function(ret, err) {
		//			if (ret.buttonIndex == 1) {
		//				//do something 点确定
		//				apiToast(GOOD_JOB, 2000);
		//				showProgress(SET_DEV_PSW, true);
		//			} else {
		//				//do otherthing 点取消
		//				apiToast(AGA_T_DEVLIST, 2000);
		//				PAGETAG = 5;
		//			}
		//		});
	}
}

//设备详情界面返回键操作
function infoToList() {
	//页面跳转
	changpage("homePage", "MiCOKit");
	//	刷新内容
	devicelist_getDevList();
	//	删除定时publish
	window.clearInterval(selfInterval);

	stopMqtt();
}

//设备详情界面返回键操作
function myselfToList() {
	//页面跳转
	changpage("homePage", "MiCOKit");
	//	刷新内容
	devicelist_getDevList();
}

function rgbctrltoinfo() {
	//页面跳转
	changpage("deviceinfo", "");
	rgbreadtag = 1;
	//开启publish
	sleeprun(DEVID_GLOBAL);
	//	删除定时publish
	window.clearInterval(rgbctrlinterval);

}

function uartctrltoinfo() {
	//页面跳转
	changpage("deviceinfo", "");
	//关闭聊天窗口
	chatobj.hide();
	//	chatobj.close();
}

function easylinktoList() {
	stopMdns();
	hidPro();
	$(".mdnsdjhsb").css("display", "none");
	//页面跳转
	changpage("homePage", "MiCOKit");
	//	刷新内容
	devicelist_getDevList();
}

//反馈见面去个人信息界面
function feedtomyself() {
	changpage("myselfpage", "");
	PAGETAG = 6;
}

//授权界面去个人信息界面
function authtomyself() {
	changpage("myselfpage", "");
	authdevobj.close();
	PAGETAG = 6;
}

//设备下用户列表2授权界面
function devusertoauto() {
	changpage("authpage", "授权");
	PAGETAG = 8;
	devicelist_getAuthDev();
	addTouchMove();
}

//从底部的弹窗，毫秒级
function apiToast(msg, time) {
	api.toast({
		msg : msg,
		duration : time,
		location : 'bottom'
	});
}

/**
 *关闭APP
 */
function closeApp() {
	api.closeWidget({
		id : 'A6988773717043',
		retData : {
			name : 'closeWidget'
		},
		animation : {
			type : 'flip',
			subType : 'from_bottom',
			duration : 500
		}
	});
}

/**
 * 进度条
 */
//等待进度，（可选项）是否模态，模态时整个页面将不可交互
function showProgress(text, ifctrl) {
	api.showProgress({
		style : 'default',
		animationType : 'zoom',
		title : 'LOADING...',
		text : text,
		modal : ifctrl
	});
}

//隐藏浮动框
function hidPro() {
	api.hideProgress();
}

//隐藏所有设备
function displayalldev() {
	$(".devctrlrow ul li").css("display", "none");
	$("#devdataid").css("display", "none");
	//	$("#adcclsid").css("display", "none");
	//	$("#devclsid").css("display", "none");
	//	$("#chatliid").css("display", "none");
	//	$("#rgbliid").css("display", "none");
	//	$("#devdataid").css("display", "none");
}

function overTime(signName, sign) {
	if ("mqttSign" == signName && (1 == sign)) {
		infoToList();
		hidPro();
		apiToast(DEV_OFFLINE, 2000);
	} else if ("getdevipSign" == signName && (1 == getdevipSign)) {
		hidPro();
		stopEasyLink();
		if (100 == PAGETAG) {
			api.confirm({
				title : EL_OV,
				msg : CT_EL,
				buttons : [OK_BTN, CANCEL_BTN]
			}, function(ret, err) {
				if (ret.buttonIndex == 1) {
					getdevip();
				} else {
					getdevipSign = 0;
					PAGETAG = 5;
				}
			});
		}
	}
}

//打开touchmove监听
function addTouchMove() {
	document.body.addEventListener('touchmove', touchmove_listener, false);
}

//移除touchmove监听
function removeTouchMove() {
	document.body.removeEventListener('touchmove', touchmove_listener, false);
}

//停止发包
function stopEasyLink() {
	//	micobindobj = api.require('micoBind');
	micobindobj.stopFtc(function(ret, err) {
	});
}

//获取mdns设备列表
function getmDNSlist() {
	//	alert("oldstartMdns");
	micoMmdns = api.require("micoMdns");
	var serviceType = "_easylink._tcp";
	var inDomain = "local";
	saytag = 0;
	micoMmdns.startMdns({
		serviceType : serviceType,
		inDomain : inDomain
	}, function(ret, err) {
		var html = "";
		var sbtag = 0;
		if (ret.status) {
			//			apiToast("ss", 1000);
			$.each(ret.status, function(n, value) {
				if (("false" == value.deviceMacbind)) {
					sbtag = 1;
					html += '<li class="mdnsdevcls" onclick="ajaxgetdveid(\'' + value.deviceIP + '\')"><a><img src="../image/weijihuo.png"/><div><p class="mdnsdjhsbname">' + value.deviceName + '</p><p class="mdnsdjhsbip">' + value.deviceIP + '</p></div></a></li>';
				}
			});
			if (1 == sbtag) {
				$(".mdnsdjhsb").css("display", "block");
				if (0 == saytag) {
					saytag = 1;
					findUnactiDev();
				}
			}
			$("#mdnsdevliid").html(html);
		}
	});
}

//提示找到设备
function findUnactiDev() {
	if (1 == saytag) {
		apiToast(FIND_UNACTIV_DEV, 5000);
		saytag = 2;
		if (1 == sysverid) {
			hidPro();
		}
		api.confirm({
			title : TBC_BING,
			msg : CLICK_HIM,
			buttons : [OK_BTN, CANCEL_BTN]
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				stopEasyLink();
				PAGETAG = 5;
			} else {
				if (100 == PAGETAG) {
					showProgress(CONNECT_NET, false);
				}
			}
		});
	}
}

//停止扫描
function stopMdns() {
	micoMmdns.stopMdns(function(ret, err) {
	});
}

//ssid，psw输入框失去焦点
function onblurmDNS() {
	if (api.systemVersion < "4.4") {
		getmDNSlist();
		//		alert("onblurmDNS");
	}
}

//ssid，psw输入框获得焦点
function onfocusmDNS() {
	if (api.systemVersion < "4.4") {
		stopMdns();
		//		alert("onfocusmDNS");
	}
}

////编码格式的什么
//function hex2bin(hex) {
//	if (!hex.match(/0x\w+/)) {
//		alert(hex);
//		return hex;
//	}
//	var buf = new ArrayBuffer(hex.length / 2 - 1);
//	// 2 bytes for each char
//	var bufView = new Uint8Array(buf);
//	for (var i = 2; i <= hex.length - 2; i += 2) {
//		bufView[i / 2 - 1] = parseInt(hex.substr(i, 2), 16);
//	}
//	alert(buf);
//	return buf;
//}