# TinyApp

TinyApp shortens URLs. 

Users can register an account with an email and password, enter links to websites that TinyApp will generate a short-form URL for. 
These links will be associated with the user who initialized them and will only be accessible when logged into their account. Users can login and logout after registration. Database exists as an object on the server and perists until the server is stopped.

This project was done as part of a learning experience while participating in
a 12 week full-stack web developer bootcamp by Lighthouse Labs.

## The learning objectives were:

* Requests and routing with HTTP.
* Building a web server from scratch with node.js and expresss.
* Using cookies to track a user's login state and for determining permissions.
* Encryption and the safe stroage of passwords.
* Unit testing with mocha and chai.
* Site testing using cURL on the command line.

## Tech Stack and Dependencies
* node.js
* expres.js
* cookie-session
* body-parser
* bcryptjs

## Dev-Dependencies
* nodemon
* morgan

## In Action

!["Screenshot of URLs page"](https://github.com/Eugene-L-H/tinyapp/blob/main/docs/myURLs_page.png?raw=true)
!["Screenshot of registration page"](https://github.com/Eugene-L-H/tinyapp/blob/main/docs/register_page.png?raw=true)
!["Screenshot of edit URL page"](https://github.com/Eugene-L-H/tinyapp/blob/main/docs/edit_link.png?raw=true)

## Install

* From user's system inside the tinyapp-main folder run the express_server.js file with node command : ```$ node express_server.js```
* Visit http://localhost:8080 in your browser address bar and the main urls page should be displayed.