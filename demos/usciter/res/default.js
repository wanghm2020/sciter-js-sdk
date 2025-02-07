import { $, on } from "@sciter";
import { launch, home, PLATFORM, exec } from "@env";
import * as sys from "@sys";
import { DropZone } from "drop-zone.js";
import * as Settings from "settings.js";
import * as LiveReload from "live-reload.js";

const APP_NAME = "usciter.js.app";

//include "live-reload.tis";

const view = Window.this;

const content = $("frame#content");
const inspectorButton = $("button#inspector");

var filename = null;
const file_filter = "files *.htm,*.html,*.svg,*.zip,*.scapp|*.htm;*.html;*.svg;*.zip;*.scapp|" +
   "HTML files only(*.htm,*.html)|*.htm;*.html|" +
   "SVG files only(*.svg)|*.svg|" +
   "SCAPP files only (*.zip,*.scapp)|*.zip;*.scapp|" +
   "All Files (*.*)|*.*";
   
var debugIsActive = false; 

// for testing SciterEval and SciterCall APIs
globalThis.test = function(param) {
  console.log(param);
  return param;
}

function updateCaption() {
  var croot = content.frame.document;
  if(!croot) return;
  var title = croot.$("head>title");
  if(title) {
    title = `uSciter: ${ title.text || "" }`;
    view.windowCaption = title;
    var capEl = $("window-caption");
    if( capEl )
      capEl.innerText = title;
  }
}

function loadFile(fn)
{
  //liveReload.reset();
  filename = fn;
  content.frame.debugMode = true;
  content.frame.loadFile(fn);
  $("button#reload").state.disabled = false;
  inspectorButton.state.disabled = false;
  updateCaption();
}

function reloadFile()
{
  content.frame.loadFile(filename);
  updateCaption();
}

on("click","button#open", function() {
    var fn = view.selectFile("open",file_filter);
    if( fn ) 
      loadFile(fn);
  })

on("click","button#reload", function () {
    //liveReload.reset();
    if( filename )
      reloadFile();
  })

on("click", "button#open-in-view", function() {
  var fn = view.selectFile("open",file_filter);
  if( fn ) 
    view.load(fn);
})

function setBlurbehind(blurBehind) {

  var bb = $("button#enable-blurbehind");

  if(blurBehind === undefined)
    blurBehind = bb.state.checked && view.mediaVar("ui-blurbehind"); // WM is blurbehind capable and uses it now  
  
  var lightAmbience = $("button#ambience").value;
  if( blurBehind ) {
    view.blurBehind = lightAmbience ? "light" : "dark";
    bb.state.checked = true;
    document.attributes["blurbehind"] = "";
  }
  else {
    view.blurBehind = "none";
    bb.state.checked = false;
    delete document.attributes["blurbehind"];
  }
}

function setAmbience(lightAmbience) {
  var bg = $("button#ambience");
  if( lightAmbience ) {
    document.attributes["theme"] = "light";
    bg.state.checked = true;
  }
  else {
    document.attributes["theme"] = "dark";
    bg.state.checked = false;
  }
}

function onMediaChange() {
  var lightAmbience = view.mediaVar("ui-ambience") == "light"; // WM uses light theme
  setAmbience(lightAmbience);
  setBlurbehind();
}

function setSystemAmbience(onOff) {
  var bg = $("button#ambience");
  var sbg = $("button#system-ambience");
  if(onOff) {
    onMediaChange();
    bg.state.disabled = true; 
    sbg.state.checked = true;
    view.on("mediachange", onMediaChange);
  } else {
    bg.state.disabled = false; 
    sbg.state.checked = false;
    view.off(onMediaChange);
  }
}

on("click", "button#system-ambience", function(evt,button)
{
  setSystemAmbience(button.value);
  Settings.saveState();
});

on("click", "button#ambience", function(evt,button)
{
  setAmbience(button.value);
  Settings.saveState();
});

on("click", "button#enable-blurbehind", function(evt,button)
{
  setBlurbehind(button.value);
  Settings.saveState();
});


on("click", "button#inspector", async function() 
{
  const SUFFIX = { Windows: ".exe", OSX: ".app" };
  const PREFIX = { Windows: "\\", OSX: "/../../../" };

  let inspectorPath = home((PREFIX[PLATFORM] || "") + "inspector" + (SUFFIX[PLATFORM] || ""));

  try {
    await sys.fs.stat(inspectorPath);
    launch(inspectorPath);
  } catch (e) {
    Window.modal(<alert>Cannot find {inspectorPath}</alert>);
  }
  
});


DropZone { 
  container: content,
  accept: "*.htm;*.html;*.xhtml;*.svg",
  ondrop: function(files) { 
    if( Array.isArray(files))
      loadFile(files[0]);
    else 
      loadFile(files);
    }
};

Settings.init(APP_NAME).then(function(){
  Window.this.state = Window.WINDOW_SHOWN;
});


Settings.add
{
  store: function(data)
    {
      data.glass = 
      {
        enabled: document.$("button#enable-blurbehind").state.checked,
        useSystem : document.$("button#system-ambience").state.checked,
        lightTheme : document.$("button#ambience").state.checked
      };
    },
  restore: function(data) 
    {
      if(data.glass) {
        setSystemAmbience(data.glass.useSystem);
        if( !data.glass.useSystem ) {
          var lightAmbience = data.glass.lightTheme;
          setAmbience(lightAmbience, view.mediaVar("ui-blurbehind"));
        }
        setBlurbehind(data.glass.enabled);
      }
    }
};

const btnLiveReload = $("button#live-reload");

LiveReload.attachTo(content);

LiveReload.onReload( function () {
  if( filename )
    loadFile(filename);
  // indication of pending change reload
  btnLiveReload.state.visited = false;
}); 

LiveReload.onChange( function() {
  btnLiveReload.state.visited = true;
}); 

btnLiveReload.on("click", function(evt,button)
{
  if(button.value)
    LiveReload.start(filename);
  else
    LiveReload.stop();
  return true;
});

on("click", "button#help", function() 
{
  const scappn = PLATFORM == "Windows" ? "scapp.exe" : "scapp";
  const scapp = home(scappn);
  const mdview = home("../../../samples.sciter/applications.quark/mdview/main.htm");
  const docfolder = home("../../../docs/md");
  exec(scapp,mdview,docfolder);
});

