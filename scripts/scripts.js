/* Global Variables */
THEME = "material", VIEW = "side-by-side", ACTIVE = "html";

/* Set before unload message */
$(window).bind("beforeunload",function(event) {
    return "Make sure to save everything before leaving this page.";
});

$(document).ready(function(){

	/* Initialize HTML mixed mode */
	var mixedMode = {
        name: "htmlmixed",
        scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
                       mode: null},
                      {matches: /(text|application)\/(x-)?vb(a|script)/i,
                       mode: "vbscript"}]
    };

	/* Create Codemirror HTML object */
	var htmlbox = document.getElementById("html_box");
	var htmleditor = CodeMirror(function(elt) {
	  htmlbox.parentNode.replaceChild(elt, htmlbox);
	},
	{
		// value: htmlDecode(htmlbox.innerHTML),
		lineNumbers: true,
		mode: 'text/html',
		extraKeys: {"Ctrl-Space": "autocomplete"},
		theme: "material",
        autoCloseTags: true,
        matchTags: true
	});


	/* Create Codemirror JS object */
	var jsbox = document.getElementById("js_box");
	var jseditor = CodeMirror(function(elt) {
	  jsbox.parentNode.replaceChild(elt, jsbox);
	},
	{
		// value: jsbox.innerHTML,
		lineNumbers: true,
		mode:  "javascript",
		theme: "material",
		extraKeys: {"Ctrl-Space": "autocomplete"},
		autoCloseBrackets: true,
		matchBrackets: true
	});


	/* Create Codemirror CSS object */
	var cssbox = document.getElementById("css_box");
	var csseditor = CodeMirror(function(elt) {
	  cssbox.parentNode.replaceChild(elt, cssbox);
	},
	{
		// value: cssbox.innerHTML,
		lineNumbers: true,
		mode:  "css",
		extraKeys: {"Ctrl-Space": "autocomplete"},
		theme: "material",
		autoCloseBrackets: true,
		matchBrackets: true
	});


	/* Add Pesudo HTMl CSS and JS classes to identify codemirror editors */
	$(".CodeMirror:nth-child(1)").addClass("html-editor");
	$(".CodeMirror:nth-child(2)").addClass("js-editor");
	$(".CodeMirror:nth-child(3)").addClass("css-editor");

	/*Store their reference in global variable */
	htmlEditor = $('.html-editor');
	jsEditor   = $('.js-editor');
	cssEditor  = $('.css-editor');
	resultBox  = $('#result_box');

	/* Read configuration file to load default configuration */
	$.ajaxSetup({  async: false  });
	$.getJSON("config.txt", function(data){
		if(data.theme){
			THEME = data.theme;
			console.log(THEME);
		}
		if(data.view){
			VIEW = data.view;
			console.log(VIEW);
		}
		if(data.active){
			ACTIVE = data.active;
			console.log(ACTIVE);
		}
	});
	$.ajaxSetup({  async: true  });

	/* Load file asynchronously on request if exists */
	if(window.location.href.split("#")[1]){
		loadFileAJAX(window.location.href.split("#")[1], htmleditor, jseditor, csseditor);
	}else{
		/* Setup the Environment */
		loadFileAJAX("help", htmleditor, jseditor, csseditor);
		//setupEnv(htmleditor, jseditor, csseditor);
    	//setResource("https://code.jquery.com/jquery-3.2.1.min.js");
	}

	/* Check for Smaller Screen Resolution and set display accordingly */
	if (Modernizr.mq('(max-width: 840px)')) {
		$("header h2, footer h2, footer #links, #nav-right li:nth-child(3)").hide();
    VIEW = "tabbed";
    changeView(VIEW, 1);
		changeTheme(THEME, htmleditor, jseditor, csseditor);
		refresh();
		setFocus();
    }

	/* Show playground */
	$("#playground").show();

	/* Make Windows Resizable */
	addResizable(VIEW);

	/* ************************ Header Buttons Handler ************************ */
	/* Execute Script */
	$("#run_button").on("click", function(){
		execute(htmleditor, jseditor, csseditor);
	});

	/* Show External Resource */
	$("#external_resource_button").on("click", function(){
		if($("#external_resource").is(":hidden")){
			reset();
			$("#external_resource").show();
			$("#external_resource_input input").focus();
		}else{
			$("#external_resource").hide();
		}
	});

	/* Add External Resource */
	$("#external_resource_input img").on('click', function(){
		addExternalUri();
	});

	/* Remove External Resource */
	$("#external_resource").on('click','.external_resource_list div', function(){
		removeExternalUri($(this));
	});

	/* Show Livecode */
	$("#livecode_button").on("click", function(){
		if($("#livecode").is(":hidden")){
			reset();
			$("#livecode").show();
			$("#livecode_input").focus();
		}else{
			$("#livecode").hide();
		}
	});

	/* Toggle Livecode */
	$("#livecode_toggle").on("click", function(){
		if($("#livecode_toggle").hasClass("tg_btn_on")){
			$("#livecode_toggle").removeClass("tg_btn_on").addClass("tg_btn_off");
			$("#livecode_button i").addClass("livecode_off");
		}else if($("#livecode_toggle").hasClass("tg_btn_off")){
			$("#livecode_toggle").removeClass("tg_btn_off").addClass("tg_btn_on");
			$("#livecode_button i").removeClass("livecode_off");
		}
	});

	/* Show Themes */
	$("#theme_button").on("click", function(){
		if($("#themes").is(":hidden")){
			reset();
			$("#themes").show();
		}else{
			$("#themes").hide();
		}
	});

	/* Change Theme */
	$("#themes li").on("click", function(){
		THEME = $(this).attr("id");
		changeTheme(THEME, htmleditor, jseditor, csseditor);
		refresh();
		setFocus(focus);
		$("#themes").hide();
	});

	/* Show Views */
	$("#view_button").on("click", function(){
		if($("#views").is(":hidden")){
			reset();
			$("#views").show();
		}else{
			$("#views").hide();
		}
	});

	/* Change View */
	$("#views li").on("click", function(){
		VIEW = $(this).attr('id');
		changeView(VIEW);
		refresh();
		setFocus();
		$("#views").hide();
	});

	/* Clear Contents */
	$("#clear_button").on("click",function(){
		clearContents(htmleditor, jseditor, csseditor);
		reset();
	});

	/* Show Help */
	$("#help_button").on("click",function(){
		window.open(window.location.href.split("#")[0] + '#help', '_blank');
		reset();
	});
	/* ************************ Tabs Handler ************************ */
	/* Handle Tabs Click */
	$(".tabs ul li").on("click", function(){
		ACTIVE = $(this).attr("id");
		switchTab(ACTIVE, VIEW);
		refresh();
		setFocus();
	});

	/* Set Tab Active on Focus */
	htmleditor.on('focus', function() {
    	ACTIVE = "html";
    });
	jseditor.on('focus', function() {
		ACTIVE = "js";
    });
	csseditor.on('focus', function() {
    	ACTIVE = "css";
    });


	/* ************************ Footer Buttons Handler ************************ */
	/* Load File */
	$('input[type=file]').on('change', function(){
		reset();
		loadFile(htmleditor, jseditor, csseditor);
	});

	/* Show Save Dialog */
	$("#file-download").on('click', function(){
		if($("#savefile").hasClass("show-save-dialog")){
			$("#savefile").removeClass("show-save-dialog");
		}else{
			reset();
			$("#savefile").addClass("show-save-dialog");
			$("#savefile input").focus();
		}
	});

	/* Save File */
	$("#save-button").on('click', function(){
		saveFile(htmleditor, jseditor, csseditor);
	});

	/* Clear red background on file name input box on input */
	$("#file-name, #external_resource_input input").on('input', function(){
		$(this).removeClass("input-alert");
	});


/* ************************ Keyboard Events Handler ************************ */
	// ESCAPE
	shortcut.add("ESC",function() {
		reset();
	});
	// ENTER
	shortcut.add("ENTER",function() {
		if($("#external_resource_input input").is(":focus")){
	        	addExternalUri();
	        }
	        else if($("#savefile input").is(":focus")){
	        	saveFile(htmleditor, jseditor, csseditor);
        }
	});
	//FULLSCREEN
	shortcut.add("F11",function() {
		var focus = getFocus();
		if(ACTIVE === "result"){
			resultBox.addClass("fullscreen");
		}
		else if(focus === "html"){
			htmlEditor.addClass("fullscreen");
			refresh();
		}else if(focus === "js"){
			jsEditor.addClass("fullscreen");
			refresh();
		}else if(focus === "css"){
			cssEditor.addClass("fullscreen");
			refresh();
		}else{
			resultBox.addClass("fullscreen");
		}
	});

	//RUN
	shortcut.add("CTRL+F11",function() {
		execute(htmleditor, jseditor, csseditor);
	});

	// SWITCH TABS
	shortcut.add("ALT+1",function() {
		ACTIVE = "html";
		switchTab(ACTIVE, VIEW);
		refresh();
		setFocus();
	});
	shortcut.add("ALT+2",function() {
		ACTIVE = "js";
		switchTab(ACTIVE, VIEW);
		refresh();
		setFocus();
	});
	shortcut.add("ALT+3",function() {
		ACTIVE = "css";
		switchTab(ACTIVE, VIEW);
		refresh();
		setFocus();
	});
	shortcut.add("ALT+4",function() {
		ACTIVE = "result";
		switchTab(ACTIVE, VIEW);
		refresh();
		setFocus();
	});

	// CHANGE VIEW
	shortcut.add("CTRL+1",function() {
		VIEW = "grid";
		changeView(VIEW);
		refresh();
		setFocus();
	});
	shortcut.add("CTRL+2",function() {
		VIEW = "side-by-side";
		changeView(VIEW);
		refresh();
		setFocus();
	});
	shortcut.add("CTRL+3",function() {
		VIEW = "top-and-bottom";
		changeView(VIEW);
		refresh();
		setFocus();
	});
	shortcut.add("CTRL+4",function() {
		VIEW = "tabbed";
		changeView(VIEW);
		refresh();
		setFocus();
	});

	// SAVE
	shortcut.add("CTRL+S",function() {
		if($("#savefile").hasClass("show-save-dialog")){
			$("#savefile").removeClass("show-save-dialog");
		}else{
			reset();
			$("#savefile").addClass("show-save-dialog");
			$("#savefile input").focus();
		}
	});
	//LOAD
	shortcut.add("CTRL+O",function() {
		$("#file-upload").trigger("click");
	});


/* ************************ Media Queries ************************ */
var resize;
var viewbuffer = undefined;
$( window ).resize(function() {
    	if (Modernizr.mq('(max-width: 840px)')) {
  		$("header h2, footer h2, footer #links, #nav-right li#view_button").hide();
  	}else{
  		$("header h2, footer h2, footer #links, #nav-right li#view_button").show();
	}
    if(resize) {
        clearTimeout(resize);
        resize = null;
    }

    resize = setTimeout(function(){
    	if (Modernizr.mq('(max-width: 840px)')) {
        if(VIEW !== "tabbed"){
          viewbuffer = VIEW;
        }
    		VIEW = "tabbed";
    		changeView(VIEW, 1);
			changeTheme(THEME, htmleditor, jseditor, csseditor);
			refresh();
			setFocus();
    	}else{
    		if(viewbuffer !== undefined){
    		  	VIEW = viewbuffer;
    		  	setupEnv(htmleditor, jseditor, csseditor);
    		}
    	}
		addResizable(VIEW);
    }, 500);
});

/* ************************ Helper Functions ************************ */
  /* Prevent resize events on panels from bubbling up the DOM */
  $(".html-editor, .css-editor, .js-editor, #result_box").on('resize', function (e) {
    e.stopPropagation(); 
  });

  /* Livecode */
  var autorun;
  var delay = 500;

  //Get delay value
  $("#livecode_input").on('input', function() {
    delay = $(this).val();
  });

  $(document).keyup(function() {
	  if($("#livecode_toggle").hasClass("tg_btn_on")){
		if(autorun) {
			clearTimeout(autorun);
			autorun = null;
		}

		autorun = setTimeout(function(){
			$("#run_button").trigger("click");
		}, delay);
	  }
  });

	/* Reset Dropdowns */
	function reset(){
		$("#external_resource, #livecode, #themes, #views").hide();
		$("#savefile").removeClass("show-save-dialog");
		$("#result_box, .html-editor, .js-editor, .css-editor").removeClass("fullscreen");
	}

	/* Refresh windows */
	function refresh(){
		htmleditor.refresh();
		jseditor.refresh();
		csseditor.refresh();
	}

	function getFocus(){
		if($(".CodeMirror:nth-child(1)").hasClass("CodeMirror-focused")){
			return "html";
		}
		else if($(".CodeMirror:nth-child(2)").hasClass("CodeMirror-focused")){
			return "js";
		}
		else if($(".CodeMirror:nth-child(3)").hasClass("CodeMirror-focused")){
			return "css";
		}else{
			return "result";
		}
	}

	function setFocus(){
		if(ACTIVE === "html"){
			htmleditor.focus();
		}else if(ACTIVE === "js"){
			jseditor.focus();
		}else if(ACTIVE === "css"){
			csseditor.focus();
		}else{
			csseditor.focus();
		}
	}

});

/* ------------------------------- Functions ------------------------------- */
/* Set Logo Color*/
function setLogoColor(){
	// Fetch iframe colors
	var foreground = $('#result_box iframe').contents().find('body').css('color');
	var background = $('#result_box iframe').contents().find('body').css('backgroundColor');

	//Set Logo color
	if(foreground != "transparent" && foreground != "rgba(0, 0, 0, 0)" && background != "transparent" && background != "rgba(0, 0, 0, 0)" && foreground !== background){
		$("#logo").css('color', foreground);
		$("#logo").css('backgroundColor', background);
	}
}

/* Setup Environment */
function setupEnv(htmleditor, jseditor, csseditor){
	// This function is defined outside 'document.ready' since it is called upon
	// loading external file through asynchronous request. Although refresh and
	// setfocus are defined again here, it is completely intentional.
	changeView(VIEW);
	changeTheme(THEME, htmleditor, jseditor, csseditor);

	// Refresh
	htmleditor.refresh();
	jseditor.refresh();
	csseditor.refresh();

	// Set Focus
	if(ACTIVE === "html"){
		htmleditor.focus();
	}else if(ACTIVE === "js"){
		jseditor.focus();
	}else if(ACTIVE === "css"){
		csseditor.focus();
	}else{
		csseditor.focus();
	}
}

//Make windows resizable
function addResizable(view){

	//Destroy existing resizable if exists and clear inline styling
	if (htmlEditor.hasClass("ui-resizable")){
		htmlEditor.resizable("destroy");
	}
	if (jsEditor.hasClass("ui-resizable")){
		jsEditor.resizable("destroy");
	}
	if (cssEditor.hasClass("ui-resizable")){
		cssEditor.resizable("destroy");
	}
	$(" .html-editor, .css-editor, .js-editor, #result_box").removeAttr("style");
	if(VIEW === "side-by-side"){
		$(" #tabs-3").css("width", "50%");
	}else if(VIEW === "top-and-bottom"){
		$(" #tabs-3").css("width", "100%");
	}else if(VIEW === "tabbed"){
		$(" #tabs-4").css("width", "100%");
	}

	var title = $("header h2").text();
	var fontsize = $("body").css('font-size').split("px")[0];

	// Resize panels
	if(view === "grid"){
		htmlEditor.resizable({
			//handles: 'e,s,se',
			handles: 'se',
			minWidth: 300,
			maxWidth: $( window ).width() - 300,
			minHeight: 200,
			maxHeight: $( window ).height() - 5.5*fontsize - 200,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){				
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());

				var currentHeight = ui.size.height;
				var currentWidth = ui.size.width;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).height(currentHeight);
				$(this).width(currentWidth);
				
				// set the other panels height and width
				resultBox.width($( window ).width() - currentWidth - 1);
				resultBox.height( currentHeight );
				resultBox.css("left", currentWidth + "px" );
				$(".js-editor, .css-editor").height($( window ).height() - 5.5*fontsize - currentHeight - 1);
				$(".js-editor, .css-editor").css("top", currentHeight + 1 + "px" );
				jsEditor.width( currentWidth );
				
				cssEditor.width( $( window ).width() - currentWidth - 1 );
				cssEditor.css( "left", currentWidth );
			}
		});
		/*
		jsEditor.resizable({
			handles: 'e,n',
			minWidth: 300,
			maxWidth: $( window ).width() - 300,
			minHeight: 200,
			maxHeight: $( window ).height() - 5.5*fontsize - 200,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				var currentHeight = ui.size.height;
				var currentWidth = ui.size.width;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).height(currentHeight);
				$(this).width(currentWidth);
				
				// set the other panels height and width
				cssEditor.width($( window ).width() - currentWidth - 1);
				cssEditor.height( currentHeight );
				cssEditor.css("top", jsEditor.css("top"));
				$(".html-editor, #result_box").height($( window ).height() - 5.5*fontsize - currentHeight - 1);
			}
		});
		cssEditor.resizable({
			handles: 'w,n,nw',
			minWidth: 300,
			maxWidth: $( window ).width() - 300,
			minHeight: 200,
			maxHeight: $( window ).height() - 5.5*fontsize - 200,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				var currentHeight = ui.size.height;
				var currentWidth = ui.size.width;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).height(currentHeight);
				$(this).width(currentWidth);
				
				// set the other panels height and width
				jsEditor.width($( window ).width() - currentWidth - 1);
				jsEditor.height( currentHeight );
				jsEditor.css("top", cssEditor.css("top"));
				$(".html-editor, #result_box").height($( window ).height() - 5.5*fontsize - currentHeight - 1);
				//$(".js-editor, .css-editor").css("top", 0*fontsize + currentHeight + "px" );
			}
		});
		*/
	}else if(view === "side-by-side"){
		htmlEditor.resizable({
			alsoResize: "#tabs-3, .js-editor, .css-editor",
			handles: 'e',
			maxWidth: $( window ).width() - 300,
			minWidth: 300,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());
				var currentWidth = ui.size.width;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).width(currentWidth);
				
				// set the content panel width
				resultBox.width($( window ).width() - currentWidth - 1);            
				resultBox.css("left", currentWidth + "px" );
			}
		});
		jsEditor.resizable({
			alsoResize: "#tabs-3, .html-editor, .css-editor",
			handles: 'e',
			maxWidth: $( window ).width() - 300,
			minWidth: 300,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());
				var currentWidth = ui.size.width;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).width(currentWidth);
				
				// set the content panel width
				resultBox.width($( window ).width() - currentWidth - 1);            
				resultBox.css("left", currentWidth + "px" );
			}
		});
		cssEditor.resizable({
			alsoResize: "#tabs-3, .html-editor, .js-editor",
			handles: 'e',
			maxWidth: $( window ).width() - 300,
			minWidth: 300,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());
				var currentWidth = ui.size.width;
				$(this).width(currentWidth);
				
				// set the result window width
				resultBox.width($( window ).width() - currentWidth - 1);
				resultBox.css("left", currentWidth + "px" );
			}
		});
	}else if(view === "top-and-bottom"){
		var fontsize = $("body").css('font-size').split("px")[0];

		htmlEditor.resizable({
			alsoResize: ".js-editor, .css-editor",
			handles: 's',
			maxHeight: $( window ).height() - 8*fontsize - 50,
			minHeight: 50,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());
				var currentHeight = ui.size.height;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).height(currentHeight);
				
				// set the content panel height
				resultBox.height($( window ).height() - 5.5*fontsize - currentHeight - 1);            
				resultBox.css("top", currentHeight + "px" );
			}
		});
		jsEditor.resizable({
			alsoResize: ".html-editor, .css-editor",
			handles: 's',
			maxHeight: $( window ).height() - 8*fontsize - 50,
			minHeight: 50,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());
				var currentHeight = ui.size.height;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).height(currentHeight);
				
				// set the content panel height
				resultBox.height($( window ).height() - 5.5*fontsize - currentHeight - 1);            
				resultBox.css("top", currentHeight + "px" );
			}
		});
		cssEditor.resizable({
			alsoResize: ".js-editor, .html-editor",
			handles: 's',
			maxHeight: $( window ).height() - 8*fontsize - 50,
			minHeight: 50,
			start: function(event, ui) {
				$('iframe').css('pointer-events','none');
				},
			stop: function(event, ui) {
				$("header h2").text(title);
				$('iframe').css('pointer-events','auto');
			},
			resize: function(event, ui){
				$("header h2").text($(resultBox).width() + " x " + $(resultBox).height());
				var currentHeight = ui.size.height;
				
				// this accounts for some lag in the ui.size value, if you take this away 
				// you'll get some instable behaviour
				$(this).height(currentHeight);
				
				// set the content panel height
				resultBox.height($( window ).height() - 5.5*fontsize - currentHeight - 1);            
				resultBox.css("top", currentHeight + "px" );
			}
		});
	}
}

function clearView(){
	htmlEditor.removeClass("grid-html side-by-side-html top-and-bottom-html tabbed-html");
	jsEditor.removeClass("grid-js side-by-side-js top-and-bottom-js tabbed-js");
	cssEditor.removeClass("grid-css side-by-side-css top-and-bottom-css tabbed-css");
	resultBox.removeClass("grid-result-box side-by-side-result-box top-and-bottom-result-box tabbed-result-box");
	$("#view_button i").removeClass("fa-pause fa-ellipsis-h fa-th-large rotate-90");
	$(".tabs").removeClass("tabs-top-and-bottom tabs-tabbed");
	$(".tabs").hide();
}

function changeView(value, allowlowres){
	//Don't change view if screen size less than 840px
	if (Modernizr.mq('(max-width: 840px)') && !allowlowres) {
		return;
	}
	//Adjust view elements according to view
	clearView();

	//Reset resized views and set new handlers
	addResizable(VIEW);

	// Change to grid
	if(value === "grid"){

		//Set editor windows to default size
		htmlEditor.css("width","50%");
		jsEditor.css("width","50%");
		cssEditor.css("width","50%");

		htmlEditor.addClass("grid-html");
		jsEditor.addClass("grid-js");
		cssEditor.addClass("grid-css");
		resultBox.addClass("grid-result-box");

		$("#view_button i").addClass("fa-th-large");

		// Switch Tab
		switchTab(ACTIVE, VIEW);
	}
	// Change to side by side
	else if(value === "side-by-side"){
		htmlEditor.addClass("side-by-side-html");
		jsEditor.addClass("side-by-side-js");
		cssEditor.addClass("side-by-side-css");
		resultBox.addClass("side-by-side-result-box");
		$("#tabs-3").show();

		$("#view_button i").addClass("fa-pause");

		// SwitchTab
		switchTab(ACTIVE, VIEW);
	}
	// Change to top and bottom
	else if(value === "top-and-bottom"){
		htmlEditor.addClass("top-and-bottom-html");
		jsEditor.addClass("top-and-bottom-js");
		cssEditor.addClass("top-and-bottom-css");
		resultBox.addClass("top-and-bottom-result-box");
		$("#tabs-3").addClass("tabs-top-and-bottom");
		$("#tabs-3").show();

		$("#view_button i").addClass("fa-pause rotate-90");

		// SwitchTab
		switchTab(ACTIVE, VIEW);
	}
	// Change to tabbed
	else if(value === "tabbed"){
		htmlEditor.addClass("tabbed-html");
		jsEditor.addClass("tabbed-js");
		cssEditor.addClass("tabbed-css");
		resultBox.addClass("tabbed-result-box");
		$("#tabs-4").addClass("tabs-tabbed");
		$("#tabs-4").show();

		$("#view_button i").addClass("fa-ellipsis-h");

		// Show only active windows
		$(".html-editor, .js-editor, .css-editor").hide();
		$("#tabs-4 ul li").each(function(index){
			if($(this).hasClass("active-li")){
				// setActiveTab(index);
				id = index+1;
				$(".CodeMirror:nth-child(" + id + ")").show();
			}
		});

		// SwitchTab
		switchTab(ACTIVE, VIEW);
	}
}

function addExternalUri(){
	if($("#external_resource_input input").val()){
		// if($("#external_resource_input input").val().endsWith(".js") || $("#external_resource_input input").val().endsWith(".css")){
			input_uri = $("#external_resource_input input").val();

			$("#external_resource_input").after($("<div class='external_resource_list'>" +
			"<input type='text' name='External Resource' value='" + input_uri + "'>" +
			"<div><img src='media/icons/plus.png'></div>" +
			"</div>"));
			$(".external_resource_list_translate").removeClass("external_resource_list_translate");


			this_item = $("#external_resource_input").next("div");
			list_items = $("#external_resource_input").nextAll("div");
			setTimeout(function(){
				this_item.find("img").addClass("external_resource_list_img_added");
				this_item.children("div").addClass("external_resource_list_div_added");
				list_items.addClass("external_resource_list_translate");
			}, 50);
			$("#external_resource_input input").val("");
			$("#external_resource_input input").focus();
		// }else{
		// 	$("#external_resource_input input").addClass("input-alert");
		// }
	}else{
		$("#external_resource_input input").addClass("input-alert");
	}
}

function removeExternalUri(element){
	element.removeClass("external_resource_list_div_added");
	element.children("img").removeClass("external_resource_list_img_added");
	element.parent().slideUp(500, function() { $(this).remove(); } );
}

function loadFileAJAX(file, htmleditor, jseditor, csseditor){
	$.ajax({
        url: "projects/" + file + ".txt",
        async: true,
        success: function (data){
    		var result = data.replace(/\r\n/g, "\n").split("```");

			if(result.length < 2){
				alert("Invalid File");
				return;
			}

			for(i=0; i<result.length; i++){

				if(i === 0){
					result[i] = result[i].slice(0, -1);
				}
				else{
					result[i] = result[i].slice(1, -1);
				}
			}

			$("header h2").text(result[0]);
			setResource(result[1]);
			htmleditor.getDoc().setValue(result[2]);
			jseditor.getDoc().setValue(result[3]);
			csseditor.getDoc().setValue(result[4]);
			if(result[5]){  ACTIVE = result[5];  }
			if(result[6]){  THEME = result[6];   }
			if(result[7] && !Modernizr.mq('(max-width: 840px)')){  VIEW = result[7];    }
			setupEnv(htmleditor, jseditor, csseditor);
			execute(htmleditor, jseditor, csseditor);
		},
		error: function(){
			alert("Invalid File");
			setupEnv(htmleditor, jseditor, csseditor);
		}
    });
}

function loadFile(htmleditor, jseditor, csseditor){
	var file = document.getElementById("file-upload").files[0];
	if (file) {
	    var reader = new FileReader();
	    reader.readAsText(file, "UTF-8");
	    reader.onload = function (evt) {

			var result = evt.target.result.replace(/\r\n/g, "\n").split("```");

			if(result.length < 2){
				alert("Invalid File");
				return;
			}

			for(i=0; i<result.length; i++){

				if(i === 0){
					result[i] = result[i].slice(0, -1);
				}
				else{
					result[i] = result[i].slice(1, -1);
				}
				// console.log(i + " " + result[i]);
			}
			$("header h2").text(result[0]);
			setResource(result[1]);
			htmleditor.getDoc().setValue(result[2]);
			jseditor.getDoc().setValue(result[3]);
			csseditor.getDoc().setValue(result[4]);
			if(result[5]){  ACTIVE = result[5];  };
			if(result[6]){  THEME = result[6];   }
			if(result[7]){  VIEW = result[7];    }
			setupEnv(htmleditor, jseditor, csseditor);
			execute(htmleditor, jseditor, csseditor);
			console.log("load file success");
	    }
	    reader.onerror = function (evt) {
	        console.log("error reading file");
	    }
	}
}

function setResource(resources){
	$('#external_resource_input').nextAll('div').remove();

	if(resources !== ""){
		var resource = resources.split("\n");
		for(i=0; i<resource.length; i++){
			$("#external_resource_input").after($("<div class='external_resource_list external_resource_list_translate'>" +
			"<input type='text' name='External Resource' value='" + resource[i] + "'>" +
			"<div class='external_resource_list_div_added'><img class='external_resource_list_img_added' src='media/icons/plus.png'></div>" +
			"</div>"));
			// console.log(i + " " + resource[i]);
		}
	}
}

function saveFile(htmleditor, jseditor, csseditor){
	if($("#file-name").val()){
		var filename = $("#file-name").val();
		$("#savefile").removeClass("show-save-dialog");

		$("header h2").text(filename);
		var newfile = filename + "\n```\n" + getResource("plain") + "\n```\n" + htmleditor.getValue() + "\n```\n" + jseditor.getValue() + "\n```\n" + csseditor.getValue() + "\n```\n" + ACTIVE + "\n```\n" + THEME +  "\n```\n" + VIEW + "\n";
		//var newfile = { "filename":filename, "resources":getResource("plain") };
		var blob = new Blob([newfile], {type: "text/plain"});
		saveAs(blob, filename + ".txt");
	}
	else{
		$("#file-name").addClass("input-alert");
	}
}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}

function execute(htmleditor,jseditor,csseditor){

	var resource = getResource("with_tags");

	var iframe = document.createElement('iframe');
	iframe.id = "result_iframe";

	//console.log("css: " + csseditor.getValue());

	content =
'<!doctype html>' +
'<html lang="en">' +
	'<head>' +
		'<meta charset = "utf-8">' +
		resource +
	'</head>' +
	'<body>' +
		htmleditor.getValue() +
	'</body>' +

	'<style>' +
		csseditor.getValue() +
	'</style>' +
	'<scr' + 'ipt>' +
		jseditor.getValue() +
	'</scr' + 'ipt>' +
'</html>'

	iframe.srcdoc = content;

	myIframe = $('#result_box').empty().append( iframe );
	srcDoc.set( $('#result_box iframe')[0] , content );

	setTimeout(function(){ setLogoColor(); }, 1000);
}

function getResource(type){
	var resources = [];

	$($(".external_resource_list input").get().reverse()).each(function(index){
		resources.push($(this).val());
	});

	if(type == "with_tags"){
		for(var i = 0; i< resources.length; i++){
			// if(resources[i].slice(resources[i].length - 3, resources[i].length) === ".js"){
			if(resources[i].toLowerCase().indexOf("js") >= 0){
				resources[i] = "<scr" + "ipt src='" + resources[i] + "'></scr" + "ipt>";
			// }else if(resources[i].slice(resources[i].length - 4,resources[i].length) === ".css"){
			}else if(resources[i].toLowerCase().indexOf("css") >= 0){
				resources[i] = "<link rel='stylesheet' href='" + resources[i] + "'>"
			}
		}
	}

	var resource = resources.join();
	var resource = resource.replace(/,/g, "\n");

	return resource;
}

function clearContents(htmleditor, jseditor, csseditor){
	var result = confirm("Are you sure you wish to clear everything? Any unsaved changes will be lost.");
	if (result) {
		setResource("https://code.jquery.com/jquery-3.2.1.min.js");
		htmleditor.getDoc().setValue("");
		jseditor.getDoc().setValue("");
		csseditor.getDoc().setValue("");
		$('#result_box').empty();
		$("header h2").text("Code Playground");
	}
}

function clearActiveTab(){
	$("#tabs-3 ul li").each(function(){
		$(this).removeClass("active-li");
	});
	$("#tabs-4 ul li").each(function(){
		$(this).removeClass("active-li");
	});
	$(".html-editor, .js-editor, .css-editor, #result_box").hide();
}

function setFullScreen(element){
	if(htmlEditor.hasClass("fullscreen") || jsEditor.hasClass("fullscreen") || cssEditor.hasClass("fullscreen") || resultBox.hasClass("fullscreen")){
		htmlEditor.removeClass("fullscreen");
		jsEditor.removeClass("fullscreen");
		cssEditor.removeClass("fullscreen");
		resultBox.removeClass("fullscreen");

		if(element === "html")  { htmlEditor.addClass("fullscreen"); }
		if(element === "js")    {   jsEditor.addClass("fullscreen"); }
		if(element === "css")   {  cssEditor.addClass("fullscreen"); }
		if(element === "result"){  resultBox.addClass("fullscreen"); }
	}
}

function switchTab(element, view){
	clearActiveTab();
	setFullScreen(element);

	if(view === "grid"){
		// show all boxes
		$(".html-editor, .js-editor, .css-editor, #result_box").show();

		if(element === "html"){
			$("#tabs-3 ul li:nth-child(1)").addClass("active-li");
		}else if(element === "js"){
			$("#tabs-3 ul li:nth-child(2)").addClass("active-li");
		}else if(element === "css"){
			$("#tabs-3 ul li:nth-child(3)").addClass("active-li");
		}else if(element === "result"){
			$("#tabs-3 ul li:nth-child(3)").addClass("active-li");
		}
	}else if(view === "side-by-side"){
		// show result box
		resultBox.show();

		if(element === "html"){
			$("#tabs-3 ul li:nth-child(1)").addClass("active-li");
			htmlEditor.show();
		}else if(element === "js"){
			$("#tabs-3 ul li:nth-child(2)").addClass("active-li");
			jsEditor.show();
		}else if(element === "css"){
			$("#tabs-3 ul li:nth-child(3)").addClass("active-li");
			cssEditor.show();
		}else if(element === "result"){
			$("#tabs-3 ul li:nth-child(3)").addClass("active-li");
			cssEditor.show();
		}
	}else if(view === "top-and-bottom"){
		// show result box
		resultBox.show();

		if(element === "html"){
			$("#tabs-3 ul li:nth-child(1)").addClass("active-li");
			htmlEditor.show();
		}else if(element === "js"){
			$("#tabs-3 ul li:nth-child(2)").addClass("active-li");
			jsEditor.show();
		}else if(element === "css"){
			$("#tabs-3 ul li:nth-child(3)").addClass("active-li");
			cssEditor.show();
		}else if(element === "result"){
			$("#tabs-3 ul li:nth-child(3)").addClass("active-li");
			cssEditor.show();
		}
	}else if(view === "tabbed"){
		if(element === "html"){
			$("#tabs-4 ul li:nth-child(1)").addClass("active-li");
			htmlEditor.show();
		}else if(element === "js"){
			$("#tabs-4 ul li:nth-child(2)").addClass("active-li");
			jsEditor.show();
		}else if(element === "css"){
			$("#tabs-4 ul li:nth-child(3)").addClass("active-li");
			cssEditor.show();
		}else if(element === "result"){
			$("#tabs-4 ul li:nth-child(4)").addClass("active-li");
			resultBox.show();
		}
	}

	// if(!$(element).hasClass("active-li")){
	// 	// Clear Active
	// 	clearActiveTab();

	// 	//Set active class
	// 	$(element).addClass("active-li");
	// 	if(!show){
	// 		$(".CodeMirror:nth-child(1), .CodeMirror:nth-child(2), .CodeMirror:nth-child(3)").hide();
	// 	}
	// 	// Switch active window
	// 	var id = $(element).index() + 1;
	// 	$(".CodeMirror:nth-child(" + id + ")").show();

	// 	// Set ACTIVE variable
	// 	if($(element).text().toLowerCase() !== "result"){
	// 		ACTIVE = $(element).text().toLowerCase();
	// 	}
	// }
}

function clearTheme(){
	$(".tabs").removeClass("material eclipse monokai");
}

function changeTheme(value, htmleditor, jseditor, csseditor){
	clearTheme();

	console.log(value);

	if(value === "eclipse"){
		htmleditor.setOption("theme", "eclipse");
		jseditor.setOption("theme", "eclipse");
		csseditor.setOption("theme", "eclipse");

		$(".tabs").addClass("eclipse");
	}
	else if(value === "material"){
		htmleditor.setOption("theme", "material");
		jseditor.setOption("theme", "material");
		csseditor.setOption("theme", "material");

		$(".tabs").addClass("material");
	}
	else if(value === "monokai"){
		htmleditor.setOption("theme", "monokai");
		jseditor.setOption("theme", "monokai");
		csseditor.setOption("theme", "monokai");

		$(".tabs").addClass("monokai");
	}
}
