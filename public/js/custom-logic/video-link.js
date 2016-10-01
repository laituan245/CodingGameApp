//var uploadSubUrl = "http://127.0.0.1:22000/VideoLinkService/uploadSubtitle";
var uploadSubUrl = "http://dashboard.phim2vl.com:22000/VideoLinkService/uploadSubtitle";
(function(window, document){
var existingSubs = [];
var isSubChanged = false;
function message(type, message, title){
	var opts = {
		"closeButton": true,
		"debug": false,
		"positionClass": "toast-top-right",
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};
	if (type=="success")
		toastr.success(message, title, opts);
	if (type=="error")
		toastr.error(message, title, opts);
}


//Constructor function , form is this
function createDataToSend(form){
	this.embedID = $(form).find("#video_link_embedID").val();
	form = $(form).find("input");

	for (var key = 0; key < form.length; key++){
		console.log(form[key]);
		if (key === "sub-file") continue;
		if ($(form[key]).prop("disabled") === false && $(form[key]).attr("id") !== undefined){
			this[$(form[key]).attr("id").replace("video_link_","")] = $(form[key]).val();
		}
	}
}

$(document).on("click", ".show-sub", function(){
	$(this).closest("td").find(".subtitles-list").toggle();
})

$("#modal-edit-form").submit(function(){
	submitForm('modal-edit', this, '/manager/videolink/editvideolink'); 
	return false;
})

$(document).on("keypress", ".press-input", function(event){
	submitFilterByEnter(event);
})

$(document).on("click", "#apply-filter-btn", function(){
	reloadData(true);
})

$(document).on("click", "#edit-btn", function(){
	$('#modal-edit').show();
	$('#modal-edit').modal('show', {backdrop: 'static',keyboard:false});
	fillModal('modal-edit',$(this).data("info"));
})

$(document).on("click", "#delete-btn", function(){
	console.log("click delete btn")
	$('#modal-delete').show();
	$('#modal-delete').modal('show', {backdrop: 'static',keyboard:false});
	fillModal('modal-delete',$(this).data("embedid"));
})

$("#delete-submit").click(function(){
	console.log("next ");
	console.log($(this).data("embedid"));
	submitForm('modal-delete', this,'/manager/videolink/deletevideolink'); 
	return false;
})

$(document).on("click", ".delete-sub", function(){
	var subElement = $(this).closest(".each-sub")[0];
	var sub = {
		type : "delete",
		language : $(subElement).data("language"),
		url: $(subElement).attr("href"),
		subElement: subElement
	}
	changeSub(sub,function(err){});
	return false;
})

$(document).on("click", ".edit-sub", function(){
	var subElement = $(this).closest(".each-sub")[0];

	return false;
})


$("#modal-close-btn").click(function(){
	if (isSubChanged)
		reloadData(true);
})


$("#show-add-sub-panel").click(function(){
	$("#add-sub-panel").show();
	return false;
})

var latestSubFile = null;
$("#sub-file").change(function(e) {
	var file = e.currentTarget.files[0];
	if (!file) {
		latestSubFile = null;
		return;
	}
	
	if (file.type !== "application/x-subrip"){
		$("#sub-file").val("");
		latestSubFile = null;
		return alert("Please choose a .srt file");
	}
		
	latestSubFile = this.files[0];
});

$("#add-sub-btn").click(function() {
	console.log("#add-sub-btn is clicked");
    // will log a FileList object, view gifs below
    //renderImage(this.files[0]);
    console.log($("#sub-file").val())
    if (latestSubFile !== null){
    	//check duplicate subtitle
    	for (var i = 0; i < existingSubs.length; i++){
    		console.log(existingSubs[i].language + " - " + $("#added-language").val())
			if (existingSubs[i].language == $("#added-language").val()){
				alert("There has been already a subtitle for " + existingSubs[i].language + ". Please try again.");
				return false;
			}
		}
    	uploadSubtitleFile(latestSubFile, function(err, subUrl){
    		if (!err){
    			//upload successfully
    			var newSubDiv = $("<a>").addClass("each-sub").text($("#added-language").val()).data("language", $("#added-language").val()).attr("href",subUrl).css("margin-top", "14px").css("display","block");
				// newSubDiv.append($("<button>",{

				// 	class: "edit-sub btn btn-secondary btn-sm btn-icon icon-left"
				// }).css("float", "right").css("margin-bottom", "0px").text("Edit"));

				newSubDiv.append($("<button>",{
					class: "delete-sub btn btn-danger btn-sm btn-icon icon-left"
				}).css("float", "right").css("margin-bottom", "0px").text("Delete"));

				$("#video_link_subtitles .well.well-lg .existing-sub-list").append(newSubDiv);
				latestSubFile = null;
				$("#sub-file").val("");
				changeSub({
					type: "add",
					language: $("#added-language").val(),
					url: subUrl
				}, function(err){
				})
    		}
    	});
    } else {
    	alert("You need to choose a subtitle file");
    }
    return false;

});

function submitFilterByEnter(e){
    if(e.keyCode === 13){
        reloadData(true)
    }
    return false;
}

//Reload the accounts table based on filter
function reloadData(filter){
	console.log("reloading");
	console.log(filter);
    if (filter){
        var form = document.getElementById("form-filter");
        //TODO: 
        var name_id = form.querySelector("#search_name_id").value
        var createRangeSent = form.querySelector("#search_createdaterange").value;
        var status = form.querySelector("#search_status").value
        var lastCheckRangeSent = form.querySelector("#search_lastCheckRange").value;
        var views = form.querySelector("#search_views").value
        var tags = form.querySelector("#search_tags").value

        var query = "";
        if (name_id) query+= "&search_name_id="+encodeURI(name_id)
        if (createRangeSent) query+= "&search_createRange="+encodeURI(createRangeSent)
        if (status) query+= "&search_status="+encodeURI(status)
        if (lastCheckRangeSent) query+= "&search_lastCheckRange="+encodeURI(lastCheckRangeSent)
        if (views) query+= "&search_views="+encodeURI(views)
        if (tags) query+= "&search_tags="+encodeURI(tags)
    }
    $.ajax({
        method:"get",
        url: window.location.pathname + "?page="+page+"&ajax=true"+query,
        dataType:"html",
        success: function(resp){
            jQuery("#table-body").html(resp);
            console.log(createRangeSent.split(',')[0]);
            jQuery("#search_name_id").val(name_id);
            jQuery("#search_createdaterange").val(createRangeSent);
           
            jQuery("#search_status").val(status);
            $("#search_status").data("selectBox-selectBoxIt").refresh();
            jQuery("#search_lastCheckRange").val(lastCheckRangeSent);
            jQuery("#search_views").val(views);
            $("#search_views").data("selectBox-selectBoxIt").refresh();
            jQuery("#search_tags").val(tags);
            
        },
        error: function(){
            message("error","Something wrong with our server! Please try again later", "Action Error")
        }
    });
}


//submit edit form / delete form
function submitForm(modal, form, url){
	if (!form) return;
	var fd;
	if (modal === "modal-edit")
		fd = new createDataToSend(form);
	else
		fd = {
			embedID: $(form).data("embedid")
		}
	console.log("form to send");
	console.log(fd);
	var modelElement = $(modal);
	$.ajax({
		method:"post",
		url:url, // ..../editgaccount or ..../deletegaccount
		data: fd,
		dataType:"json",
		success: function(resp){
			resp = JSON.parse(resp);
			if (resp.status=="000"){
				//reload data
				if (modal=="modal-delete"){
					$("#modal-delete").hide();
					message("success","VideLink deleted Successfully!", "Action Complete");
				}
				if (modal=="modal-edit"){
					$("#modal-edit").hide();
					message("success","VideLink updated Successfully!", "Action Complete")
				}
				reloadData(true);
			} else {
				message("error",resp.status + " : "	+resp.data, "Action Error")
				alert (resp.data)
			}

			
		},
		error: function(){
			jQuery('#'+modal).modal('hide');
			message("error","Something wrong with our server! Please try again later", "Action Error")
		}

	});
}



//add or edit or delete
function changeSub(sub, callback){
	isSubChanged = true;
	var pendingSubs = existingSubs;
	if (sub.type === "add"){
		pendingSubs.push({language:sub.language, url:sub.url})
	} else if (sub.type === "delete"){
		for (var i = 0; i < pendingSubs.length; i++){
			console.log(pendingSubs[i].language + " ------------ " +  sub.language)
			if (pendingSubs[i].language == sub.language){
				console.log(pendingSubs.length);
				console.log(i);
				pendingSubs.splice(i, 1);
				console.log(pendingSubs.length);
				break;
			}
		}
	} else if (sub.type === "edit"){
		for (var i = 0; i < pendingSubs.length; i++){
			if (pendingSubs[i].language === sub.language){
				pendingSubs[i] = {language:sub.language, url: sub.url}
			}
		}
	}
	var embedID = $("#modal-edit-form").find("#video_link_embedID").val();
	$.ajax({
		method:"post",
		url:'/manager/videolink/editvideolink', 
		data: {
			embedID: embedID,
			subtitles:pendingSubs,
			deleteSubPath:sub.type === "delete" ? sub.url.substring(sub.url.lastIndexOf("/") + 1) : ""
		},
		dataType:"json",
		success: function(resp){
			resp = JSON.parse(resp);
			if (resp.status=="000"){
				existingSubs = pendingSubs;
				if (sub.type === "delete"){
					//remove sub in the panel
					$(sub.subElement).remove();
				}
				callback(null);
			} else {
				message("error",resp.status + " : "	+resp.data, "Action Error")
				alert (resp.data)
				callback(err);
			}

			
		},
		error: function(){
			jQuery('#'+modal).modal('hide');
			message("error","Something wrong with our server! Please try again later", "Action Error")
			callback(err);
		}

	});
	
}


//submit subtitles file to VideoLink Service
function uploadSubtitleFile(file, callback){
	var formData = new FormData();
	formData.append("uploadedSub", file);
	$.ajax({
		url: uploadSubUrl,
		//Ajax events
		success: function (result) {
			
			if (result.success == true){
				callback(null, result.subUrl);
			} else {
				alert('error ' + result.message);
				callback(result.message, result.message);
			}
			
       },
       error: function (e) {
         alert('error ' + e.message);
         callback(e);
       },
       // Form data
       data: formData,
       type: 'POST',
       //Options to tell jQuery not to process data or worry about content-type.
       cache: false,
       contentType: false,
       processData: false
	})
 
}


function getExistingSubs(){
	var res = [];
	$(".each-sub").each(function(sub){
		var language = $(this).data("language");
		var url = $(this).attr("href");
		res.push({language:language, url: url});
	})
	return res;
}



function fillModal(modal, info){
	console.log(info);
	console.log(modal);
	
	
	if (!info) return;
	console.log("Filling modal");
	if (modal === "modal-edit"){
		//for adding subtitles
		
		
		for (var key in info){
			if (key !== "embedID"){
				if (key === "subtitles") {
					//list of subtitles
					$("#video_link_subtitles .well.well-lg .existing-sub-list").empty();
					$("#video_link_subtitles .well.well-lg .added-sub-list").empty();
					for (var i = 0; i < info[key].length; i++){
						var sub = info[key][i];
						var newSubDiv = $("<a>").addClass("each-sub").data("language", sub.language).text(sub.language).attr("href", sub.url).css("display","block").css("margin-top", "14px");
						// newSubDiv.append($("<button>",{
						// 	class: "edit-sub btn btn-secondary btn-sm btn-icon icon-left"
						// }).css("float", "right").css("margin-bottom", "0px").text("Edit"));

						newSubDiv.append($("<button>",{
							class: "delete-sub btn btn-danger btn-sm btn-icon icon-left"
						}).css("float", "right").css("margin-bottom", "0px").text("Delete"));

						$("#video_link_subtitles .well.well-lg .existing-sub-list").append(newSubDiv);
					}
					existingSubs = getExistingSubs();

					

					


					
				} else {
					$("#video_link_"+key).val(info[key]);		
				}
				
			} else {
				$("#video_link_"+key).val(info[key]);
				var iframe = document.createElement("iframe")
				iframe.src = embed_url + "/embed/"+ info["embedID"] + ".html?preview=true";
				iframe.width="564px"
				iframe.height="320px"
				iframe.scrolling="no"
				
				iframe.setAttribute('allowFullScreen', '');
				iframe.setAttribute('frameborder', 'no');
				$("#video_link_"+key).append(iframe)
				
				var loop = setInterval(function () {
					 if (document.getElementById("modal-edit") && document.getElementById("modal-edit").style.display=="none") {
					 		document.getElementById("modal-edit").querySelector("#video_link_embedID").innerHTML="";
					 		clearInterval(loop)
					 	}
				}, 500);
			}
			
		}
	} else if (modal === "modal-delete"){
		$("#delete-submit").data("embedid",info);
		console.log("embedID to delete " + info);
		console.log($("#delete-submit").data("embedid"));
	}
	

	
}
})(window, document)