const { generateTokens, verifyToken } = require('./TokenGenerator');
const { TokenExpiredError } = require('jsonwebtoken');

module.exports = class Giveaway {
    constructor(numWinners) {
        this.numWinners = numWinners;
        this.entries = new Set();
        this.acceptingEntries = false;
        this.giveawayEnded = false;
    }

    start() {
        this.entries.clear();
        this.acceptingEntries = true;
        this.giveawayEnded = false;
        return { err: null, data: { msg: 'The giveaway has started' } };
    }

    checkForWinner(username, token) {
        if (!this.giveawayEnded || this.acceptingEntries) {
            return { err: `It's not the right time to submit your token.` };
        }

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
        return { err: errorMsg, data: { msg: returnMsg } };
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
        if (!this.acceptingEntries)
            return { err: 'The giveaway never started' };

        this.acceptingEntries = false;
        const entriesArray = [...this.entries];
        const tokens = generateTokens(this.numWinners, entriesArray);
        const userToTokenMap = {};
        entriesArray.forEach((entry, i) => {
            userToTokenMap[entry] = tokens[i];
        });
        this.giveawayEnded = true;
        return {
            err: null,
            data: { userToTokenMap, msg: 'Tokens generated successfully' },
        };
    }
};
