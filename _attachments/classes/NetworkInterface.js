function NetworkInterface(){};

function NetworkInterface(){
	this.CURVES = false;

	this.nodeHovered;
	this.selectedList = new List();

	Loader.loadData("./resources/network.gdf", this.loadedGDF, this);
	//Loader.loadData("./resources/networkTests.gdf", this.loadedGDF, this);
}

NetworkInterface.prototype.loadedGDF=function(e){
	network = NetworkEncodings.decodeGDF(e.result);

	this.nodes = network.nodeList;
	this.relations = network.relationList;

	this.followMousePoint = new Point();
	this.kZ=0.018; //bigger -> wider
	this.qZ=6;

	this.minMaxX = new Interval(1000,-1000);
	this.minMaxY = new Interval(1000,-1000);

	var i;
	var index;

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		if(node.nodeType=='tag'){
			node.r = 5*node.weight+3;
		} else {
			node.r = 3*node.weight;
		}

		this.minMaxX.x = Math.min(node.x, this.minMaxX.x);
		this.minMaxX.y = Math.max(node.x, this.minMaxX.y);
		this.minMaxY.x = Math.min(node.y, this.minMaxY.x);
		this.minMaxY.y = Math.max(node.y, this.minMaxY.y);

		node.hl = 0;

		index = urlsList.indexOf(node.url);
		node.category = categories[index];
	}

	for(i=0;this.relations[i]!=null;i++){
		relation = this.relations[i];
		relation.factor = Math.sqrt(Math.pow(relation.node0.x-relation.node1.x, 2)+Math.pow(relation.node0.y-relation.node1.y, 2))*0.015;
	}

	networkBuilt();

	resizeWindow();

	tagsColorsSoft = new ColorList();
	tagsColorsHard = new ColorList();
	var node;

	c.log("_________________________ tags.length", tags.length);

	for(var i=0; tags[i]!=null; i++){
		node = network.nodeList.getNodeById(tags[i]);
		//c.log(i, node, node.id);
		node.color = colorFromHardness(node.hardnessValue, 0.5);
		tagsColorsSoft.push(node.color);
		tagsColorsHard.push(colorFromHardness(node.hardnessValue), 0.9);
	}

	comparatives = new Comparatives();

	var nChars = 4;
	var char0 = 2;

	for(i=0; network.nodeList[i]!=null;i++){
		node = network.nodeList[i];
		if(node.nodeType!="tag"){
			md = MD5.hex_md5(node.url);
			node.miniHash = md.substr(char0,nChars);
		}
	}

	// testing repetitions

	if(TEST_REPETITIONS){
		c.log("///////////////////////////////////////////// TEST REPETITIONS");
		var j;
		for(i=0; network.nodeList[i]!=null;i++){
			for(j=i+1; network.nodeList[j]!=null;j++){
				if(network.nodeList[i].nodeType!="tag" && network.nodeList[j].nodeType!="tag" &&  network.nodeList[i].miniHash==network.nodeList[j].miniHash){
					c.log("\n\n [!] BAD LUCK: ", i, j, network.nodeList[i].name, network.nodeList[j].name, network.nodeList[i].url, network.nodeList[j].url, network.nodeList[i].miniHash, network.nodeList[j].miniHash);
				}
			}
		}
		c.log("/////////////////////////////////////////////TR");
	}

	if(hashTag!=null && hashTag!=""){
		var initVisMode = Number(hashTag.charAt(1));
		var cleanHashtag = hashTag.substr(2);
		var miniHash;
		var j;
		for(i=0; i<cleanHashtag.length/nChars; i++){
			miniHash = cleanHashtag.substr(i*nChars, nChars);
			//c.log("miniHash::::["+miniHash+"]");
			for(j=0; network.nodeList[j]!=null;j++){
				node = network.nodeList[j];
				if(node.nodeType!="tag"){
					if(node.miniHash==miniHash){
						this.nodeHovered = node;
						this.mousedown();
					}
				}
			}
		}

		if(initVisMode==1 && panel.infoInstances.length>2){
			panel.overComparativesButton = true;
			panel.mouseDown();
		}
	}

	//////////////// 3 pre-selected for tests purpose

	// this.nodeHovered = network.nodeList.getNodeById("visualisingdata.com");
	// this.mousedown();
	// this.nodeHovered = network.nodeList.getNodeById("datavisualization.ch");
	// this.mousedown();
	// this.nodeHovered = network.nodeList.getNodeById("flowingdata.com");
	// this.mousedown();
	// this.nodeHovered = network.nodeList.getNodeById("infosthetics.com");
	// this.mousedown();
	// this.nodeHovered = network.nodeList.getNodeById("visualizing.org");
	// this.mousedown();

	////////////////
}

NetworkInterface.prototype.mousedown=function(e){
	if(this.nodeHovered!=null && this.nodeHovered.nodeType=='url'){
		c.log("this.nodeHovered.selected", this.nodeHovered.selected);
		if(this.nodeHovered.selected){
			this.removeFromSelectedList(this.nodeHovered);
		} else {
			this.addToSelectedList(this.nodeHovered);
		}
		c.log("this.selectedList", this.selectedList);
	}
}
NetworkInterface.prototype.addToSelectedList=function(node){
	if(this.selectedList.indexOf(node)==-1){
		node.selected = true;
		this.selectedList.push(node);
		panel.addSelected(node);
	}
}
NetworkInterface.prototype.removeFromSelectedList=function(node){
	node.selected = false;
	this.selectedList.removeElement(node);
	panel.removeSelected(node);
}

NetworkInterface.prototype.setFrame=function(frame){
	this.frame = frame;
	var margin = Math.min(canvasHeight, canvasWidth)*0.04;
	this.frame.x+=margin;
	this.frame.y+=margin;
	this.frame.width-=2*margin;
	this.frame.height-=2*margin;

	var kX = this.frame.width/this.minMaxX.getAmplitude();
	var kY = this.frame.height/this.minMaxY.getAmplitude();

	c.log("this.frame", this.frame);

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		node.x = this.frame.x + (node.x-this.minMaxX.x)*kX;
		node.y = this.frame.y + (node.y-this.minMaxY.x)*kY;
	}

	this.minMaxX = new Interval(1000,-1000);
	this.minMaxY = new Interval(1000,-1000);

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		this.minMaxX.x = Math.min(node.x, this.minMaxX.x);
		this.minMaxX.y = Math.max(node.x, this.minMaxX.y);
		this.minMaxY.x = Math.min(node.y, this.minMaxY.x);
		this.minMaxY.y = Math.max(node.y, this.minMaxY.y);
	}
}

NetworkInterface.prototype.draw=function(){
	this.followMousePoint.x = 0.8*this.followMousePoint.x + 0.2*mousePoint.x;
	this.followMousePoint.y = 0.8*this.followMousePoint.y + 0.2*mousePoint.y;

	var i;
	var p0 = new Point();

	//////////////////////////relations

	var relation;
	var p1 = new Point();
	var r1;
	var k;

	var a;

	for(i=0;this.relations[i]!=null;i++){
		relation = this.relations[i];

		p0 = new Point(relation.node0.x, relation.node0.y);
		p0 = this.zoomTransformation(p0);

		p1 = new Point(relation.node1.x, relation.node1.y);
		p1 = this.zoomTransformation(p1);

		context.lineWidth = Math.sqrt(relation.weight)*5+0.5;
		context.strokeStyle = relation.node0.color;
		context.beginPath();
		r = relation.node0.r;
		if(this.CURVES){

			context.moveTo(p0.x+r*Math.cos(relation.angle0), p0.y+r*Math.sin(relation.angle0));

			r = r*relation.factor;
			k = 8*relation.factor;

			context.bezierCurveTo(p0.x+r*Math.cos(relation.angle0), p0.y+r*Math.sin(relation.angle0),
				p1.x+k*Math.cos(relation.angle1), p1.y+k*Math.sin(relation.angle1),
				p1.x, p1.y
				);
		} else {
			a = p0.angleToPoint(p1);
			//c.log(a);
			context.moveTo(p0.x + r*Math.cos(a), p0.y + r*Math.sin(a));
			context.lineTo(p1.x , p1.y );
		}
		context.stroke();

	}

	//////////////////////////nodes

	var node;
	var r;
	var circleColor = 'rgba(0,0,0,0.8)';
	var wT;
	var textSize;

	var j;
	var angles;
	var indexes;
	var otherNode;
	var factor;

	var alphaAura;

	var hoveredThisFrame = false;

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		p0 = new Point(node.x, node.y);
		p0 = this.zoomTransformation(p0);

		if(this.nodeHovered!=null && node.nodeList.indexOf(this.nodeHovered)!=-1){
			node.hl = 0.9*node.hl + 0.1;
		} else {
			node.hl*=0.9;
		}

		if(node.nodeType=='tag'){
			r = (3*Math.sqrt(node.weight)+2)*p0.z*(1+node.hl*0.7)*0.7;
			node["r"] = r;

			if(p0.distanceToPoint(mousePoint)<r*1.2){
				this.nodeHovered = node;
				node.hovered = true;
				hoveredThisFrame = true;
			} else {
				node.hovered = false;
			}

			circleColor = node.color;

			context.fillStyle = circleColor;
			context.beginPath();
			context.arc(p0.x, p0.y, r, 0, TwoPi);
			context.fill();

			alphaAura = node.hovered?0.5:node.hl*0.4;

			if(alphaAura>0.01){
				context.strokeStyle = 'rgba(0,0,0,'+alphaAura+')';
				context.lineWidth = 8;
				context.beginPath();
				context.arc(p0.x, p0.y, r*1.08+10, 0, TwoPi);
				context.stroke();
			}

			context.font = '12px Arial';
			wT = context.measureText(node.id).width;
			textSize = Math.floor(2*r*12/wT);
			if(textSize>6){
				context.textBaseline = 'middle';
				context.textAlign = 'center';

				context.font = textSize+'px Arial';

				context.fillStyle = 'white';
				context.fillText(node.id, p0.x, p0.y);
			}

		} else {
			r = p0.z*Math.sqrt(node.weight+0.1)*(1+node.hl);

			if(p0.distanceToPoint(mousePoint)<(r*1.2+5)){
				this.nodeHovered = node;
				node.hovered = true;
				hoveredThisFrame = true;
				canvas.style.cursor='pointer';
			} else {
				node.hovered = false;
			}

			context.fillStyle = 'black';
			context.beginPath();
			context.arc(p0.x, p0.y, r, 0, TwoPi);
			context.fill();

			if(r>=5) drawIcon(node.category, p0.x, p0.y, r*0.17, r*0.17, 'white');

			alphaAura = alphaAura = node.selected?0.9:(node.hovered?0.5:node.hl*0.4);

			if(alphaAura>0.01){
				context.strokeStyle = 'rgba(0,0,0,'+alphaAura+')';
				context.lineWidth = 7;
				context.beginPath();
				context.arc(p0.x, p0.y, r*1.08+8, 0, TwoPi);
				context.stroke();
			}

			context.textBaseline = 'top';
			context.textAlign = 'left';

			textSize = 1.4*r+4.5;
			if(textSize>8){
				context.font = textSize+'px Arial';
				wT = context.measureText(node.id).width;

				context.fillStyle = 'black';
				context.fillText(node.id, p0.x+r*0.6, p0.y+r*0.6);
			}
		}
	}

	if(!hoveredThisFrame) this.nodeHovered = null;
}

NetworkInterface.prototype.zoomTransformation=function(point){
	var v = new Point(point.x-this.followMousePoint.x, point.y-this.followMousePoint.y);
	var norm = v.getNorm();
	var e = this.expand(norm)/norm;
	var p = this.followMousePoint.add(v.factor(e));
	return new Point3D(p.x, p.y, e);
}

NetworkInterface.prototype.expand=function(d){
	return d + (this.qZ*d/(1+(Math.pow(this.kZ*d,2))));
}
