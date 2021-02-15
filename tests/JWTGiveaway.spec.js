const { TokenExpiredError, verify } = require('jsonwebtoken');
const Giveaway = require('../src/JWTGiveaway');

//Mock jsonwebtoken package
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    TokenExpiredError: class TokenExpiredError {},
}));

describe('JWTGiveaway class', () => {
    let giveaway;

    beforeEach(() => {
        giveaway = new Giveaway(1);
    });

    test('should set isOpen to false when creating a new instance of Giveaway', () => {
        expect(giveaway.isOpen).toBe(false);
    });

    test('should set giveawayEnded to false when creating a new instance of Giveaway', () => {
        expect(giveaway.giveawayEnded).toBe(false);
    });

    // Start Function

    test('should update isOpen, giveawayEnded, and entries set appropriately when calling start()', () => {
        giveaway.start();
        expect(giveaway.isOpen).toBe(true);
        expect(giveaway.giveawayEnded).toBe(false);
        expect(giveaway.entries.size).toBe(0);
    });

    test('should return no error and appropriate msg when calling start()', () => {
        const { err, data } = giveaway.start();
        expect(err).toBe(null);
        expect(data.msg).toBe('The giveaway has started');
    });

    // Stop Function

    test('should return an error when calling stop() while the giveaway is not currently running', () => {
        const { err } = giveaway.stop();
        expect(err).toBe('The giveaway never started');
    });

    test('should updated isOpen and giveawayEnded appropriately when calling stop() while the giveaway is currently running', () => {
        giveaway.start();
        giveaway.stop();
        expect(giveaway.isOpen).toBe(false);
        expect(giveaway.giveawayEnded).toBe(true);
    });

    test('should return a valid userToTokenMap and no error when calling stop() while the giveaway is currently running.', () => {
        giveaway.start();
        const { err, data } = giveaway.stop();
        expect(err).toBe(null);
        expect(typeof data.userToTokenMap).toBe('object');
    });

    // Enter Function
    test('should return an error if enter() is called while the giveaway is not running', () => {
        const { err } = giveaway.enter('USERNAME');
        expect(err).toBe(
            'Sorry, you cannot enter while the giveaway is not running.',
        );
    });

    test('should add username to entries set after enter() is called appropriately', () => {
        giveaway.start();
        giveaway.enter('USERNAME');
        expect(giveaway.entries.size).toBe(1);
        expect(giveaway.entries.has('USERNAME')).toBe(true);
    });

    test('should return an appropriate message and no error if enter() is called while the giveaway is running', () => {
        giveaway.start();
        const { err, data } = giveaway.enter('USERNAME');
        expect(err).toBe(null);
        expect(data.msg).toBe('USERNAME added successfully.');
    });

    //checkForWinner function
    test('should return an error if called while the giveaway is open', () => {
        const { err } = giveaway.checkForWinner();
        expect(err).toBe(`It's not the right time to submit your token.`);
    });

    test('should return an error if called and the giveaway has not ended', () => {
        const { err } = giveaway.checkForWinner();
        expect(err).toBe(`It's not the right time to submit your token.`);
    });

    test('should confirm winner when calling checkForWinner() if jwt.verify() returns a matching username and winner property set to true', () => {
        verify.mockImplementation(() => {
            return { data: { username: 'USERNAME', winner: true } };
        });
        giveaway.start();
        giveaway.stop();
        const { err, data } = giveaway.checkForWinner('USERNAME');
        expect(err).toBe(null);
        expect(data.msg).toBe('USERNAME is a WINNER!');
    });

    test('should return error when calling checkForWinner() if jwt.verify() returns a matching username and winner property set to false', () => {
        verify.mockImplementation(() => {
            return { data: { username: 'USERNAME', winner: false } };
        });
        giveaway.start();
        giveaway.stop();
        const { err, data } = giveaway.checkForWinner('USERNAME');
        expect(err).toBe(`Sorry, USERNAME. That's not a winner`);
    });

    test('should return error when calling checkForWinner() if jwt.verify() returns a mismatched username', () => {
        verify.mockImplementation(() => {
            return { data: { username: 'USERNAME2', winner: false } };
        });
        giveaway.start();
        giveaway.stop();
        const { err, data } = giveaway.checkForWinner('USERNAME');
        expect(err).toBe(
            `Sorry, USERNAME. That token doesn't match your username. Did you steal it?`,
        );
    });

    test('should return error when calling checkForWinner() if jwt.verify() returns an error', () => {
        verify.mockImplementation(() => {
            throw new Error();
        });
        giveaway.start();
        giveaway.stop();
        const { err, data } = giveaway.checkForWinner('USERNAME');
        expect(err).toBe(`Sorry, USERNAME. That token isn't valid.`);
    });

    test('should return error when calling checkForWinner() if jwt.verify() returns a TokenExpiredError', () => {
        verify.mockImplementation(() => {
            throw new TokenExpiredError();
        });
        giveaway.start();
        giveaway.stop();
        const { err, data } = giveaway.checkForWinner('USERNAME');
        expect(err).toBe(`Sorry, USERNAME. That token is expired.`);
    });
});
