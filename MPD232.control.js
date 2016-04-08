loadAPI(1);

/* Script Initilization */
/* MPD232 MIDI Product ID */

var PRODUCT_ID = 0x36;
var minimumPadOff = 1266;
var minimumPadOn = 1330;

var noteInputs = [];

load("MPD2_common.js");
load("MPD2_PadClipLaunch.js");
load("MPD2_PadSceneLaunch.js");
load("MPD2_PadInstrument.js");

host.defineController("Akai", "MPD232", "1.0.2", "47f8391b-a6e0-4535-9672-6467bbbd04c6");
host.defineMidiPorts(2, 2);

if (host.platformIsWindows())
{
    host.addDeviceNameBasedDiscoveryPair(["MPD232","MIDIIN4 (MPD232)"], ["MPD232","MIDIOUT4 (MPD232)"]);
}

else if (host.platformIsMac())
{
    host.addDeviceNameBasedDiscoveryPair(["MPD232 Port A","MPD232 Remote"], ["MPD232 Port A","MPD232 Remote"]);
}
else
 {
    host.addDeviceNameBasedDiscoveryPair(["MPD232 MIDI 1","MPD232 MIDI 4"], ["MPD232 MIDI 1","MPD232 MIDI 4"]);
}

function init()
{
    PadNotes = host.getMidiInPort(0).createNoteInput("MPD232 Pads", "DF????","EF??", "AF????");
	PadNotes.setKeyTranslationTable(PadMIDITable.ON);
	PadNotes.setShouldConsumeEvents(false);
	
	
    initClipArray();
	
	transport = host.createTransport();
	application = host.createApplication();
    trackBank = host.createMainTrackBank(8, 2, 16);
    sceneLaunchTrackBank = host.createTrackBank(1,0,64);

	cursorTrack = host.createArrangerCursorTrack(2, 0);
	cursorDevice = host.createEditorCursorDevice();

    primaryDevice = cursorTrack. createCursorDevice("Primary");
    primaryDevice.addNameObserver(11, "", cursorTrackInstrumentNameObs());

    cursorTrack.addColorObserver(cursorTrackColorObs());
    cursorTrack.addPitchNamesObserver(cursorTrackpitchObs());
	host.getMidiInPort(0).setMidiCallback(onMidi);
    
    trackBank.getClipLauncherScenes().addNameObserver(sceneLaunchObs());

	for (var p = 0; p < 8 ; p++)
	{
		var macro = primaryDevice.getMacro(p).getAmount();
		var parameter = cursorDevice.getParameter(p);
		var track = trackBank.getTrack(p);
		
        track.getArm().addValueObserver(armObsFunction(p));
        track.getMute().addValueObserver(muteObsFunction(p));
        track.getSolo().addValueObserver(soloObsFunction(p));

		track.addIsSelectedObserver(handleIsSelected(p));
				
        macro.setIndication(true);
		parameter.setIndication(true);
		parameter.setLabel("P" + (p + 1));
		track.getVolume().setIndication(true);
		track.getPan().setIndication(true);
		track.getSend(0).setIndication(true);
		track.getSend(1).setIndication(true);
        
        var clipLauncherSlots = track.getClipLauncherSlots();
        clipLauncherSlots.addIsPlayingObserver(clipPlayingObs(p));
        clipLauncherSlots.addHasContentObserver(clipContentObs(p));
        clipLauncherSlots.addIsRecordingObserver(clipRecordObs(p));
        clipLauncherSlots.setIndication(true);
    }
	setActivePadMode(PadInstrument);

    println("Akai Profressional MPD232 Bitwig Controller Script");
}
