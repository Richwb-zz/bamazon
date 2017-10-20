var inquirer = require("inquirer");
var engine = require("./engine.js");

var list = engine.displayProducts("manager", prompt);

function prompt(list){
	var itemList = list.itemList;
	var stockQuantity = list.itemQuantity;
	var itemId = list.itemId;
	var fullList = list;

inquirer
	.prompt([
		{
		type:"list",
		name: "action",
		message: "What would you like to do?",
		choices: ["View Products for Sale","View Low Inventory",
					"Add to Inventory", "Add New Product"]
		},
		{
			type: "list",
			name: "products",
			message: "Which item would you like to add inventory to",
			choices: itemList,
			when: function(answers){
				return answers.action === "Add to Inventory";
			}
		},
		{
			type: "input",
			name: "addstock",
			message: "How many would you like to order?",
			when: function(answers){
				return answers.action === "Add to Inventory";
			},
			validate: function(addStock){
				return(engine.numberCheck(addstock));
			}
		},
		{
			type: "input",
			name: "newproductname",
			message: "Product being added",
			when: function(answers){
				return answers.action === "Add New Product";
			}
		},
		{
			type: "input",
			name: "newproductdept",
			message: "What department?",
			when: function(answers){
				return answers.action === "Add New Product";
			}
		},
		{
			type: "input",
			name: "newproductstock",
			message: "How many in stock?",
			when: function(answers){
				return answers.action === "Add New Product";
			},
			validate: function(newproductstock){
				return(engine.numberCheck(newproductstock));
			}
		},
		{
			type: "input",
			name: "newproductcost",
			message: "What is the cost? $",
			when: function(answers){
				return answers.action === "Add New Product";
			}
		}
	])
	.then(function(answer){
		engine.managerActionProcess(answer,fullList);
	})
}