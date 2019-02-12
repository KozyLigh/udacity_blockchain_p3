module.exports = class Request {

    constructor({requestTimeStamp, walletAddress, message, validationWindow}) {
        this.requestTimeStamp = requestTimeStamp || this._currentTStamp();
        this.walletAddress = walletAddress;
        this.message = `${this.walletAddress}:${this.requestTimeStamp}:starRegistry`;
        this.validationWindow = validationWindow - (this._currentTStamp() - this.requestTimeStamp);
    }
    // Calculates UTC timestamp as a string

    _currentTStamp () {
        return new Date().getTime().toString().slice(0, -3);
    }

    getWalletAddress() {
        return this.walletAddress;
    }

    getMessage(){
        return this.message;
    }

};
