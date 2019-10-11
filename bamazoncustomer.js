// require modules
const mysql = require('mysql');
const inquirer = require('inquirer');
require('dotenv').config();

// pass in password from dotenv
const db = require('db')
db.connect({
    PASSWORD: process.env.DB_PASS
})

// connect to SQL
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3300,
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
        console.log(results);
        promptUserAction();
    })
}


// function which asks the user what they want to buy & how much
function promptUserAction() {
    inquirer.prompt({
        name: 'itemID',
        type: 'number',
        message: `\nPlease type the unique ID of the item you'd like to purchase.`
    },
        {
            name: 'quantity',
            type: 'number',
            message: 'How many would you like to purchase?'
        })
        .then(function (answer) {
            // query SQL for that specific item
            connection.query("SELECT * FROM products WHERE ?", [{id:answer.itemID}], function (err, results) {
                if (err) throw err;

            
                if (answer.quantity > `current number`) {
                    console.log(`We're sorry, we don't currently have that many ${itemname} in stock.`);
                }
                else {
                    let totalprice = answer.quantity * itemprice;
                    console.log(`Thank you for your purchase! ${totalprice} will be deducted from your account.`);
                    printStorefront();
                }
            }
        });
}


function bidAuction() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM auctions", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].item_name);
                        }
                        return choiceArray;
                    },
                    message: "What auction would you like to place a bid in?"
                },
                {
                    name: "bid",
                    type: "input",
                    message: "How much would you like to bid?"
                }
            ])
            .then(function (answer) {
                // get the information of the chosen item
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_name === answer.choice) {
                        chosenItem = results[i];
                    }
                }

                // determine if bid was high enough
                if (chosenItem.highest_bid < parseInt(answer.bid)) {
                    // bid was high enough, so update db, let the user know, and start over
                    connection.query(
                        "UPDATE auctions SET ? WHERE ?",
                        [
                            {
                                highest_bid: answer.bid
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Bid placed successfully!");
                            start();
                        }
                    );
                }
                else {
                    // bid wasn't high enough, so apologize and start over
                    console.log("Your bid was too low. Try again...");
                    start();
                }
            });
    });
}
