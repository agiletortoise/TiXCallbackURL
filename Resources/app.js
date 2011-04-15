Ti.UI.setBackgroundColor('#000');
Ti.include("xcallbackurl/XCallbackURL.js");

function d(msg) {
	Ti.API.debug("### " + msg);
}

var Main = {};
Main.buildView = function() {
	Main.tabGroup = Ti.UI.createTabGroup();
	
	Main.buildSendView();
	Main.buildReceiveView();
	
	Main.tabGroup.addTab(Main.sendTab);
	Main.tabGroup.addTab(Main.receiveTab);
};
Main.buildSendView = function() {
	Main.sendWindow = Ti.UI.createWindow({
		title:"Send",
		backgroundColor:"#fff"
	});
	Main.sendTab = Ti.UI.createTab({
		icon:'images/send.png',
		title:"Send",
		window:Main.sendWindow
	});
	
	// CREATE LABELS
	var lbl = Main.createLabel();
	lbl.text = "Scheme";
	lbl.left = 10;
	lbl.top = 10;
	Main.sendWindow.add(lbl);
	
	lbl = Main.createLabel();
	lbl.text = "Host";
	lbl.left = 100;
	lbl.top = 10;
	Main.sendWindow.add(lbl);
	
	lbl = Main.createLabel();
	lbl.text = "Action";
	lbl.left = 10;
	lbl.top = 60;
	Main.sendWindow.add(lbl);

	lbl = Main.createLabel();
	lbl.text = "Action Parameters";
	lbl.left = 10;
	lbl.top = 110;
	lbl.width = 140;
	Main.sendWindow.add(lbl);

	lbl = Main.createLabel();
	lbl.text = "x-success";
	lbl.left = 10;
	lbl.top = 160;
	Main.sendWindow.add(lbl);

	lbl = Main.createLabel();
	lbl.text = "x-error";
	lbl.left = 10;
	lbl.top = 210;
	Main.sendWindow.add(lbl);

	lbl = Main.createLabel();
	lbl.text = "x-source";
	lbl.left = 10;
	lbl.top = 260;
	Main.sendWindow.add(lbl);
	
	// CREATE TEXT FIELDS
	Main.fldScheme = Main.createTextField();
	Main.fldScheme.top = 30;
	Main.fldScheme.right = 240;
	Main.sendWindow.add(Main.fldScheme);

	Main.fldHost = Main.createTextField();
	Main.fldHost.top = 30;
	Main.fldHost.left = 90;
	Main.fldHost.value = 'x-callback-url';
	Main.sendWindow.add(Main.fldHost);

	Main.fldAction = Main.createTextField();
	Main.fldAction.top = 80;
	Main.sendWindow.add(Main.fldAction);

	Main.fldActionParameters = Main.createTextField();
	Main.fldActionParameters.top = 130;
	Main.sendWindow.add(Main.fldActionParameters);

	Main.fldXSuccess = Main.createTextField();
	Main.fldXSuccess.top = 180;
	Main.sendWindow.add(Main.fldXSuccess);

	Main.fldXError = Main.createTextField();
	Main.fldXError.top = 230;
	Main.sendWindow.add(Main.fldXError);

	Main.fldXSource = Main.createTextField();
	Main.fldXSource.top = 280;
	Main.sendWindow.add(Main.fldXSource);
	
	var btn = Ti.UI.createButton({
		title:"Open URL",
		left:10,
		right:10,
		height:35,
		top:315
	});
	btn.addEventListener('click',function(e){
		Main.buildAndOpenURL();
	});
	Main.sendWindow.add(btn);	
};
Main.buildReceiveView = function() {
	Main.receiveWindow = Ti.UI.createWindow({
		title:"Receive",
		backgroundColor:"#fff"
	});
	Main.receiveTab = Ti.UI.createTab({
		icon:'images/receive.png',
		title:"Receive",
		window:Main.receiveWindow
	});	
	
	Main.lblReceive = Ti.UI.createLabel({
		text:"Incoming URLs for the tixcallbackurl:// schema will be displayed here.",
		top:10,
		left:10,
		width:300,
		height:380
	});
	Main.receiveWindow.add(Main.lblReceive);
};
Main.createLabel = function(){
	return Ti.UI.createLabel({
		font:{fontFamily:"Helvetica",fontSize:12},
		color:'#444',
		width:80,
		height:16
	});
};
Main.createTextField = function(){
	return Ti.UI.createTextField({
		font:{fontFamily:"Helvetica",fontSize:14},
		color:"#000",
		height:25,
		right:10,
		left:10,
		autocapitalization:false,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_BEZEL
	});
};
Main.show = function() {
	Main.buildView();
	Main.tabGroup.open();
	Main.handleArguments();
};

// BUILD AND OPEN TEST URL
Main.buildAndOpenURL = function() {
	var err = [];
	if(!Main.fldScheme.value) { err.push("Scheme required"); }
	if(!Main.fldHost.value) { err.push("Host required"); }
	if(!Main.fldAction.value) { err.push("Action required"); }
	if(err.length > 0) {
		var a = Ti.UI.createAlertDialog({
			title:"Error",
			message:err.join("\n")
		});
		a.show();
		return;
	}
	
	var url = Main.fldScheme.value + "://";
	url += Main.fldHost.value + "/";
	url += Main.fldAction.value + "?";
	if(Main.fldActionParameters.value) {
		url += Main.fldActionParameters.value + "&";
	}
	if(Main.fldXSuccess.value) {
		url += "x-success=" + escape(Main.fldXSuccess.value) + "&";
	}
	if(Main.fldXError.value) {
		url += "x-error=" + escape(Main.fldXError.value) + "&";
	}
	if(Main.fldXSource.value) {
		url += "x-source=" + escape(Main.fldXSource.value);
	}
	
	Ti.Platform.openURL(url);
};

// HANDLE INCOMING ARGS
Main.handleArguments = function() {
	d("Main.handleArguments : " + JSON.stringify(Ti.App.getArguments()));
	var args = Ti.App.getArguments();
	if(args.url && args.url != Main.lastArgs) {
		var s = args.url + "\n\n";
		
		var xcallback = new XCallbackURL(args.url);
		if(!xcallback.isCallbackURL()) {
			s += "Not an x-callback-url formatted URL."
		}
		else { // yes it is an x-callback-url
			s += "action: " + xcallback.action() + "\n";
			s += "x-source: " + xcallback.source() + "\n";
			s += "x-success: " + xcallback.callbackURL() + "\n"; 
		}

		Main.tabGroup.setActiveTab(1);
		Main.lastArgs = args.url;		
		Main.lblReceive.text = s;
	}
};

// REGISTER EVENTS
//	Resumed event fires after the app has completed resuming and is the proper place to handle arguments
Ti.App.addEventListener('resumed', function(e) {
	d("App:resumed");
	Main.handleArguments();
});

// KICK OFF UI
Main.show();
