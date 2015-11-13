/**
 * Created by rocke on 15-5-1.
 */

//APP_ID
var APP_ID = "189cf0d5-4bd9-4d3f-a65d-342adbea735b";
//APP_NAME
var APP_NAME = "MicoKit";

/*设备字典*/
//设备制造商
var DEVMANUDIC = "public.map.property.manufacturer";
//设备序列号
var DEVNUMDIC = "public.map.property.serial_number";
//设备名称
var DEVNAMEDIC = "public.map.property.name";

//adc
//var LIGHT_DIC = "public.map.service.adc";
var LIGHT_DIC = "public.map.service.light_sensor";
//RGB
var RGB_DIC = "public.map.service.rgb_led";
//UARTMSG
var UARTMSG_DIC = "public.map.property.message";
//温度传感器
var TEMP_DIC = "public.map.service.temperature";
//湿度传感器
var HUMI_DIC = "public.map.service.humidity";
//距离传感器
var PRO_SENSOR_DIC = "public.map.service.proximity_sensor";
//大气压传感器
var ATMO_SENSOR_DIC = "public.map.service.atmosphere_sensor";
//三轴加速传感器
var MONTION_SENSOR_DIC = "public.map.service.montion_sensor";
//电机
var MOTOR_SENSOR_DIC = "public.map.service.motor";
//红外
var INFRARED_DIC = "public.map.service.infrared";
//串口透传
var UARTMSG = "public.map.service.uart";

//LED 的开关量
var RGB_SWITCH_DIC = "public.map.property.switch";
//LED 颜色的 hues 分量
var RGB_HUES_DIC = "public.map.property.hues";
//LED 颜色的 saturability分量
var RGB_SATU_DIC = "public.map.property.saturation";
//LED颜色的brightness分量
var RGB_BRIGHT_DIC = "public.map.property.brightness";
//all value
var OTHER_VAL_DIC = "public.map.property.value";

//key对应的设备上报的标识
//adc标识
var ADC_KEY;
//uart标识
var UART_KEY;
//rgb标识switch
var RGB_SWI_KEY;
//rgb标识hues
var RGB_HUES_KEY;
//urgb标识saturation
var RGB_SATU_KEY;
//rgb标识brightness
var RGB_BRIGHT_KEY;
//motor标识开关
var MOTOR_KEY;
//infrared标识开关
var INFRARED_KEY;
//htkey
var TEMP_KEY;
//htkey
var HUMI_KEY;
//距离
var PRO_KEY;
//大气压
var ATMO_KEY;
//三轴加速
var MONTION_KEY;


////key对应的设备上报的标识
////adc标识
//var ADC_KEY = "10";
////uart标识
//var UART_KEY = "13";
////rgb标识switch
//var RGB_SWI_KEY = "5";
////rgb标识hues
//var RGB_HUES_KEY = "6";
////urgb标识saturation
//var RGB_SATU_KEY = "7";
////rgb标识brightness
//var RGB_BRIGHT_KEY = "8";
////motor标识开关
//var MOTOR_KEY = "15";
////infrared标识开关
//var INFRARED_KEY = "16";
////htkey
//var ht_key = "";
////距离
//var PRO_KEY = "";
////大气压
//var ATMO_KEY = "";
////三轴加速
//var MONTION_KEY = "";
