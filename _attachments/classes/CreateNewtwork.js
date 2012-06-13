function CreateNetwork(){};

CreateNetwork.create=function(tagsTable, tags_to_sites){
	//var urlsList = tagsTable.getNames().getSubList(new Interval(1, tagsTable.length-1));
	var tags = tagsTable[0];
	
	c.log("‘‘‘‘‘‘‘‘‘‘ tags.length", tags.length);
	
	numberTable = tagsTable.getSubList(new Interval(1, tagsTable.length-1));
	numberTable = NumberTableOperators.normalizeListsToMax(numberTable);
	
	var tagSums = numberTable.getRowsSums();
	var urlSums = numberTable.getSums();
	
	var network = new Network();
	
	var i;
	
	var node;
	var name;
	var url;
	
	//tags = tags.removeElement('visualization');
	
	for(i=0;tags[i]!=null;i++){
		node = new Node(tags[i], tags[i]);
		node.nodeType='tag';
		node.weight = tagSums[i];
		node['url'] = '';
		network.addNode(node);
	}
	
	for(i=0;urlsList[i]!=null;i++){
		//name = urlsList[i].replace("http://", "").replace("https://", "").replace("www.", "");
		url = urlsList[i];
		name = titles[i];
		node = new Node(name, name);
		node['url'] = url;
		node.nodeType='url';
		//c.log("+++", node.id, urlSums[i]);
		node.weight = urlSums[i];
		network.addNode(node);
	}
	
	var j;
	var numberList;
	var indexes;
	
	var tagNode;
	var urlNode;
	if(tags_to_sites){
		var transposed = numberTable.getTransposed();
		for(i=0;tags[i]!=null;i++){
			tagNode = network.nodeList[i];
			numberList =  transposed[i];
			indexes = numberList.getSortIndexes();
			//for(j=0;j<4 || numberList[indexes[j]]==1;j++){
			for(j=0;j<6 || numberList[indexes[j]]==1;j++){
				if(numberList[indexes[j]]<0.1) break;
				urlNode = network.nodeList[indexes[j]+tags.length];
				network.createRelation(tagNode, urlNode, null, numberList[indexes[j]-0.1]);
			}
		}
	} else {
		for(i=0;urlsList[i]!=null;i++){
			urlNode = network.nodeList[i+tags.length];
			numberList = numberTable[i].getNormalizedToMax();
			indexes = numberList.getSortIndexes();
			for(j=0;j<4;j++){
				if(numberList[indexes[j]]<=0.1) break;
				tagNode = network.nodeList[indexes[j]];
				network.createRelation(tagNode, urlNode, null, (numberList[indexes[j]]/tagNode.weight));
			}
			if(urlNode.nodeList.length==0){
				tagNode = network.nodeList[indexes[0]];
				if(numberList[indexes[0]]>0) network.createRelation(tagNode, urlNode, null, (numberList[indexes[0]]/tagNode.weight));
			}
		}
		var transposed = numberTable.getTransposed();
		for(i=0;tags[i]!=null;i++){
			tagNode = network.nodeList[i];
			if(tagNode.nodeList.length==0){
				numberList =  transposed[i];
				indexes = numberList.getSortIndexes();
				urlNode = network.nodeList[indexes[0]+tags.length];
				network.createRelation(tagNode, urlNode, null, (numberList[indexes[0]]/tagNode.weight));
			}
		}
	}
	
	return network;
}
CreateNetwork.createItemsNetwork=function(tagsTable){
	var node;
	var name;
	
	var itemsNetwork = new Network();
	
	for(var i=0;urlsList[i]!=null;i++){
		name = titles[i];
		node = new Node(name, name);
		itemsNetwork.addNode(node);
	}
	
	var item0;
	var numberList0;
	var numberList1;
	
	for(i=0; itemsNetwork.nodeList[i+1]!=null; i++){
		numberList0 = tagsTable[i+1];
		item0 = itemsNetwork.nodeList[i];
		for(var j=i+1; itemsNetwork.nodeList[j]!=null; j++){
			numberList1 = tagsTable[j+1];
			var weight = NumberListOperators.cosinus(numberList0, numberList1);
			if(weight>0.5){
				itemsNetwork.createRelation(item0, itemsNetwork.nodeList[j], null, weight);
			}
		}
	}
	
	// for(i=0; itemsNetwork.nodeList[i]!=null; i++){
		// c.log(itemsNetwork.nodeList[i].nodeList.length);
	// }
	
	
	return itemsNetwork;
	
}
// CreateNetwork.createItemsNetwork=function(network){
	// var items = new NodeList();
	// for(var i=0; network.nodeList[i]!=null; i++){
		// if(network.nodeList[i].nodeType!='tag'){
			// items.push(network.nodeList[i]);
		// }
	// }
// 	
	// var weight
// 	
	// for(i=0; items[i+1]!=null; i++){
		// for(var j=i+1; items[j]!=null; j++){
			// var weight = relationWeight(items[i], item[j]);
// 			
		// }
	// }
// 
// }

CreateNetwork.relationWeight=function(item0, item1){
	
}














