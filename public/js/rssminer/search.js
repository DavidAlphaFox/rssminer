(function () {
  var data = window.RM.data,
      $q = $('#header input'),
      tmpls = RM.tmpls,
      to_html = Mustache.to_html;

  var SELECTED = 'selected';

  function sub_array (arr, offset, limit) {
    var result = [];
    for(var i = offset; i < arr.length && i < offset + limit; i++) {
      result.push(arr[i]);
    }
    return result;
  }

  function get_search_result (q, limit, cb) {
    var subs = data.get_all_sub_titles(q),
        result = {
          'subs': sub_array(subs, 0, limit)
        };
    cb(result);
  }

  function do_search (e) {
    var q = $q.val(),
        ID = 'search-result',
        $selected = $('#' + ID + ' .selected');
    switch(e.which) {
    case 38:                    // up
      if($selected.length) {
        $selected.removeClass(SELECTED);
        if($selected.prev().length) {
          $selected.prev().addClass(SELECTED);
        } else {
          $('#' + ID + ' li:last').addClass(SELECTED);
        }
      } else {
        $('#' + ID + ' li:last').addClass(SELECTED);
      }
      return false;
    case 40:                    // down
      if($selected.length) {
        $selected.removeClass(SELECTED);
        if($selected.next().length) {
          $selected.next().addClass(SELECTED);
        } else {
          $('#' + ID + ' li:first').addClass(SELECTED);
        }
      } else {
        $('#' + ID + ' li:first').addClass(SELECTED);
      }
      return false;
    case 13:                    // enter
      if($selected.length) {
        location.hash = $('a', $selected).attr('href');
        $('#' + ID).remove();
        $q.val('');
        return false;
      }
    case 27:                  // esc
      $('#' + ID).remove();
      return false;
    }

    get_search_result(q, 15, function (result) {
      var html = to_html(tmpls.search_result, result);
      $('#' + ID).remove();
      var $result = $(html).attr('id', ID);
      $('#header .wrapper').append($result);
      $('li', $result).mouseenter(function () {
        $('li', $result).removeClass(SELECTED);
        $(this).addClass(SELECTED);
      });
    });
    return false;
  }

  $('#header input').keyup(do_search);
})();