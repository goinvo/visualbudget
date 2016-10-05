/*
    A simple jQuery modal (http://github.com/kylefox/jquery-modal)
    Version 0.8.0
*/

(function (factory) {
  // Making your jQuery plugin work better with npm tools
  // http://blog.npmjs.org/post/112712169830/making-your-jquery-plugin-work-better-with-npm
  if(typeof module === "object" && typeof module.exports === "object") {
    factory(require("jquery"), window, document);
  }
  else {
    factory(jQuery, window, document);
  }
}(function($, window, document, undefined) {

  var jquerymodals = [],
      getCurrent = function() {
        return jquerymodals.length ? jquerymodals[jquerymodals.length - 1] : null;
      },
      selectCurrent = function() {
        var i,
            selected = false;
        for (i=jquerymodals.length-1; i>=0; i--) {
          if (jquerymodals[i].$blocker) {
            jquerymodals[i].$blocker.toggleClass('jquerymodal-current',!selected).toggleClass('jquerymodal-behind',selected);
            selected = true;
          }
        }
      };

  $.jquerymodal = function(el, options) {
    var remove, target;
    this.$body = $('body');
    this.options = $.extend({}, $.jquerymodal.defaults, options);
    this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10));
    this.$blocker = null;
    if (this.options.closeExisting)
      while ($.jquerymodal.isActive())
        $.jquerymodal.close(); // Close any open jquerymodals.
    jquerymodals.push(this);
    if (el.is('a')) {
      target = el.attr('href');
      //Select element by id from href
      if (/^#/.test(target)) {
        this.$elm = $(target);
        if (this.$elm.length !== 1) return null;
        this.$body.append(this.$elm);
        this.open();
      //AJAX
      } else {
        this.$elm = $('<div>');
        this.$body.append(this.$elm);
        remove = function(event, modal) { modal.elm.remove(); };
        this.showSpinner();
        el.trigger($.jquerymodal.AJAX_SEND);
        $.get(target).done(function(html) {
          if (!$.jquerymodal.isActive()) return;
          el.trigger($.jquerymodal.AJAX_SUCCESS);
          var current = getCurrent();
          current.$elm.empty().append(html).on($.jquerymodal.CLOSE, remove);
          current.hideSpinner();
          current.open();
          el.trigger($.jquerymodal.AJAX_COMPLETE);
        }).fail(function() {
          el.trigger($.jquerymodal.AJAX_FAIL);
          var current = getCurrent();
          current.hideSpinner();
          jquerymodals.pop(); // remove expected modal from the list
          el.trigger($.jquerymodal.AJAX_COMPLETE);
        });
      }
    } else {
      this.$elm = el;
      this.$body.append(this.$elm);
      this.open();
    }
  };

  $.jquerymodal.prototype = {
    constructor: $.jquerymodal,

    open: function() {
      var m = this;
      this.block();
      if(this.options.doFade) {
        setTimeout(function() {
          m.show();
        }, this.options.fadeDuration * this.options.fadeDelay);
      } else {
        this.show();
      }
      $(document).off('keydown.jquerymodal').on('keydown.jquerymodal', function(event) {
        var current = getCurrent();
        if (event.which == 27 && current.options.escapeClose) current.close();
      });
      if (this.options.clickClose)
        this.$blocker.click(function(e) {
          if (e.target==this)
            $.jquerymodal.close();
        });
    },

    close: function() {
      jquerymodals.pop();
      this.unblock();
      this.hide();
      if (!$.jquerymodal.isActive())
        $(document).off('keydown.jquerymodal');
    },

    block: function() {
      this.$elm.trigger($.jquerymodal.BEFORE_BLOCK, [this._ctx()]);
      this.$body.css('overflow','hidden');
      this.$blocker = $('<div class="jquerymodal-modal jquerymodal-blocker jquerymodal-current"></div>').appendTo(this.$body);
      selectCurrent();
      if(this.options.doFade) {
        this.$blocker.css('opacity',0).animate({opacity: 1}, this.options.fadeDuration);
      }
      this.$elm.trigger($.jquerymodal.BLOCK, [this._ctx()]);
    },

    unblock: function(now) {
      if (!now && this.options.doFade)
        this.$blocker.fadeOut(this.options.fadeDuration, this.unblock.bind(this,true));
      else {
        this.$blocker.children().appendTo(this.$body);
        this.$blocker.remove();
        this.$blocker = null;
        selectCurrent();
        if (!$.jquerymodal.isActive())
          this.$body.css('overflow','');
      }
    },

    show: function() {
      this.$elm.trigger($.jquerymodal.BEFORE_OPEN, [this._ctx()]);
      if (this.options.showClose) {
        this.closeButton = $('<a href="#close-modal" rel="jquerymodal:close" class="jquerymodal-close-modal ' + this.options.closeClass + '">' + this.options.closeText + '</a>');
        this.$elm.append(this.closeButton);
      }
      this.$elm.addClass(this.options.jquerymodalClass).appendTo(this.$blocker);
      if(this.options.doFade) {
        this.$elm.css('opacity',0).show().animate({opacity: 1}, this.options.fadeDuration);
      } else {
        this.$elm.show();
      }
      this.$elm.trigger($.jquerymodal.OPEN, [this._ctx()]);
    },

    hide: function() {
      this.$elm.trigger($.jquerymodal.BEFORE_CLOSE, [this._ctx()]);
      if (this.closeButton) this.closeButton.remove();
      var _this = this;
      if(this.options.doFade) {
        this.$elm.fadeOut(this.options.fadeDuration, function () {
          _this.$elm.trigger($.jquerymodal.AFTER_CLOSE, [_this._ctx()]);
        });
      } else {
        this.$elm.hide(0, function () {
          _this.$elm.trigger($.jquerymodal.AFTER_CLOSE, [_this._ctx()]);
        });
      }
      this.$elm.trigger($.jquerymodal.CLOSE, [this._ctx()]);
    },

    showSpinner: function() {
      if (!this.options.showSpinner) return;
      this.spinner = this.spinner || $('<div class="' + this.options.jquerymodalClass + '-spinner"></div>')
        .append(this.options.spinnerHtml);
      this.$body.append(this.spinner);
      this.spinner.show();
    },

    hideSpinner: function() {
      if (this.spinner) this.spinner.remove();
    },

    //Return context for custom events
    _ctx: function() {
      return { elm: this.$elm, $blocker: this.$blocker, options: this.options };
    }
  };

  $.jquerymodal.close = function(event) {
    if (!$.jquerymodal.isActive()) return;
    if (event) event.preventDefault();
    var current = getCurrent();
    current.close();
    return current.$elm;
  };

  // Returns if there currently is an active modal
  $.jquerymodal.isActive = function () {
    return jquerymodals.length > 0;
  }

  $.jquerymodal.getCurrent = getCurrent;

  $.jquerymodal.defaults = {
    closeExisting: true,
    escapeClose: true,
    clickClose: true,
    closeText: 'Close',
    closeClass: '',
    modalClass: "jquerymodal-modal",
    spinnerHtml: null,
    showSpinner: true,
    showClose: true,
    fadeDuration: null,   // Number of milliseconds the fade animation takes.
    fadeDelay: 1.0        // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
  };

  // Event constants
  $.jquerymodal.BEFORE_BLOCK = 'jquerymodal:before-block';
  $.jquerymodal.BLOCK = 'jquerymodal:block';
  $.jquerymodal.BEFORE_OPEN = 'jquerymodal:before-open';
  $.jquerymodal.OPEN = 'jquerymodal:open';
  $.jquerymodal.BEFORE_CLOSE = 'jquerymodal:before-close';
  $.jquerymodal.CLOSE = 'jquerymodal:close';
  $.jquerymodal.AFTER_CLOSE = 'jquerymodal:after-close';
  $.jquerymodal.AJAX_SEND = 'jquerymodal:ajax:send';
  $.jquerymodal.AJAX_SUCCESS = 'jquerymodal:ajax:success';
  $.jquerymodal.AJAX_FAIL = 'jquerymodal:ajax:fail';
  $.jquerymodal.AJAX_COMPLETE = 'jquerymodal:ajax:complete';

  $.fn.jquerymodal = function(options){
    if (this.length === 1) {
      new $.jquerymodal(this, options);
    }
    return this;
  };

  // Automatically bind links with rel="jquerymodal:close" to, well, close the modal.
  $(document).on('click.jquerymodal', 'a[rel~="jquerymodal:close"]', $.jquerymodal.close);
  $(document).on('click.jquerymodal', 'a[rel~="jquerymodal:open"]', function(event) {
    event.preventDefault();
    $(this).jquerymodal();
  });
}));