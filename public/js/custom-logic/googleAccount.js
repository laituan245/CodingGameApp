(function(window, document){
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


//Constructor function for class FormData, form is this
function FormData(form){
	this.email = $($(form).find("#email")).val();
	form = $(form).find("input,select");

	for (var key = 0; key < form.length; key++){
		if ($(form[key]).prop("disabled") === false){
			this[$(form[key]).attr("id")] = $(form[key]).val();
		}
	}
}

$("#modal-edit-form").submit(function(){
	submitForm('modal-edit', this, '/admin/manager/gaccount/editgaccount'); 
	return false;
})

$(document).on("keypress", ".search_filter input", function(event){
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
	$('#modal-delete').show();
	$('#modal-delete').modal('show', {backdrop: 'static',keyboard:false});
	fillModal('modal-delete',$(this).data("info"));
})

$("#delete-submit").click(function(){
	console.log("next ");
	console.log($(this).data("email"));
	submitForm('modal-delete', this,'/admin/manager/gaccount/deletegaccount'); 
	return false;
})

function submitFilterByEnter(e){
    if(e.keyCode === 13){
        reloadData(true)
    }
    return false;
}

//Reload the accounts table based on filter
window.reloadData = function(filter){
    if (filter){
        var form = document.getElementById("form-filter");
        //TODO: 
        var name = form.querySelector("#filter-name").value
        var email = form.querySelector("#filter-email").value
        var recovery = form.querySelector("#filter-recovery").value
        var free_space = form.querySelector("#filter-free-space").value
        var status = form.querySelector("#filter-status").value
        var lock = form.querySelector("#filter-lock").value
        console.log(recovery);
        var query = "";
        if (name) query+= "&search_name="+encodeURI(name)
        if (email) query+= "&search_email="+encodeURI(email)
        if (recovery) query+= "&search_recovery_email="+encodeURI(recovery)
        if (free_space) query+= "&search_free_space="+encodeURI(free_space)
        if (status) query+= "&search_status="+encodeURI(status)
        if (lock) query+= "&search_lock="+encodeURI(lock)
    }
    $.ajax({
        method:"get",
        url: window.location.pathname + "?page="+page+"&ajax=true"+query,
        dataType:"html",
        success: function(resp){
            jQuery("#table-body").html(resp);
            jQuery("#filter-name").val(name);

            jQuery("#filter-email").val(email);
            jQuery("#filter-recovery").val(recovery);
            jQuery("#filter-free-space").val(free_space);
            $("#filter-free-space").data("selectBox-selectBoxIt").refresh();
            jQuery("#filter-status").val(status);
            $("#filter-status").data("selectBox-selectBoxIt").refresh();
            jQuery("#filter-lock").val(lock);
            $("#filter-lock").data("selectBox-selectBoxIt").refresh();
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
		fd = new FormData(form);
	else
		fd = {
			email: $(form).data("email")
		}
	console.log(url);
	console.log($(form).data("email"));
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
					message("success","Account deleted Successfully!", "Action Complete");
				}
				if (modal=="modal-edit"){
					$("#modal-edit").hide();
					message("success","Account updated Successfully!", "Action Complete")
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
function fillModal(modal, info){
	if (!info) return;
	console.log("Filling modal");
	if (modal === "modal-edit"){
		for (var key in info){
			var key1 = key;
			if (key1 == "freespace") key1 = "free-space";
			if (key1 == "recovery_email") key1 = "recovery-email";
			if (key1 !== "tokens"){
				if (key1 === "lock" || key1 === "status"){
					$("select#"+key1+" option[value="+ info[key] +"]").prop("selected", true);
					$("select#"+key1).data("selectBox-selectBoxIt").refresh();
				} else {
					$("#"+key1).val(info[key]);
				}

			}
			else {
				for (var k in info[key1]){
					var k1 = k.replace("_", "-");

					$("#"+k1).val(info[key1][k]);
				}
			}
		}
	} else if (modal === "modal-delete"){
		$("#delete-submit").data("email",info.email);
		console.log("email to delete");
		console.log($("#delete-submit").data("email"));
	}
	

	
}
})(window, document)