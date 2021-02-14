const { generateTokens, verifyToken } = require('./TokenGenerator');
const { TokenExpiredError } = require('jsonwebtoken');

module.exports = class Giveaway {
    constructor(numWinners) {
        this.numWinners = numWinners;
        this.entries = new Set();
        this.acceptingEntries = false;
    }

    start() {
        this.entries.clear();
        this.acceptingEntries = true;
        return { err: null, data: { msg: 'The giveaway has started' } };
    }

    checkForWinner(username, token) {
        if (this.acceptingEntries)
            return { err: 'Not currently accepting entries.' };
        const { error, decoded } = verifyToken(token);
        let errorMsg, returnMsg;
        if (error) {
            if (error instanceof TokenExpiredError) {
                errorMsg = `${username}, you can't fool me. THAT TOKEN IS EXPIRED!!`;
            } else {
                errorMsg = `${username}, you can't fool me. THAT TOKEN ISN'T VALID`;
            }
        } else if (decoded.data.username !== username) {
            errorMsg = `${username}, you must have stolen someone else's token`;
        } else if (!decoded.data.winner) {
            errorMsg = `${username},that's not a winner`;
        } else {
            returnMsg = `${username} IS A WINNER!!`;
        }
        return { err: errMsg, data: { msg: returnMsg } };
    }

    enter(username) {
        if (!this.acceptingEntries) {
            return {
                err:
                    'Sorry, you cannot enter unless the giveaway has been started.',
            };
        }
        this.entries.add(username);
        return { err: null, data: { msg: `${username} added successfully.` } };
    }

    stop() {
        this.acceptingEntries = false;
        const entriesArray = [...this.entries];
        const tokens = generateTokens(this.numWinners, entriesArray);
        const userToTokenMap = {};
        entriesArray.forEach((entry, i) => {
            userToTokenMap[entry] = tokens[i];
        });
        return {
            err: null,
            data: { userToTokenMap, msg: 'Tokens generated successfully' },
        };
    }
};
