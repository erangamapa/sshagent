var WebSocketServer = require('ws').Server;
wss = new WebSocketServer({port: 8009});
var port = 6000;
var couchPort = 8000;
var cincoCreated = false;


wss.on('connection', function(ws) {
    ws.on('message', function(message) {
    	console.log(message);
        if(message == "password"){
            var pwd = genPwd();
            if(pwd != null){
                ws.send(JSON.stringify({"password": pwd}));
            }else{
                ws.send(JSON.stringify({"password": pwd, "error": true}));
            }
        }else{
            var exec = require('child_process').exec;
            var child = exec(message);
            child.stdout.on('data', function(data) {
                ws.send(JSON.stringify({'error': false}));
            });
            child.stderr.on('data', function(data) {
                ws.send(JSON.stringify({'error': true}));
            });
            child.on('close', function(data) {
                ws.send(JSON.stringify({'error': true}));
            });
        }
    });
});

function genPwd() {
    var request = require('sync-request');
    var btoa = require('btoa');
    var username = "Administrator";
    var passwords = ["123456a", "123456b", "123456c", "654321a", "654321b", "654321c"];
    var hash;
    for(var i in passwords){
        hash = "Basic " + btoa(username + ":" + passwords[i]);
        console.log(passwords[i]);
        var result = request('GET', 'http://localhost:8080/rest/login?isPinPrimaryLogin=true', { 'headers' : {
           'Content-Type': 'application/json; charset=UTF-8',
           'Authorization': hash,
           'dataType': 'json',
           'async': 'true'
         }
        });
        try{
            if(result.statusCode == "401"){
                console.log(result.statusCode);
                continue;
            }
            data = JSON.parse(result.getBody().toString());
            if(data.documentType != undefined && data.documentType == "com.leapset.beans.employee.TinyAuthenticatedEmployee"){
                console.log(passwords[i]);
                return passwords[i];
            }
        }catch(ex){
            console.log(ex);
            return null;
        }
    }
}