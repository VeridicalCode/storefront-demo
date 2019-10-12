// require modules
const mysql = require('mysql');
const inquirer = require('inquirer');
require('dotenv').config();

// pass in vars from dotenv
const PASSWORD = process.env.DB_PASS;
const PORT = process.env.PORT;

// connect to SQL
const connection = mysql.createConnection({
    host: 'localhost',
    port: PORT,
    user: 'root',
    password: PASSWORD,
    database: 'bamazon'
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // on connection, display storefront
    printStorefront();
});

// function which displays all current items, ids, quantities
function printStorefront() {
    // query database for available products, print in default format
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (let i = 0 ; i < results.length; i++) {
            console.log(
                `Item # ${results[i].item_id}: ${results[i].product_name}, Price: $${results[i].price}. ${results[i].stock_quantity} left in stock.`
            )
        }
        promptUserAction();
    })
}


// function which asks the user what they want to buy & how much
function promptUserAction() {
    inquirer.prompt([
        {
        name: 'itemID',
        type: 'number',
        message: `\nPlease type the unique ID of the item you'd like to purchase.`
        },
        {
            name: 'quantity',
            type: 'number',
            message: 'How many would you like to purchase?'
        }
    ]).then(
            function (inquirerResponse) {
            // query SQL for that specific item
            connection.query(`SELECT * FROM products WHERE item_id=${inquirerResponse.itemID}`,
                function (err, SQLresults) {
                    if (err) throw err;
                    // very wet to declare all these variables but we'll do it anyway for clarity
                    let currentStock = SQLresults[0].stock_quantity;
                    let productName = SQLresults[0].product_name;
                    let productPrice = SQLresults[0].price;
                    let numberBought = inquirerResponse.quantity;

                    if (numberBought > currentStock) { // make sure we have enough
                        console.log(`We're sorry, we don't currently have that many ${productName} in stock.`);
                    }
                    else {
                        let totalprice = productPrice * numberBought;
                        console.log(`Thank you for your purchase! ${totalprice} will be deducted from your account.`);
                        finalizeItemPurchase(inquirerResponse.itemID, numberBought, currentStock); // send off to purchase function
                    }
                })
        });
}

// function to deduct product from SQL server
function finalizeItemPurchase(itemID, quantity, stock) {
    let newQuantity = stock - quantity; // target value is current stock minus purchase
    connection.query("UPDATE products SET ? WHERE ?",
    [{stock_quantity:newQuantity},{item_id:itemID}],
    function(err){
        if (err) throw (err)
    })
    printStorefront(); 
}

