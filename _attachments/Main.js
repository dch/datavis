var deliciousTags;

//var scienceBlogs = new StringList("http://scienceblogs.com/clock/", "http://scienceblogs.com/illconsidered/", "http://scienceblogs.com/voteforscience/", "http://scienceblogs.com/aardvarchaeology/", "http://scienceblogs.com/ethicsandscience/");


//// data

var urlsList;
var titles;
var categories;
var urlsListForDeliciousTags;

var table;
var numberTable;
var minMaxInterval;

var tags;

var tagsColorsSoft;
var tagsColorsHard;

var network;
var itemsNetwork;


///// interface

var drawNetwork;

var networkInterface;
var panel;
var comparatives;


//// parameters

var SEARCH_DELICIOUS_TAGS = false;
var DRAW_NETWORK = false;
var WRITES_JSON = false;
var TEST_REPETITIONS = false;

var vis_mode = 0; //0:network 1:comparative

var launchIcon;

var tweetButtonDiv = document.getElementById('tweet_button');

init=function(){
	if(SEARCH_DELICIOUS_TAGS){
		Loader.loadData("./resources/lists.txt", loadedLists, this);
		//Loader.loadData("./resources/listsTests.txt", loadedLists, this);
	} else {
		Loader.loadImage('./resources/launchIcon.png', iconLoaded, this);
		Loader.loadData("./resources/vis_tags.csv", loadedCSV, this);
		//Loader.loadData("./resources/vis_tagsTests.csv", loadedCSV, this);
	}
}
function iconLoaded(e){
	launchIcon = e.result;
}

function loadedLists(e){
	var lines = e.result.split("\n");

	titles = new StringList();
	categories = new StringList();
	urlsList = new StringList();
	urlsListForDeliciousTags = new StringList();

	var lastIndex;

	var url;
	var urlForDelicious;
	var title;
	var blocks;
	var category;
	for(var i=0;lines[i]!=null;i++){
		if(lines[i].charAt(0)=="/"){
			category = lines[i].substr(2);
		} else if(lines[i]!=""){
			lastIndex = lines[i].lastIndexOf(" ");
			categories.push(category);
			if(lastIndex==-1){
				url = lines[i];
				urlForDelicious = url;
				urlsList.push(url);
				urlsListForDeliciousTags.push(urlForDelicious);
				title = url.replace("http://", "").replace("https://", "").replace("www.", "");
				if(title.charAt(title.length-1)=="/") title = title.substr(0, title.length-1);
				titles.push(title);
			} else {
				url = lines[i].substr(lastIndex+1);
				blocks = lines[i].split(" ");
				if(url.charAt(0)=="*"){
					urlForDelicious = url.substr(1);
					url = blocks[blocks.length-2];
					if(blocks.length==3){
						title = blocks[0];
					} else {
						title = blocks[0]+" "+blocks[1];
					}
				} else {
					urlForDelicious = url;
					if(blocks.length==2){
						title = blocks[0];
					} else {
						title = blocks[0]+" "+blocks[1];
					}
				}
				urlsList.push(url);
				urlsListForDeliciousTags.push(urlForDelicious);


				titles.push(title);
			}
			c.log("\nt :"+title);
			c.log("u :"+url);
			c.log("ud:"+urlForDelicious);
			c.log("c :"+category);
		}
	}

	urlsList.name = 'url';
	titles.name = 'title';
	categories.name = 'category';

	deliciousTags = new LoadDeliciousTagsFromWebsite(loadedDeliciousTags);

	c.log(urlsList.type, urlsList);
	c.log("START LOADING TAGS FOR "+urlsList.length+" URLs");

	deliciousTags.tagsToRemove.push('visualization');
	deliciousTags.searchMultiple(urlsListForDeliciousTags, false, 80);
}

function loadedDeliciousTags(resultTable){
	table = resultTable;
	c.log("result table:", table);

	numberTable = table.getSubList(new Interval(1, table.length-1));//.sliceRows(0, 50);
	c.log("numberTable:", numberTable);
	minMaxInterval = numberTable.getMinMaxInterval();

	var sums = numberTable.getSums();
	c.log("sums:", sums);

	table[0] = ListOperators.concat(new StringList('url', 'categories'), table[0]);
	table[0].name = 'names';
	for(var i=0; urlsList[i]!=null; i++){
		table[i+1] = ListOperators.concat(new StringList(urlsList[i], categories[i]), table[i+1]);
		table[i+1].name=titles[i];
		c.log("\n"+titles[i], LoadDeliciousTagsFromWebsite.deliciousPageUrl(titles[i]));
		c.log("values:",table[i+1]);
		if(table[i+1].getSubList(new Interval(2, table[i+1].length-2)).getSum()<6){
			c.log("\n\n\n[!] [!] [!] [!] [!] [!] [!]");
			c.log(table[i+1][0]);
			c.log("[!] [!] [!] [!] [!] [!] [!]");
		}
	}

	var csv = TableEncodings.TableToCSV(table, ',', true);

	var deliciousUrlsLine = urlsListForDeliciousTags.join(",");

	c.log(csv);
	c.log();
	c.log(deliciousUrlsLine)
}



function loadedCSV(e){
	table = TableEncodings.CSVtoTable(e.result, true, ',');
	urlsList = table.getRow(0).getSubList(new Interval(1, table.length-1));
	var tagsTable = table.sliceRows(2);

	numberTable = tagsTable.getSubList(new Interval(1, tagsTable.length-1));

	tags = table[0].getSubList(new Interval(2,  table[0].length-1));

	categories = table.getRow(1).getSubList(new Interval(1, table.length-1));

	titles = table.getNames().getSubList(new Interval(1, table.length-1));

	if(DRAW_NETWORK){
		c.log("table:", table);

		numberTable = NumberTableOperators.normalizeListsToMax(numberTable);
		c.log("numberTable:", numberTable);

		minMaxInterval = numberTable.getMinMaxInterval();

		c.log("minMaxInterval:", minMaxInterval);

		network = CreateNetwork.create(tagsTable);
		c.log('network', network);

		c.log("network.nodeList.length", network.nodeList.length);

		drawNetwork = new DrawNetwork(network, false);
	}

	itemsNetwork = CreateNetwork.createItemsNetwork(tagsTable);
	c.log('itemsNetwork', itemsNetwork);

	if(!DRAW_NETWORK){
		networkInterface = new NetworkInterface();

		addInteractionEventListener('mousedown', this.mousedown, this);
	}


	//////////////////create JSON file

	if(WRITES_JSON){
		var object = new Object();
		var resources = new Array();
		object["resources"] = resources;

		var resource;
		var node;
		var index;
		var urlTags;
		var tagsWeights;

		var sN;

		for(var i=0;network.nodeList[i]!=null;i++){
			node = network.nodeList[i];
			if(node.nodeType=='url'){
				resource = new Object();
				resource["name"] = node.name;
				resource["url"] = node.url;
				//resource["delicious_url"] = node.url;
				resource["tags"] = new Array();
				resource["weighedTags"] = new Array();


				index = urlsList.indexOf(node.url);
				tagsWeights = numberTable[index].getNormalizedToMax();
				c.log(tags.length, tagsWeights.length);
				urlTags = ListOperators.sortListByNumberList(tags, tagsWeights, true);
				tagsWeights = ListOperators.sortListByNumberList(tagsWeights, tagsWeights, true);

				for(var j=0; tagsWeights[j]!=null; j++){
					if(tagsWeights[j]>0){
						resource["tags"].push(urlTags[j]);
						sN = String(Math.round(100*tagsWeights[j])*0.01);
						if(sN.length>4) sN = sN.substr(0,4);
						resource["weighedTags"].push(new Array(urlTags[j], Number(sN)));
					}
				}

				resources.push(resource);
			}
		}

		var jsonString = JSON.stringify(object);

		c.log("-------------JSON---------------");
		c.log(jsonString);
		c.log("--------------------------------");
	}
}

mousedown=function(e){
	if(mouseX<panel.PANEL_WIDTH){
		panel.mouseDown();
	} else {
		switch(vis_mode){
			case 0:
				networkInterface.mousedown(e);
				break;
			case 1:
				comparatives.mousedown(e);
				break;
		}
	}
}

networkBuilt = function(){
	panel = new Panel();
}


cycle=function(){


	if(network==null){
		DrawTexts.setContextTextProperties('white', 24);
		context.fillText('loading data | building network', canvasWidth - 340, canvasHeight - 40);
		return;
	}

	canvas.style.cursor = 'default';

	switch(vis_mode){
		case 0:
			if(DRAW_NETWORK){
				drawNetwork.draw();
			} else {
				networkInterface.draw();
			}
			break;
		case 1:
			comparatives.draw();
			break;

	}

	panel.draw();
}

resizeWindow = function(){
	networkInterface.setFrame(new Rectangle(panel.PANEL_WIDTH,0,canvasWidth-panel.PANEL_WIDTH,canvasHeight));
	panel.heightChanged();
}

updateHash = function(){
	var md;
	var newHash = "";
	var node;



	for(var i=0; panel.infoInstances[i]!=null;i++){
		node = panel.infoInstances[i].node;
		// if(node.miniHash==null){
			// md = MD5.hex_md5(node.url);
			// node.miniHash = md.substr(char0,nChars);
		// }
		newHash += node.miniHash;
	}

	window.location.hash = String(vis_mode)+newHash;

}


colorFromHardness = function(hardnessValue, alpha){
	return ColorOperators.addAlpha(ColorOperators.grayToOrange(Math.pow(1-hardnessValue, 3)), alpha);
}


drawIcon = function(type, x, y, w, h, color){
	x-=w*3;
	y-=h*3;
	context.fillStyle = color;
	switch(type){
		case "blogs":
			context.beginPath();
			context.fillRect(x,y,6*w,h);
			context.fillRect(x,y+3*h,6*w,h);
			context.fillRect(x,y+6*h,6*w,h);
			break;
		case "people":
			context.beginPath();
			context.moveTo(x+2*w,y);
			context.lineTo(x+4*w,y);
			context.lineTo(x+4*w,y+1.7*h);
			context.lineTo(x+5*w,y+1.7*h);
			context.lineTo(x+5*w,y+4.5*h);
			context.lineTo(x+4*w,y+4.5*h);
			context.lineTo(x+4*w,y+7*h);
			context.lineTo(x+2*w,y+7*h);
			context.lineTo(x+2*w,y+4.2*h);
			context.lineTo(x+1*w,y+4.2*h);
			context.lineTo(x+1*w,y+1.7*h);
			context.lineTo(x+2*w,y+1.7*h);
			context.lineTo(x+2*w,y);
			context.fill();
			break;
		case "companies/studios":
			context.beginPath();
			context.moveTo(x,y+3*h);
			context.lineTo(x+3*w,y-0.5*h);
			context.lineTo(x+6*w,y+3*h);
			context.lineTo(x+6*w,y+6*h);
			context.lineTo(x,y+6*h);
			context.lineTo(x,y+3*h);
			context.fill();
			break;
		case "resources/tools/applications/frameworks":
			context.beginPath();
			context.moveTo(x+3*w,y);
			context.lineTo(x+6*w,y+3*h);
			context.lineTo(x+3*w,y+6*h);
			context.lineTo(x,y+3*h);
			context.lineTo(x+3*w,y);
			context.fill();
			break;
		case "books":
			context.beginPath();
			context.moveTo(x+1*w,y);
			context.lineTo(x+5*w,y);
			context.lineTo(x+5*w,y+6*h);
			context.lineTo(x+1*w,y+6*h);
			context.lineTo(x+1*w,y);
			context.fill();
			break;
	}
}

