function Comparatives(){};

function Comparatives(){
	this.intervalsTable;
	this.frame;
	this.titles;
	this.subUrlsList;

	this.prevNHovered;
	this.colors = tagsColorsSoft;

	this.zoom = 1;
	this.finalZoom = 1;

	this.angles;
	this.nToFlip;
	this.nOther;
	this.a0;
	this.a1;

	this.angle0 = 0;

	this.flipping=false;
	this.unflipping=false;

	this.drag = new DragDetection(2, this.dragging, this);
	this.drag.center = new Point(panel.PANEL_WIDTH + (canvasWidth-panel.PANEL_WIDTH)*0.5, canvasHeight*0.5);

	addInteractionEventListener('mousewheel', this.onWheel, this);
}

Comparatives.prototype.setUrls = function(subUrlsList, titles, flipping){
	this.subUrlsList = subUrlsList;
	this.titles = titles;

	flipping = flipping==null?false:flipping;

	var indexes = ListOperators.indexesOfElements(urlsList, subUrlsList);
	var subNumberTable = numberTable.getSubListByIndexes(indexes);

	this.intervalsTable = NumberTableFlowOperators.flowTableIntervals(subNumberTable.getTransposed(), true, true);
	this.intervalsTable = IntervalTableOperators.scaleIntervals(this.intervalsTable, 0.97);

	if(!flipping){
		this.angles = new NumberList();
		var dA = TwoPi/this.titles.length;
		for(var i=0; this.titles[i]!=null; i++){
			this.angles[i] = i*dA;
		}
	}
}


Comparatives.prototype.mousedown=function(e){
	if(this.overTriangle!=-1){
		this.nToFlip = Math.floor(this.overTriangle*0.5);
		this.nOther = (this.nToFlip+ (Number(this.overTriangle*0.5-this.nToFlip == 0)*2-1)+this.titles.length)%this.titles.length;

		this.flipping = true;

		this.a0 = this.angles[this.nToFlip];
		this.a1 = this.angles[this.nOther];
	}
}
Comparatives.prototype.flip = function(){
	var pivot = this.subUrlsList[this.nOther];

	this.subUrlsList[this.nOther] = this.subUrlsList[this.nToFlip];
	this.subUrlsList[this.nToFlip] = pivot;

	pivot = this.titles[this.nOther];
	this.titles[this.nOther] = this.titles[this.nToFlip];
	this.titles[this.nToFlip] = pivot;

	this.setUrls(this.subUrlsList, this.titles, true);
}

Comparatives.prototype.onWheel=function(e){
	if(vis_mode!=1) return;
	this.finalZoom += e.value*this.finalZoom*0.01;
	this.finalZoom = Math.min(Math.max(this.finalZoom, 0.1), 100);
}
Comparatives.prototype.dragging = function(polarVector){
	if(vis_mode!=1) return;
	this.finalZoom += polarVector.x*this.finalZoom*0.003;
	this.finalZoom = Math.min(Math.max(this.finalZoom, 0.1), 100);

	this.angle0+=polarVector.y;
	if(this.angle0>Math.PI) this.angle0-=TwoPi;
	if(this.angle0<-Math.PI) this.angle0+=TwoPi;
}



Comparatives.prototype.draw = function(){
	if(this.flipping){
		var dA = TwoPi/this.titles.length;
		if(this.nOther>this.nToFlip){
			if(this.nOther>this.nToFlip+1){
				this.angles[this.nToFlip] = 0.9*this.angles[this.nToFlip] + 0.1*(this.a1-TwoPi);
				this.angles[this.nOther] = 0.9*this.angles[this.nOther] + 0.1*(this.a0+TwoPi);
				if(this.angles[this.nToFlip]+TwoPi<this.angles[this.nOther]){
					this.flipping = false;
					this.unflipping = true;
					this.flip();
				}
			} else {
				this.angles[this.nToFlip] = 0.9*this.angles[this.nToFlip] + 0.1*this.a1;
				this.angles[this.nOther] = 0.9*this.angles[this.nOther] + 0.1*this.a0;
				if(this.angles[this.nToFlip]>=this.angles[this.nOther]){
					this.flipping = false;
					this.unflipping = true;
					this.flip();
				}
			}
		} else {
			if(this.nToFlip>this.nOther+1){
				this.angles[this.nToFlip] = 0.9*this.angles[this.nToFlip] + 0.1*(this.a1+TwoPi);
				this.angles[this.nOther] = 0.9*this.angles[this.nOther] + 0.1*(this.a0-TwoPi);
				if(this.angles[this.nToFlip]-TwoPi>this.angles[this.nOther]){
					this.flipping = false;
					this.unflipping = true;
					this.flip();
				}
			} else {
				this.angles[this.nToFlip] = 0.9*this.angles[this.nToFlip] + 0.1*this.a1;
				this.angles[this.nOther] = 0.9*this.angles[this.nOther] + 0.1*this.a0;
				if(this.angles[this.nToFlip]<=this.angles[this.nOther]){
					this.flipping = false;
					this.unflipping = true;
					this.flip();
				}
			}
		}

	} else if(this.unflipping){
		var dA = TwoPi/this.titles.length;
		this.angles[this.nToFlip] = 0.9*this.angles[this.nToFlip] + 0.1*this.a0;
		this.angles[this.nOther] = 0.9*this.angles[this.nOther] + 0.1*this.a1;
		if(Math.abs(this.a0 - this.angles[this.nToFlip])<0.01){
			this.unflipping = false;
			c.log(this.angles);
		}
	}

	DrawTexts.setContextTextProperties('black', 12);
	context.fillText('drag to rotate and zoom | mouse wheel to zoom', canvasWidth-270, canvasHeight-14);

	this.zoom = 0.8*this.zoom + 0.2*this.finalZoom;

	this.frame = new Rectangle(panel.PANEL_WIDTH, 0, canvasWidth-panel.PANEL_WIDTH,canvasHeight);

	var center = new Point(panel.PANEL_WIDTH + (canvasWidth-panel.PANEL_WIDTH)*0.5, canvasHeight*0.5);
	this.drag.center = center;

	var minSize = Math.min(canvasHeight, canvasWidth - panel.PANEL_WIDTH);

	var r0 = minSize*0.06;
	var rT = minSize*0.48;
	var radius = r0 + (0.45*minSize - 50)*this.zoom;

	var anglesRotated = this.angles.add(this.angle0);

	var nHovered = IntervalTableDraw.drawCircularIntervalsFlowTable(context, this.intervalsTable, center, radius, r0, this.colors, tags, true, anglesRotated);

	if(nHovered!=this.prevNHovered){
		if(nHovered==-1){
			this.colors = tagsColorsSoft;
		} else {
			this.colors = tagsColorsSoft.clone();
			this.colors[nHovered] = 'rgba(255,0,0,0.6)';
		}
		this.prevNHovered = nHovered;
	}

	//var dA = TwoPi/this.titles.length;
	var a;
	var xT;
	var yT;
	var wT;
	var rA;

	this.overTriangle = -1;

	var s = rT*0.03;

	for(var j=0;this.titles[j]!=null;j++){
		DrawTexts.setContextTextProperties('white', s, 'Arial', 'center', 'middle');

		wT = context.measureText(this.titles[j]).width

		a = anglesRotated[j];

		xT = rT*Math.cos(a)+center.x;
		yT = rT*Math.sin(a)+center.y;

		context.save();
		context.translate(xT, yT);
		context.rotate(a+Math.PI*0.5);

		context.fillStyle = 'rgba(0,0,0,0.6)';
		context.fillRect(-wT*0.5-2,-s*0.4-2, wT+4, s*0.8+6);

		rA = wT*0.5+12;
		this.drawTriangleButton(-rA, 0, Math.PI);
		this.drawTriangleButton(rA, 0, 0);

		if(Math.pow(mouseX-(xT + rA*Math.cos(a+HalfPi)), 2)+Math.pow(mouseY-(yT+ rA*Math.sin(a+HalfPi)), 2)<100){
			this.overTriangle = j*2;
		} else if(Math.pow(mouseX-(xT + rA*Math.cos(a-HalfPi)), 2)+Math.pow(mouseY-(yT+ rA*Math.sin(a-HalfPi)), 2)<100){
			this.overTriangle = j*2+1;
		}

		context.fillStyle = 'white';
		context.fillText(this.titles[j], 0, 0);

		context.restore();
	}
	if(this.overTriangle!=-1) canvas.style.cursor='pointer';


}

Comparatives.prototype.drawTriangleButton = function(x,y,a){
	context.beginPath();
	Draw.drawEquilateralTriangle(context, x, y, 8, a);
	context.fill();
	return Math.pow(mouseX-x, 2)+Math.pow(mouseY-y, 2) < 100;
}
