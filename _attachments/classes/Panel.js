Panel.prototype.constructor=Panel;



function Panel(){
	this.PANEL_COLOR = 'white';
	this.PANEL_WIDTH = 295;

	this.infoInstancesY = 235;

	this.infoInstances = new List();

	var categories = new StringList();
	c.log("network", network);
	for(var i=0;network.nodeList[i]!=null;i++){
		if(network.nodeList[i].category!=null) categories.push(network.nodeList[i].category);
	}
	this.categoryNumbers = ListOperators.countElementsRepetitionOnList(categories)[1];

	this.overCategory;
	this.overComparativesButton;

	this.dYInfoPanel;

	this.overInfoPanel=-1;
	this.previousOverInfoPanel;

	this.info = new Info(this.infoInstancesY+15, this.PANEL_WIDTH);
}


Panel.prototype.draw=function(){
	this.drawBackground();
	this.drawHeader();

	this.overInfoInstance = -1;

	if(this.infoInstances.length==0){
		this.info.draw();
	} else {
		tweetButtonDiv.setAttribute('style', 'position:absolute;top:-1000px;left:0px;z-index:30;');
	}

	for(var i=0;this.infoInstances[i]!=null;i++){
		this.infoInstances[i].y = 0.8*this.infoInstances[i].y + 0.2*this.infoInstances[i].yFinal;
		if(i>0){
			this.infoInstances[i-1].yBelow = this.infoInstances[i].y;
			this.infoInstances[i-1].draw();
		}
		if(this.infoInstances[i+1]!=null && mouseY>this.infoInstances[i].y && mouseY<this.infoInstances[i+1].y) this.overInfoPanel = i;
	}
	if(i>0){
		this.infoInstances[i-1].yBelow = canvasHeight-25;
		this.infoInstances[i-1].draw();
		if(mouseY>this.infoInstances[i-1].y) this.overInfoPanel = i-1;
	}



	if(mouseY<this.infoInstancesY || mouseX>this.PANEL_WIDTH){
		this.overInfoPanel = -1;
	}

	if(this.previousOverInfoPanel!=this.overInfoPanel){
		this.relocate();
		this.previousOverInfoPanel=this.overInfoPanel;
	}

	this.drawCompareButton();

	this.overComparativesButton = mouseY>canvasHeight-25;
	if(this.overComparativesButton) canvas.style.cursor='pointer';


}


Panel.prototype.drawCompareButton=function(){
	context.fillStyle = 'rgb(150,150,150)';
	context.fillRect(0,canvasHeight-25, this.PANEL_WIDTH, 25);

	DrawTexts.setContextTextProperties('rgba(255, 255, 255, '+(0.8 + 0.2*Math.cos(nFrame*0.14))+')', 18);
	if(vis_mode==0){
		if(this.infoInstances.length==0){
			context.fillText('select nodes by clicking', 10, canvasHeight-22);
		} else if(this.infoInstances.length==1){
			context.fillText('you can select more', 10, canvasHeight-22);
		} else if(this.infoInstances.length==2){
			context.fillText('select more (min 3) to compare', 10, canvasHeight-22);
		} else {
			context.fillText('click here to compare selected', 10, canvasHeight-22);
		}
	} else {
		context.fillText('back to network', 10, canvasHeight-22);
	}
}

Panel.prototype.drawHeader=function(){
	DrawTexts.setContextTextProperties('black', 33, 'Arial', null, null, 'bold');
	context.fillText('data visualization', 9, 5);
	DrawTexts.setContextTextProperties('black', 29, 'Arial', null, null, 'bold');
	context.fillText('references network', 9, 28);

	DrawTexts.setContextTextProperties('rgb(100,100,100)', 17, 'Arial', null, null, 'bold');
	context.fillText('A navigable selection of sites and', 9, 60);
	context.fillText('resources about data visualization', 9, 76);

	//DrawTexts.setContextTextProperties('black', 14, 'Arial', null, null, 'bold');
	//context.fillText('+ click here for more info and data', 7, 96);

	this.overCategory = null;

	this.overCategory = this.drawNodeIcon('blogs', 130, 'blogs', this.categoryNumbers[0]);
	this.overCategory = this.drawNodeIcon('companies/studios', 150, 'studios', this.categoryNumbers[1]) || this.overCategory;
	this.overCategory = this.drawNodeIcon('people', 170, 'people', this.categoryNumbers[2]) || this.overCategory;
	this.overCategory = this.drawNodeIcon('resources/tools/applications/frameworks', 190, 'tools', this.categoryNumbers[3]) || this.overCategory;
	this.overCategory = this.drawNodeIcon('books', 210, 'books', this.categoryNumbers[4]) || this.overCategory;

	if(this.infoInstances.length>0){
		DrawTexts.setContextTextProperties('gray', 10, 'Arial');
		context.fillText('x deselect all', 220, this.infoInstancesY-22);
		this.overDeselectAll = this.overCategory==null && mouseY<this.infoInstancesY && mouseY>this.infoInstancesY-22 && mouseX<this.PANEL_WIDTH && mouseX>220;
	} else {
		this.overDeselectAll = false;
	}

	if(this.overCategory!=null || this.overDeselectAll) canvas.style.cursor='pointer';
}

Panel.prototype.drawBackground=function(){
	context.fillStyle = this.PANEL_COLOR;
	context.fillRect(0,0,this.PANEL_WIDTH,canvasHeight);
}

Panel.prototype.mouseDown=function(){
	if(this.overComparativesButton){
		if(vis_mode==0){
			this.newUrlsOnComparatives();
		} else {
			vis_mode = 0;
		}
		updateHash();
	} else if(this.overDeselectAll){
		while(this.infoInstances.length>0){
			networkInterface.removeFromSelectedList(this.infoInstances[0].node);
		}
	} else if(this.overCategory!=null){
		while(this.infoInstances.length>0){
			networkInterface.removeFromSelectedList(this.infoInstances[0].node);
		}

		for(var i=0; network.nodeList[i]!=null; i++){
			if(network.nodeList[i].category == this.overCategory) networkInterface.addToSelectedList(network.nodeList[i]);
		}

	} else {
		var infoInstance;
		for(i=this.infoInstances.length-1;i>=0;i--){
			infoInstance = this.infoInstances[i];
			if(infoInstance.mouseOnInfoInstance()) {
				infoInstance.mouseDown();
				break;
			}
		}
	}
}
Panel.prototype.newUrlsOnComparatives=function(){
	var urls = new StringList();
	var titles = new StringList();
	for(var i=0;this.infoInstances[i]!=null;i++){
		urls[i] = this.infoInstances[i].node.url;
		titles[i] = this.infoInstances[i].node.id;
	}
	if(urls.length>2){
		vis_mode = 1;
		comparatives.setUrls(urls, titles);
	} else {
		vis_mode = 0;
	}
}


Panel.prototype.drawNodeIcon=function(type, y, label, number){
	context.fillStyle = 'black';
	context.beginPath();
	context.arc(19, y , 7, 0, TwoPi);
	context.fill();

	drawIcon(type, 19, y, 1, 1, 'white');

	DrawTexts.setContextTextProperties('black', 14, 'Arial', null, null, 'bold');
	context.fillText(label, 30, y-9);

	DrawTexts.setContextTextProperties('rgb(200,200,200)', 22, 'Arial', null, null, 'bold');
	context.fillText(number, 90, y-14);

	if(mouseX<this.PANEL_WIDTH - 100 && mouseX > 10 && mouseY>y-10 && mouseY<y+10) return type;
}



///////// selected

Panel.prototype.addSelected=function(node){
	var infoInstance = new ResourceInfo(node);
	this.infoInstances.push(infoInstance);
	this.heightChanged();
	this.checkOpenned();
	updateHash();
}

Panel.prototype.removeSelected=function(node){
	var i;
	for(i=0;this.infoInstances[i]!=null;i++){
		if(this.infoInstances[i].node == node){
			this.infoInstances.removeElement(this.infoInstances[i]);
			break;
		}
	}

	this.heightChanged();

	if(vis_mode==1){
		this.newUrlsOnComparatives();
	}

	this.checkOpenned();
	updateHash();
}

Panel.prototype.heightChanged=function(){
	this.dYInfoPanel = (canvasHeight - this.infoInstancesY - 25)/this.infoInstances.length;

	this.relocate();

	this.info.resize();
}

Panel.prototype.relocate=function(){
	if(this.overInfoPanel==-1 || this.infoInstances[this.overInfoPanel].height<=this.dYInfoPanel){
		var dY = this.dYInfoPanel;
		var jump=-1;
	} else {
		dY = (canvasHeight - this.infoInstancesY - 25 - (this.infoInstances[this.overInfoPanel].height-this.dYInfoPanel))/(this.infoInstances.length);
		jump = 0;
	}



	for(var i=0;this.infoInstances[i]!=null;i++){
		this.infoInstances[i].yFinal = this.infoInstancesY + i*dY + jump;
		if(jump==0 && i==this.overInfoPanel) jump+=this.infoInstances[i].height-dY;
		//yy+=this.infoInstances[i].height;
	}
}

Panel.prototype.checkOpenned=function(){
	for(var i=0;this.infoInstances[i]!=null;i++){
		this.infoInstances[i].checkOpenned();
	}
}

Panel.prototype.isOpen=function(nodeName){
	//c.log("............isOpen | nodeName:", nodeName);
	for(var i=0;this.infoInstances[i]!=null;i++){
		//c.log("___", i, this.infoInstances[i].node.id);
		if(this.infoInstances[i].node.id==nodeName) return true;
	}
	return false;
}
