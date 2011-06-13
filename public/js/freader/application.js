$(function () {

  var d_selected = 'selected',
      freader = window.Freader,
      tmpls = freader.tmpls,
      util = freader.util;

  var SubscriptionView = Backbone.View.extend({
    tagName: 'div',
    id: 'content',
    template: tmpls.subscripton,
    events: {
      'click .collapsed .entry-main': 'toggleExpandFeed'
    },
    initialize: function () {
      _.bindAll(this, 'render', 'toggleExpandFeed');
    },
    toggleExpandFeed: function(e) {
      var $entry = $(e.currentTarget).parents('.entry'),
          offset = $entry.offset().top - $('.entry:first').offset().top;
      $('.entry').not($entry).removeClass('expanded');
      $entry.toggleClass('expanded');
      $('#entries').scrollTop(offset);
    },
    render: function () {
      var data = this.model.toJSON();
      _.each(data.items, function(item) {
        item.snippet = util.snippet(item.summary);
      });
      $(this.el).html(this.template(data));
      return this;
    }
  });

  var Magic = (function() {
    var fdata;                  // this `class` manipulate
    function subs_comp(asub, bsub){
      return asub.title.toLowerCase() < bsub.title.toLowerCase();
    }
    function group_comp(ag, bg){
      return ag.group_name.toLowerCase() < bg.group_name.toLowerCase();
    };
    function getById(id) {
      var ret;
      _.each(fdata, function(group) {
        _.each(group.subscriptions, function(subscripton) {
          if(subscripton.id === id)
            ret = subscripton;
        });
      });
      if(!ret) {
        throw new Error('get by id ' + id + ' fail');
      }
      return ret;
    }
    function addFeeds (subscripton) {
      var saved = getById(subscripton.id);
      saved && _.extend(saved, subscripton);
    }
    function showSubscription (data) {
      var model = new Backbone.Model(data),
          view = new SubscriptionView({model : model});
      $('#content').replaceWith(view.render().el);
      $(window).resize();
    }
    function showById (id) {
      var saved = getById(id);
      if(!saved.items) {
        util.ajax.get('/api/feeds/'+id, function(data) {
          showSubscription(data);
          addFeeds(data);
        });
      }else {
        showSubscription(saved);
      }
    }
    function reShowNav() {
      if(fdata) {
        fdata.sort(group_comp);
        _.each(fdata, function(group) {
          group.subscriptions.sort(subs_comp);
        });
        var nav = tmpls.nav_template(fdata),
            $nav = $('.nav-tree');
        $nav.length > 0 ? $nav.replaceWith(nav) : $('nav').append(nav);
        $('a', $nav).click(function() {
          $('.selected').removeClass(d_selected);
          $(this).addClass(d_selected);
        });
      }
    }
    function init() {
      util.ajax.get('/api/overview',function(data) {
        fdata = data;
        reShowNav();
        new Router();
        Backbone.history.start();
      });
    }
    function addSubscription (link) {
      var post = util.ajax.jpost('/api/feeds', {link: link});
      post.success(function(data, status, xhr) {
        var ungroup = 'freader_ungrouped',
            group =  _.detect(fdata, function(e) {
              return e.group_name === ungroup;
            });
        if(group) {
          group.subscriptions.push(data);
        }else {
          data.push({
            group_name: ungroup,
            subscriptons: [data]
          });
        }
        reShowNav();
        window.location.hash = '/subscription/' + data.id;
      });
    }
    return {
      showById: showById,
      init: init,
      addSubscription: addSubscription
    };
  })();

  var Router = Backbone.Router.extend({
    routes:{
      '': 'index',
      '/subscription/:id': 'subscription'
    },
    index: function () {
      window.location.hash = '/subscription/1';
    },
    subscription: function(id) {
      Magic.showById(+id);
      $('.selected').removeClass(d_selected);
      $('#subs-' + id).addClass(d_selected);
    }
  });

  function layout() {
    var $entries = $('#entries'),
        $nav_tree = $('.nav-tree');
    if($entries.length > 0) {
      $entries.height($(window).height() - $entries.offset().top - 20);
    }
    if($nav_tree.length > 0) {
      $nav_tree.height($(window).height() - $nav_tree.offset().top - 20);
    }
  }

  $(window).resize(_.debounce(layout, 100));

  (function() {
    var $form = $('#add-subscription .form'),
        $input = $('input',$form);
    $('#add-subscription span').click(function() {
      $form.toggle();
      $input.focus();
    });
    $form.keydown(function(e) {
      if(e.which === 13) {
        Magic.addSubscription($input.val());
        $form.hide();
        $input.val('');
      }
    });
  })();
  Magic.init();
});