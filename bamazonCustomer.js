var inquirer = require("inquirer");
var engine = require("./engine.js");

var list = engine.displayProducts("customer", prompt);

function prompt(list){
	var itemList = list.itemList;
	var stockQuantity = list.itemQuantity;
	var itemId = list.itemId;

	inquirer
	.prompt([
		{
			type: "list",
			name: "itemselection",
			message: "enter the ID of the product you would like to buy",
			choices: itemList
		},
			{
			type: "input",
			name: "itemquantity",
			message: "How many would you like?",
			validate: function(itemquantity ,item){
				return(engine.quantityValidate(itemList, itemquantity, item, stockQuantity, "customer"));
			}
		},
		{
			type: "confirm",
			name: "placeorder",
			message: "Would you like to place the order?",
			default: "True",
		}	
	])
	.then(function(answer){
		if(!answer.placeorder){
			return
		}

		engine.processOrder(itemId, answer);
	});
}