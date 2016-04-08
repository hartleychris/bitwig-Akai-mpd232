

/* Midi note numbers for arrow */
const NAVKeys =
{
    UP:34,
    DOWN:35,
    LEFT:36,
    RIGHT:37,
};

/* MPK2 Pad Color Identifiers */
const padColors = 
{
    Off:0x00,
    Red:0x01,
    Orange:0x02,
    Amber:0x03,
    Yellow:0x04,
    Green:0x05,
    Green_Blue:0x06,
    Aqua:0x07,
    Light_Blue:0x08,
    Blue:0x09,
    Purple:0x0A,
    Pink:0x0B,
    Hot_Pink:0x0C,
    Pastel_Purple:0x0D,
    Pastel_Green:0x0E,
    Pastel_Pink:0x0F,
    Grey:0x10
};


/* Pad Status byte */
const PadStatus = 0x99;
var PadNotes;

/* Status bytes used on each bank */
const bankAStatus = 0xb1;
const bankBStatus = 0xb2;
const bankCStatus = 0xb3;

const ClipStatus = {
    Off:0x00,
    Occupied:0x01,
    Playing:0x02,
    Recording:0x03
}


/* left most CC of each control. inc by 1 for each control to the right */
var S1 = 30;
const F1 = 40;
var K1 = 50;

var S_225_BankB = 75;
var S_225_BankC = 106;

/* Mode defines*/
var usingDrumMachine = false;
var shifted = false;
var activeClipBank;
var displayHelpText = true;


/* arrays to keep track of track states */
var armed = initArray(0, 8);
var muted = initArray(0, 8);
var soloed = initArray(0, 8);

var isSelected = initArray(false, 8);

var clipSlots = create2DArray(8,16);

var drumKeys = initArray(false,128);
var transtable = initArray(-1,128);

var activePadMode = null;

var PadMidiTableOFF = initArray(-1,128);
var PadMidiTableON = initCountingArray(0,128);

var PadMIDITable = {
    ON:initCountingArray(0,128),
    OFF:initArray(-1,128)
};



function initCountingArray(startValue, length)
{
    var arr = [];
    arr.length = length;
    for (var x = 0; x < arr.length; x++) {
        arr[x] = x;
    }
    return arr;
}


function getActivePadMode(mode)
{
	return activePadMode;
}
function setActivePadMode(mode)
{
    activePadMode = mode;
    mode.init();
	
	updateButtonLeds();
}

function getLSB(value) 
{
    return Math.floor(value % 128);
}

function getMSB(value) 
{
    return Math.floor(value / 128);
}


var bitwigColor = { Dark_Grey             :     [0.3294.toFixed(4),0.3294.toFixed(4),0.3294.toFixed(4)],
                    Light_Grey            :     [0.4784.toFixed(4),0.4784.toFixed(4),0.4784.toFixed(4)],
                    White                 :     [0.7882.toFixed(4),0.7882.toFixed(4),0.7882.toFixed(4)],
                    Purple_Grey           :     [0.5255.toFixed(4),0.5373.toFixed(4),0.6745.toFixed(4)],
                    Dark_Brown            :     [0.6392.toFixed(4),0.4745.toFixed(4),0.2627.toFixed(4)],
                    Light_Brown           :     [0.7765.toFixed(4),0.6235.toFixed(4),0.4392.toFixed(4)],
                    Purple_Blue           :     [0.3412.toFixed(4),0.3804.toFixed(4),0.7765.toFixed(4)],
                    Light_Purple_Blue     :     [0.5176.toFixed(4),0.5412.toFixed(4),0.8784.toFixed(4)],
                    Purple                :     [0.5843.toFixed(4),0.2863.toFixed(4),0.7961.toFixed(4)],
                    Pink                  :     [0.8510.toFixed(4),0.2196.toFixed(4),0.4431.toFixed(4)],
                    Red                   :     [0.8510.toFixed(4),0.1804.toFixed(4),0.1412.toFixed(4)],
                    Orange                :     [1.0000.toFixed(4),0.3412.toFixed(4),0.0235.toFixed(4)],
                    Gold                  :     [0.8510.toFixed(4),0.6157.toFixed(4),0.0627.toFixed(4)],
                    Lime                  :     [0.4510.toFixed(4),0.5961.toFixed(4),0.0784.toFixed(4)],
                    Green                 :     [0.0000.toFixed(4),0.6157.toFixed(4),0.2784.toFixed(4)],
                    Aqua                  :     [0.0000.toFixed(4),0.6510.toFixed(4),0.5804.toFixed(4)],
                    Sky_Blue              :     [0.0000.toFixed(4),0.6000.toFixed(4),0.8510.toFixed(4)],
                    Light_Purple          :     [0.7373.toFixed(4),0.4627.toFixed(4),0.9412.toFixed(4)],
                    Light_Pink            :     [0.8824.toFixed(4),0.4000.toFixed(4),0.5686.toFixed(4)],
                    Pink_Orange           :     [0.9255.toFixed(4),0.3804.toFixed(4),0.3412.toFixed(4)],
                    Light_Orange          :     [1.0000.toFixed(4),0.5137.toFixed(4),0.2431.toFixed(4)],
                    Light_Gold            :     [0.8941.toFixed(4),0.7176.toFixed(4),0.3059.toFixed(4)],
                    Light_Lime            :     [0.6275.toFixed(4),0.7529.toFixed(4),0.2980.toFixed(4)],
                    Light_Green           :     [0.2431.toFixed(4),0.7333.toFixed(4),0.3843.toFixed(4)],
                    Light_Aqua            :     [0.2627.toFixed(4),0.8235.toFixed(4),0.7255.toFixed(4)],
                    Light_Sky_Blue        :     [0.2667.toFixed(4),0.7843.toFixed(4),1.0000.toFixed(4)]
};


function bitwigColorToPadColor(rgbInput)
{
    if (areArraysEqual(rgbInput,bitwigColor['Dark_Grey']) == true) { return padColors['Grey']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Grey']) == true) { return padColors['Grey']; }
    else if (areArraysEqual(rgbInput,bitwigColor['White']) == true) { return padColors['Grey']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Purple_Grey']) == true) { return padColors['Purple']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Dark_Brown']) == true) { return padColors['Orange']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Brown']) == true) { return padColors['Orange']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Purple_Blue']) == true) { return padColors['Light_Blue']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Purple_Blue']) == true) { return padColors['Pastel_Purple']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Purple']) == true) { return padColors['Purple']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Pink']) == true) { return padColors['Pink']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Red']) == true) { return padColors['Red']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Orange']) == true) { return padColors['Orange']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Gold']) == true) { return padColors['Orange']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Lime']) == true) { return padColors['Green_Blue']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Green']) == true) { return padColors['Pastel_Green']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Aqua']) == true) { return padColors['Aqua']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Sky_Blue']) == true) { return padColors['Aqua']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Purple']) == true) { return padColors['Pastel_Purple']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Pink']) == true) { return padColors['Hot_Pink']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Pink_Orange']) == true) { return padColors['Pastel_Pink']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Orange']) == true) { return padColors['Orange']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Gold']) == true) { return padColors['Orange']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Lime']) == true) { return padColors['Pastel_Green']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Green']) == true) { return padColors['Pastel_Green']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Aqua']) == true) { return padColors['Aqua']; }
    else if (areArraysEqual(rgbInput,bitwigColor['Light_Sky_Blue']) == true) { return padColors['Light_Blue']; }

}


var CursorTrackColor;

function sendSysexToRemote(numberArray)
{
    var sysexString = "";
    for ( var x = 0 ; x < numberArray.size(); x++) {
        sysexString+=uint8ToHex(numberArray[x]) + " ";
    }
    host.MidiOutPort(1).sendSysex(sysexString);
}




function setSwitchLED(swich, bank, value)
{
    host.getMidiOutPort(0).sendMidi(bank, swich, value);
}

function updateButtonLeds() {
	
	if (getActivePadMode() == PadInstrument) {
	
		setSwitchLED(0 + S1 ,bankAStatus,127);
		setSwitchLED(1 + S1 ,bankAStatus,0);
		setSwitchLED(2 + S1 ,bankAStatus,0);
		
		setSwitchLED(0 + S1 ,bankBStatus,127);
		setSwitchLED(1 + S1 ,bankBStatus,0);
		setSwitchLED(2 + S1 ,bankBStatus,0);
		
		setSwitchLED(0 + S1 ,bankCStatus,127);
		setSwitchLED(1 + S1 ,bankCStatus,0);
		setSwitchLED(2 + S1 ,bankCStatus,0);
		
	} else if (getActivePadMode() == PadClipLauncher) {
	
		setSwitchLED(0 + S1 ,bankAStatus,0);
		setSwitchLED(1 + S1 ,bankAStatus,127);
		setSwitchLED(2 + S1 ,bankAStatus,0);
		
		setSwitchLED(0 + S1 ,bankBStatus,0);
		setSwitchLED(1 + S1 ,bankBStatus,127);
		setSwitchLED(2 + S1 ,bankBStatus,0);
		
		setSwitchLED(0 + S1 ,bankCStatus,0);
		setSwitchLED(1 + S1 ,bankCStatus,127);
		setSwitchLED(2 + S1 ,bankCStatus,0);
		
	} else if (getActivePadMode() == PadSceneLauncher) {
	
		setSwitchLED(0 + S1 ,bankAStatus,0);
		setSwitchLED(1 + S1 ,bankAStatus,0);
		setSwitchLED(2 + S1 ,bankAStatus,127);
		
		setSwitchLED(0 + S1 ,bankBStatus,0);
		setSwitchLED(1 + S1 ,bankBStatus,0);
		setSwitchLED(2 + S1 ,bankBStatus,127);
		
		setSwitchLED(0 + S1 ,bankCStatus,0);
		setSwitchLED(1 + S1 ,bankCStatus,0);
		setSwitchLED(2 + S1 ,bankCStatus,127);
	}
	


}

function create2DArray(x, y)
{
   var tmp = [];
    for ( var i = 0; i < x; i++) {
        tmp[i] = [];
    }
    return tmp;
}

function cursorTrackColorObs() 
{
    return function(red,green,blue)
	{
        activePadMode.cursorTrackColorObs(red,green,blue);
    }
}

function cursorTrackInstrumentNameObs() 
{
    return function (text) 
	{
        activePadMode.cursorTrackInstrumentNameObs(text);
    }
}

function cursorTrackpitchObs() 
{
    return function (key, name) 
	{
        activePadMode.cursorTrackpitchObs(key,name);
    }
}

function initClipArray() 
{
    for (var x = 0; x < 8; x++)
		{
        for (var y = 0; y < 16; y++) 
		{
            newClipData = new padSceneData();
            newClipData.playing = false;
            newClipData.recording = false;
            newClipData.color = padColors['Off'];
            clipSlots[x][y] = newClipData;
        }
    }
}

function clipContentObs(track)
 {
    return function(slot, hasContent) {
        activePadMode.clipContentObs(track,slot,hasContent);
    }
}

function clipRecordObs(track) 
{
    return function(slot, isRecording)  
	{
        activePadMode.clipRecordObs(track,slot,isRecording);
    }
}

function clipPlayingObs(track) 
{
    return function(slot, isPlaying)
	{
        activePadMode.clipPlayingObs(track,slot,isPlaying);
    }
}

function sceneLaunchObs()
 {
    return function(slots,name)
	{
    }
}

function handleIsSelected(track)
 {
    return function(value) 
	{
        if (value == true) 
		{
			isSelected[track] = true;
		}
        else 
		{ 
			isSelected[track] = false; 
		}
		lightToggleR();
		lightToggleS();
		lightToggleM();
    }
}

function armObsFunction(track)
 {
    return function(value) 
	{
        if (value == true) 
		{
			armed[track] = 127;
		}
        else 
		{ 
			armed[track] = 0; 
		}
        
		if (isSelected[track]) {
			setSwitchLED(3 + S1 ,bankAStatus,armed[track]);
			setSwitchLED(3 + S1 ,bankBStatus,armed[track]);
			setSwitchLED(3 + S1 ,bankCStatus,armed[track]);
		}
    }
}


function soloObsFunction(track) {
    return function(value) 
	{
        if (value == true)
		{
			soloed[track] = 127; 
		}
        else 
		{ 
			soloed[track] = 0; 
		}
		
		if (isSelected[track]) {
			setSwitchLED(4 + S1 ,bankAStatus,soloed[track]);
			setSwitchLED(4 + S1 ,bankBStatus,soloed[track]);
			setSwitchLED(4 + S1 ,bankCStatus,soloed[track]);
		}
    }
}


function muteObsFunction(track)
 {
    return function(value) 
	{
        if (value == true) 
		{ 
			muted[track] = 127;
		}
        else
		{ 
			muted[track] = 0; 
		}
		
		if (isSelected[track]) {
			setSwitchLED(5 + S1 ,bankAStatus,muted[track]);
			setSwitchLED(5 + S1 ,bankBStatus,muted[track]);
			setSwitchLED(5 + S1 ,bankCStatus,muted[track]);
		}
    }
}


function exit()
{
}


function onMidi(status, data1, data2)
{
    var channel = status & 0xF;

	var pressed = data2 > 0;
    	
    /* transport */
    if (status ==  0xb0) {
        if (data1 == 115 && pressed == true) {
            transport.rewind();
        }
        if (data1 == 116 && pressed == true) {
            transport.fastForward();
        }
        if (data1 == 117 && pressed == true) {
            transport.stop();
        }
        if (data1 == 118 && pressed == true) {
            
			if(shifted){
                transport.toggleClick();
            } else {
                transport.play();
            }
			
        }
        if (data1 == 119 && pressed == true) {
            			
			if(shifted == false){
                transport.toggleLauncherOverdub();
            } else {
                transport.record();
            }
			
        }
        
    }
	else if (status == PadStatus || status == 0x89) 
    {
        activePadMode.handleMIDI(data1,data2);
        return;
    }
    
    else if (status == bankAStatus || status == bankBStatus || status == bankCStatus) 
    {    
		if (data1 >= NAVKeys['UP'] && data1 <= NAVKeys['RIGHT'] && pressed) 
		{
            PadMode.prototype.handleNavKeys(data1);
        }

        /* switches */
        if (data1 >= S1 && data1 < F1) {
            if(pressed == true) {
                if(data1 - S1 == 0) {
                   setActivePadMode(PadInstrument);
				   
                }
                if(data1 - S1 == 1) 
				{
					if (getActivePadMode() == PadClipLauncher)
					{
						activeClipBank == ClipBanks.Bank_A ? activeClipBank = ClipBanks.Bank_B : activeClipBank = ClipBanks.Bank_A
					}
					else
					{
						activeClipBank = ClipBanks.Bank_A;
					}
					setActivePadMode(PadClipLauncher);

                }
                else if(data1 - S1 == 2)
				{
                    setActivePadMode(PadSceneLauncher);

                }
				else if (data1 - S1 == 3)
				{
                    cursorTrack.getArm().toggle(); 
                }
            } else {
				if (data1 - S1 == 3) {
					lightToggleR();
				} else if (data1 - S1 == 4) {
					lightToggleS();
				} else if (data1 - S1 == 5) {
					lightToggleM();
				}					
			}
        }

        else 
		{
            ControlsMidi(status,data1,data2);
        }

	updateButtonLeds();        
    }   
}

 function lightToggleR() {
	for (var x = 0; x < 8; x++ ) {
	if (isSelected[x] == true) {
		setSwitchLED(3 + S1 ,bankAStatus,armed[x]);
		setSwitchLED(3 + S1 ,bankBStatus,armed[x]);
		setSwitchLED(3 + S1 ,bankCStatus,armed[x]);
	} 
	}				
 }
 
 function lightToggleS() {
	for (var x = 0; x < 8; x++ ) {
	if (isSelected[x] == true) {
		setSwitchLED(4 + S1 ,bankAStatus,soloed[x]);
		setSwitchLED(4 + S1 ,bankBStatus,soloed[x]);
		setSwitchLED(4 + S1 ,bankCStatus,soloed[x]);
	} 
	}				
 }
 
 function lightToggleM() {
	for (var x = 0; x < 8; x++ ) {
	if (isSelected[x] == true) {
		setSwitchLED(5 + S1 ,bankAStatus,muted[x]);
		setSwitchLED(5 + S1 ,bankBStatus,muted[x]);
		setSwitchLED(5 + S1 ,bankCStatus,muted[x]);
	} 
	}				
 }

PadMode.prototype.handleNavKeys = function (data1) {
    if (data1 == NAVKeys.UP) {
		shifted ? cursorDevice.nextParameterPage() : cursorTrack.getSolo().toggle();
    }
	
    else if (data1 == NAVKeys.DOWN) {
		shifted ? cursorDevice.previousParameterPage() : cursorTrack.getMute().toggle();
    }

    else if (data1 == NAVKeys.LEFT) {
        if (shifted) {
			cursorDevice.selectPrevious()
		} else {
			cursorTrack.selectPrevious();
		}
    }
    
    else if (data1 == NAVKeys.RIGHT) {
        if (shifted) {
			cursorDevice.selectNext()
		} else {
			cursorTrack.selectNext();
		}
    }
}


function ControlsMidi(status,data1, data2) {
    
    pressed = data2 > 0;
    
    if (status == bankAStatus)
	{ 
            /* control bank a: knobs */
			if (data1 >= K1 && data1 < 60) {
                primaryDevice.getMacro(data1 - K1).getAmount().inc(uint7ToInt7(data2), 128);
            }
			/* control bank a: faders */
            else if (data1 >= F1 && data1 < K1) {
                cursorDevice.getParameter(data1 - F1).set(data2, 128);
            }
    }
    
    else if(status == bankBStatus) {

        if (data1 >= K1 && data1 < 60) {
            trackBank.getTrack(data1 - K1).getPan().inc(uint7ToInt7(data2), 128);
        }
        else if (data1 >= F1 && data1 < K1) {
            trackBank.getTrack(data1 - F1).getVolume().set(data2, 128);
        }
    }
	
    else if(status == bankCStatus) {
        if (data1 >= K1 && data1 < 60) {
			trackBank.getTrack(data1 - K1).getSend(0).inc(uint7ToInt7(data2), 128);
        }
        else if (data1 >= F1 && data1 < K1) {
            trackBank.getTrack(data1 - F1).getSend(1).set(data2, 128);
        }
    }
}


/* Light a pad, Ride a horse. */
function lightPad(color, padNumber, padState) {
    
    var padIdent = minimumPadOn + padNumber;
    if (padState == "Off") {
        padIdent = minimumPadOff + padNumber;
    }
    var MidiOut = "F0 47 00 " + uint7ToHex(PRODUCT_ID) + " 31 00 04 01 " + uint7ToHex(getMSB(padIdent)) + " " + uint7ToHex(getLSB(padIdent));
    MidiOut+= " " + uint7ToHex(color)
    MidiOut+= " F7";
    host.getMidiOutPort(1).sendSysex(MidiOut);

}

function lightAllPads(color, padState) {
    
    var padIdent = minimumPadOn;
    if (padState == "Off") {
        padIdent = minimumPadOff;
    }
    var MidiOut = "F0 47 00 " + uint7ToHex(PRODUCT_ID) + " 31 00 43 40 " + uint7ToHex(getMSB(padIdent)) + " " + uint7ToHex(getLSB(padIdent));
    for (var x = 0; x < 64; x++ ) {
        MidiOut+= " " + uint7ToHex(color)
    }
    MidiOut+= " F7";
    host.getMidiOutPort(1).sendSysex(MidiOut);
}


function PadMode () {
}


PadMode.prototype.handleMIDI = function(data1,data2) {

}

PadMode.prototype.init = function() {
}

PadMode.prototype.cursorTrackColorObs = function(red,green,blue) {
    CursorTrackColor = bitwigColorToPadColor([red.toFixed(4),green.toFixed(4),blue.toFixed(4)]);
}
PadMode.prototype.cursorTrackInstrumentNameObs = function(text)
{
    usingDrumMachine = (text == "DrumMachine");
    if (usingDrumMachine == true)
    {
        for (var x = 0; x < drumKeys.length; x++)
	{
            drumKeys[x] = false;
        }
    }
}

PadMode.prototype.cursorTrackpitchObs = function (key, name) 
{
    if (name != null)
    {
        drumKeys[key] = true;
    }
    else
    {
        drumKeys[key] = false;
    }
}

PadMode.prototype.clipContentObs = function(track,slot,hasContent) {
    if (hasContent == true)
    {
	clipSlots[track][slot].color = padColors['Amber'];	
    } 
    else
    {
        clipSlots[track][slot].color = padColors['Off'];
    }
}

PadMode.prototype.clipRecordObs = function(track,slot, isRecording)  
{
    thisPad = clipSlots[track][slot];
    thisPad.recording = isRecording;
}

PadMode.prototype.clipPlayingObs = function(track,slot,playing) {
    thisPad = clipSlots[track][slot];
    thisPad.playing = playing;
}

function padSceneData()
{
    this.color = padColors['Off'];
    this.playing = false;
    this.recording = false;
}

function MPK225ControlsMidi(status, data1, data2) 
{
     if (status == PadStatus)
     {
         return data2;
     }
}



