var local_token = "";

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);   
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

		FCMPlugin.getToken(
            function(token){
                console.log('success geting token from FCM Server');
                local_token = token;
                var name = 'android_device';
                var eml = device.uuid + "@gmail.com";
                var postData = "name=" + name + "&email=" + eml + "&token=" + token + "&insert=";
                $.ajax({
                    type: 'POST',
                    data: postData,
                    crossDomain: true,
                    cache: false,
                    url: 'http://school.fermicoding.com/fcm_server/register.php',
                    success: function(data){                 
                        console.log('Sucess posting to Fermi Server');
                        console.log(postData);
                    },
                    error: function(){
                        alert('There was an error posting to Fermi Server');
                        console.log(data);
                    }
                });
                return false;
            },
            function(err){
                console.log('error retrieving token: ' + err);
                alert('error retrieving token: ' + err);
            }
        );

        FCMPlugin.onNotification(
            function(data){
                if(data.wasTapped){
                  //Notification was received on device tray and tapped by the user.
                  alert( JSON.stringify(data) );
                }else{
                  //Notification was received in foreground. Maybe the user needs to be notified.
                  alert( JSON.stringify(data) );
                }
            },
            function(msg){
                console.log('onNotification callback successfully registered: ' + msg);
            },
            function(err){
                console.log('Error registering onNotification callback: ' + err);
            }
        );

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }, 
};
app.initialize();