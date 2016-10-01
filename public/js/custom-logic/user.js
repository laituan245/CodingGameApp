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
			if ($(form[key]).attr("id") === "lock") {
				this[$(form[key]).attr("id")] = $(form[key]).prop("checked");
			} else {
				this[$(form[key]).attr("id")] = $(form[key]).val();
			}
		}
	}
}

$("#modal-edit-form").submit(function(){
	submitForm('modal-edit', this, '/admin/manager/user/edituser'); 
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

$(document).on("click", "#unlock-btn", function(){
	updateLock(false,'/admin/manager/user/edituser', $(this).data("email"))
})

$(document).on("click", "#lock-btn", function(){
	updateLock(true,'/admin/manager/user/edituser', $(this).data("email"))
})

function updateLock(lock, url, email){
	var fd = {
		email: email,
		lock: lock
	}
	$.ajax({
		method:"post",
		url:url, // ..../editgaccount or ..../deletegaccount
		data: fd,
		dataType:"json",
		success: function(resp){
			resp = JSON.parse(resp);
			if (resp.status=="000"){
				//reload data
				var msg;
				if (lock) msg = "User is locked successfully!";
				else msg = "User is unlocked successfully";
				message("success",msg, "Action Complete")
				reloadData(true);
			} else {
				message("error",resp.status + " : "	+resp.data, "Action Error")
				alert (resp.data)
			}

			
		},
		error: function(){
			message("error","Something wrong with our server! Please try again later", "Action Error")
		}

	});
}

function submitFilterByEnter(e){
    if(e.keyCode === 13){
        reloadData(true)
    }
    return false;
}

//Reload the accounts table based on filter
function reloadData(filter){
    if (filter){
        var form = document.getElementById("form-filter");
        //TODO: 
        var name = form.querySelector("#filter-name").value;
        var email = form.querySelector("#filter-email").value;
        var plan = form.querySelector("#filter-plan").value;
        var limit = form.querySelector("#filter-limit").value;
        var lock = form.querySelector("#filter-lock").value;
        var createtime = form.querySelector("#filter-createtime").value;
        
        var query = "";

        if (name) query+= "&search_name="+encodeURI(name)
        if (email) query+= "&search_email="+encodeURI(email)
        if (plan) query+= "&search_plan="+encodeURI(plan)
        if (limit) query+= "&search_limit="+encodeURI(limit)
        if (lock) query+= "&search_lock="+encodeURI(lock)
        if (createtime) query+= "&search_createtime="+encodeURI(createtime)

    }
    $.ajax({
        method:"get",
        url: window.location.pathname + "?page="+page+"&ajax=true"+query,
        dataType:"html",
        success: function(resp){
            jQuery("#table-body").html(resp);
            jQuery("#filter-name").val(name);
            jQuery("#filter-email").val(email);
            jQuery("#filter-plan").val(plan);
            $("#filter-plan").data("selectBox-selectBoxIt").refresh();
            jQuery("#filter-limit").val(limit);
            $("#filter-limit").data("selectBox-selectBoxIt").refresh();
            jQuery("#filter-lock").val(lock);
            $("#filter-lock").data("selectBox-selectBoxIt").refresh();
            jQuery("#filter-createtime").val(createtime);
            $("#filter-createtime").data("selectBox-selectBoxIt").refresh();
        },
        error: function(){
            message("error","Something wrong with our server! Please try again later", "Action Error")
        }
    });
}
//submit edit form / delete form
function submitForm(modal, form, url){
	if (!form) return;
	var fd = new FormData(form);
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
	for (var key in info){
		if (key !== "lock"){
			$("#"+key).val(info[key]);	
		} else {
			if (info[key]){
				$("#lock-label").html("Lock status: <strong> Locked </strong>")
			} else {
				$("#lock-label").html("Lock status: <strong> Unlocked </strong>")
			}
			$("#"+key).prop("checked", info[key]);	
		}
		if (key === "plan")
			$("#plan").data("selectBox-selectBoxIt").refresh();

	}

	
}
})(window, document)