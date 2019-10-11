// require modules
const mysql = require('mysql');
const inquirer = require('inquirer');
const dotenv = require('dotenv').config();

// pass in password from dotenv
const PASSWORD = dotenv.ENV_PASS;

// connect to SQL
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
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
            console.log(`inside promptUserAction async`);
            // query SQL for that specific item
            connection.query("SELECT * FROM products WHERE ?",
                [{ item_id: inquirerResponse.itemID }]
                , function (err, results) {
                    if (err) throw err;
                    let currentStock = inquirerResponse.stock_quantity;

                    if (inquirerResponse.quantity > currentStock) {
                        console.log(`We're sorry, we don't currently have that many ${inquirerResponse.product_name} in stock.`);
                    }
                    else {
                        let totalprice = inquirerResponse.quantity * results.price;
                        console.log(`Thank you for your purchase! ${totalprice} will be deducted from your account.`);
                        printStorefront();
                        finalizeItemPurchase(inquirerResponse.itemID, inquirerResponse.quantity, currentStock);
                    }
                })
        });
}

// function to deduct product from SQL server
function finalizeItemPurchase(itemID, quantity, stock) {
    let newQuantity = stock - quantity;
    connection.query("SET ? FROM products WHERE ?",
    [{stock_quantity:newQuantity},{item_id:itemID}],
    function(err){
        if (err) throw (err)
    })
}

