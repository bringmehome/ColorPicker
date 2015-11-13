/**
 * Created by rocke on 15-5-1.
 */

$(function() {
	//登录
	$("#loginbtn").click(function() {
		var phone = $("#login_phone").val();
		var psw = $("#login_psw").val();
		if (true != isphone2(phone)) {
			apiToast(CONFIRM_PHONE, 2000);
		} else {
			showProgress(LOGIN, true);
			$mxuser.loginWithPhone(phone, psw, function(ret, err) {
				// alert("usermag --- " + JSON.stringify(ret));
				if (ret) {
					if (strDMlogin == 'ios') {
						hidPro();
						openIndexWin();

						//hidPro();
					} else {
						openDevlistWin();
						hidPro();
					}
				} else {
					hidPro();
					if (err.message.indexOf("Could not find user") >= 0) {
						apiToast(NOT_EXIST, 2000);
					} else {
						apiToast(ID_WRONG, 2000);
					}
				}
			});
		}
	});
	//	返回上一级
	$("#historygo").click(function() {
		history.go(-1);
	});
	//	发送验证码
	$("#getverifyCode").click(function() {
		if (0 == sendSmsTag) {
			var phone = $("#register_phone").val();
			var pswtag = $("#pswtag").val();
			if (true != isphone2(phone)) {
				apiToast(CONFIRM_PHONE, 2000);
			} else {
				//按钮变灰不可用，并开启倒计时
				//				$("#getverifyCode").css("background", "#CCCCCC");
				$("#getverifyCode").removeClass("sendverify");
				$("#getverifyCode").addClass("sendverifyhs");
				sendSmsTag = 1;
				timecd = 60;
				$mxuser.isExist(phone, function(ret, err) {
					var ifreg_suc, length = ret.length;
					if (1 == length) {
						//看看userToken是否已经存在
						ifreg_suc = ret[0].get("userToken");
					}
					//如果是找回验证码pswtag=0：判断是否有此用户length，此用户是否有userToken
					//如果是注册pswtag=1：判断此用户是否已经注册length，此用户是否有userToken
					if (((0 == pswtag) && (0 < length) && ("undefined" != typeof (ifreg_suc))) || ((1 == pswtag) && (0 == length)) || ((1 == pswtag) && ("undefined" == typeof (ifreg_suc)))) {
						$mxuser.getSmsCode(phone, function(ret) {
							hidPro();
							//发送成功
							if (ret == 0) {
								apiToast(SEND_TO_PHONE, 2000);
							} else {
								alert(JSON.stringify(ret));
							}
						});
					} else {
						if (0 == pswtag) {
							apiToast(NOT_EXIST, 2000);
						} else if (1 == pswtag) {
							apiToast(IS_EXIST, 2000);
						}
						//恢复send按钮的初始状态
						window.clearInterval(ctrlSendSms);
						//						$("#getverifyCode").css("background", "#0088CC");
						$("#getverifyCode").removeClass("sendverifyhs");
						$("#getverifyCode").addClass("sendverify");
						$("#sendsmstxt").text("发送");
						sendSmsTag = 0;
					}
				});
				ctrlSendSms = self.setInterval("setCountDown()", 1000);
			}
		} else {
			apiToast(SMS_FRE, 2000);
		}
	});
	//注册用户
	$("#nextstep").click(function() {
		var phone = $("#register_phone").val();
		var identify = $("#register_code").val();
		if (true != isphone2(phone)) {
			apiToast(CONFIRM_PHONE, 2000);
		} else if ("" == identify) {
			apiToast(VCODE_N_EMPTY, 2000);
			//		} else if (!isNum(identify)) {
			//			apiToast(VCODE_N_EMPTY, 2000);
		} else {
			showProgress(VALID_MSG, true);
			$mxuser.signUpOrlogInByPhone(phone, identify, function(ret, err) {
				// alert("nextstep --- " + JSON.stringify(ret));
				if (ret) {
					// openMainWin();
					apiToast(EDI_SUCCESS, 2000);
					// window.location.href = "../index.html";
					//slideup
					$.mobile.changePage("#nextsteppage", {
						transition : "none"
					});
					hidPro();
				} else {
					apiToast(VALID_MSG_FAIL, 2000);
					//					alert(JSON.stringify(err));
					hidPro();
				}
			});
		}
	});

	//退出登录
	$("#logout").click(function() {
		AV.User.logOut();
		currentUser = AV.User.current();
		window.location.href = "./login.html";
	});

	//设置初始密码
	$("#finishregister").click(function() {
		var phone = $("#register_phone").val();
		var password = $("#nextstep_psw").val();
		var confirmpsw = $("#nextstep_ckpsw").val();
		var pswtag = $("#pswtag").val();
		//1 初次设置密码 0重置密码
		if ("" == password) {
			apiToast(PSW_N_EMPTY, 2000);
		} else if (password != confirmpsw) {
			apiToast(PSW_N_MATCH, 2000);
		} else {
			showProgress(SETTING, true);
			if (pswtag == "1") {
				$mxuser.setPassword(phone, password, function(ret, err) {
					if (ret) {
						apiToast(EDI_SUCCESS, 2000);
						// registerToEasyCloud(phone, password);
						if (strDMlogin == 'ios') {
							hidPro();
							openIndexWin();
						} else {
							openDevlistWin();
							hidPro();
						}

						//						window.location.href = "../index.html";
					} else {
						hidPro();
						alert(JSON.stringify(err));
					}
				});
			} else {
				$mxuser.resetPassword(password, function(ret, err) {
					if (ret) {
						apiToast(EDI_SUCCESS, 2000);
						// registerToEasyCloud(phone, password);
						// window.location.href = "../index.html";
						if (strDMlogin == 'ios') {
							hidPro();
							openIndexWin();
						} else {
							openDevlistWin();
							hidPro();
						}
						//						window.location.href = "../index.html";
					} else {
						hidPro();
						alert(JSON.stringify(err));
					}
				});
			}
		}
	});

	//保存反馈信息
	$("#savefd").click(function() {
		var phone = getUserInfo().get("username");
		var fdcontent = $("#fdcontent").val();
		showProgress("Saving", true);
		$mxuser.sendFeedback(phone, fdcontent, function(ret, err) {
			hidPro();
			if (ret) {
				//				alert("ret = " + JSON.stringify(ret));
				apiToast(REPLY_U, 2000);
			} else {
				alert("err = " + JSON.stringify(err));
			}
		});
	});

	//		修改用户昵称
	$("#nickclsid").click(function() {
		api.prompt({
			title : EDIT_NICK,
			msg : ENTER_NICK,
			buttons : [OK_BTN, CANCEL_BTN]
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				var nickname = ret.text;
				$mxuser.updateNickName(nickname, function(ret, err) {
					if (ret) {
						apiToast(EDI_SUCCESS, 2000);
						$("#nicknameid").text(nickname);
					}
				});
			}
		});
	});

	//		修改用户邮箱
	$("#emailclsid").click(function() {
		api.prompt({
			title : EDIT_MAIL,
			msg : ENTER_MAIL,
			buttons : [OK_BTN, CANCEL_BTN]
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				var email = ret.text;
				if (checkEmail(email)) {
					$mxuser.updateEmail(email, function(ret, err) {
						if (ret) {
							apiToast(EDI_SUCCESS, 2000);
							$("#emailid").text(email);
						}
					});
				} else {
					apiToast(CONFIRM_EMAIL, 2000);
				}
			}
		});
	});

	//		修改用户密码
	$("#pswclsid").click(function() {
		api.prompt({
			title : EDIT_PSW,
			msg : ENTER_PSW,
			buttons : [OK_BTN, CANCEL_BTN]
		}, function(ret, err) {
			if (ret.buttonIndex == 1) {
				var psw = ret.text;
				$mxuser.resetPassword(psw, function(ret, err) {
					if (ret) {
						apiToast(EDI_SUCCESS, 2000);
					}
				});
			}
		});
	});

	//	//Cloud测试
	//	$("#cloudtest").click(function() {
	//		//		alert("CLOUD测试");
	//		var phone = "13122000202";
	//		var oldpsw = "111111";
	//		var password = "123456";
	//
	//		$mxuser.updatePassword(oldpsw, password, function(ret, err) {
	//			if (ret) {
	//				alert("ret = " + JSON.stringify(ret));
	//				alert("注册成功");
	//			} else {
	//				alert("err = " + JSON.stringify(err));
	//			}
	//		});
	//	});
});

//去EasyCloud注册regToEasyCloud
function registerToEasyCloud(phone, password) {
	$mxuser.regToEasyCloud(phone, password, function(ret, err) {
		if (ret) {
			apiToast(EDI_SUCCESS, 2000);
			// window.location.href = "../index.html";
		} else {
			alert(JSON.stringify(err));
		}
	});
}

//获取登录信息
function islogin() {
	//	alert("in");
	var currentUser = $mxuser.islogin();
	//	alert(currentUser);
	if (currentUser) {
		apiToast("true", 2000);
	} else {
		apiToast("false", 2000);
	}
	return currentUser;
}

//获取用户登录的信息
function getUserInfo() {
	var userinfo = AV.User.current();
	//	var nickname = currentUser.get("nickname");
	return userinfo;
}

//获取昵称
function getNickName() {
	if (getUserInfo()) {
		var nickname = getUserInfo().get("nickname");
		if (nickname == "" || nickname == null) {
			return getUserInfo().get("username");
		} else {
			return nickname;
		}
	} else {
		return NOT_LOGIN;
	}
}

//获取邮箱
function getEmail() {
	if (getUserInfo()) {
		var email = getUserInfo().get("email");
		if (email == "" || email == null) {
			//			return getUserInfo().get("email");
		} else {
			return email;
		}
	} else {
		return "未设置";
	}
}

////打开首页
//function openMainWin() {
//	apiToast(EDI_SUCCESS, 1000);
//
//}

////修改昵称
//function saveNickName() {
//	var nickname = $("#nickname").val();
//	if (nickname == "" || nickname == null) {
//		apiToast("原来你就是无名", 2000);
//	} else {
//		$mxuser.updateNickName(nickname, function(ret, err) {
//			if (ret) {
//				apiToast("昵称修改成功", 2000);
//				// window.location.href = "../index.html";
//				window.history.go(-1);
//			} else {
//				apiToast("现在不让起名字了，一会再试试吧", 2000);
//				alert(JSON.stringify(err));
//			}
//		});
//	}
//}

////修改用户密码
//function updatePsw() {
//	var oldpsw = $("#update_old_psw").val();
//	var password = $("#update_psw").val();
//	var confirmpsw = $("#update_confirmpsw").val();
//
//	if (oldpsw == "" || password == "" || confirmpsw == "" || oldpsw == null || password == null || confirmpsw == null) {
//		apiToast("密码能不填吗?", 2000);
//	} else if (password != confirmpsw) {
//		apiToast("两次密码输入不一致", 2000);
//	} else {
//		$mxuser.updatePassword(oldpsw, password, function(ret, err) {
//			if (ret) {
//				apiToast("密码修改成功", 2000);
//			} else {
//				alert(JSON.stringify(err));
//			}
//		});
//	}
//}

////跳转到其他页面
//function openOtherWin(type) {
//	location.href = "./" + type + ".html";
//}
//
////返回上一页
//function goback() {
//	window.history.go(-1);
//}

/*判断输入是否为合法的手机号码*/
function isphone2(inputString) {
	//	alert(inputString);
	var regBox = {
		regEmail : /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/, //邮箱
		regName : /^[a-z0-9_-]{3,16}$/, //用户名
		regMobile : /^0?1[3|4|5|7|8][0-9]\d{8}$/, //手机
		regTel : /^0[\d]{2,3}-[\d]{7,8}$/
	};
	var mflag = regBox.regMobile.test(inputString);
	if (!mflag) {
		return false;
		//		alert("手机或者电话有误！");
	} else {
		return true;
		//		alert("信息正确！");
	};
}

/*判断输入的邮箱是否正确*/
function checkEmail(str) {
	var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
	if (re.test(str)) {
		return true;
	} else {
		return false;
	}
}

//判断是否是数字
function isNum(t) {
	var z = /^[0-9]*$/;
	if (z.test(t)) {
		return true;
	} else {
		return false;
	};
}

function openIndexWin() {
	api.openWin({
		name : "index",
		url : "../index.html",
		reload : true,
		bgColor : '#F0F0F0',
		slidBackEnabled : false,
		animation : {
			type : 'none'
		}
	})
}

function openDevlistWin() {
	api.openWin({
		name : 'devicelist',
		url : './devicelist.html',
		reload : true,
		bgColor : '#F0F0F0',
		slidBackEnabled : false,
		animation : {
			type : 'none'
		}
	});
}

function openWindows(type) {
	alert("type = " + type);
	var urlty = './' + type + '.html';
	alert("urlty = " + urlty);
	api.openWin({
		name : type,
		url : urlty,
		delay : 100,
		type : "flip", //动画类型（详见动画类型常量）
		subType : "from_right", //动画子类型（详见动画子类型常量）
		duration : 300, //动画过渡时间，默认300毫秒
		reload : true
	});
}

//发送短信的倒计时程序
function setCountDown() {
	if (timecd > 0) {
		$("#sendsmstxt").text(timecd-- + "s");
	} else {
		//恢复send按钮的初始状态
		window.clearInterval(ctrlSendSms);
		//		$("#getverifyCode").css("background", "#0088CC");
		$("#getverifyCode").removeClass("sendverifyhs");
		$("#getverifyCode").addClass("sendverify");
		$("#sendsmstxt").text("发送");
		sendSmsTag = 0;
	}
}