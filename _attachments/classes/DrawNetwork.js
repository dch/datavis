Matrix.prototype.constructor=DrawNetwork;


function DrawNetwork(network){
	this.dEqRepulsors = 250;

	this.network = network;
	this.forces = new Forces(0.01, 0, 0);
	this.forces.forcesForNetwork(this.network, 500);

	var i;
	var j;

	var node0;
	var node1;
	var r0;
	var r1;

	this.nodes = this.network.nodeList;
	this.relations = this.network.relationList;

	this.forces.equilibriumDistances = new NumberList();

	for(i=0;i<this.nodes.length-1;i++){
		node0 = this.nodes[i];
		r0 = 5*Math.sqrt(node0.weight)+3;
		for(j=i+1;j<this.nodes.length;j++){
			node1 = this.nodes[j];
			r1 = 3*Math.sqrt(node1.weight);
			if(this.relations.nodesAreConnected(node0, node1)){
				this.forces.equilibriumDistances.push(20+5*(r0+r1));
			} else {
				this.forces.equilibriumDistances.push(80+8*(r0+r1));
			}
		}
	}


	this.origin = new Point();

	this.cX;
	this.cY;

	this.hardTags = new StringList("data", "math", "mathematics", "theory", "statistics", "analytics", "analysis", "business", "gis", "science", "technology");
	this.softTags = new StringList("art", "design", "illustration", "inspiration", "visual", "humor", "graphics", "cool", "animation");

	var hardnessDegree;
	var softnessDegree;
	var otherNode;
	var deg;

	var hardnessValues = new NumberList();

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		if(node.nodeType=='tag'){
			//node["color"] = ColorOperators.addAlpha(ColorOperators.greenToRed(node.weight/50+0.1), 0.5);
			//node["color"] = ColorOperators.greenToRed(node.weight/50+0.1);

			hardnessDegree=0;
			softnessDegree = 0;
			for(j=0;this.hardTags[j]!=null;j++){
				otherNode = this.network.nodeList.getNodeById(this.hardTags[j]);
				deg = NetworkOperators.degree(this.network, node, otherNode);
				if(deg==0) deg=-10;
				hardnessDegree+=deg==-1?10:deg;
			}
			for(j=0;this.softTags[j]!=null;j++){
				otherNode = this.network.nodeList.getNodeById(this.softTags[j]);
				deg = NetworkOperators.degree(this.network, node, otherNode);
				if(deg==0) deg=-10;
				softnessDegree+=deg==-1?10:deg;
			}
			hardnessValues[i] = softnessDegree/hardnessDegree;
			//node["hardnessValue"] = hardnessValues[i];
		} else {
			node["hardnessValue"] = 0;
		}
	}

	hardnessValues = hardnessValues.getNormalized();
	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		if(node.nodeType=='tag'){
			node["color"] = ColorOperators.addAlpha(ColorOperators.greenToRed(hardnessValues[i]), 0.5);
			node["hardnessValue"] = hardnessValues[i];
		}
	}

	draw_relations_mode = 1; //0: lines 1: curves 2: triangles

	addInteractionEventListener('keydown', this.key, this);
}

DrawNetwork.prototype.key=function(e){
	var i;
	var otherNode;

	for(i=0;this.relations[i]!=null;i++){
		relation = this.relations[i];
		relation.angle0 = Math.floor(relation.angle0*1000)/1000;
		relation.angle1 = Math.floor(relation.angle1*1000)/1000;
		relation.weight = Math.floor(relation.weight*100)/100;
	}
	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];
		node.x = Math.floor(node.x);
		node.y = Math.floor(node.y);
		node.weight = Math.floor(node.weight*100)/100;
		node.hardnessValue = Math.floor(node.hardnessValue*100)/100;
	}


	var gdf = NetworkEncodings.encodeGDF(this.network, new StringList("url", "x", "y", "weight", "nodeType", "hardnessValue"), new StringList("weight", "angle0", "angle1"));
	c.log("\n\n\n");
	c.log(gdf);

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];

		if(node.nodeList.length==1){
			otherNode = node.nodeList[0];
			if(Math.pow(otherNode.x-node.x, 2)+Math.pow(otherNode.y-node.y, 2)>200){
				node.x = node.x + 0.8*(otherNode.x-node.x);
				node.y = node.y + 0.8*(otherNode.y-node.y);
			}
		}
	}
}

DrawNetwork.prototype.draw=function(){
	this.forces.calculate();
	this.forces.attractionToPoint(this.origin, 1000, 0.01);
	this.forces.applyForces();

	this.cX = canvasWidth*0.5;
	this.cY = canvasHeight*0.5;

	var i;

	//relations

	var angle;
	var relation;
	var p0 = new Point();
	var p1 = new Point();
	var r1;

	for(i=0;this.relations[i]!=null;i++){
		relation = this.relations[i];

		switch(draw_relations_mode){
			case 0: //lines
				context.lineWidth = relation.weight*12;
				context.strokeStyle = relation.node0.color;
				context.beginPath();
				r = relation.node0.r;
				context.moveTo(relation.node0.x+this.cX+r*Math.cos(relation.angle0), relation.node0.y+this.cY+r*Math.sin(relation.angle0));
				context.lineTo(relation.node1.x+this.cX, relation.node1.y+this.cY);
				context.stroke();
				break;
			case 1: //curves
				context.lineWidth = Math.sqrt(relation.weight)*4+2;
				context.strokeStyle = relation.node0.color;
				context.beginPath();
				r = relation.node0.r;
				context.moveTo(relation.node0.x+this.cX+r*Math.cos(relation.angle0), relation.node0.y+this.cY+r*Math.sin(relation.angle0));
				//context.lineTo(relation.node1.x+this.cX, relation.node1.y+this.cY);
				r = r*4;

				context.bezierCurveTo(relation.node0.x+this.cX+r*Math.cos(relation.angle0), relation.node0.y+this.cY+r*Math.sin(relation.angle0),
					relation.node1.x+this.cX+40*Math.cos(relation.angle1), relation.node1.y+this.cY+40*Math.sin(relation.angle1),
					relation.node1.x+this.cX, relation.node1.y+this.cY
					);
				context.stroke();
				break;
			case 2: //triangles
				context.fillStyle = relation.node0.color;

				r = relation.node0.r;

				p0.x = relation.node0.x+this.cX+r*Math.cos(relation.angle0);
				p0.y = relation.node0.y+this.cY+r*Math.sin(relation.angle0);

				p1.x = relation.node1.x+this.cX;
				p1.y = relation.node1.y+this.cY;

				context.beginPath();
				Draw.drawArrowTriangle(context, p0, p1, relation.weight*20);

				context.fill();
				break;
		}

	}

	//nodes

	var node;
	var r;
	var circleColor = 'rgba(0,0,0,0.8)';
	var textColor;
	var wT;
	var textSize;

	var j;
	var angles;
	var indexes;
	var otherNode;
	var factor;

	for(i=0;this.nodes[i]!=null;i++){
		node = this.nodes[i];

		if(node.nodeType=='tag'){
			context.textBaseline = 'middle';
			context.textAlign = 'center';

			r = 5*Math.sqrt(node.weight)+3;
			node["r"] = r;
			textColor = 'white';
			circleColor = node.color; // ColorOperators.sqrtTemperature(node.weight/50+0.1);

			context.font = '12px Arial';
			wT = context.measureText(node.name).width;

			textSize = Math.max(Math.floor(2*r*12/wT), 9);

			context.font = textSize+'px Arial';

			context.fillStyle = circleColor;
			context.beginPath();
			context.arc(node.x+this.cX, node.y+this.cY, r, 0, TwoPi);
			context.fill();

			context.fillStyle = textColor;
			context.fillText(node.name, node.x+this.cX, node.y+this.cY);

		} else {
			r = 3*Math.sqrt(node.weight);
			context.fillStyle = 'black';
			context.beginPath();
			context.arc(node.x+this.cX, node.y+this.cY, r, 0, TwoPi);
			context.fill();

			context.textBaseline = 'top';
			context.textAlign = 'left';

			textSize = Math.floor(Math.min(Math.max(r, 9), 24));
			context.font = textSize+'px Arial';
			wT = context.measureText(node.name).width;

			context.fillStyle = 'black';
			context.fillText(node.name, node.x+this.cX+r*0.6, node.y+this.cY+r*0.6);
		}

		angles = new NumberList();

		for(j=0;node.nodeList[j]!=null;j++){
			otherNode = node.nodeList[j];

			angles[j] = -Math.atan2(otherNode.y-node.y, otherNode.x-node.x)+Math.PI;
			if(j==0) dA = angles[j]-Math.PI;
		}
		indexes = angles.getSortIndexes();
		var dA = angles[indexes[0]];
		factor = TwoPi/node.nodeList.length;
		if(node.nodeType=='tag'){
			for(j=0;node.nodeList[j]!=null;j++){
				node.relationList[indexes[j]]["angle0"] = j*factor-Math.PI-dA;
			}
		} else {
			for(j=0;node.nodeList[j]!=null;j++){
				node.relationList[indexes[j]]["angle1"] = j*factor-Math.PI-dA;
			}
		}

		// node.x = Math.max(node.x, -this.cX);
		// node.y = Math.max(node.y, -this.cX);
		// node.x = Math.min(node.x, 1000-this.cX);
		// node.y = Math.min(node.y, 1000-this.cX);
	}
}
