function post(endpoint, data, cb) {
  return $.ajax({
    url: endpoint,
    type: "POST",
    data: data,
    success: function(data) {
      data.success = true;
      cb(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      var data = {
        success : false
      }
      cb(data);
    }
  });
}

function get(endpoint, cb, errCb) {
  return $.ajax({
    url: endpoint,
    type: "GET",
    success: function(data) {
      cb(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      errCb(xhr, ajaxOptions, thrownError);
    }
  });
}