# SEU Students

SEU Students is a web application that targets students who are studying in the Saudi Electronic University, to help them find any content related to the courses more easily all in one place.

## How it works:

The project's main goal is to make SEU students be able to share and download the content related to the courses of the university.

Currently, the project is only targeting the College of Computing and Informatics. Until the number of consumers grow and the project's popularity rises, we will be covering all colleges in the university.

As a user, you can simply just browser through the department you want, the course you want, and you will find all of the uploaded content related to that course.

## Who uploads the content?

Anyone can upload content that they believe could be helpful to others! 

But signing up in the web app is a must before being allowed to upload content.

## Project folder structure:

The project is divided into three root folders:

#### ```client```:

Contains all assets and functionalities related to the client side.

#### ```server```:

Contains all functionalities related to the server side.

#### ```common```:

Contains all functionalities that are used both in the client side and server side.

## Code behaviour:

Let's give an example to show how the code behaves if we have a scenario where a user visits our web app and signs up.

**User:** opens web app

**App**: a route has been hit in the routes.js file, which triggers a route handler file called ```RouteHandler.js```, which handles the request to that endpoint. In this case, it's just going to render the home page

When the user visits the web app, a session object specific to that user is created in the server, to help us identify the user later on if he logs in

**User**: clicks on sign up

**App**: /signup route has been hit, ```RouteHandler.js``` will handle the request, in this case it just renders the sign up page

**User**: fills up the form and clicks sign up

**App**: /signup-process route has been hit, ```RouteHandler.js``` will handle the request by validating the form input data by calling validation methods from ```Validation.js```, which is inside the ```common``` folder

If validation has passed, ```RouteHandler.js``` will call an insert method provided by ```DB.js```, to insert the data in the database

If data has been inserted successfully to the database, the route handler will redirect to the home page

**Client**: after redirecting to the home page, the client side JavaScript will show a toast message indicating that the sign up process has been successful

## Storage

The content uploaded is stored in S3 Bucket provided by AWS.

The content must be either a  **PDF**, **PowerPoint**, or **Word** file.

## Running scripts

```npm run build```:

Runs the server and the webpack bundle concurrently and listens to changes done in the ```server``` folder and the ```client``` folder
