$(document).ready(function(){
  
  $("#loginForm").validate({
   ignore:'',
    rules: {
      page_login_email: {
        required: true,
        //email: true
      }
    }
  });
  
});

$(document).off('click.login').on('click.login', '#page_login_submit', function(e){  
 //e.preventDefault();
  console.log('step 1');
  var email = $('#page_login_email').val();
  var pass = $('#page_login_pass').val();

  console.log('step2');
  if (!$("#loginForm").valid()) {
    console.log('step34');
    return false;
  }
  console.log('step98');
  $('#page_login .content').append(ajaxLoader);
  console.log('step3');
                                  
  // BEGIN: drupal services user login (warning: don't use https if you don't have ssl setup)
//  $.ajax({
//      url: DOMAIN + lan + api + "/user/login.json",
//      type: 'post',
//      data: 'username=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(pass),
//      dataType: 'json',
//      error: function(XMLHttpRequest, textStatus, errorThrown) {
//          $('#page_login .ui-content').append(ntf);
//          var $msgdiv = $('.ntf-inner .msg');
//          $msgdiv.html('<div class="error">' + XMLHttpRequest.responseJSON[0] + '</div>');
//          var screen = $(window).outerHeight();
//          var msg = $msgdiv.outerHeight(true);
//          var $close = $('.ntf-inner .close');
//             
//          console.log('step 4');
//          $close.css({top: (msg - $close.outerHeight()) / 2}).click(function(){
//            $('#ntf').animate({'bottom':'-100%'},300).remove();
//          });
//          $('#ntf').animate({'bottom': msg - screen}).addClass('open');
//         
//          console.log('step 5');
//          },
//       success: function (data) {
//         
//           console.log('step 6');
//           user = data.user;
//           token = data.token;
//           sessid = data.sessid;
//           $.cookie('session_name', data.session_name);
//           //registerUser(data.user.email);


  $.ajax({
    url: DOMAIN + lan + api + "/user/token.json",
    type: 'post',
    contentType: 'application/json',
    //crossDomain: true,
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      // Error getting Token
      console.log('Get Token Failed');
      console.log(JSON.stringify(XMLHttpRequest));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
    success: function (data) {
      // Set the Token Value in a textfield
      token = data.token;

      // BEGIN: drupal services user login (warning: don't use https if you don't have ssl setup)
      $.ajax({
          url: DOMAIN + lan + api + "/user/login.json",
          type: 'post',
          data: 'username=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(pass),
          dataType: 'json',
          beforeSend: function (request) {
            request.setRequestHeader("X-CSRF-Token", token);              
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            $('#page_login .ui-content').append(ntf);
            var $msgdiv = $('.ntf-inner .msg');
            $msgdiv.html('<div class="error">' + XMLHttpRequest.responseJSON[0] + '</div>');
            var screen = $(window).outerHeight();
            var msg = $msgdiv.outerHeight(true);
            var $close = $('.ntf-inner .close');
            $close.css({top: (msg - $close.outerHeight()) / 2}).click(function(){
              $('#ntf').animate({'bottom':'-100%'},300).remove();
            });
            $('#ntf').animate({'bottom': msg - screen}).addClass('open');
          },
          success: function (data) {
           user = data.user
           token = data.token;
           sessid = data.sessid;
           $.cookie('token', data.token);
           $.cookie('session_id', data.sessid);
           $.cookie('session_name', data.session_name);
           
           var ifr = $('<iframe/>', {
               id: 'sessifr',
               src: DOMAIN + "/aa.php?session_name=" + data.session_name + '&sessid=' + data.sessid,
               style: 'display:none',
               load: function() {
                 $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "fade", changeHash: false});
                 $('#sessifr').remove();
               }
           });       
           $('body').append(ifr);
          }
      });
    }
  });
  
  // END: drupal services user login
  return false;
});


$(document).off('click.logout').on("click.logout", '#button_logout', function(){
  try {
   $.ajax({
       url: DOMAIN + lan + api + "/user/logout.json",
       type: 'post',
       dataType: 'json',
       error: function (XMLHttpRequest, textStatus, errorThrown) {
         alert('button_logout - failed to logout');
         console.log(JSON.stringify(XMLHttpRequest));
         console.log(JSON.stringify(textStatus));
         console.log(JSON.stringify(errorThrown));
       },
       success: function (data) {
         alert("You have been logged out.");
           $.mobile.pageContainer.pagecontainer("change", "#page_dashboard", {transition: "flow", changeHash: false, reload: true});
       }
   });
  }
  catch (error) { alert("button_logout - " + error); }
  return false;
  });

function registerUser(email){
  FCMPlugin.getToken(
      function(token){
          console.log('success geting token from FCM Server');
          var name = 'apple_device';
          var eml = email;
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
}
