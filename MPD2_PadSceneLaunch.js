
PadSceneLauncher = new PadMode();

PadSceneLauncher.init = function() {

	if (displayHelpText) 
    {
        host.showPopupNotification("Pads: Scene Launch");
    }
    PadNotes.setShouldConsumeEvents(true);
    PadNotes.setKeyTranslationTable(PadMIDITable.OFF);
    lightAllPads(padColors['Yellow'],"Off");
}

function sceneLaunchObs()
{
    return function (slots, name)
    {
    }
}

PadSceneLauncher.handleMIDI = function(data1,data2) {
    pressed = data2 > 0;
    println("mid");
    if (pressed == true)
    {
        sceneLaunchTrackBank.launchScene(data1 - 36);
    }
}