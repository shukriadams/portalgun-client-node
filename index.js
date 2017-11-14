let io = require('socket.io-client'),
    request= require('request'),
    path = require('path');

let Client = function(url, clientId, appId){
    this.url = url;
    this.clientId = clientId;
    this.appId = appId;

    this.socket = io.connect(url, {reconnect: true});
    
    // Add a connect listener
    this.socket.on('connect', function () {
        
        this.socket.emit('register', {
            clientId : clientId,
            appId : appId
        });
        console.log('registered with server')
    }.bind(this));
    
    this.socket.on('event', function (data) {
        console.log('received event');
        if (this.listener){
            let extras = {
                isWaiting : data.isWaiting
            }
            this.listener(data.payload, extras);
        }
    }.bind(this));
}

Client.prototype.send = function(payload){
    this.socket.emit('push', { 
        clientId : this.clientId, 
        appId : this.appId, 
        payload : payload 
    })
}

Client.prototype.post = function(payload, callback){
    console.log('syncing to ', this.url);
    request.post(
        this.url,
        {form : JSON.stringify({ clientId : this.clientId, appId : this.appId, payload : payload })},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body));
            }
        }
    );
}

Client.prototype.onData = function(listener){
    this.listener = listener;
}

module.exports = Client;