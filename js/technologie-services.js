// TechnologieServices

(function(ext) {
    var device = null;
    var _rxBuf = [];

    
	var levels = {
		HIGH:1,
		LOW:0
	};
	var pins = {
		"D0":0,
		"D2":2,
		"D3":3,
		"D4":4,
		"D5":5,
		"D6":6,
		"D7":7,
		"D8":8,
		"A0":0,
		"A1":1,
		"A2":2,
		"A3":3
	};
	var values = {};
	var indexs = [];
	
	var versionIndex = 0xFA;
    
	ext.resetAll = function(){};
	
	ext.runArduino = function(){};
  
	ext.digitalWrite = function(label, pin, level) {
    runPackage(30,typeof pin=="number"?pin:pins[pin],typeof level=="number"?level:levels[level]);
  };
	ext.digitalRead = function(nextID, label, pin) {
		getPackage(nextID,30,typeof pin=="number"?pin:pins[pin]);
	};
	ext.analogRead = function(nextID, label, pin) {
		getPackage(nextID,31,typeof pin=="number"?pin:pins[pin]);
	};
	ext.analogWrite = function(label, pin, pwm) {
    runPackage(32,typeof pin=="number"?pin:pins[pin],pwm);
  };
	//Arduino map() implementation
	ext.map = function(nextID, val, in_min, in_max, out_min, out_max) {
		var newVal = ( val - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
		responseValue(nextID, newVal);
	};
	ext.timerRead = function(nextID){
		getPackage(nextID, 50);
	};
	//Timer reset
	ext.timerWrite = function(nextID){
		runPackage(50);
	};
	//Afficheur 7 segments
	ext.sevSegDisplayWrite = function (val, pin, dots) {
		runPackage(9,typeof pin=="number"?pin:pins[pin], Math.floor(val/100), val%100, dots=="afficher"?1:0);
	};
  //Afficheur i2c
	ext.i2cDisplayWrite = function (text, line) {
    var charCodes = [];//char splitted string
    var len = String(text).length;
    for(var i=0;i<len;i++) {
      charCodes.push(String(text).charCodeAt(i));
    }
    var port = 0; //dummy port
    runPackage(42, port, line, String(text).length, charCodes);
	};
  ext.i2cDisplayClear = function () {
    var port = 0; //dummy port
    runPackage(49, port);
	};
  ext.i2cDisplayRGB = function (r, g, b) {
    var port = 0; //dummy port
    runPackage(57, r, g, b);
	};
  //RGB Color Sensor
  ext.readColorRGB = function (nextID,  params, pin) 
	{
		var charCodes = [];
		if(params == "Rouge")
		{
			charCodes.push(0x52); //"R"
		}
		else if(params == "Bleu")
		{
			charCodes.push(0x42); //"B"
		} else {
			charCodes.push(0x56); //"V"
		}
		getPackage(nextID, 88, typeof pin=="number"? pin:pins[pin], 1, charCodes);
	};
  //DHT 11
	ext.dhtTemperatureRead = function (nextID, type, pin) {
    if(type == "DHT11")
    {
      getPackage(nextID, 43, typeof pin=="number"?pin:pins[pin]);
    }
    else if(type == "DHT22")
    {
      getPackage(nextID, 61, typeof pin=="number"?pin:pins[pin]);
    }
	};
  ext.dhtHumidityRead = function (nextID, type, pin) {
		if(type == "DHT11")
    {
      getPackage(nextID, 44,typeof pin=="number"?pin:pins[pin]);
    }
    else if(type == "DHT22")
    {
      getPackage(nextID, 62,typeof pin=="number"?pin:pins[pin]);
    }
	};
  //GROV24
  ext.humidityRead = function (nextID, pin) {
    getPackage(nextID, 65, typeof pin=="number"?pin:pins[pin]);
  }
  //GROV49 v1.2
  ext.temperatureRead = function (nextID, pin) {
		getPackage(nextID, 2,typeof pin=="number"?pin:pins[pin]);
	};
  //GROV121 BMP280
  ext.BMP280TemperatureRead = function (nextID) {
    getPackage(nextID, 63);
  }
  ext.BMP280PressureRead = function (nextID) {
    getPackage(nextID, 64);
  }
  //Joystick GROV78
  ext.joystickRead = function (nextID, slot, pin) {
    //Analog read
    var pinX = typeof pin=="number"?pin:pins[pin];
    var pinY = pinX+1;
    if(slot == "de l'axe X")
    {
      getPackage(nextID,31,pinX);//ANALOG
    }
    else if(slot == "de l'axe Y")
    {
      getPackage(nextID,31,pinY);//ANALOG
    }
    else
    {
      getPackage(nextID, 5, pinX);//JOYSTICK
    }
  };
    //Servo angle
  ext.servoAngleWrite = function (pin, val, speed)
  {
    runPackage(45, typeof pin=="number"?pin:pins[pin], val, speed);//SERVO_ANGLE
  };
  //Servo continu
  ext.servoContWrite = function (pin, val, dir, trim)
  {
    trim = 90 + trim;
    runPackage(46, typeof pin=="number"?pin:pins[pin], val, dir=="inverse"?1:0, trim);//SERVO_CONT
  };
  //IR
  ext.irRead = function (nextID, pin)
  {
    getPackage(nextID, 13, typeof pin=="number"?pin:pins[pin]);//IR
  };
  //RGB Led
  ext.rgbLedWrite = function (index, pin, red, green, blue)
  {
    runPackage(8, typeof pin=="number"?pin:pins[pin], index, red, green, blue);//RGB Led
  };
  //Led bar
  ext.ledBarWrite = function (level, pin)
  {
    runPackage(48, typeof pin=="number"?pin:pins[pin], level);
  };
  //Ultrasonic Ranger
  ext.ultrasonicRangerRead = function(nextID, pin)
  {
    getPackage(nextID, 1, typeof pin=="number"?pin:pins[pin]);//US
  };
  //i2c driver 
  ext.i2cDriver = function(speed1, speed2, direction)
  {
    var directions = {
      "en avant":6,
      "en arrière":9,
      "à gauche":5,
      "à droite":10,
    }
    var port = 0;//dummy port
    runPackage(10, port, directions[direction], speed1, speed2);
  };
  //AppInventor
  ext.appInventorDataAvailable= function(nextID, pin) {
		getPackage(nextID,60,typeof pin=="number"?pin:pins[pin]);
	};
	ext.appInventorSend = function (label, val, pin) {
    var charCodes = [];//char splitted string
    var str = label + ':' + val;
    var len = String(str).length;
    for(var i=0;i<len;i++) {
      charCodes.push(String(str).charCodeAt(i));
    }
    runPackage(58, typeof pin=="number"?pin:pins[pin], len, charCodes);
	};
  ext.appInventorReceive = function (nextID, label, pin) {
    var charCodes = [];//char splitted string
    var len = String(label).length;
    for(var i=0;i<len;i++) {
      charCodes.push(String(label).charCodeAt(i));
    }
    getPackage(nextID, 59, typeof pin=="number"?pin:pins[pin], len, charCodes);
  };
  //Led strip
  ext.ledStripPixel = function (index, size, pin, red, green, blue)
  {
    runPackage(69, typeof pin=="number"?pin:pins[pin], size, index, red, green, blue);
  };
  ext.ledStripBrightness = function (size, pin, value)
  {
    runPackage(70, typeof pin=="number"?pin:pins[pin], size, value);
  };
  ext.ledStripPattern = function (index, size, pin, red, green, blue)
  {
    var patterns = {
      "Uni":0,
      "Fondu":1,
      "Arc en ciel 1":2,
      "Arc en ciel 2":3,
      "Vogue":4,
      "Cylon":5,
      "Cascade":6
    }
    runPackage(71, typeof pin=="number"?pin:pins[pin], size, patterns[index], red, green, blue);
  };
  //MP3 Player GROV111
  ext.mp3Run = function (action, pin)
  {
      var commands = {
      "Lecture":1,
      "Pause":2,
      "Reprise":3,
      "Suivant":4,
      "Précédent":5,
      "Boucle":6,
      "Volume +":7,
      "Volume -":8,
    }
    runPackage(72, typeof pin=="number"?pin:pins[pin], commands[action]);
  };
  //RF433
  ext.RF433Available = function (nextID, pin) {
    getPackage(nextID, 66, typeof pin=="number"?pin:pins[pin]);
  };
  ext.RF433Read = function (nextID, pin) {
    getPackage(nextID, 67, typeof pin=="number"?pin:pins[pin]);
  };
  ext.RF433Write = function (nextID, val, pin) {
    var charCodes = [];
		charCodes.push(val);
    runPackage(68, typeof pin=="number"?pin:pins[pin], charCodes);
  };
  //Boussole
  ext.readCompass3Axis = function (nextID, param1, pin) 
	{
		var charCodes = [];
				
		if (param1 == "X")
		{
			charCodes.push(0x58);
		}
		else if (param1 == "Y")
		{
			charCodes.push(0x59);
		} else {// "Z"
			charCodes.push(0x5A); //"Z"
		}
		getPackage(nextID, 89, typeof pin=="number"? pin:pins[pin], 1, charCodes);
	};
  ext.readAccelerometer = function (nextID, axis)
  {
    var listaxis = {
      "X":0,
      "Y":1,
      "Z":2,
    }
    getPackage(nextID, 73, listaxis[axis]);
  }
  //--------------------
	// RFID
	//--------------------
	ext.RFIDavailable = function (nextID, pin) 
	{
		getPackage(nextID, 80, typeof pin=="number"?pin:pins[pin]);
	};
	ext.readRFID = function (nextID, pin) 
	{
		getPackage(nextID, 81, typeof pin=="number"?pin:pins[pin]);
	};

	/*******************************
	********************************
	*******************************/
	function runPackage(){
		var bytes = [];
		bytes.push(0xff);
		bytes.push(0x55);
		bytes.push(0);
		bytes.push(0);
		bytes.push(2);
		for(var i=0;i<arguments.length;i++){
      if(Array.isArray(arguments[i])) {
				bytes = bytes.concat(arguments[i]);
			} else {
        bytes.push(arguments[i]);
      }
		}
		bytes[2] = bytes.length-3;//size
		device.send(bytes);
	}
	function getPackage(){
		var bytes = [];
		bytes.push(0xff);
		bytes.push(0x55);
		bytes.push(0);
		bytes.push(arguments[0]);//0
		bytes.push(1);
		for(var i=1;i<arguments.length;i++){
			if(Array.isArray(arguments[i])) {
				bytes = bytes.concat(arguments[i]);
			} else {
        bytes.push(arguments[i]);
      }
		}
    bytes[2] = bytes.length-3;//size
		device.send(bytes);
	}

  var inputArray = [];
	var _isParseStart = false;
	var _isParseStartIndex = 0;
    function processData(bytes) {
		var len = bytes.length;
		if(_rxBuf.length>30){
			_rxBuf = [];
		}
		for(var index=0;index<bytes.length;index++){
			var c = bytes[index];
			_rxBuf.push(c);
			if(_rxBuf.length>=2){
				if(_rxBuf[_rxBuf.length-1]==0x55 && _rxBuf[_rxBuf.length-2]==0xff){
					_isParseStart = true;
					_isParseStartIndex = _rxBuf.length-2;
				}
				if(_rxBuf[_rxBuf.length-1]==0xa && _rxBuf[_rxBuf.length-2]==0xd&&_isParseStart){
					_isParseStart = false;
					
					var position = _isParseStartIndex+2;
					var extId = _rxBuf[position];
					position++;
					var type = _rxBuf[position];
					position++;
					//1 byte 2 float 3 short 4 len+string 5 double
					var value;
					switch(type){
						case 1:{
							value = _rxBuf[position];
							position++;
						}
							break;
						case 2:{
							value = readFloat(_rxBuf,position);
							position+=4;
							if(value<-255||value>1023){
								value = 0;
							}
						}
							break;
						case 3:{
							value = readShort(_rxBuf,position);
							position+=2;
						}
							break;
						case 4:{
							var l = _rxBuf[position];
							position++;
							value = readString(_rxBuf,position,l);
						}
							break;
						case 5:{
							value = readDouble(_rxBuf,position);
							position+=4;
						}
							break;
            case 6:
							value = readInt(_rxBuf,position,4);
							position+=4;
							break;
					}
					if(type<=5){
						if(values[extId]!=undefined){
							responseValue(extId,values[extId](value));
						}else{
							responseValue(extId,value);
						}
						values[extId] = null;
					}
					_rxBuf = [];
				}
			} 
		}
    }
	function readFloat(arr,position){
		var f= [arr[position],arr[position+1],arr[position+2],arr[position+3]];
		return parseFloat(f);
	}
	function readShort(arr,position){
		var s= [arr[position],arr[position+1]];
		return parseShort(s);
	}
	function readDouble(arr,position){
		return readFloat(arr,position);
	}
	function readString(arr,position,len){
		var value = "";
		for(var ii=0;ii<len;ii++){
			value += String.fromCharCode(_rxBuf[ii+position]);
		}
		return value;
	}
  function readInt(arr,position,count){
		var result = 0;
		for(var i=0; i<count; ++i){
			result |= arr[position+i] << (i << 3);
		}
		return result;
	}
    function appendBuffer( buffer1, buffer2 ) {
        return buffer1.concat( buffer2 );
    }

    // Extension API interactions
    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        potentialDevices.push(dev);

        if (!device) {
            tryNextDevice();
        }
    }

    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
        if (device) {
            device.open({ stopBits: 0, bitRate: 115200, ctsFlowControl: 0 }, deviceOpened);
        }
    }

    function deviceOpened(dev) {
        if (!dev) {
            // Opening the port failed.
            tryNextDevice();
            return;
        }
        device.set_receive_handler('ts',function(data) {
            processData(data);
        });
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        device = null;
    };

    ext._shutdown = function() {
        if(device) device.close();
        device = null;
    };

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'demo disconnected'};
        return {status: 2, msg: 'demo connected'};
    }

    var descriptor = {};
	ScratchExtensions.register('ts', descriptor, ext, {type: 'serial'});
})({});
