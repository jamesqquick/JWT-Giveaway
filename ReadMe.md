# JWT Giveaway
Node program for running a giveaway through the use of JSON Web Tokens (jwt). Each participant that enters will receive a JWT. They can decode this token at [jwt.io](jwt.io) to determine if they are a winner. 

## Usage

```javascript
const JWTGiveaway = require('jwt-giveaway');
const giveaway = new JWTGiveaway(1); //1 - represents the numbers of winners
giveaway.start(); //starts the giveaway and accepting entries
giveaway.enter("<username>"); //enters the username into the giveaway
const {err, data : { userToTokenMap } }giveaway.stop(); //stops the giveaways and returns a map of username entries to JWTs
const {err, data: { msg } } = giveaway.checkForWinner("<username>", "<token>") //validates whether or not the token is valid for the given usernameå
```