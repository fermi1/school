$(document).ready(function(){

  $("#signupFormP").validate({
   ignore:'',
    onkeyup: function(element) {
      if ($(element).attr('name') != 'page_signup_email') {
        $.validator.defaults.onkeyup.apply(this, arguments);
      }
	},
    rules: {
	  page_signup_email:  {
        required: true,
        email: true,
        remote: {
		  url: DOMAIN + lan + api + "/checkmail.json",
		  type: 'post',
		  data: {
            email: function() {
              return $('#page_signup_email').val();
			}
		  }
        }
      }
    }
  });
  $("#signupFormS").validate({
    ignore:'',
    onkeyup: function(element) {
      if ($(element).attr('name') != 'page_signup_s_email') {
        $.validator.defaults.onkeyup.apply(this, arguments);
      }
	},
    rules: {
	  page_signup_s_email:  {
        required: true,
        email: true,
        remote: {
		  url: DOMAIN + lan + api + "/checkmail.json",
		  type: 'post',
		  data: {
            email: function() {
              return $('#page_signup_s_email').val();
			}
		  }
        }
      }
    }
  });
  
});

$(document).off('click.signups').on('click.signups', '#page_signup_s_submit', function(){
	
  var fname = $('#page_signup_s_fname').val();
  var lname = $('#page_signup_s_lname').val();
  var semail = $('#page_signup_s_email').val();
  var spass = $('#page_signup_s_pass').val();
  var sgender = $("input[name='radio-gender']:checked").val();
  
  if (!$("#signupFormS").valid()) {
	  return false;
  }
  
var params = {
  'name': semail,
  'mail': semail,
  'pass': spass,
  'gender': sgender,
  'notify': 1,
  'field_firstname': {'und': {'0': {'value': fname}}},
  'field_lastname': {'und': {'0': {'value': lname}}},
  'field_gender': {'und': sgender},
  'status': 1,
  'roles': {'7': 7}, // School admin
  };

  // BEGIN: drupal services user register
  $.ajax({
     url: DOMAIN + lan + api + "/school/register.json",
     type: 'post',
	   contentType: 'application/json',
     data: JSON.stringify(params),
     dataType: 'json',
     error: function(XMLHttpRequest, textStatus, errorThrown) {
	     //XMLHttpRequest.responseJSON.form_errors.mail ili name
     },
     success: function (data) {
       user = data.uid;
	     email = semail;
	     pass = spass;
       var uri = data.uri;
	   
	     // Clean up
	     $('#page_signup_s_fname').val('');
	     $('#page_signup_s_lname').val('');
	     $('#page_signup_s_email').val('');
	     $('#page_signup_s_pass').val('');
	   
	     // Goto login page
       $.mobile.pageContainer.pagecontainer("change", "#page_login", {transition: "slide", changeHash: false});
     }
  });
  // END: drupal services user login
  return false;
});