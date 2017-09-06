// TechnologieServices

(function(ext) {
	var levels = {
		HIGH:1,
		LOW:0
	};
    
	ext.resetAll = function(){};
	
	ext.runArduino = function(){};

  //Robuno WRITE 54
  ext.robunoWrite = function(pin, level)
  {
    var outputs = {
      "la led rouge":4,
      "la led blanche":5,
      "le buzzer":6,
      "la broche libre":7
    }
    runPackage(54, outputs[pin], typeof level=="number"?level:levels[level]);
  }
  //Robuno RUN 51
  ext.robunoRun = function(dir, speed)
  {
    var direction = {
		"en avant":0,
    "en arrière":1,
    "à gauche":2,
    "à droite":3
    }
    runPackage(51, direction[dir], speed);
  }
  //Robuno STOP 52
  ext.robunoStop= function()
  {
    var port=0;//dummy port
    runPackage(52, port);
  }
  //Robuno READ 53
  ext.robunoRead= function(nextID, pin)
  {
    var port = {
      "gauche":2,
			"droite":3,
			"la broche libre":7,
    }
    getPackage(nextID, 53, port[pin]);
  }
  //Robuno LDR 55
  ext.robunoLDR= function(nextID, pin)
  {
    var side = {
      "gauche":2,
      "droite":3,
    }
    getPackage(nextID, 55, side[pin]);
  }
  //Robuno SERVO 56
  ext.robunoServo= function()
  {
    var port=0;//dummy port
    runPackage(56, port);
  }

/*******************************
	********************************
	*******************************/
  var device = null;
  var _rxBuf = [];
  var values = {};
	var indexs = [];
	var versionIndex = 0xFA;
    
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
		bytes[2] = bytes.length-3;
		device.send(bytes);
	}
	function getPackage(){
		var bytes = [];
		bytes.push(0xff);
		bytes.push(0x55);
		bytes.push(arguments.length+1);
		bytes.push(arguments[0]);//0
		bytes.push(1);
		for(var i=1;i<arguments.length;i++){
			bytes.push(arguments[i]);
		}
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
        if(!device) return {status: 1, msg: 'robuno disconnected'};
        return {status: 2, msg: 'robuno connected'};
    }

    var descriptor = {};
	ScratchExtensions.register('robuno', descriptor, ext, {type: 'serial'});
})({});

