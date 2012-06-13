Info.prototype.constructor=Info;

Info.textAboutBig = 'The aim of this tool is to enable the discovery of amazing and useful contents from the infovis field. I made the compilation by my own criteria and taking into consideration other selections (listed below).\\n\\nFeel free to propose new resources, just write me a tweet (<ehttps://twitter.com/#!/moebio*@moebio>) with the proposed link.\\n\\nThe bipartitie network resources-tags has been built by reading the tags used by <ehttp://delicious.com*Delicious> users when saving the links.';
Info.textAboutShort = 'The aim of this tool is… <ee*[rollover]>';

function Info(y, width){
	this.y = y;

	this.INTER_SPACE = 30;

	//about
	var textAbout = Info.textAboutShort;

	this.aboutTextBox = new TextBox();

	this.aboutTextBox.x = 10;
	this.aboutTextBox.y = this.y;
	this.aboutTextBox.width = width - 20;
	this.aboutTextBox.fontSize = 13;

	this.aboutTextBox.setText(textAbout);

	//download data
	var textDownload = "download the data:\\n   <e./resources/lists.txt*simple lists> (txt) | <e./resources/resources.json*complete data> (json)";

	this.downloadTextBox = new TextBox();

	this.downloadTextBox.x = 10;
	//this.downloadTextBox.y = this.aboutTextBox.y + this.aboutTextBox.height + this.INTER_SPACE;
	this.downloadTextBox.width = width - 20;
	this.downloadTextBox.fontSize = 13;

	this.downloadTextBox.setText(textDownload);

	//tags colors

	var textTags = "tag colors are based on a 'soft' to 'hard' scale (defined by a mixed handy/algorithmic method)";

	this.tagsTextBox = new TextBox();

	this.tagsTextBox.x = 10;
	//this.tagsTextBox.y = this.downloadTextBox.y + this.downloadTextBox.height + this.INTER_SPACE;
	this.tagsTextBox.width = width - 20;
	this.tagsTextBox.fontSize = 13;

	this.tagsTextBox.setText(textTags);

	this.tagsColors = new Array();
	for(var i=0; i<7; i++){
		this.tagsColors[i] = colorFromHardness(Math.pow(i/6, 2), 0.6);
	}



	//other compilations
	var textLists = "These are great compilations of infovis resources done by realiable people:\\n\\n   <ehttp://flowingdata.com/2012/04/27/data-and-visualization-blogs-worth-following/*blogs worth following>, by flowingdata\\n\\n   <ehttp://www.visualisingdata.com/index.php/2011/03/part-1-the-essential-collection-of-visualisation-resources/*essential resources>, from visualizingdata\\n\\n   <ehttp://datavisualization.ch/tools/selected-tools/*carefully selected list of tools>, by datavis";

	this.listsTextBox = new TextBox();

	this.listsTextBox.x = 10;
	//this.listsTextBox.y = this.tagsTextBox.y + this.tagsTextBox.height + 35 +this.INTER_SPACE;
	this.listsTextBox.width = width - 20;
	this.listsTextBox.fontSize = 13;

	this.listsTextBox.setText(textLists);

	//created by Santiago Ortiz
	var textCredits = "created by <ehttp://moebio.com*Santiago Ortiz*s>";

	this.creditsTextBox = new TextBox();

	this.creditsTextBox.x = 10;
	//this.creditsTextBox.y = this.listsTextBox.y + this.listsTextBox.height +this.INTER_SPACE;
	this.creditsTextBox.width = width - 20;
	this.creditsTextBox.fontSize = 13;

	this.creditsTextBox.setText(textCredits);

	c.log("HHH:", this.creditsTextBox.y+this.creditsTextBox.height);

	this.previousOver;

	this.resize();
}

Info.prototype.resize = function(){
	var textAbout = (canvasHeight>790 || this.previousOver)?Info.textAboutBig:Info.textAboutShort;

	this.aboutTextBox.setText(textAbout);

	this.downloadTextBox.y = this.aboutTextBox.y + this.aboutTextBox.height + this.INTER_SPACE;
	this.tagsTextBox.y = this.downloadTextBox.y + this.downloadTextBox.height + this.INTER_SPACE;
	this.listsTextBox.y = this.tagsTextBox.y + this.tagsTextBox.height + 35 +this.INTER_SPACE;
	this.creditsTextBox.y = this.listsTextBox.y + this.listsTextBox.height +this.INTER_SPACE;
}

Info.prototype.draw = function(){
	if(canvasHeight<=790){
		over = (mouseY>this.aboutTextBox.y && mouseY<this.aboutTextBox.y+this.aboutTextBox.height && mouseX<this.aboutTextBox.width+this.aboutTextBox.x);
		if(this.previousOver!=over){
			this.previousOver = over;
			this.resize();
		}
	}

	context.strokeStyle = 'gray';

	this.line(this.aboutTextBox.y, this.aboutTextBox.width-20);
	this.aboutTextBox.draw();

	this.line(this.downloadTextBox.y, this.downloadTextBox.width-20);
	this.downloadTextBox.draw();

	//tags

	this.line(this.tagsTextBox.y, this.tagsTextBox.width-20);
	this.tagsTextBox.draw();
	var dX = Math.floor(180/7);
	var y = this.tagsTextBox.y + this.tagsTextBox.height + 20;
	for(var i=0; i<7; i++){
		context.fillStyle =this.tagsColors[i];// colorFromHardness(i/7, 0.6);
		context.fillRect(i*dX+50, y, dX-1, 12);
	}
	context.fillStyle = 'gray';
	context.fillText('soft', 15, y-2);
	context.fillText('hard', 235, y-2);

	//lists

	this.line(this.listsTextBox.y, this.listsTextBox.width-20);
	this.listsTextBox.draw();

	//created by

	this.line(this.creditsTextBox.y, this.listsTextBox.width-20);
	this.creditsTextBox.draw();
	tweetButtonDiv.setAttribute('style', 'position:absolute;top:'+(this.creditsTextBox.y-2)+'px;left:'+170+'px;z-index:30;');

}

Info.prototype.line = function(y, w){
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(10, y-8.5);
	context.lineTo(w, y-8.5);
	context.stroke();
}
