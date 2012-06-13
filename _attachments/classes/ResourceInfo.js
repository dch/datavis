ResourceInfo.prototype.constructor=Panel;


function ResourceInfo(node){
	this.node = node;

	c.log("::::: CREATED: node.name:", node.name);

	this.y=1000;
	this.yFinal=0;

	this.yBelow;

	var index = urlsList.indexOf(node.url);

	this.tagsWeights = numberTable[index].getNormalizedToMax();

	this.tags = new StringList();
	this.positions = new Polygon();
	this.textSizes = new NumberList();
	this.colors = new ColorList();

	//colors on tags

	var node;
	var xx = 4;
	var yy = 45;
	var tag;
	var wT;

	var sT;
	var maxST = 0;
	//c.log("this.tagsWeights", this.tagsWeights);

	for(i=0;this.tagsWeights[i]!=null;i++){
		//c.log("t:", i,  Math.floor(this.tagsWeights[i]*28), tags[i]);
		tag = tags[i];
		sT = Math.floor(Math.sqrt(this.tagsWeights[i])*16+2);
		if(sT>8){
			this.tags.push(tag);
			this.textSizes.push(sT);
			maxST = Math.max(maxST, sT);
			DrawTexts.setContextTextProperties('black', sT, 'Arial', null, 'alphabetic', 'bold');
			wT = context.measureText(tag).width;
			if(xx+wT>panel.PANEL_WIDTH-8){
				xx = 4;
				yy+=16;//maxST*1.1;
				maxST = 0;
			}
			//context.fillText(tag, xx, yy);
			this.positions.push(new Point(xx, yy));
			xx+=wT+4;
			//
			node = network.nodeList.getNodeById(tag);
			this.colors.push(colorFromHardness(node.hardnessValue, 0.9));
		}
	}

	//title

	DrawTexts.setContextTextProperties('black', 14, 'Arial', null, null, 'bold');
	this.widthTitle = context.measureText(this.node.id).width;

	this.deselectText = this.widthTitle>190?"x":"x deselect";
	this.xDeselect =    this.widthTitle>190?-12:-55;



	//related items

	this.relatedNodesNames = new StringList();
	this.relatedNodesTypes = new StringList();
	this.openned = new List();

	var otherNode = itemsNetwork.nodeList.getNodeById(this.node.id);
	var weights = new NumberList();

	if(otherNode!=null){
		for(i=0; i<otherNode.nodeList.length; i++){
			this.relatedNodesNames.push(otherNode.nodeList[i].name);
			//c.log(":::this.relatedNodesNames.push -> otherNode.nodeList[i].name:", otherNode.nodeList[i].name);
			this.relatedNodesTypes.push(network.nodeList.getNodeById(otherNode.nodeList[i].id).category);
			weights.push(otherNode.relationList[i].weight+i*0.0001);
		}

		this.relatedNodesNames = ListOperators.sortListByNumberList(this.relatedNodesNames, weights);
		this.relatedNodesTypes = ListOperators.sortListByNumberList(this.relatedNodesTypes, weights);
		weights = ListOperators.sortListByNumberList(weights, weights);

		var subInterval = new Interval(0, Math.min(this.relatedNodesNames.length, 4));
		this.relatedNodesNames = this.relatedNodesNames.getSubList(subInterval);
		this.relatedNodesTypes = this.relatedNodesTypes.getSubList(subInterval);
	}

	this.yyTags = yy+17;
	this.height = yy+30+this.relatedNodesNames.length*16;
}

ResourceInfo.prototype.checkOpenned = function(){
	for(var i=0;this.relatedNodesNames[i]!=null;i++){
		this.openned[i] = panel.isOpen(this.relatedNodesNames[i]);
	}
}

ResourceInfo.prototype.draw=function(){
	this.drawBackground();
	this.drawDeselect();

	this.drawNodeIcon();

	DrawTexts.setContextTextProperties('black', 14, 'Arial', null, null, 'bold');
	context.fillText(this.node.id, 25, this.y + 6);

	context.drawImage(launchIcon, this.widthTitle+28, this.y + 7, 17, 15);

	if(this.mouseOnInfoInstance()){
		if(this.mouseOnDeselect() || this.mouseOnLink()) canvas.style.cursor='pointer';
	}

	if(this.y+30 > this.yBelow) return;

	this.drawTags();

	if(this.y+this.yyTags > this.yBelow) return;

	this.drawRelated();
}

ResourceInfo.prototype.drawRelated=function(){
	DrawTexts.setContextTextProperties('black', 12, 'Arial');
	var yy;

	var mouseOnList = mouseX>20 && mouseX<panel.PANEL_WIDTH-20 && mouseY>this.y + this.yyTags && mouseY<this.y+this.height-10;

	for(var i=0;this.relatedNodesNames[i]!=null;i++){
		yy = this.y + this.yyTags + i*16;
		drawIcon(this.relatedNodesTypes[i], 22, yy+7, 1, 1, 'black');
		context.fillText(this.relatedNodesNames[i], 30, yy);
		if(this.openned[i]){
			context.fillRect(10, yy+6, 3, 3);
			if(mouseY>yy && mouseY<yy+16) mouseOnList=false;
		}
	}

	if(mouseOnList) canvas.style.cursor='pointer';
}

ResourceInfo.prototype.drawTags=function(){
	for(var i=0;this.tags[i]!=null;i++){
		DrawTexts.setContextTextProperties(this.colors[i], this.textSizes[i], 'Arial', null, 'alphabetic', 'bold');
		context.fillText(this.tags[i], this.positions[i].x, this.positions[i].y+this.y);
	}
}

ResourceInfo.prototype.drawNodeIcon=function(){
	context.fillStyle = 'black';
	context.beginPath();
	context.arc(12,this.y + 13, 7, 0, TwoPi);
	context.fill();

	drawIcon(this.node.category, 12, this.y+13, 1, 1, 'white');
}



ResourceInfo.prototype.drawDeselect=function(){
	DrawTexts.setContextTextProperties('gray', 10, 'Arial', null, null, null);
	context.fillText(this.deselectText, panel.PANEL_WIDTH + this.xDeselect, this.y + 4);
}
ResourceInfo.prototype.drawBackground=function(){
	context.save();

	context.shadowOffsetX=-2;
	context.shadowOffsetY=-3;
	context.shadowBlur=8;
	context.shadowColor='rgba(0,0,0,0.2)';

	context.fillStyle = 'rgba(255,255,255,1)'
	context.fillRect(0, this.y, panel.PANEL_WIDTH,canvasHeight);//this.height);

	context.restore();
}

ResourceInfo.prototype.mouseDown=function(){
	if(this.mouseOnLink()){
		 window.open(this.node.url);
	} else if(this.mouseOnDeselect()){
		networkInterface.removeFromSelectedList(this.node);
	} else if(mouseX>20 && mouseX<panel.PANEL_WIDTH){

		for(var i=0;this.relatedNodesNames[i]!=null;i++){
			yy = this.y + this.yyTags + i*16;
			if(mouseY>yy && mouseY<yy+16){
				networkInterface.addToSelectedList(network.nodeList.getNodeById(this.relatedNodesNames[i]));
				if(vis_mode==1) panel.newUrlsOnComparatives();
			}
		}
	}
}


ResourceInfo.prototype.mouseOnInfoInstance=function(){
	return mouseX<panel.PANEL_WIDTH && mouseY>this.y-10 && mouseY<this.y + this.height;
}

ResourceInfo.prototype.mouseOnDeselect=function(){
	return mouseY<this.y+16 && mouseX>(this.deselectText=="x"?280:240);
}

ResourceInfo.prototype.mouseOnLink=function(){
	return mouseX<(this.deselectText=="x"?275:235) && mouseY>this.y+6 && mouseY<this.y+20;
}
