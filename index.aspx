<%@ Page Language="C#" CodeFile="csharp/index.aspx.cs" Inherits="DemoTranslatorPage._Index"  AutoEventWireup="true" %>
<!DOCTYPE html>
<html lang="en">
    <meta name="viewport" content="width=device-width, initial-scale=yes">
	<head>
        <title>JS Translator</title>

        <script type="text/javascript">
            var main = null;
			function initPage() {
			    main = new cMain();
                main.Init();
			}
        </script>
        <script type="text/javascript" src="js/Main.js"></script>
        <style>
            @import url(http://fonts.googleapis.com/css?family=Racing+Sans+One|Montserrat);
            *{
                margin:0;
                padding:0;
                outline:0;
                font-family:"Montserrat";
                font-size: 12pt;
                color: #070707;
                box-sizing:border-box;
                -moz-box-sizing:border-box;
                -webkit-box-sizing:border-box;
                -webkit-tap-highlight-color:transparent

            }
            div, h1, select, option, button, textarea {
                border:0

            }
            html,body{
                width:100%;
                min-height:100%;
                height:100%;
                max-height:100%;
                font-family:"Segoe UI";
                display:block;
                background-color:#e1e0df

            }
            h1 {
                font-family: 'Racing Sans One', cursive;
                font-size: 1.5em;
                color: #1098F7;
                text-shadow: 2px 2px 2px #333;
            }
            h2 {
                padding: 15px;
            }
            textarea {
                width: 100%;
                height: 150px;
                padding: 15px;
            }
            select {
                width: 43%;
            }
            select, option {
                background-color: #474448;
                color: #E0DDCF;
                height: 100%;
                padding-left: 5px;
                padding-right: 5px;
            }
            header {
                padding: 3px 15px;
                background-color: #6D5959;
                height: 40px;
                overflow: hidden;
                -webkit-transition: 0.2s ease-in-out;
                transition: 0.2s ease-in-out 0s;
            }
            footer {
                position: fixed;
                bottom: 0px;
                width: 100%;
                text-align: center;
                font-size: 8pt;
                background-color: #1098F7;
            }
            .menu {
                background-color: #474448;
                height: 45px;
            }
            .menu button {
                background-color: #6D5959;
                height: 100%;
                padding: 5px;
                border-left: solid 1px #454545;
                border-right: solid 1px #454545;
            }
            button {
                -webkit-transition: 0.1s;
                transition: 0.2s;
            }
            #translateButton, #clearButton {
                padding: 5px;
                margin-top: -20px;
                margin-left: 15px;
                box-shadow: 0px 0px 3px #333;
            }
            button:active {
                background-color: #1098F7;
            }
            @media (min-width: 540px) {
                * {
                   font-size: 20pt;
                }
                header {
                    height: 60px;
                }
                footer {
                    font-size: 14px;
                }
            }
        </style>
        
    </head>
    
    <body onLoad="initPage()">
        <header>
           <h1>TranslateJS</h1>
        </header>
        <div class="menu">
            <select id="fromLang" onchange="main.HandleInputUpdate(this)"></select>
            <button onclick="main.FlipLangs()">&lt;&nbsp;&gt;</button>
            <select id="toLang" onchange="main.HandleInputUpdate(this)"></select>
        </div>
        <div class="content">
            <form onSubmit="return false;">
                <textarea name="textInput" 
                    placeholder="Enter something to translate" 
                    onchange="main.HandleInputUpdate(this)"
                    onfocus="main.OnInputFocus(this)"></textarea>
                <button onclick="main.TranslateInput()" id="translateButton">Translate</button>
                <button onclick="main.ClearInput()" id="clearButton">Clear All</button>
            </form>
            <h2 id="translatedText"></h2>
            <footer>
                TranslateJS. This is a Footer&trade;.
            </footer>
        </div>
    </body>
</html>