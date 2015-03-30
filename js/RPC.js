/**
 * @class rpc
 * @author Scott Clarke
 * Example request:
 * 
        function handleSuccessCallback (response) {
            if(response.statusCode === 200) {
                document.getElementById('testContentDiv').innerHTML = response.contentText;
            } else {
                document.getElementById('testContentDiv').innerHTML = response.error;
            }
        }
             
        function handleStatusCallback (response) {
            document.getElementById('testContentDiv').innerHTML = response;
        }

        function handleErrorCallback (response) {
            document.getElementById('testContentDiv').innerHTML = response;
        }
             
        function bareMinumumRequest () {
            var requestData = {
                "url" : "pspTest.html",
                "onSuccess" : handleSuccessCallback,
                "onStatus" : handleStatusCallback,
                "onError" : handleErrorCallback
            };
            Utils.RPC.Request(requestData);
        };
        
 */
Utils.RPC = {
    /**
     *  RPC Object Properties
     */
    async: true,
    httpResponseText: null,
    showXHRStatus: false,
    responseHandler: null,
    currentState: "Connection Uninitialized.",
    connState: ["Connection Uninitialized.","Connection Open. Wait for Request.","Data recieved.","Processing Data.","Request Complete","Unknown XHR state."],
    preventCaching : true,
    toJSON : false,
    requestMethods : {
        "get" : "GET",
        "post" : "POST",
        "delete" : "DELETE",
        "put" : "PUT"
    },
    withCredentials : true,
    offline : false,
    
    /**
     * Main worker function
     * @param {Object} inputParams
     */
    Request : function (inputParams) {
        
        // process input parameters being passed in
        var currTimestamp = Utils.RPC.CreateTimestamp();
        var requestId = (typeof inputParams.id === "string") ? inputParams.id : "";
        var urlString = (typeof inputParams.url === "string") ? inputParams.url : "";
        var paramArr = (typeof inputParams.params === "object" && inputParams.params !== null) ? inputParams.params : [] ;
        var paramCount = paramArr.length;
        var requestMethod = (typeof inputParams.method === "string") ? inputParams.method : "get";
        var successCallback = (typeof inputParams.onSuccess === "function") ? inputParams.onSuccess : function () {};
        var errorCallback = (typeof inputParams.onError === "function") ? inputParams.onError : null;
        var statusCallback = (typeof inputParams.onStatus === "function") ? inputParams.onStatus : function () {};
        var isAsync  = (typeof inputParams.async === "boolean") ? inputParams.async : Utils.RPC.async ;
        var preventCache  = (typeof inputParams.preventCache === "boolean") ? inputParams.preventCache : Utils.RPC.preventCaching ;
        var restart = (typeof inputParams.restart === "function") ? inputParams.restart : null ;
        var contentType = (typeof inputParams.contentType === "string") ? inputParams.contentType : "application/json" ;
        var withCredentials = (typeof inputParams.withCredentials === "boolean") ? inputParams.withCredentials : Utils.RPC.withCredentials;
        var dataQuery = (typeof inputParams.dataQuery === "string") ? inputParams.dataQuery : null;
        var overrideOffline = (typeof inputParams.overrideOffline === "boolean") ? inputParams.overrideOffline : false ;
        
        // Add xtsx param if required
        if(preventCache && requestMethod !== "post"){
            paramArr.push(['xtsx',currTimestamp]);
            ++paramCount;
        }
            
        //build param string
        var paramString = "";
        if(paramCount > 0 && (requestMethod === "get" || requestMethod === 'delete'))
                paramString = "?"
        
        // Add all params to the string
        for(var i=0; i<paramCount; ++i) {
            if(i !== 0 ) paramString += "&"
            paramString += paramArr[i][0] + "=" + paramArr[i][1];
        }

        if (this.offline == 0 || overrideOffline) {
            // make the request 
            // console.debug(urlString, paramString);
            Utils.RPC.MakeRequest(requestId, urlString, paramString, requestMethod, isAsync, successCallback, errorCallback, statusCallback, withCredentials);
        } else {
            if (dataQuery) {
                scrui.RequestGameData([dataQuery],
                function(results) {
                    if (results.length) {
                        results = results[0];
                    }
                    if (results) {
                        successCallback(results);
                    } else {
                        errorCallback();
                    }
                });         
            
            } else {
                console.debug('offline: ' + urlString, inputParams, dataQuery, successCallback);
            }
        }
    },
    
    /**
     * Method used to make actual XHR request. Called by Utils.RPC.Request(). 
     * This should never be called directly. Always use Utils.RPC.Request() method instead so input params can be properly processed
     *  
     * @param {Object} requestId
     * @param {Object} url
     * @param {Object} params
     * @param {Object} method
     * @param {Object} async
     * @param {Object} successCallback
     * @param {Object} errorCallback
     * @param {Object} statusCallback
     */
    MakeRequest : function (requestId, url, params, method, async, successCallback, errorCallback, statusCallback, withCredentials) {
        //create request object
        var httpRequest = Utils.RPC.CreateRequestObject(false);
        
        //defined a temp request handler for dealing with status codes and the final server response
        var requestHandler = function() {
            if(httpRequest.readyState <= 4) {
                switch(httpRequest.readyState) {
                    case 0 :
                        Utils.RPC.HandleStatusUpdate(Utils.RPC.connState[0], statusCallback);
                        break;
                    case 1 :
                        Utils.RPC.HandleStatusUpdate(Utils.RPC.connState[1], statusCallback);
                        break;
                    case 2 :
                        Utils.RPC.HandleStatusUpdate(Utils.RPC.connState[2], statusCallback);
                        break;
                    case 3 :
                        Utils.RPC.HandleStatusUpdate(Utils.RPC.connState[3], statusCallback);
                        break;
                    case 4 :            
                        Utils.RPC.HandleStatusUpdate(Utils.RPC.connState[4], statusCallback);
                        Utils.RPC.ProcessServerResponse(requestId, httpRequest, successCallback, errorCallback, url);
                        break;
                    default :
                        Utils.RPC.HandleStatusUpdate(Utils.RPC.connState[5], statusCallback);
                        break;
                }
            }                       
        };
        
        //pass temp request handler to request object
        httpRequest.onreadystatechange = requestHandler;
        try {
            //do request
            if (method === "get") {
                httpRequest.open('GET', url + params, async);
                if( typeof httpRequest.withCredentials == 'boolean' && withCredentials) {
                    httpRequest.withCredentials = true;
                }
                httpRequest.send(null);
            }
            else 
                if (method === "delete") {
                    httpRequest.open('DELETE', url + params, async);
                    if(typeof httpRequest.withCredentials == 'boolean' && withCredentials){
                        httpRequest.withCredentials = true;
                    }
                    httpRequest.send(null);
                }
                else {
                    httpRequest.open('POST', url, async);
                    if(typeof httpRequest.withCredentials == 'boolean' && withCredentials){
                        httpRequest.withCredentials = true;
                    }
                    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                    if(params){
                        httpRequest.send(params);
                    }else{
                        httpRequest.send();
                    }
                }
        } catch(e) {
            errorCallback({"code":500, "message":"error opening conneciton to server", "stack": e});
        }
    },
    
    /**
     * callback handler for status updates from XHR request. 
     * @param {Object} statusMsg
     * @param {Object} callback
     */
    HandleStatusUpdate : function (statusMsg, callback) {
        if(typeof callback == "function") {
            callback(statusMsg);
        } else {
            scrui.DebugPrint(statusMsg);
        }
    },
    
    /**
     * callback handler for when errors occur with XHR request
     * @param {Object} errorMsg
     * @param {Object} callback
     */
    HandleXHRError : function (errorMsg, callback) {
        if(typeof callback == "function") {
            callback(errorMsg);
        } else {
            scrui.DebugPrint(errorMsg);
        }
    },
    
    /**
     * 
     * @param {Object} requestId
     * @param {Object} httpRequest
     * @param {Object} callback
     * @param {Object} errorStr
     */
    ProcessServerResponse : function(requestId, httpRequest, successCallback, errorCallback, url) { 
        var state = httpRequest.readyState;
        var content_type = httpRequest.getResponseHeader('Content-Type');
        var response = {
                "statusCode" : 0,
                "error" : null,
                "contentText" : "",
                "contentXml" : "" ,
                "contentType" : "",
                "isJson" : false };

        //build response object
        response.statusCode = (typeof httpRequest.status !== "unknown") ? httpRequest.status : 200;
        response.contentText = (typeof httpRequest.responseText !== "unknown") ? httpRequest.responseText : '';
        response.contentType = (typeof content_type !== "unknown") ? content_type : '';
        response.url = url;
        if (content_type == null) {
            response.isJson = false;
        } else {
            response.isJson = (typeof content_type !== "unknown") ? (content_type.indexOf('application/json') >= 0) : false;
        }
        response.contentXml = httpRequest.responseXML;
        if(response.isJson) {
            try {
                response.json = scrui.ParseJSON(response.contentText);
            } catch(e) {
                response.json = {"error":"response not valid json"};
            }
        }
        
        var callAfterRequestDone = function() {Utils.RPC.HandleXHRResponse(requestId, response, successCallback, errorCallback)};
        window.setTimeout(callAfterRequestDone, 10);
    },
        
    /**
     * Handles the server response to an XHR call
     * @param {Object} requestId
     * @param {Object} response
     * @param {Object} callback
     */
    HandleXHRResponse : function(requestId, response, successCallback, errorCallback) {
        if (typeof errorCallback != "function") {
            errorCallback = function(message){gErrorManager.TriggerError(scrui.kErrorCode_NetworkCommError)};
        }
        
        switch(response.statusCode) {
            //handle redirect
            case 401:
                errorCallback({"code":401,"message":"server sent redirect", "url":response.url, "content":response.contentText});
            case 302:
                errorCallback({"code":401,"message":"not authenticated", "url":response.url, "content":response.contentText});
                break;
            case 404:
                errorCallback({"code":404,"message":"page not found", "url":response.url, "content":response.contentText});
                break;
            case 405:
                errorCallback({"code":405,"message":"invalid request", "url":response.url, "content":response.contentText});
                break;
            case 500:
                errorCallback({"code":500,"message":"server encounterd an error processing the request. See server logs.", "url":response.url, "content":response.contentText});
                break;
            case 501:
                errorCallback({"code":501,"message":"request method not implemented", "url":response.url, "content":response.contentText});
                break;
            // handle correct response
            case 200:
                if(typeof successCallback == "function") {
                    successCallback(response);
                }
                break;

            // catch any unkown error that may occur                
            default :
                errorCallback({"code": response.statusCode, "message": "An unknown error occurred.", "url":response.url, "content":response.contentText});
                break;
                
        }       
    },
    
    /**
     * creates a timestamp with gets tacked onto the end of a URL to prevent caching
     */
    CreateTimestamp : function () {
        var currentDate = new Date();
        return currentDate.getUTCDay() + '' + currentDate.getUTCHours() + '' + currentDate.getUTCMonth() + '' + currentDate.getUTCMinutes() + '' +currentDate.getUTCSeconds() + '' + currentDate.getUTCMilliseconds();
    },
    
    /**
     * function to handle making a new http request ojbect
     */
    CreateRequestObject : function(useComet) {
        var httpRequest = false;
        if (window.XMLHttpRequest && !window.ActiveXObject) { // Mozilla, Safari,...
            //debug.append('Mozilla HTTP request method');
            httpRequest = new XMLHttpRequest();
            httpRequest.domain="ea.com";
            if (httpRequest.overrideMimeType) {
                httpRequest.overrideMimeType('text/xml');
            }
        } else if (window.ActiveXObject) { // IE
            try {
                httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
                httpRequest = false;
            }
        }
        if (!httpRequest) {
            //debug.append('Cannot create XMLHTTP instance');
            httpRequest = false;
        }   
        //httpRequest.multipart = true;
        return httpRequest;
    }   
    

};
