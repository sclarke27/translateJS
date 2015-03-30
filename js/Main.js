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
	
	//runtime placeholder values
	this.mAutoDetectInput = false;
}

cMain.prototype.Init = function () {
    this.mInputField = document.getElementsByTagName("textarea")[0]; 
    this.mToSelectField = document.getElementById("toLang");
    this.mFromSelectField = document.getElementById("fromLang");
    this.mFinalTextDiv = document.getElementById("translatedText");

    this.PopulateDropDowns(this.mAutoDetectInput);
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
	var newToIndex = this.mFromSelectField.selectedIndex - (this.mAutoDetectInput ? 1 : 0);
	var newFromIndex = this.mToSelectField.selectedIndex;
	this.mFromSelectField.selectedIndex = newFromIndex;
	this.mToSelectField.selectedIndex = newToIndex;
}

cMain.prototype.TranslateInput = function() {

	this.mTranslateAPI.requestParams.text = this.mInputField.value;
	this.mTranslateAPI.requestParams.from = this.mFromSelectField[this.mFromSelectField.selectedIndex].value;
	this.mTranslateAPI.requestParams.to = this.mToSelectField[this.mToSelectField.selectedIndex].value;
	this.mFinalTextDiv.innerHTML = "";
	
	if (this.mTranslateAPI.requestParams.text !== "") {
		var newScript = document.createElement("script");
		newScript.src = this.CreateRequestURL();
		
		document.body.appendChild(newScript);
	}

}

cMain.prototype.ClearInput = function() {
	this.mInputField.value = "";
	this.mFinalTextDiv.innerHTML = "";
}

cMain.prototype.OnInputFocus = function () {
	document.getElementsByTagName("header")[0].style.height = "0px";
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

cMain.prototype.HandleInputUpdate = function (updatedElement) {
	console.debug(updatedElement.id);
	switch(updatedElement.id) {
		case "ting":
		  break;
	}
}

cMain.prototype.HandleAPIResponse = function (response) {
	this.mFinalTextDiv.innerHTML = response;
}

cMain.prototype.HandleAPIError = function (response) {
    this.mFinalTextDiv.innerHTML = "<font color='red'>" + response + "</font>";
}
