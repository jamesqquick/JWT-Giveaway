const { generateTokens } = require('./TokenGenerator');
const { TokenExpiredError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');

module.exports = class Giveaway {
    constructor(numWinners, signingKey) {
        this.numWinners = numWinners;
        this.entries = new Set();
        this.isOpen = false;
        this.giveawayEnded = false;
        this.signingKey = signingKey;
    }

    start() {
        this.entries.clear();
        this.isOpen = true;
        this.giveawayEnded = false;
        return { err: null, data: { msg: 'The giveaway has started' } };
    }

    checkForWinner(username, token) {
        if (!this.giveawayEnded || this.isOpen) {
            return { err: `It's not the right time to submit your token.` };
        }

        try {
            let decoded = jwt.verify(token, this.signingKey);
            if (decoded.data.username !== username) {
                return {
                    err: `Sorry, ${username}. That token doesn't match your username. Did you steal it?`,
                };
            } else if (!decoded.data.winner) {
                return {
                    err: `Sorry, ${username}. That's not a winner`,
                };
            }

            return {
                err: null,
                data: { msg: `${username} is a WINNER!` },
            };
        } catch (error) {
            console.error(error);
            if (error instanceof TokenExpiredError) {
                return { err: `Sorry, ${username}. That token is expired.` };
            } else {
                return { err: `Sorry, ${username}. That token isn't valid.` };
            }
        }
    }

    enter(username) {
        if (!this.isOpen) {
            return {
                err:
                    'Sorry, you cannot enter while the giveaway is not running.',
            };
        }
        this.entries.add(username);
        return { err: null, data: { msg: `${username} added successfully.` } };
    }

    stop() {
        if (!this.isOpen) return { err: 'The giveaway never started' };

        this.isOpen = false;
        const entriesArray = [...this.entries];
        const tokens = generateTokens(
            this.numWinners,
            entriesArray,
            this.signingKey,
        );
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
