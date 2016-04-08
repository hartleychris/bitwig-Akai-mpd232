var PadInstrument = new PadMode();
var S1 = 30;

PadInstrument.handleMIDI = function (data1, data2)
{
	if (data2 > 0) 
	{
		PadNotes.sendRawMidiEvent (0x90, data1, data2);
	}
	else
	{
		PadNotes.sendRawMidiEvent (0x80, data1, data2);		
	}
}

PadInstrument.init = function()
{
    if (displayHelpText) {
        host.showPopupNotification("Pads: Instrument/Drum Rack Mode");
    }

    lightAllPads(CursorTrackColor,"Off");
    PadNotes.setKeyTranslationTable(PadMIDITable.ON);
}

PadInstrument.cursorTrackColorObs = function(red,green,blue) {
	    PadMode.prototype.cursorTrackColorObs(red,green,blue);
		lightAllPads(CursorTrackColor,"Off");
}


PadInstrument.cursorTrackInstrumentNameObs = function (track, text)
{
    PadMode.prototype.cursorTrackInstrumentNameObs(track,text);
    lightAllPads(CursorTrackColor,"Off");
}


PadInstrument.cursorTrackpitchObs = function(key,name)
{
    PadMode.prototype.cursorTrackpitchObs(key,name);
    lightAllPads(CursorTrackColor,"Off");
}