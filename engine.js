var mysql = require('mysql');

// Opens connection to the database
function connectToDB(){
	var connection = mysql.createConnection({
		host: "localhost",
		port: 3306,
		user: "root",
		password: "root",
		database: "bamazon"
	});

  connection.connect(function(error) {
   if (error) {
   	throw error;
   }
  
  });

  return connection;
}

// Queries the Database and gets information from all the products
function displayProducts(client, prompt){
	var display = {};
	var connect = connectToDB();
	connect.query("Select * FROM products", function(error, results){
		if(error){
			throw error;
		}

		prompt(parseData(results, client));
		connect.end();
	});	
}

// Takes the queried information and parses it to 
// be displayed in the Customer UI inquirer list
// Creates 3 arrays to pass on the the UI
// List gets used by Inquirer to show the products id, name and price
// Quantity is collected but not used in inquirer, only passed into for the quantity validation function
// 	during validation to ensure there is enough in stock
// ItemId is held and passed into .then to run a second query on the item during purcahase to ensure that
//		during the time before selection and purchase the amount in stock did not go below the ordered amount.
function parseData(data, client){
	var itemList = [];
	var itemQuantity = [];
	var itemId = [];

	for(var key in data){
		if(client === "customer"){
			itemList.push(data[key].product + " $" + data[key].price);
		
		}else if(client === "manager"){
			itemList.push(data[key].id + ": " + data[key].product + " "+ data[key].quantity +  " $" + data[key].price);
		}

		itemQuantity.push(data[key].quantity);
		itemId.push(data[key].id);
	}
	
	return({itemList: itemList, itemQuantity: itemQuantity, itemId: itemId});
}

// itemList, and stockQuantity were passed from the parseData function
// itemquantity is the user inputed item quantity
// itemList is from the query of all products
// function validates the numbe rof items by checking:
// 	1: input is a number, 2: requested amount is less then stock amount
function quantityValidate(itemList, itemquantity, item, stockQuantity, client){
		itemIndex = itemList.indexOf(item.itemselection);

		numberCheck(itemquantity);

		if(parseInt(stockQuantity[itemIndex]) < parseInt(itemquantity) && client==="customer"){
			return "Sorry, only " + stockQuantity[itemIndex] + " in stock";
		}
		
		return true;			
}

function numberCheck(itemquantity){
	if(isNaN(itemquantity)){
		return "Please enter a valid number";
	}

	return true;
}

// Processes the order

function processOrder(itemId, answers){

	var connect = connectToDB();
	var newStock = 0;
	var totalCost = 0;

	// Queries the product to check if there is still enough product in stock since placing in cart
	connect.query("SELECT * FROM products WHERE id = ?", [itemId[itemIndex]], function(error, results){
		if(error){
			throw error;
		}

		newStock = results[0].quantity - answers.itemquantity;
		totalCost = answers.itemquantity * results[0].price;
		// If stock is less then what is in cart throw error
		if(newStock < 0){
			console.log("Sorry, the quantity you requested is no longer available, there are currently " + results[0].quantity + " left");
			return
		}
		
		console.log("The total is $" + totalCost);

		updateProduct(connect, newStock, itemId);
	});
}

function updateProduct(connect, newStock, itemId){

	connect.query("UPDATE products SET quantity = ? WHERE id = ?", [newStock, itemId[itemIndex]],  function(error, results){
		if(error){
			throw error;
		}

		connect.end();
	});
}

function addProduct(input){
	var connect = connectToDB();

	connect.query("INSERT INTO products (product, department, price, quantity) VALUES (?,?,?,?)", [input.newproductname, input.newproductdept, input.newproductcost, input.newproductstock],  function(error, results){
		if(error){
			throw error;
		}

		console.log(input.newproductname + " has been added to the system");
		connect.end();
	});
}

function managerActionProcess(answer,list=""){
	switch(answer.action){
		case "View Products for Sale":
			
			for (var i = 0; i < list["itemList"].length; i++) {
				console.log(list.itemList[i]);
			}
			
			break;
		case "View Low Inventory":
			var noLow = true;
			for (var i = 0; i < list["itemList"].length; i++) {
				if(list.itemQuantity[i] < 10){
					console.log(list.itemList[i]);
					noLow = false;
				}
			}

			if(noLow){
				console.log("No low inventory items");
			}

			break;
		case "Add to Inventory":

			itemIndex = list["itemList"].indexOf(answer.products);
			var newStock = parseInt(answer.addstock) + parseInt(list.itemQuantity[itemIndex]);
			
			updateProduct(connectToDB(), newStock, list.itemId);
			
			break;
		case "Add New Product":
			addProduct(answer);
			break;
	}
}

module.exports = {
	displayProducts : displayProducts,
	quantityValidate : quantityValidate,
	managerActionProcess : managerActionProcess,
	processOrder : processOrder,
	numberCheck : numberCheck
};