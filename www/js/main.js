var DOMAIN = 'http://klassenweb.de'; // No trailing slash
var lan = '/en'; // No trailing slash
var api = '/api/v1'; // No trailing slash
var nid, user, sessid, email, pass; // global node id variable, token for logged in user
var token;
var ajaxLoader = "<div class='ajaxloader'><div class='uil-squares-css' style='transform:scale(0.65);'><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div></div>";
var ntf = '<div id="ntf"><div class="ntf-inner" ><div class="msg"></div><button class="close ui-btn ui-btn-inline ui-corner-all" data-t="close">Close</button></div></div>';
var picture, formid;
var setp = 0;

function isLoggedIn() {
  var session_name = $.cookie('session_name');
  return session_name == null ? false : true;
}

function setToken(){
  if (token == null) {
    // Get a Token from the site
    $.ajax({
      url: DOMAIN + lan + api + "/user/token.json",
      type: 'post',
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
        testConnect(1);
      }
    }); // End Ajax
  }
  else {
      testConnect(1);
  }
}

function testConnect(xhrFields){
  var o = {
    url: DOMAIN + lan + api + "/system/connect.json",
    type: 'post',
    dataType: 'json',
    crossDomain: true,
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('page_dashboard - failed to system connect');
      console.log(JSON.stringify(XMLHttpRequest));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
    success: function (data) {
      var drupal_user = data.user;
      if (drupal_user.uid == 0) { // user is not logged in, show the login button, hide the logout button
        $('#button_login').show();
        $('#button_logout').hide();
      }
      else { // user is logged in, hide the login button, show the logout button
        $('#button_login').hide();
        $('#button_logout').show();
      }
    }
  };
  if (xhrFields == 1) {
    o.xhrFields = {
      withCredentials: true
    };
    o.beforeSend = function (request) {
      request.setRequestHeader("X-CSRF-Token", token);              
    };
  }
  $.ajax(o);
}

function translate() {
  var translation;
  $('[data-t]').each(function(){
    translation = po[$(this).attr('data-t')];
	if ($(this).prop("tagName") == 'TEXTAREA') {
	  $(this).attr('placeholder', translation);
	}
	else if($(this).prop("tagName") == 'INPUT'){
	  $(this).attr('value', translation);
	}
	else {
      $(this).html(translation);
	}
  });
}

/** Add placeholders to form elements, and hide labels.
     Do this only after translate.
**/
function activatePlaceholders() {
  $('label').not('.plchldr-processed').each(function(){
    var selector = $(this).attr('for');
    $('input[name=' + selector + ']').attr('placeholder', $(this).text()).addClass('plchldr-processed');
    if (!$(this).hasClass('show')) {
      $(this).addClass('ui-hidden-accessible');
    }
  });
}

function init() {
  if (isLoggedIn()) { // user is logged in, go to the activity page
    $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "fade", changeHash: false});
  }
  else { // user is not logged in, show the front page

    setTimeout(function(){
      $.mobile.pageContainer.pagecontainer("change", "#page_front", {transition: "fade", changeHash: false});
    }, 1000);
   }
}

function detectClickOutsideNtfPane() {
  $(document).click(function(event) { 
    if(!$(event.target).closest('#ntf').length) {
      if($('#ntf').hasClass('open')) {
        $('.ntf-inner .close').click();
      }
    }        
  });
}


// Allows us to do a page.html#pageId
function deepLink() {
    if(window.location.search) {
      var query = location.search.replace('?', '');
      $.mobile.pageContainer.pagecontainer("change", "#" + query, {changeHash: false});
    }
}

// Enable deep linking
$(document).off('pagebeforeshow.deep1').on('pagebeforeshow.deep1', '#page_afront', deepLink);
$(document).off('pagebeforeshow.deep2').on('pagebeforeshow.deep2', '#page_cfront', deepLink);
$(document).off('pagebeforeshow.deep3').on('pagebeforeshow.deep3', '#page_mfront', deepLink);

// Init functions
$(document).ready(function(){
  token = $.cookie('token');
	translate();
	activatePlaceholders();
	detectClickOutsideNtfPane();
});

$(document).ajaxSuccess(function() {
  translate();
});

/**
 * Load node data for displaying news and events on the activity page.
 * 
 * @param int page
 *   Page number. If absent, then 1
 */
function loadActivity() {
  $filter = localStorage.getItem('filter') != null ? localStorage.getItem('filter') : 0;
  // BEGIN: drupal services getActivity
  $.ajax({
    url: DOMAIN + lan + api + "/activities/1",
    type: 'get',
    dataType: 'json',
    data: { 
      "filter": $filter,
    },
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      //
    },
    success: function (data) {
      if($filter){
    	$('#page_afront .node_wrapper').empty();
    	//localStorage.removeItem('filter');
      }
    	
      var node;
       
       var out = '';
       for (var i = 0; i < data.length; i++) {
         node = data[i];

         if(node.type == 'news'){
          
          out +=  '<div class="news node-'+node.nid+'">'+
          			'<div class="post-shadow">'+
          			  '<div class="post-header">';
          			if(node.hasOwnProperty('url')){
          			  out += '<div class="post-media">'+
          				  	   '<img class="img-responsive" typeof="foaf:Image" src="'+node.url+'" alt="" width="85" height="90" style="display: block;">'+
          				  	 '</div>';  //post-media
          			} else {
          out += '<div class="post-media">'+
                  '<img class="img-responsive" src="img/default-post.jpg" alt="" width="85" height="90" style="display: block;">'+
                  '</div>';  //post-media
                }
          		out +=  '<div class="post-title">'+
        			      '<div class="title">' + node.title + '</div>'+
        			      '<div class="post-autor">'+node.post_autor+'</div>'+
                    '<div class="post-created"><span data-t="postedon">Posted on: </span>'+dateFormat(node.created*1000, "dd.mm.yyyy HH:MM")+'</div>'+
        			      '<div class="title-details">'+ 
        			  	    '<a href="#" id="show-rest" class="show_rest" data-id="'+ node.nid+'"><span data-t="readmore">Read more</span></a>'+
        			  	    /*'<span class="post-time">'+dateFormat(node.start*1000, "dd.mm.yyyy")+' @ '+dateFormat(node.start*1000, "HH:MM")+'</span>'+*/
        			      '</div>'+ //title-details
        			    '</div>'+ //post-title
        			    '<div class="title-icons">';
			          	  if(node.can_edit){
			                out += '<a href="#page_add_news" data-role="button" data-id="' + node.nid + '" id="button_edit" class="edit-post iedit title-icon" data-t="edit"><i class="iedit material-icons">edit</i></a>';
			              }
			              if(node.can_delete){
			                out += '<a href="#" data-role="button" class="button_delete delete-post idelete title-icon" data-id="' + node.nid + '"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
			              }
        		out +=  '</div>'+ //title-icons
          			  '</div>'+ //post-header
          			  '<div class="post-wrapper wrapper-' + node.nid + '" style="height: 0px;">'+  
                    	'<div class="post-body">'+      
                    	  '<div class="body-post">'+
                    	    node.body_value +      
                    	  '</div>'+  //body-post  
                    	  '<div class="edit-bar">'+      
                    		'<div class="comment-text comment-' + node.nid + '">'+      
                    		  '<p>'+
                    		    '<a href="#" class="show-comments" data-id="'+node.nid+'"><i class="material-icons">comment</i> <span data-t="addcomments">Add comment</span> (<span class="num_comments">'+node.num_comments+'</span>)</a>'+
                    		  '</p>'+      
                    		'</div>'+ //comment-text   
                    	  '</div>'+ // edit-bar  
                    	'</div>'+ //post-body 
                      '</div>'+ //post-shadow
                    	'<div class="comment-wrapper-all wrapper-comments-'+node.nid+'" style="display: none;">'+    
                    	 '<div id="proccesed-comments-'+node.nid+'">';
        		        $.each(node.comments, function( key, value ) {
                      out +='<div class="singular-comment singular-comment-'+value.c_id+'">'+
                    		  '<div class="comment-avatar">'+
                    		  	value.c_picture+
                    		  '</div>'+ //comment-avatar
                    		  '<div class="comment-body">'+
                    			'<p class="comment-title">'+value.c_autor+'</p>'+
                    			'<p class="comment-date">'+dateFormat(value.c_created*1000, "dd-mm-yyyy")+'<i class="material-icons">schedule</i>'+dateFormat(value.c_created*1000, "HH:MM")+'</p>'+
                    			'<div class="comment-content">'+
                    			  '<span class="c_body">'+value.c_body+'</span>'+
                    			  '<div class="comment-icons">';
                    			  if(value.c_owner){    
                                      out += '<a href="#editcomment" data-role="button" data-id="' + value.c_id + '" id="button_edit" class="edit-comment" data-t="edit"><i class="iedit material-icons">edit</i></a>';
                                      //out += '<a href="#delete-coment-popup" data-role="button" data-id="' + value.c_id + '" class="button_delete delete-post"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
                                  }
                    	out +=    '</div>'+ //comment-icons
                    			'</div>'+ //comment-content
                    		  '</div>'+ //comment-body
                    		'</div>'+ //singular-comment 
                    		'<hr>';
                    	  })
                   out += '</div>'+ //proccesed-comments-nid
                    	  '<div id="comments" class="comment-wrapper">'+
                    	    '<form id="comment-form" data-id="' + node.nid + '" >'+
                    		  '<div class="comment-body-wrapper">'+
                    			'<i class="material-icons">reply</i>'+
                    			'<textarea rowspan="5" name="comment-body" data-t="stype" placeholder="Start typing your message" class="comment-body comment-body-'+node.nid+' ui-input-text ui-shadow-inset ui-body-inherit ui-corner-all ui-textinput-autogrow" required></textarea>'+
                    			'<input type="submit" value="reply" class="comment-btn btn btn-success form-submit ajax-processed ui-btn ui-btn-b ui-shadow ui-corner-all" data-t="reply">'+
                    	      '</div>'+//comment-body-wrapper
                    		'</form>'+      
                    	  '</div>'+ //comment-wrapper
                        '</div>'+ //comment-wrapper-all
                      '</div>'+//post-wrapper
          			
          		  '</div>'; //news
         }
         else if(node.type == 'event'){
          
          out +=  '<div class="event node-'+node.nid+'">'+
			'<div class="post-shadow">'+
			  '<div class="post-header">';
			if(node.hasOwnProperty('url')){
			  out += '<div class="post-media">'+
				  	   '<img class="img-responsive" typeof="foaf:Image" src="'+node.url+'" alt="" width="85" height="90" style="display: block;">'+
				  	 '</div>';  //post-media
			} else{
      out += '<div class="post-media">'+
              '<img class="img-responsive" src="img/default-post.jpg" alt="" width="85" height="90" style="display: block;">'+
              '</div>';  //post-media
            }
		out +=  '<div class="post-title">'+
			      '<div class="title">' + node.title + '</div>'+
			      '<div class="post-autor">'+node.post_autor+'</div>'+
			      '<div class="post-created"><span data-t="postedon">Posted on: </span>'+dateFormat(node.created*1000, "dd.mm.yyyy HH:MM")+'</div>'+
			      '<div class="title-details">'+ 
			  	    '<a href="#" id="show-rest" class="show_rest" data-id="'+ node.nid+'" data-t="readmore">Read more</a>'+
			  	    '<span class="post-time"><i class="material-icons">schedule</i> '+dateFormat(node.start*1000, "dd.mm.yyyy")+' '+dateFormat(node.start*1000, "HH:MM")+'</span>'+
			      '</div>'+ //title-details
			    '</div>'+ //post-title
			    '<div class="title-icons">';
	          	  if(node.can_edit){
	                out += '<a href="#page_add_event" data-role="button" data-id="' + node.nid + '" id="button_edit" class="edit-post iedit title-icon" data-t="edit"><i class="iedit material-icons">edit</i></a>';
	              }
	              if(node.can_delete){
	                out += '<a href="#" data-role="button" class="button_delete delete-post idelete title-icon" data-id="' + node.nid + '"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
	              }
		out +=  '</div>'+ //title-icons
			  '</div>'+ //post-header
			  '<div class="post-wrapper wrapper-' + node.nid + '" style="height: 0px;">'+  
          	'<div class="post-body">'+      
          	  '<div class="body-post">'+
          	    node.body_value +      
          	  '</div>'+  //body-post  
          	  '<div class="edit-bar">'+      
          		'<div class="comment-text comment-' + node.nid + '">'+      
          		  '<p>'+
          		    '<a href="#" class="show-comments" data-id="'+node.nid+'"><i class="material-icons">comment</i> <span data-t="addcomments">Add comment</span> (<span class="num_comments">'+node.num_comments+'</span>)</a>'+
          		  '</p>'+      
          		'</div>'+ //comment-text   
          	  '</div>'+ // edit-bar  
          	'</div>'+ //post-body 
            '</div>'+ //post-shadow
          	'<div class="comment-wrapper-all wrapper-comments-'+node.nid+'" style="display: none;">'+    
          	 '<div id="proccesed-comments-'+node.nid+'">';
		        $.each(node.comments, function( key, value ) {
            out +='<div class="singular-comment singular-comment-'+value.c_id+'">'+
          		  '<div class="comment-avatar">'+
          		  	value.c_picture+
          		  '</div>'+ //comment-avatar
          		  '<div class="comment-body">'+
          			'<p class="comment-title">'+value.c_autor+'</p>'+
          			'<p class="comment-date">'+dateFormat(value.c_created*1000, "dd-mm-yyyy")+'<i class="material-icons">schedule</i>'+dateFormat(value.c_created*1000, "HH:MM")+'</p>'+
          			'<div class="comment-content">'+
          			  '<span class="c_body">'+value.c_body+'</span>'+
          			  '<div class="comment-icons">';
          			  if(value.c_owner){    
                            out += '<a href="#editcomment" data-role="button" data-id="' + value.c_id + '" id="button_edit" class="edit-comment" data-t="edit"><i class="iedit material-icons">edit</i></a>';
                            //out += '<a href="#delete-coment-popup" data-role="button" data-id="' + value.c_id + '" class="button_delete delete-post"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
                        }
          	out +=    '</div>'+ //comment-icons
          			'</div>'+ //comment-content
          		  '</div>'+ //comment-body
          		'</div>'+ //singular-comment 
          		'<hr>';
          	  })
         out += '</div>'+ //proccesed-comments-nid
          	  '<div id="comments" class="comment-wrapper">'+
          	    '<form id="comment-form" data-id="' + node.nid + '" >'+
          		  '<div class="comment-body-wrapper">'+
          			'<i class="material-icons">reply</i>'+
          			'<textarea rowspan="5" name="comment-body" data-t="stype" placeholder="Start typing your message" class="comment-body comment-body-'+node.nid+' ui-input-text ui-shadow-inset ui-body-inherit ui-corner-all ui-textinput-autogrow" required></textarea>'+
          			'<input type="submit" value="reply" class="comment-btn btn btn-success form-submit ajax-processed ui-btn ui-btn-b ui-shadow ui-corner-all" data-t="reply">'+
          	      '</div>'+//comment-body-wrapper
          		'</form>'+      
          	  '</div>'+ //comment-wrapper
              '</div>'+ //comment-wrapper-all
            '</div>'+//post-wrapper
			
		  '</div>'; //event
         }
       }
       $('#page_afront .node_wrapper').html(out);
       
   	   user_has_role();
     }
  });
} 
/**
 * Load form elements for news
 * 
 * @param int page
 *   Page number. If absent, then 1
 */
function loadAddNews(nid1) {
  var nid = typeof nid1 == 'undefined' ? 'start' : nid1;
  // BEGIN: drupal services getActivity
  $.ajax({
    url: DOMAIN + lan + api + "/addnews/" + nid,
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
    },
    success: function (data) {
      if($.isNumeric(nid)){
    	$('#news-node-form .recipients select').remove();
    	$('input[type="hidden"]').remove();  	
    	$('#news-node-form .form-item-title input').val('');
	    $('#news-node-form .edit-body textarea').val('');
    	
    	if(data.hasOwnProperty('body')){
    	  input = data.body;    	  
    	  input = input.slice(0,-4);    	
    	  input = input.replace('<p>','');    	
    	  input = input.replace(/<\/p><p>/g, '\n');        
          $('#news-node-form .edit-body textarea').val(input);
        }
        
    	if(data.hasOwnProperty('title')){
          $('#news-node-form .form-item-title input').val(data.title);
        }
    	
    	$('#news-node-form').append('<input type="hidden" name="nid" value="'+nid+'">');
        
    	if(data.hasOwnProperty('preview')){
          $('#news-node-form .image').html(
            '<div class="preview">'+
              '<img style="width: 100%" src="'+data.preview+'">'+
              '<div class="cont-remove">'+
              '<fieldset>'+
              	'<a href="#" class="remove cancel-button" data-role="button"><i class="material-icons">clear</i><span data-t="removeImage">Remove image</span></a>'+
                '</fieldset>'+
              '</div>'+
            '</div>');         
        }  	
    	
    	if(data.hasOwnProperty('image')){ 
          if(data.hasOwnProperty('preview')){
        	  $('#news-node-form .image').append(
        	    '<div class="field-name-field-news-image">'+
        	      '<button id="edit-field-news-image-und-0-upload"><span data-t="browse">Browse...</span></button> <span class="no-select" data-t="noSelect">No file selected.</span>'+
        	    '</div>');  
            $('#news-node-form .image .field-name-field-news-image').hide();
          }
          else{
        	$('#news-node-form .image').html(
              '<div class="field-name-field-news-image">'+
              	 '<button id="edit-field-news-image-und-0-upload"><span data-t="browse">Browse...</span></button> <span class="no-select" data-t="noSelect">No file selected.</span>'+
              '</div>');  
          }
        }
      }
      else{
    	$('#news-node-form .recipients').html(
    	  '<select name="recipients" id="nrecipients" data-native-menu="false" multiple required>'+
    	    '<option data-t="recipients">Select recipients</option>'+
    	  '</select>');
    	$('input[type="hidden"]').remove();
    	$('#news-node-form .form-item-title input').val('');
	    $('#news-node-form .edit-body textarea').val('');
    	  
	    if(data.hasOwnProperty('recipients')){	 
		  $.each(data.recipients, function( key, value ) {
		    $('<option>').val(key).html(value).appendTo('#news-node-form .recipients select');
		  });
		  translate();
		  $('#news-node-form .recipients select').selectmenu().selectmenu('refresh', true);
	    }	    
		       
		$('#news-node-form .image').html(
		  '<div class="field-name-field-news-image">'+
			'<button id="edit-field-news-image-und-0-upload"><span data-t="browse">Browse...</span></button> <span class="no-select" data-t="noSelect">No file selected.</span>'+
		  '</div>'
		);
		       
		if(data.hasOwnProperty('staff_schools')){
		  $('#news-node-form').append(data.staff_schools);
		}
		if(data.hasOwnProperty('staff')){
		  $('#news-node-form').append(data.staff);
		}
		if(data.hasOwnProperty('teacher')){
		  $('#news-node-form').append(data.teacher);
		} 
      }           
    }
  });
}

function deleteNode(nid) {

  $.ajax({
     url: DOMAIN + lan + api + "/addnews/" + nid,
     type: 'delete',
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
       var msg = data.responseText;
	   if (msg != 'ok') {
            $('#page_afront .ui-content').append(ntf);
            var $msgdiv = $('.ntf-inner .msg');
            $msgdiv.html('<div class="error">' + msg + '</div>');
            var screen = $(window).outerHeight();
            var msg = $msgdiv.outerHeight(true);
            var $close = $('.ntf-inner .close');
            $close.css({top: (msg - $close.outerHeight()) / 2}).click(function(){
              $('#ntf').animate({'bottom':'-100%'},300).remove();
            });
            $('#ntf').animate({'bottom': msg - screen}).addClass('open');
	   }
	   else {
         $('.node-'+nid+'').fadeOut().remove();
	   }
    }
  });
}

/**
 * Load form elements for event
 * 
 * @param int nid
 *   Nid of node to be edited. If absent, then start (get elements for new event)
 */
function loadAddEvent(nid1) {
  var nid = typeof nid1 == 'undefined' ? 'start' : nid1;
  // BEGIN: drupal services getActivity
  $.ajax({
    url: DOMAIN + lan + api + "/addevent/" + nid,
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
    },
    success: function (data) {
      if(localStorage.getItem("addNewItem") === null){
    	localStorage.setItem('addNewItem', $('#page_add_event #event-node-form .panel-body').html());
      }
      
      var html = localStorage.getItem('addNewItem');
      
	  if($.isNumeric(nid)){
	    $('#page_add_event #event-node-form .panel-body').empty();
    	$('#event-node-form .recipients select').remove();
    	$('input[type="hidden"]').remove();
    	$('#event-node-form .input-radio').remove();
    	$('#event-node-form .form-item-title input').val('');
	    $('#event-node-form .edit-body textarea').val('');
    	
    	if(data.hasOwnProperty('body')){
    	  input = data.body;    	  
    	  input = input.slice(0,-4);    	
    	  input = input.replace('<p>','');    	
    	  input = input.replace(/<\/p><p>/g, '\n');        
          $('#event-node-form .edit-body textarea').val(input);
        }
        
    	if(data.hasOwnProperty('title')){
          $('#event-node-form .form-item-title input').val(data.title);
        }
    	
    	$('#event-node-form').append('<input type="hidden" name="nid" value="'+nid+'">');
        
    	if(data.hasOwnProperty('preview')){
          $('#event-node-form .image').html(
            '<div class="preview">'+
              '<img style="width: 100%" src="'+data.preview+'">'+
              '<div class="cont-remove">'+
                '<fieldset>'+
            	  '<a href="#" class="remove cancel-button" data-role="button"><i class="material-icons">clear</i><span data-t="removeImage">Remove image</span></a>'+
                '</fieldset>'+
              '</div>'+
            '</div>');         
        }  	
    	
    	if(data.hasOwnProperty('image')){
    		console.log($('#event-node-form .image .field-name-field-news-image').html());
    		$('#event-node-form .image .field-name-field-news-image').remove();
          $('#event-node-form .image').append(
        	'<div class="field-name-field-news-image">'+
      		  '<button id="edit-field-news-image-und-0-upload"><span data-t="browse">Browse...</span></button> <span class="no-select" data-t="noSelect">No file selected.</span>'+
      		'</div>');   
          if(data.hasOwnProperty('preview')){
            $('#event-node-form .image .field-name-field-news-image').hide();
          }
        }
    	
    	if(data.hasOwnProperty('dates')){  
    	  $('#page_add_event #event-node-form .panel-body').empty();
    	  $.each(data.dates, function (i) {
    		$('#page_add_event #event-node-form .panel-body').append(html);
    		$.each(data.dates[i], function (key, val) {
    		  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .start-item-date input').attr('value', data.dates[i]['start_date']);
    		  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .start-item-time input').attr('value', data.dates[i]['start_time']);
    		  
    		  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .end-item-date input').attr('value', data.dates[i]['end_date']);
    		  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .end-item-time input').attr('value', data.dates[i]['end_time']);
    		  
    		});
    	  });
    	}
      }
      else{
    	$('#event-node-form .recipients').html(
    	  '<select name="recipients" id="recipients" data-native-menu="false" multiple required>'+
    	    '<option data-t="recipients">Select recipients</option>'+
    	  '</select>');
    	$('input[type="hidden"]').remove();
    	$('#event-node-form .form-item-title input').val('');
	    $('#event-node-form .edit-body textarea').val('');
    	  
	    if(data.hasOwnProperty('recipients')){	 
		  $.each(data.recipients, function( key, value ) {
		    $('<option>').val(key).html(value).appendTo('#event-node-form .recipients select');
		  });
		  translate();
		  $('#event-node-form .recipients select').selectmenu().selectmenu('refresh', true);
	    }	    
		       
		$('#event-node-form .image').html(		  
		  '<div class="field-name-field-news-image">'+
			'<button id="edit-field-news-image-und-0-upload"><span data-t="browse">Browse...</span></button> <span class="no-select" data-t="noSelect">No file selected.</span>'+
		  '</div>'
        );
		       
		if(data.hasOwnProperty('staff_schools')){
		  $('#event-node-form').append(data.staff_schools);
		}
		if(data.hasOwnProperty('staff')){
		  $('#event-node-form').append(data.staff);
		}
		if(data.hasOwnProperty('teacher')){
		  $('#event-node-form').append(data.teacher);
		} 
      }           
    }
  });
}

/**
 * Submits news to server
 * 
 * @param int page
 *   Page number. If absent, then 1
 */
function submitNews(data) {
  $.ajax({
     url: DOMAIN + lan + api + "/addnews",
     type: 'post',
     dataType: 'array',
     data: {'value' : data},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
      $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "fade", changeHash: true});
    }
  });
}

/**
 * Submits event to server
 * 
 * @param int page
 *   Page number. If absent, then 1
 */
function submitEvent(data) {
  var type_submit = 'post';
  var nid = '';
  if(data.hasOwnProperty('nid')){
	type_submit = 'put';
	nid = data.nid;
  }
  $.ajax({
     url: DOMAIN + lan + api + "/addevent/" + nid,
     type: type_submit,
     dataType: 'array',
     data: {'value' : data},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
      $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "fade", changeHash: true});
    }
  });
}

/**
 * Submits comment to server
 * 
 * @param array data
 *   Array of elements for creating comment 
 */
function submitComment(data) {
  $.ajax({
     url: DOMAIN + lan + api + "/addcomment",
     type: 'post',
     dataType: 'array',
     data: {'value' : data},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
      //ajax new comment
    }
  });
}

function logout() {

  // BEGIN: drupal services user register
  $.ajax({
     url: DOMAIN + lan + api + "/user/logout.json",
     type: 'post',
     dataType: 'json',
     contentType: 'application/json',
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       // If there is an error..well who cares. Delete the cookie and goto login page
       $.removeCookie('token', { path: '/' });
       $.removeCookie('session_id', { path: '/' });
       $.removeCookie('session_name', { path: '/' });
	   document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	   document.cookie = 'session_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	   document.cookie = 'session_name=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
       $.mobile.pageContainer.pagecontainer("change", "index.html", {transition: "fade", changeHash: false});
     },
     success: function (data) {
       // Delete the cookie and goto login page
       $.removeCookie('token', { path: '/' });
       $.removeCookie('session_id', { path: '/' });
       $.removeCookie('session_name', { path: '/' });
	   document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	   document.cookie = 'session_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	   document.cookie = 'session_name=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	   localStorage.clear();
	   
       $.mobile.pageContainer.pagecontainer("change", "index.html", {transition: "fade", changeHash: false});   
     }
  });
  
}

function loadEvents() {
	
  $.ajax({
    url: DOMAIN + lan + api + "/events/1",
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
    },
    success: function (ev) {
	  var $calendar = $("#calendar");
      for (i = 0; i < ev.length; i++) {
        ev[i].start = new Date(ev[i].start * 1000);
        ev[i].end = new Date(ev[i].end * 1000);
        $calendar.fullCalendar("renderEvent", ev[i], true);
      }
	  $calendar.fullCalendar('render');
    }
  });
}

function loadStudentList() {
	
  $.ajax({
    url: DOMAIN + lan + api + "/studentlist/1",
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
    },
    success: function (data) {
    	var el = $('#student-list');
    	console.log(data);
		el.html(data);
		try{
		$('table', $('#student-list')).table();
		}catch(e) {
			console.log(e);
		}
		
		el.find('div[data-role=collapsible]').collapsible({theme:'c',refresh:true});
    }
  });
	
}

function loadUserData() {
	
  $.ajax({
    url: DOMAIN + lan + api + "/userdata/1",
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
    },
    success: function (data) {
		var uid = data.uid;
		var fname = data.field_firstname['und'][0]['value'];
		var lname = data.field_lastname['und'][0]['value'];
		var remail = data.field_receive_email['und'][0]['value'] == 1 ? 'yes' : 'no';console.log(remail);
		var rnotifications = data.field_receive_push_notifications['und'][0]['value'] == 1 ? 'yes' : 'no';
		var gender = data.field_gender['und'][0]['value'];
		var showdata = data.field_show_data['und'][0]['value'] == 1 ? 'yes' : 'no';
		//var nocontact = data.field_no_contact['und'][0]['value'];
		$('#page_options_uid').val(uid);
		$('#page_options_fname').val(fname);
		$('#page_options_lname').val(lname);
		$('#optionsFormP[name="radio-gender"]').val(gender);
		$('#optionsFormP[name="receive_email"]').val(remail).flipswitch('refresh');
		$('#optionsFormP[name="receive_push"]').val(rnotifications).flipswitch('refresh');
		$('#optionsFormP[name="showdata"]').val(showdata).flipswitch('refresh');
		//$('#optionsFormP[name="receive_email"]').val(nocontact);
    }
  });
	
}

function saveUserData(indata) {
	
  $.ajax({
     url: DOMAIN + lan + api + "/userdata",
     type: 'post',
     dataType: 'array',
     data: {value : indata},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
    	 response = data['responseText'];
		 
		$('#page_ofront .ui-content').append(ntf);
		var $msgdiv = $('.ntf-inner .msg');
		$msgdiv.html('<div class="error">' + response + '</div>');
		var screen = $(window).outerHeight();
		var msg = $msgdiv.outerHeight(true);
		var $close = $('.ntf-inner .close');
		$close.css({top: (msg - $close.outerHeight()) / 2}).click(function(){
		  $('#ntf').animate({'bottom':'-100%'},300).remove();
		});
		$('#ntf').animate({'bottom': msg - screen}).addClass('open');
    }
  });
}
    
/**
 * Sends data for creating new conversation comment or post comment
 * 
 * @param array data
 *   all papams needed to create conversation comment
 */
function createComment(data) {
  
  var operation = typeof(data[2]) != "undefined" && data[2] !== null ? data[2] : "default";
	
  $.ajax({
     url: DOMAIN + lan + api + "/conversation",
     type: 'post',
     dataType: 'array',
     data: {value : data},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
    	 var out = '';

    	 comment = JSON.parse(data['responseText']);
         
       switch (operation) {
         case 'create':      
        	 
	    	 out +=
	    		 
	    	'<div class="singular-comment singular-comment-'+comment.cid+'">'+
       		  '<div class="comment-avatar">'+
       		  	comment.c_picture+
       		  '</div>'+ //comment-avatar
       		  '<div class="comment-body">'+
       			'<p class="comment-title">'+comment.c_autor+'</p>'+
       			'<p class="comment-date">'+dateFormat(comment.created*1000, "dd-mm-yyyy")+'<i class="material-icons">schedule</i>'+dateFormat(comment.created*1000, "HH:MM")+'</p>'+
       			'<div class="comment-content">'+
       			  '<span class="c_body">'+comment.comment_body['und'][0]['value']+'</span>'+
       			  '<div class="comment-icons">';
       			  if(comment.c_owner){    
                         out += '<a href="#editcomment" data-role="button" data-id="' + comment.cid + '" id="button_edit" class="edit-comment" data-t="edit"><i class="iedit material-icons">edit</i></a>';
                         //out += '<a href="#delete-coment-popup" data-role="button" data-id="' + value.c_id + '" class="button_delete delete-post"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
                     }
       	out +=    '</div>'+ //comment-icons
       			'</div>'+ //comment-content
       		  '</div>'+ //comment-body
       		'</div>'+ //singular-comment 
       		'<hr>';

           $('#proccesed-comments-'+comment.nid).append(out);
           $('.node-'+comment.nid+' #comment-form textarea').val('');
           var num = $('.node-'+comment.nid+' .num_comments').text();
           console.log(num);
           $('.node-'+comment.nid+' .num_comments').html(parseInt(num)+1);
           $('.comment-body-' + comment.nid).val('');
           break;
         case 'edit':
           $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "fade", changeHash: true});
           break;
         case 'default':
           break;
       }
    }
  });
}

/**
 * Sends comment id to be deleted
 * 
* @param int cid
 *   nid of conversation
 */
function deleteComment(cid) {	
  $.ajax({
     url: DOMAIN + lan + api + "/conversation/"+cid,
     type: 'delete',
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
       var nid = JSON.parse(data.responseText)
       $('#page_afront .singular-comment-'+cid).remove();
       $('#page_afront .nline-'+cid).remove();
       var num = $('.node-'+nid+' .num_comments').text();
       $('.node-'+nid+' .num_comments').html(parseInt(num) - 1);
       $( "#delete-coment-popup" ).popup( "close" )
    }
  });
}

// Reload page on swipe up
$(document).on("swipeup", '.main', function(){
  $.mobile.pageContainer.pagecontainer("change", "#" + $(this).attr('id'), {allowSamePageTransition: true});
});

// Login screen
$(document).off('pageshow.login').on('pageshow.login', '#page_login', function(){
  if (email != null && pass != null) {
    $("#loginAfterRegisterDialog").popup("open");
    $('#page_login_email').val(email);
    $('#page_login_pass').val(pass);
    email = null;
    pass = null;
  }
});

// Login button leads to login page
$(document).off('click.main1').on("click.main1", '#button_login', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_login", {transition: "slide", changeHash: false});
});
// Signup button leads to signup page
$(document).off('click.main2').on("click.main2", '#button_signup', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_signup_s", {transition: "slide", changeHash: false});
});
// Signup parent button leads to signup parent page
$(document).off('click.sgn1').on("click.sgn1", '#button_signup_p', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_signup_p", {transition: "fade", changeHash: false});
});
// Signup parent button leads to signup parent page
$(document).off('click.sgn2').on("click.sgn2", '#button_signup_s', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_signup_s", {transition: "fade", changeHash: false});
});

// Login cancel button leads back to front page
$(document).off('click.lgn').on("click.lgn", '#page_login_cancel', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_front", {transition: "slide", reverse: true, changeHash: false});
});
// Signup cancel button leads back to front page
$(document).off('click.sgn3').on("click.sgn3", '#page_signup_cancel', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_front", {transition: "slide", reverse: true, changeHash: false});
});
// Reset cancel button leads back to front page
$(document).off('click.rst').on("click.rst", '#page_reset_password', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_front", {transition: "slide", reverse: true, changeHash: false});
});

// Create new news cancel button leads back to front page
$(document).off('click.anc').on("click.anc", '#page_an_reset_cancel', function(e){
  e.preventDefault();
  $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "slide", reverse: true, changeHash: false});
});

$(document).on("pagecontainerload",function(event, data){

  if (data.url == 'index.html') {
    $.mobile.pageContainer.pagecontainer("change", "#page_front", {transition: "fade", changeHash: true});
  }
});
$(document).off('click.deletenode').on('click.deletenode', '.delete-post', function(){
	var nid = $(this).attr('data-id');
	deleteNode(nid);
});

// Splash screen
$(document).off('pagebeforeshow.index').on('pagebeforeshow.index', '#page_splash', init);
$(document).off('pagebeforeshow.activity').on('pagebeforeshow.activity', '#page_afront', function() {	
  if ($('#node_wrapper').children().length == 0) {
    loadActivity();
  }  
});
$(document).off('pagebeforeshow.calendar').on('pagebeforeshow.calendar', '#page_cfront', function() {

  var $calendar = $("#calendar");

  $('#calendar').fullCalendar('destroy');
  if ($calendar.length > 0) {
	  console.log('Ok');
      $calendar.fullCalendar({
    	  height: 650,
    	  buttonText: {
    		  listMonth: 'mList',
    		  listWeek: 'wList',
    		  agendaWeek: "wAgenda",
    		  agendaDay: "dAgenda",
    	  },
    	  header: {
          left:   'title',
          center: '',
          right:  'today month basicWeek basicDay agendaWeek agendaDay listMonth listWeek prev,next'
        },
        eventRender: function(event, element) {
          $(element).addTouch();
        },
        /*viewRender: function(currentView){
          var minDate = moment(),
          maxDate = moment().add(2,'weeks');
          // Past
          if (minDate >= currentView.start && minDate <= currentView.end) {
            $(".fc-prev-button").prop('disabled', true); 
            $(".fc-prev-button").addClass('fc-state-disabled'); 
          }
          else {
            $(".fc-prev-button").removeClass('fc-state-disabled'); 
            $(".fc-prev-button").prop('disabled', false); 
          }
        },*/
        events: {
            url: DOMAIN + lan + api + '/events/1',
            type: 'get',
            xhrFields: {
              withCredentials: true
            },
            beforeSend: function (request) {
              request.setRequestHeader("Cookie", $.cookie("session_id"));
              request.setRequestHeader("X-CSRF-Token", token);              
            },
            error: function() {
                alert('there was an error while fetching events!');
            },
            //color: 'yellow',   // a non-ajax option
            //textColor: 'black' // a non-ajax option
        }        
      });
	//loadEvents();
      $calendar.fullCalendar('next');
      console.log('Ready');
  } 
});

$(document).off('pagebeforeshow.single').on('pagebeforeshow.single', '#page_sevent', function() {
  loadSingle(localStorage.getItem("single_event"));
  localStorage.removeItem("single_event");
});

$(document).off('pagebeforeshow.studentlist').on('pagebeforeshow.studentlist', '#page_slfront', function() {

  var $studentList = $("#student-list");
  if ($studentList.length > 0) {
	loadStudentList();
  }
	
});

$(document).off('pagebeforeshow.options').on('pagebeforeshow.options', '#page_ofront', function() {

  $(document).off('click.logout').on('click.logout', '#logout', function(e){
    e.preventDefault();
    logout();
  });
  loadUserData();
  $(document).off('click.opt').on('click.opt', '#page_options_submit', function(e){
	e.preventDefault();
	var data = $('#optionsFormP').serialize();
	saveUserData(data);
  });
  
});

$(document).off('pagebeforeshow.messages').on('pagebeforeshow.messages', '#page_mfront', function() {
  if ($('.all-messages').children().length == 0) {
	loadMessages();
  }  
});

$(document).on('pagebeforeshow.conversation', '#page_confront1', function() {
  nid = localStorage.getItem("conversation"); //$.cookie('conversation');
  
  loadConversation(nid);
  localStorage.removeItem("conversation");
  var n = $(document).height();
  $.mobile.silentScroll(n)
});
$(document).off('pageshow.conversation').on('pageshow.conversation', '#page_confront1', function() {
  var n = $(document).height();
  $.mobile.silentScroll(n);
});

$(document).off('pagebeforeshow.conversation', '#page_confront1', function() {
  $('.messages-col').empty();
});

$(document).off('pagebeforeshow.addnews').on('pagebeforeshow.addnews', '#page_add_news', function() {
  if(localStorage.getItem("edit_post") == null){
	loadAddNews();
  }
  else{
	loadAddNews(localStorage.getItem("edit_post"));
	localStorage.removeItem("edit_post");
  }
});

$(document).off('pagebeforeshow.addevent').on('pagebeforeshow.addevent', '#page_add_event', function() {
  if(localStorage.getItem("edit_post") == null){
	$('#page_add_event #event-node-form')[0].reset();
	loadAddEvent();
	
	$('#page_add_event .start-item-date input, #page_add_event .end-item-date input').val(dateFormat(new Date(), "dd.mm.yyyy"));
	$('#page_add_event .start-item-time input, #page_add_event .end-item-time input').val(dateFormat(new Date(), "HH:MM"));
	$('#event-node-form .panel-body .one-date').slice(1).remove();
  }
  else{
	loadAddEvent(localStorage.getItem("edit_post"));
	localStorage.removeItem("edit_post");
  }
  
	$('#event-node-form .end-voting-date-combo').hide();
	$('#event-node-form .clearfix').hide();
	

  
});

$(document).on('click', '#page_add_event #event-node-form .field-add-more-submit', function(e) {
  html = localStorage.getItem('addNewItem');
  
  $('#page_add_event #event-node-form .date-combo .panel-body').append(html);
  
  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .start-item-date input').attr('value', dateFormat(new Date(), "dd.mm.yyyy"));
  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .start-item-time input').attr('value', dateFormat(new Date(), "HH:MM"));
  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .end-item-date input').attr('value', dateFormat(new Date(), "dd.mm.yyyy"));
  $('#page_add_event #event-node-form .date-combo .panel-body .one-date:last .end-item-time input').attr('value', dateFormat(new Date(), "HH:MM"));
});

$(document).on('focus','.field-event-date-datepicker', function(){
  $(this).datepicker({ dateFormat: 'dd.mm.yy', minDate: 0 });
});

$(document).on('focus',".field-event-date-timepicker", function(){
  $(this).timepicker();
});

$(document).on('focus','#edit-field-end-voting-und-0-value-datepicker-popup-0', function(){
  $(this).datepicker({ dateFormat: 'dd.mm.yy', minDate: 0 });
});

$(document).on('focus','#edit-field-end-voting-und-0-value-timeEntry-popup-1', function(){
  $(this).timepicker();
});

$(document).on('change', '.one-date .start-item-date input', function() {
  var tmp1 = $(this).val().split('.');

  var $enddate = $('.end-item-date input', $(this).closest('.one-date'));
  var tmp2 = $enddate.val().split('.');
  if (tmp1[2] + '' + tmp1[1] + '' + tmp1[0] > tmp2[2] + '' + tmp2[1] + '' + tmp2[0]) {
    $enddate.val($(this).val());
  }
});

$(document).on('change', '.one-date .end-item-date input', function() {
  var tmp1 = $(this).val().split('.');
  
  var $startdate = $('.start-item-date input', $(this).closest('.one-date'));
  var tmp2 = $startdate.val().split('.');
  if (tmp1[2] + '' + tmp1[1] + '' + tmp1[0] < tmp2[2] + '' + tmp2[1] + '' + tmp2[0]) {
    $startdate.val($(this).val());
  }
});
	  
$(document).on('change', '.start-item-time input', function() {
  var $enddate = $('.end-item-date input', $(this).closest('.one-date'));
  var $endtime = $('.end-item-time input', $(this).closest('.one-date'));
	
  var startdate = $('.start-item-date input', $(this).closest('.one-date')).val().split('.');
  var starttime = $(this).val().split(':');
	
  var enddate = $enddate.val().split('.');
  var endtime = $endtime.val().split(':');
  if (startdate[2] + '' + startdate[1] + '' + startdate[0] + '' + starttime[1] + '' + starttime[0]  >  enddate[2] + '' + enddate[1] + '' + enddate[0] + '' + endtime[1] + '' + endtime[0]) {
	$endtime.val($(this).val());
  }
});
	  
$(document).on('change', '.end-item-time input', function() {
  var $startdate = $('.start-item-date input', $(this).closest('.one-date'));
  var $starttime = $('.start-item-time input', $(this).closest('.one-date'));
	
  var enddate = $('.end-item-date input', $(this).closest('.one-date')).val().split('.');
  var endtime = $(this).val().split(':');
	
  var startdate = $startdate.val().split('.');
  var starttime = $starttime.val().split(':');
  if (enddate[2] + '' + enddate[1] + '' + enddate[0] + '' + endtime[1] + '' + endtime[0]  <  startdate[2] + '' + startdate[1] + '' + startdate[0] + '' + starttime[1] + '' + starttime[0]) {
	$starttime.val($(this).val());
  }
});

$(document).on('submit', '#page_add_event #event-node-form', function(e){
  e.preventDefault();
  
  var title = $('#event-node-form .form-item-title input').val();
  var data = {'title' : title};
  
  var dates = {};
  var num = 0
  $('.date-combo .panel-body .one-date').each(function () {
    var start = $('.start-item-date input', $(this)).val();
    start += ' '+$('.start-item-time input', $(this)).val();
    
    end = $('.end-item-date input', $(this)).val();
    end += ' '+$('.end-item-time input', $(this)).val();
    
    dates[num] = {};
    dates[num].value = start;
    dates[num].value2 = end;
    
    num++;
  });	
  
  var recipians = value = [];
  $('#page_add_event #recipients-menu li').each(function (index, value) {
	if($(this).attr('aria-selected') == 'true'){
	  var sThisVal = $('#recipients option').eq(index).val();
	  recipians.push(sThisVal);
	  value = JSON.stringify(recipians);
	}
  });
  
  var type = $('#event-node-form input[name=type-event]:checked').val();
  
  var input = $('#event-node-form textarea').val();
  content = input.replace(/\n/g, '</p><p>');    	
  content = '<p>' + content;
  content += '</p>';
  
  var end_date = $('.end-voting-date-combo #edit-field-end-voting-und-0-value-datepicker-popup-0').val();
  end_date += ' '+$('.end-voting-date-combo #edit-field-end-voting-und-0-value-timeEntry-popup-1').val();

  data.end = end_date;

  data.recipians = value;
  data.body = content;
  data.date = dates;
  data.type = type;
  
  $('#event-node-form input[type=hidden]').each(function() {
	var hidden = $(this).attr('name');
	data[hidden] = $(this).val();
  });
  
  if(setp){ 
    waitForElement(data, 'event'); 
  }
  else{
  	submitEvent(data);
  } 
  
  $(this)[0].reset();
});

$(document).off('pagebeforeshow.new-message').on('pagebeforeshow.new-message', '#page_newmessage', function() {
  allContacts();
});

$(document).on('click', '.popup-message', function() {
  $('#msgrecipients').val('Recipients').selectmenu('refresh');
  $('#msgtextarea').val('');
});

$(document).on('click', '#student-list .contact-person', function() {
  uid = $(this).data('id');
  $(this).removeData();    
    
  localStorage.setItem("contact_person", uid);
  $('#page_slfront .popup-message').click();
});


$(document).off('pagebeforeshow.end-voting').on('pagebeforeshow.end-voting', '#page_evfront', function() {
  var nid = localStorage.getItem('end_voting');
  endvoting(nid);
  localStorage.removeItem("end_voting");
});

$(document).on('click', '#button_vote', function() {
  nid = $(this).data('id');
  $(this).removeData();
    
  localStorage.setItem("end_voting", nid);
});

$(document).on('submit', '#school-core-voting-form', function(e) {
  e.preventDefault();
  var data = {};
  data.key = parseInt($('input[name=voting]:checked').val());
  nid = $(this).data('id');
  $(this).removeData();
  data.nid = nid;
  submitendvoting(data);
});


$(document).on('click', '.all-messages .conversation a', function() {
	nid = $(this).data('id');
    $(this).removeData();
    
    localStorage.setItem("conversation", nid);
});

$(document).on('click', '#page_confront1 .post-message-btn', function(e) {
	var input = $('#page_confront1 textarea').val();
	content = input.replace(/\n/g, '</p><p>');    	
    content = '<p>' + content;
    content += '</p>';
	$('textarea').val('');	
	var data = [content, nid];	
	createComment(data);
	$('.messages-col').empty();
	setTimeout(loadConversation(nid), 2000);
	e.preventDefault();
});

$(document).on('submit', '.mobileform', function(e) {
  e.preventDefault();
  $('.submit-new-message').click();
});
$(document).on('click', '.submit-new-message', function(e) {
	e.preventDefault();
	var recipians = [];
	var array_value;
	$('#page_newmessage #msgrecipients-menu li').each(function (index, value) {
	  if($(this).attr('aria-selected') == 'true'){
		var sThisVal = $('#msgrecipients option').eq(index).val();
		recipians.push(sThisVal);
		array_value = JSON.stringify(recipians);
	  }
	});
	
	var input = $('#page_newmessage .new-message-body').val();
	content = input.replace(/\n/g, '</p><p>');    	
    content = '<p>' + content;
    content += '</p>';
	$('textarea').val('');
	var data = [content, array_value];	
	newConversation(data);
}).on('mousedown', '.submit-new-message', function(e) {
	e.preventDefault();
});

$(document).on('click', '#news-node-form .image .cont-remove a', function(){
  $('#news-node-form .image .preview').hide();
  $('#news-node-form .image .field-name-field-news-image').show();
  $(this).closest('form').append('<input type="hidden" name="btn_remove" value="img_removed">')
});

$(document).on('click', '#event-node-form .image .cont-remove a', function(){
  $('#event-node-form .image .preview').hide();
  $('#event-node-form .image .field-name-field-news-image').show();
});

$(document).on('click', '.show_rest', function(e){
  e.preventDefault();
	
  var id = $(this).data('id');
  $('span', this).removeData();
    
  if($('.wrapper-'+id).css('height') === '0px'){
    $('.wrapper-'+id).css('height', 'auto');    
    $(this).html('<span data-t="readless">Read less</span>');
  }
  else{
    $('.wrapper-'+id).css('height', '0');
    $(this).html('<span data-t="readmore">Read more</span>');
  }
  translate();
});

$(document).on('click', '.show-comments', function(e){
  e.preventDefault();
  var id = $(this).data('id');
  $(this).removeData();
    
  $('.wrapper-comments-'+id).toggle();
});

$(document).on('click', '#calendar .fc-view-container a', function(e) {
  e.preventDefault();
  
  localStorage.setItem("single_event", $(this).attr('href'));
  $.mobile.pageContainer.pagecontainer("change", "#page_sevent", {transition: "fade", changeHash: true});
});

$('#news-node-form').submit(function(e){
  e.preventDefault();
  
  var recipians = value = [];
  $('#page_add_news #nrecipients-menu li').each(function (index, value) {
	if($(this).attr('aria-selected') == 'true'){
	  var sThisVal = $('#nrecipients option').eq(index).val();
	  recipians.push(sThisVal);
	  value = JSON.stringify(recipians);
	}
  });
  
  var title = $('#news-node-form .form-item-title input').val();
  
  var input = $('#news-node-form textarea').val();
  content = input.replace(/\n/g, '</p><p>');    	
  content = '<p>' + content;
  content += '</p>';
  
  var data = {'title' : title};
  data.recipians = value;
  data.body = content;
  //data.picture = {'src' : picture}
  
  $('#news-node-form input[type=hidden]').each(function() {
	var hidden = $(this).attr('name');
	data[hidden] = $(this).val();
  });
  
  if(setp){ 
    waitForElement(data, 'news'); 
  }
  else{
  	submitNews(data);
  }
});

$(document).on('submit', '#page_afront #comment-form', function(e){
  e.preventDefault();
  console.log('click!');
  
  nid = $(this).data('id');
  $(this).removeData();
  
  var input = $('.comment-body-'+nid).val();
  content = input.replace(/\n/g, '</p><p>');    	
  content = '<p>' + content;
  content += '</p>';
  
  var data = [content, nid, 'create'];
  
  createComment(data);	  
});

$(document).on('click', '.singular-comment .comment-icons .edit-comment', function(){
  cid = $(this).data('id');
  $(this).removeData();
  
  var body = $('.singular-comment-'+cid+' .comment-content .c_body').html();
  
  body = body.slice(0,-4);    	
  body = body.replace('<p>','');    	
  body = body.replace(/<\/p><p>/g, '\n');        
  $('#editcomment .comment-body-wrapper textarea').val(body);
  $('#editcomment #comment-form').attr('data-id', cid);
});

$(document).on('click', '.singular-comment .comment-icons .delete-comment', function(){
  cid = $(this).data('id');
  $(this).removeData();
  localStorage.setItem('cid', cid);
});

$(document).on('click', '#delete-coment-popup .popup-delete', function(){
  cid = localStorage.getItem('cid');
  deleteComment(cid);
  localStorage.removeItem("cid");
});

$(document).on('submit', '#editcomment #comment-form', function(e){
  e.preventDefault();
  cid = $('#editcomment #comment-form').data('id');
  $(this).removeData();
	  
  var input = $('#editcomment .comment-body-wrapper textarea').val();
  content = input.replace(/\n/g, '</p><p>');    	
  content = '<p>' + content;
  content += '</p>';
  $('#editcomment #comment-form textarea').val('');	
  var data = [content, cid, 'edit'];	
  createComment(data);
});

function openFilePicker() {
	navigator.camera.getPicture(onSuccess, onFail, { 
		quality: 100,
	    destinationType: Camera.DestinationType.FILE_URI,
	    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
	});

	function onSuccess(imageData) {
	  setp = 1;
	  //picture = imageData;
	  $('#'+formid+' .image .no-select').remove();
	  $('#'+formid+' .image .field-name-field-news-image').append('<span class="file-load" data-t="fileLoad">File is loading.</span>');
	  getFileEntry(imageData);
	  
	}

	function onFail(message) {
	   console.log(message);
	}
}

function getFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        readFile(fileEntry);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
      // If don't get the FileEntry (which may happen when testing
      // on some emulators), copy to a new FileEntry.
        createNewFileEntry(imgUri);
    });
}

function readFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
          picture = this.result;
      	  $('#'+formid+' .image .file-load').remove();
  	      $('#'+formid+' .image .field-name-field-news-image').append('<span class="file-selected" data-t="fileSelect">File is selected.</span>');          
        };

        reader.readAsDataURL(file);

    });
}

$(document).on('click', '#page_afront .edit-post', function(e) {
	nid = $(this).data('id');
    $(this).removeData();    
    
    localStorage.setItem("edit_post", nid);
});

$(document).on('change', '.input-radio #radio-setDate', function(e) {
  if ($(this).is(':checked')) {
  	$('#event-node-form .end-voting-date-combo').hide();
  	$('#event-node-form .clearfix').hide();
  	$('#event-node-form .panel-body .one-date').slice(1).remove();
  }  		
});

$(document).on('change', '.input-radio #radio-voteDate', function(e) {
  if ($(this).is(':checked')) {
	$('#event-node-form .clearfix').show();
  	$('#event-node-form .end-voting-date-combo').show();
  }  		
});

$(document).on('click', '#edit-field-news-image-und-0-upload', function(e) {
  e.preventDefault();
  formid = $(this).closest("form").attr('id');
  openFilePicker();
});



/**
 * Load node data for displaying messages on the message page.
 * 
 * @param int page
 *   Page number. If absent, then 1
 */
function loadMessages() {
  var out = '';
  $.ajax({
    url: DOMAIN + lan + api + "/messages/1",
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      //
    },
    success: function (data) {
 

     var array = new Array();
      if(data.length > 0) {
		  var data = JSON.parse(data);
	    if (typeof data.all_messages != 'undefined') {
          array = data.all_messages;
	    }   	 
      }

	  if (array.length == 0) {
		  out = '<br /><br /><div class="nomsgs" data-t="nomsgs" style="text-align:center">You have no messages.<br /><br />Tap <a href="#page_newmessage" class="popup-item popup-message" data-transition="fade">here</a> to write a new message.</div>';
	  }
	  else {
       for (var i = 0; i < array.length; i++) {
  
        
   	 out += 
   		 '<div class="conversation">'+ 
   		 	'<a href="#page_confront1" data-transition="slide" data-id="'+array[i].nid+'">'+
         '<div class="conversation-avatar">'+ 
    		 		  array[i].src+     
              '</div>'+
            '<div class="conversation-main-text">'+ 
    		 		'<p class="title">'+array[i].recipain+'</p>'+   
            '<p class="last-message">'+array[i].last_comment+'</p>'+  
            '</div>'+
    		 	'</a>'+
    		 '</div>'+
    		 '<hr>';
       }
       
	  }
      $('.all-messages').prepend(out);
     }
  });
}

/**
 * Load node data for displaying conversation and recipians.
 * 
 * @param int nid
 *   nid of conversation
 */
function loadConversation(nid) {
  var out = '';
  $.ajax({
	 url: DOMAIN + lan + api + "/conversation/"+nid,
     type: 'get',
     dataType: 'json',
     contentType: 'application/json',
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     success: function (data) {
       var out1 = '', out2 = '', out3= '';
       
       if(data.length > 0){
    	 var array = JSON.parse(data);    	 
       }
       
       if('conversation' in array){
      	 var conversation = array.conversation;
      	 
      	 for (var i = 0; i < conversation.comments.length; i++) {
      	   var comments = conversation.comments;
      	   
      	   if(comments[i].owner){
      		 out1 += '<div class="message-win" style="text-align: right;">'+
                 '<div class="message-wraper" style="background-color:#fcf6ed;">'+
            	   '<div class="arrow-right">' +
                 '</div>' + 
                 '<div class="message-author">' +
                   comments[i].full_name+
                 '</div>' + 
                  '<div class="message-date">'+
                   //'<img class="img-responsive" src="'+comments[i].src+'">'+
                   '<p class="date"  style="text-align:right;">'+comments[i].date+'</p>'+
                 '</div>'+   
            	   '<div class="message-body">'+
            	     comments[i].text+
            	   '</div>'+
                 '</div>'+
               '</div>';  	   
      	   }
      	   else{
      		 out1 += '<div class="message-win" style="text-align: left;">'+
          	   	 '<div class="message-wraper"  style="background-color:#8de7dc;">'+   
                   '<div class="arrow-left">' +
                   '</div>' + 
                   '<div class="message-author">' +
                   comments[i].full_name+
                  '</div>' + 
                  '<div class="message-date">'+
                   //'<img class="img-responsive" src="'+comments[i].src+'">'+
                   '<p class="date" style="text-align:left;">'+comments[i].date+'</p>'+
                    '</div>'+   
          	   	   '<div class="message-body">'+
          	         comments[i].text+
          	       '</div>'+
          	   '</div>'+
          	 '</div>';  
      	   }      	   
      	 }
       	$('.messages-col').html(out1);

          var num = conversation.comments.length;

          out3 +=  '<div class="last-sender-icon">'+ 
                  '<a href="#page_mfront" data-transition="slide" data-direction="reverse"><i class="material-icons">arrow_back</i></a>'+
                  conversation.comments[(num-1)].src+
                  '</div>'+
                  '<div class="sender-name">'+
                  '<span>'+conversation.comments[(num-1)].full_name+'</span>'+
                  '</div>';
            $('.avatar').html(out3);
       }
       
       if('recipians' in array){
       	 var recipians = array.recipians;
        	 
       	 for (var i = 0; i < recipians.length; i++) {
       	   out2 += '<div class="recipian-wraper">'+    
      		 '<div class="avatar">'+      
      		   '<img class="img-responsive" src="'+recipians[i].src+'">'+
      		 '</div>'+
      		 '<div class="recipian-body">'+
      		   recipians[i].full_name
      		 '</div>'+
      	   '</div>';
       	 }
       	
       	$('.recipians-col').html(out2);
       }
     }
  });
}

/**
 * Load all possible parents to message 
 * 
 */
function allContacts(){
  $.ajax({
	url: DOMAIN + lan + api + "/contacts/1",
	type: 'get',
	dataType: 'json',
	contentType: 'application/json',
	crossDomain: true,
	xhrFields: {
	  withCredentials: true
	},
	beforeSend: function (request) {
	request.setRequestHeader("Cookie", $.cookie("session_id"));
	request.setRequestHeader("X-CSRF-Token", token);              
	},
	error: function(XMLHttpRequest, textStatus, errorThrown) {
	  //
	},
	success: function (data) {
	  if ($('.newmessages-col #msgrecipients').length > 0 && (localStorage.getItem('contact_person') == null)) {
		  return;
	  }
	  // If there are previous recipient elements
		
	  //out = '<a href="#recipientsPopup" data-rel="popup" class="ui-btn ui-btn-inline" data-t="recipients">Choose recipients</a><div data-role="popup" id="recipientsPopup" class="ui-content">';
	  out = '<form id="recip" method="post" action="#"><fieldset><label for="msgrecipients"></label><select name="msgrecipients" id="msgrecipients" multiple="multiple" data-native-menu="false"><option data-t="recipients">Recipients</option>';	
	  $.each(data, function( index, value ) {
		out += '<option value="' + value['uid'] + '">' + value['field_firstname_value']+' '+value['field_lastname_value'] + '</option>';
	  });
	  out += '</select></fieldset></form>';//</div>';
	  
	  $('.newmessages-col').html(out);
	  translate();
	  $("#msgrecipients").selectmenu();
	  
	  if(localStorage.getItem('contact_person') != null){
        var uid = localStorage.getItem('contact_person');
        console.log('uid', uid);
	    
	 // Grab a select field
	    var el = $('#msgrecipients');

	    // Select the relevant option, de-select any others
	    el.val(uid).attr('selected', true).siblings('option').removeAttr('selected');

	    // Initialize the selectmenu
	    el.selectmenu();

	    // jQM refresh
	    el.selectmenu("refresh", true);
	    
	    localStorage.removeItem('contact_person');
	  }  
    }
  });
}

function newConversation(data) {
  $.ajax({
     url: DOMAIN + lan + api + "/new_conversation",
     type: 'post',
     dataType: 'array',
     data: {value : data},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
      nid = JSON.parse(data.responseText);
      localStorage.setItem("conversation", nid[0]);
      $.mobile.pageContainer.pagecontainer("change", "#page_confront1", {transition: "fade", changeHash: false});
    }
  });
}

/**
 * Load page for teacher end voting
 * 
 * @param int nid
 *   Nid of event
 */
function endvoting(nid) {
  var out = '';
  $.ajax({
	url: DOMAIN + lan + api + "/endvoting/"+nid,
    type: 'get',
    dataType: 'json',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function (request) {
      request.setRequestHeader("Cookie", $.cookie("session_id"));
      request.setRequestHeader("X-CSRF-Token", token);              
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      //
    },
    success: function (data) {
     $('#page_evfront .main-content').append(data[0]);
     $('#page_evfront .main-content #school-core-voting-form').attr('data-id', nid);
    }
  });
}

/**
 * Submits final vote on event date
 * 
 * @param array data
 *   Arary containing vote and nid
 */
function submitendvoting(data1) {
  $.ajax({
     url: DOMAIN + lan + api + "/endvoting/" + data1.nid,
     type: 'put',
     dataType: 'array',
     data: {'value' : data1},
     crossDomain: true,
     xhrFields: {
       withCredentials: true
     },
     beforeSend: function (request) {
       request.setRequestHeader("Cookie", $.cookie("session_id"));
       request.setRequestHeader("X-CSRF-Token", token);              
     },
     error: function(XMLHttpRequest, textStatus, errorThrown) {
       //
     },
     complete: function (data) {
      $.mobile.pageContainer.pagecontainer("change", "#page_afront", {transition: "fade", changeHash: false});
    }
  });
}

function user_has_role(){
  $.ajax({
	url: DOMAIN + lan + api + "/has_role/1",
	type: 'get',
	dataType: 'json',
	contentType: 'application/json',
	crossDomain: true,
	xhrFields: {
	withCredentials: true
	},
	beforeSend: function (request) {
	  request.setRequestHeader("Cookie", $.cookie("session_id"));
	  request.setRequestHeader("X-CSRF-Token", token);              
	},
	error: function(XMLHttpRequest, textStatus, errorThrown) {
	},
	success: function (data) {
	  if(data[0]){
		//$('#page_add_news .node-news-form').attr('action', DOMAIN);
	  }
	  else{
		$('.add-news').hide();
		$('.add-event').hide();
	  }
	}
  });
}

function waitForElement(data, type){
  if(typeof picture !== "undefined"){
    data.picture = {'src' : picture};
    if(type == 'news'){
      submitNews(data);  
    }
    else{
      submitEvent(data);
    }
  }
  else{
    setTimeout(waitForElement, 250);
  }

}

/**
 * Loads single event
 * 
 * @param int nid
 *   Nid of event to load
 */
function loadSingle(nid){
  $.ajax({
	url: DOMAIN + lan + api + '/load_single/'+nid,
	type: 'get',
	dataType: 'json',
	contentType: 'application/json',
	crossDomain: true,
	xhrFields: {
	withCredentials: true
	},
	beforeSend: function (request) {
	  request.setRequestHeader("Cookie", $.cookie("session_id"));
	  request.setRequestHeader("X-CSRF-Token", token);              
	},
	error: function(XMLHttpRequest, textStatus, errorThrown) {
	},
	success: function (node) {
		var out = '';
        
        out +=  '<div class="event node-'+node.nid+'">'+
			'<div class="post-shadow">'+
			  '<div class="post-header">';
			if(node.hasOwnProperty('url')){
			  out += '<div class="post-media">'+
				  	   '<img class="img-responsive" typeof="foaf:Image" src="'+node.url+'" alt="" width="85" height="75" style="display: block;">'+
				  	 '</div>';  //post-media
			}
       else{
        out += '<div class="post-media">'+
                '<img class="img-responsive" src="img/default-post.jpg" alt="" width="85" height="90" style="display: block;">'+
                '</div>';  //post-media
              }
		out +=  '<div class="post-title">'+
			      '<div class="title">' + node.title + '</div>'+
			      '<div class="post-autor">'+node.post_autor+'</div>'+
			      '<div class="post-created">'+dateFormat(node.created*1000, "dd.mm.yyyy HH:MM")+'</div>'+
			      '<div class="title-details">'+ 
			  	    '<a href="#" id="show-rest" class="show_rest" data-id="'+ node.nid+'" data-t="readmore">Read more</a>'+
			  	    '<span class="post-time"><i class="material-icons">schedule</i> '+dateFormat(node.start*1000, "dd.mm.yyyy")+' '+dateFormat(node.start*1000, "HH:MM")+'</span>'+
			      '</div>'+ //title-details
			    '</div>'+ //post-title
			    '<div class="title-icons">';
	          	  if(node.can_edit){
	                out += '<a href="#page_add_event" data-role="button" data-id="' + node.nid + '" id="button_edit" class="edit-post iedit title-icon" data-t="edit"><i class="iedit material-icons">edit</i></a>';
	              }
	              if(node.can_delete){
	                out += '<a href="#" data-role="button" class="button_delete delete-post idelete title-icon" data-id="' + node.nid + '"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
	              }
		out +=  '</div>'+ //title-icons
			  '</div>'+ //post-header
			  '<div class="post-wrapper wrapper-' + node.nid + '" style="height: 0px;">'+  
        	'<div class="post-body">'+      
        	  '<div class="body-post">'+
        	    node.body_value +      
        	  '</div>'+  //body-post  
        	  '<div class="edit-bar">'+      
        		'<div class="comment-text comment-' + node.nid + '">'+      
        		  '<p>'+
        		    '<a href="#" class="show-comments" data-id="'+node.nid+'"><i class="material-icons">comment</i> <span data-t="addcomments">Add comment</span> (<span class="num_comments">'+node.num_comments+'</span>)</a>'+
        		  '</p>'+      
        		'</div>'+ //comment-text   
        	  '</div>'+ // edit-bar  
        	'</div>'+ //post-body 
          '</div>'+ //post-shadow
        	'<div class="comment-wrapper-all wrapper-comments-'+node.nid+'" style="display: none;">'+    
        	 '<div id="proccesed-comments-'+node.nid+'">';
		       $.each(node.comments, function( key, value ) {
          out +='<div class="singular-comment singular-comment-'+value.c_id+'">'+
        		  '<div class="comment-avatar">'+
        		  	value.c_picture+
        		  '</div>'+ //comment-avatar
        		  '<div class="comment-body">'+
        			'<p class="comment-title">'+value.c_autor+'</p>'+
        			'<p class="comment-date">'+dateFormat(value.c_created*1000, "dd-mm-yyyy")+'<i class="material-icons">schedule</i>'+dateFormat(value.c_created*1000, "HH:MM")+'</p>'+
        			'<div class="comment-content">'+
        			  '<span class="c_body">'+value.c_body+'</span>'+
        			  '<div class="comment-icons">';
        			  if(value.c_owner){    
                          out += '<a href="#editcomment" data-role="button" data-id="' + value.c_id + '" id="button_edit" class="edit-comment" data-t="edit"><i class="iedit material-icons">edit</i></a>';
                          //out += '<a href="#delete-coment-popup" data-role="button" data-id="' + value.c_id + '" class="button_delete delete-post"  data-t="delete"><i class="idelete material-icons">delete</i></a>';
                      }
        	out +=    '</div>'+ //comment-icons
        			'</div>'+ //comment-content
        		  '</div>'+ //comment-body
        		'</div>'+ //singular-comment 
        		'<hr>';
        	  })
       out += '</div>'+ //proccesed-comments-nid
        	  '<div id="comments" class="comment-wrapper">'+
        	    '<form id="comment-form" data-id="' + node.nid + '" >'+
        		  '<div class="comment-body-wrapper">'+
        			'<i class="material-icons">reply</i>'+
        			'<textarea rowspan="5" name="comment-body" data-t="stype" placeholder="Start typing your message" class="comment-body comment-body-'+node.nid+' ui-input-text ui-shadow-inset ui-body-inherit ui-corner-all ui-textinput-autogrow" required></textarea>'+
        			'<input type="submit" value="reply" class="comment-btn btn btn-success form-submit ajax-processed ui-btn ui-btn-b ui-shadow ui-corner-all" data-t="reply">'+
        	      '</div>'+//comment-body-wrapper
        		'</form>'+      
        	  '</div>'+ //comment-wrapper
            '</div>'+ //comment-wrapper-all
          '</div>'+//post-wrapper
			
		  '</div>'; //event
		        
      $('.single_event').html(out);
       
	}
  });
}

var $filters = $('.filters');
if ($filters.length > 0) {
  $('input', $filters).click(function(){
    var str = '';
    var $filter = $('.checkbox input:checked', $filters);
    var direction = $('.radio input:checked', $filters).val();
    if ($filter.length == 0) {
      $(this).prop('checked', true);
    }
    else {
      $filter.each(function(){
        str += '/' + $(this).val();
      });
      str += '/' + direction;
      //window.location.href = '/activity' + str;
    }
    if(str){
      localStorage.setItem('filter', str);
      loadActivity();	
    }
  });  
}
