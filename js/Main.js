var cMain = function () {
	this.mEventManager = null;
	this.mTranslateAPI = {
		requestParams : {
            "appId" : "Bearer " + window.accessToken,
			"text"   : null,
			"from"   : "en",
			"to"     : "fr",
			"oncomplete" : "main.HandleAPIResponse",
			"onerror" : "main.HandleAPIError",
		},
        requestURL : "http://api.microsofttranslator.com/v2/Ajax.svc/Translate",
		speakURL : "http://api.microsofttranslator.com/V2/Ajax.svc/Speak",
		detectURL : "http://api.microsofttranslator.com/V2/Ajax.svc/Detect"
	};
	this.mDefaultLanguages = {
		"en" : "English",
		"it" : "Italian",
		"fr" : "French",
		"de" : "German",
		"hi" : "Hindi",
		"ar" : "Arabic",
		"zh-CHS" : "Simplified Chinese (China)",
		"zh-CHT" : "Traditional Chinese (Taiwan)"
	};
	
	//placeholders for html objects on page
	this.mInputField = null; 
	this.mToSelectField = null;
	this.mFromSelectField = null;
	this.mFinalTextDiv = null;
	this.mToolBar = null;
	this.mAudioTag = null;
	
	//runtime placeholder values
	this.mAutoDetectInput = true;
	this.mSpeakUrl = null;
	this.mPlayingSpeech = false;
}

cMain.prototype.Init = function () {
    this.mInputField = document.getElementsByTagName("textarea")[0]; 
    this.mToSelectField = document.getElementById("toLang");
    this.mFromSelectField = document.getElementById("fromLang");
    this.mFinalTextDiv = document.getElementById("translatedText");
	this.mToolBar = document.getElementById("toolbar");

    this.PopulateDropDowns(this.mAutoDetectInput);
	this.UpdateToolButtons();
}

cMain.prototype.PopulateDropDowns = function (autoDetectInput) {
	var thisObj = this;
	function loadSelections (selectBox, selectedLang, addAuto) {
		var langKeys = Object.keys(thisObj.mDefaultLanguages)
		var keyCount = langKeys.length;
		if(addAuto) {
            var newOption = document.createElement("option");
            newOption.value = "auto";
            newOption.text = "Auto";
            newOption.selected = true;
            selectBox.appendChild(newOption);
		}
		
		for(var i =0, l=keyCount; i<l; i++) {
			var newOption = document.createElement("option");
			newOption.value = langKeys[i];
			newOption.text = thisObj.mDefaultLanguages[langKeys[i]];
			if(langKeys[i] === selectedLang && !addAuto) {
				newOption.selected = true;
			}
			selectBox.appendChild(newOption);
		}
	}
	loadSelections(document.getElementById("toLang"), this.mTranslateAPI.requestParams.to);
	loadSelections(document.getElementById("fromLang"), this.mTranslateAPI.requestParams.from, autoDetectInput);
}

cMain.prototype.FlipLangs = function () {
	//if auto selected, return and dont flip
	if(this.mAutoDetectInput && this.mFromSelectField.selectedIndex == 0) return;
	//do flip
	var newToIndex = this.mFromSelectField.selectedIndex - (this.mAutoDetectInput ? 1 : 0);
	var newFromIndex = this.mToSelectField.selectedIndex + (this.mAutoDetectInput ? 1 : 0);
	this.mFromSelectField.selectedIndex = newFromIndex;
	this.mToSelectField.selectedIndex = newToIndex;
    if(this.mFromSelectField[this.mFromSelectField.selectedIndex].value == "ar") {
        this.mInputField.className = "right";
    } else {
        this.mInputField.className = "left";
    }
	if(this.mFinalTextDiv.innerHTML !== "") {
		this.mInputField.value = this.mFinalTextDiv.innerHTML;
		this.TranslateInput(); 
	}
}

cMain.prototype.TranslateInput = function() {
	
	if(this.mAutoDetectInput && this.mFromSelectField.selectedIndex == 0) {
		this.DetectInputLang();
		return;
	} 

	this.mTranslateAPI.requestParams.text = this.mInputField.value;
	this.mTranslateAPI.requestParams.from = this.mFromSelectField[this.mFromSelectField.selectedIndex].value;
	this.mTranslateAPI.requestParams.to = this.mToSelectField[this.mToSelectField.selectedIndex].value;
	//this.mFinalTextDiv.innerHTML = "";
	
	if (this.mTranslateAPI.requestParams.text !== "") {
		var newScript = document.createElement("script");
		newScript.src = this.CreateRequestURL();
		
		document.body.appendChild(newScript);
	}

	if(this.mTranslateAPI.requestParams.to == "ar") {
		this.mFinalTextDiv.className = "translatedText right";
	} else {
		this.mFinalTextDiv.className = "translatedText left";
	}

}

cMain.prototype.ClearInput = function() {
	this.mInputField.value = "";
	this.mFinalTextDiv.innerHTML = "";
	this.mFinalTextDiv.className = "translatedText left";
	this.mSpeakUrl = null;
	this.UpdateToolButtons();
}

cMain.prototype.OnInputFocus = function () {
	document.getElementsByTagName("header")[0].style.height = "0px";
}

cMain.prototype.OpenNewSearch = function (searchText) {
	var newTab = window.open("http://www.bing.com/search?form=MSTLP1&q=" + searchText, "_blank");
	newTab.focus();
}

cMain.prototype.FetchSpeakUrl = function() {
    var newScript = document.createElement("script");
    newScript.src = this.CreateSpeakRequest();
    
    document.body.appendChild(newScript);
	
}

cMain.prototype.DetectInputLang = function () {
    var newScript = document.createElement("script");
    newScript.src = this.CreateDetectRequest();
    
    document.body.appendChild(newScript);
	
}

cMain.prototype.PlaySpeech = function () {
	var thisObj = this;
	var onPlayComplete = function () {
        document.body.removeChild(thisObj.mAudioTag);
        thisObj.mPlayingSpeech = false;
        thisObj.UpdateToolButtons();
    };
    this.mAudioTag = document.createElement("audio");
    this.mAudioTag.src = this.mSpeakUrl;
    this.mAudioTag.setAttribute('autoplay', true);
	this.mAudioTag.addEventListener('ended', onPlayComplete);
	this.mAudioTag.addEventListener('pause', onPlayComplete);
    document.body.appendChild(this.mAudioTag);
	this.mPlayingSpeech = true;
	this.UpdateToolButtons();
	
}

cMain.prototype.StopSpeech = function() {
    this.mAudioTag.pause();
}

cMain.prototype.UpdateToolButtons = function() {
	var buttons = this.mToolBar.children;
	if(this.mFinalTextDiv.innerHTML !== "") {
		buttons[0].style.display = "inline";
	} else {
		buttons[0].style.display = "none";
	}
	if(this.mSpeakUrl !== null) {
		if(this.mPlayingSpeech) {
            buttons[1].style.display = "none";
            buttons[2].style.display = "inline";  
		} else {
            buttons[1].style.display = "inline";
			buttons[2].style.display = "none";	
		}
		
	} else {
	   buttons[1].style.display = "none";
	   buttons[2].style.display = "none";	
	}
	
	
}	

cMain.prototype.CreateRequestURL = function () {
	var newUrl = this.mTranslateAPI.requestURL;
	var params = this.mTranslateAPI.requestParams;
	var paramKeys = Object.keys(params);
	var keyCount = paramKeys.length;
	
	for(var i = 0, l = keyCount; i<l; i++) {
	   newUrl += ((i==0) ? "?" : "&") + paramKeys[i] + "=" + encodeURIComponent(params[paramKeys[i]]);	
	}
    
	return newUrl; 
}

cMain.prototype.CreateSpeakRequest = function() {
	var newUrl = this.mTranslateAPI.speakURL;
	newUrl += "?appId=" + encodeURIComponent(this.mTranslateAPI.requestParams.appId);
	newUrl += "&text=" + this.mFinalTextDiv.innerHTML;
	newUrl += "&language=" + this.mToSelectField[this.mToSelectField.selectedIndex].value;
	newUrl += "&oncomplete=main.HandleSpeechResponse";
    newUrl += "&onerror=main.HandleSpeechError";
    newUrl += "&format=audio/mp3";
	
	return newUrl;
}

cMain.prototype.CreateDetectRequest = function() {
    var newUrl = this.mTranslateAPI.detectURL;
    newUrl += "?appId=" + encodeURIComponent(this.mTranslateAPI.requestParams.appId);
    newUrl += "&text=" + this.mInputField.value;
    newUrl += "&oncomplete=main.HandleDetectResponse";
    
    return newUrl;
}


cMain.prototype.HandleInputUpdate = function (updatedElement) {
	switch(updatedElement.id) {
		case "fromLang":
		      if(this.mFromSelectField[this.mFromSelectField.selectedIndex].value == "ar") {
                this.mInputField.className = "right";
			  } else {
			  	this.mInputField.className = "left";
			  }
			  break;
        case "toLang":
            if(this.mInputField.value != "") {
				this.TranslateInput();
			}
		  break;
		  
        case "searchButton":
	       this.OpenNewSearch(this.mFinalTextDiv.innerHTML);	      
		  break;  	
		case "playTranslation":
		  this.PlaySpeech();
		  break;
        case "stopPlaying":
          this.StopSpeech();
          break;
	}
}

cMain.prototype.HandleAPIResponse = function (response) {
	this.mFinalTextDiv.innerHTML = response;
	this.FetchSpeakUrl();
	this.UpdateToolButtons();
}


cMain.prototype.HandleAPIError = function (response) {
    this.mFinalTextDiv.innerHTML = "<font color='red'>" + response + "</font>";
}

cMain.prototype.HandleSpeechResponse = function(response) {
    this.mSpeakUrl = response;
    this.UpdateToolButtons();
}

cMain.prototype.HandleDetectResponse = function(response) {
    console.debug(response);
    var detectedLang = response;
    var options = this.mFromSelectField.children;
    var totalOptions = options.length;
    
    for(var i=0, l=totalOptions; i<l; i++) {
        if (options[i].value == detectedLang) {
            this.mFromSelectField.selectedIndex = i;
            this.TranslateInput();
        }
    }
    
}

cMain.prototype.HandleSpeechError = function (response) {
    this.mSpeakUrl = null;
    this.UpdateToolButtons();
}
