const jwt = require('jsonwebtoken');

const generateTokens = (numberOfWinners, entries) => {
    const winningNumbers = getWinningNumbers(numberOfWinners, entries);
    const tokens = [];
    for (let i = 0; i < entries.length; i++) {
        const data = {
            winner: winningNumbers.includes(i) ? true : false,
            username: entries[i],
        };
        var token = jwt.sign(
            {
                data,
                exp:
                    Math.floor(Date.now() / 1000) +
                    process.env.EXPIRATION_IN_MINUTES * 60,
            },
            process.env.SIGNING_KEY,
        );
        tokens.push(token);
    }
    return tokens;
};

const getWinningNumbers = (numberOfWinners, entries) => {
    const winningNumbers = [];
    for (let i = 0; i < numberOfWinners; i++) {
        let randomNum;
        do {
            randomNum = Math.floor(Math.random() * entries.length);
        } while (randomNum === undefined || winningNumbers.includes(randomNum));

        winningNumbers.push(randomNum);
    }
    console.log(winningNumbers);
    return winningNumbers;
};

module.exports = { generateTokens };
