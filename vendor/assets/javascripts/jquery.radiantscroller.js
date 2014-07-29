/*!
 * jQuery RadiantScroller
 * Version: 0.1.0 (29/07/2014)
 * Copyright (c) 2014 Ilya Bodrov (http://www.radiant-wind.com/plugins/radiant_scroller)
 *
 * Requires: jQuery 1.7.0+
 */

(function($) {
  $.radiantScroller = function(el, options) {
    var scroller = $(el);

    scroller.vars = $.extend({}, $.radiantScroller.defaults, options);

    // Store reference to scroller in data of the object
    scroller.data("radiantscroller", scroller);
    // Set to true when scrolling
    scroller.animating = false;

    var elements = scroller.find('.scroller-el'),
        el_count = elements.size(),
        el_width = scroller.vars.elementWidth + scroller.vars.elementMargin,
        per_row = Math.ceil(el_count / scroller.vars.rows);

    // Calculating scroller's width with regard to items per row
    scroller.width( (el_width * per_row) - scroller.vars.elementMargin );

    // Grouping elements by rows
    var elements_tmp = elements;
    do $(elements_tmp.slice(0, per_row)).wrapAll('<div class="radiant_scroller_row" />');
    while((elements_tmp = elements_tmp.slice(per_row)).length > 0);

    // Wrapper with hidden scrollbars
    scroller.wrap('<div class="radiant_scroller"></div>').wrap('<div class="radiant_scroller_wrapper" />');
    var wrapper = scroller.parent('.radiant_scroller_wrapper'),
        outer_wrapper = wrapper.parent('.radiant_scroller'),
        max_wrapper_width = (scroller.vars.cols * el_width - scroller.vars.elementMargin) + 'px';

    wrapper.css('max-width', max_wrapper_width);
    outer_wrapper.css('max-width', max_wrapper_width);

    // Next/previous buttons
    var nav = $('<div class="radiant-navigation" />').insertAfter(wrapper),
        prev = nav.append($('<div class="radiant-prev">' + scroller.vars.prevButtonText + '</div>')),
        next = nav.append($('<div class="radiant-next">' + scroller.vars.nextButtonText + '</div>'));

    // Scroller methods
    scroller.calculateVisibleElements = function() {
      scroller.visible_els = (wrapper.width() + scroller.vars.elementMargin) / el_width;
    };

    scroller.moveElements = function(scrollBy, instant) {
      if (!scroller.animating) {
        if (typeof scrollBy === 'undefined')
          scrollBy = 1;

        var duration = scroller.vars.animateDuration;
        if (typeof instant !== 'undefined' && instant)
          duration = 0;

        var new_current_page = scroller.current_page + scrollBy;
        // The requested page should be between 0 and total number of pages and should not be the same page
        // as the current, otherwise do nothing
        if (new_current_page >= 0 && new_current_page < scroller.total_pages &&
            new_current_page !== scroller.current_page) {
          scroller.animating = true;

          if (duration !== 0)
            scroller.vars.beforeMove(scroller); // Callback telling moving animation is started

          wrapper.animate(
              { scrollLeft: wrapper.scrollLeft() + scroller.visible_els * el_width * scrollBy },
              duration, scroller.vars.easingType,
              function() { scroller.animating = false; }
          );

          scroller.current_page = new_current_page;

          if (scroller.vars.addPagination)
            scroller.assignActivePage(true);

          if (duration !== 0) {
            // Callback telling moving animation is finished
            scroller.vars.afterMove(scroller);

            if (new_current_page + 1 === scroller.total_pages)
            // Callback telling moving animation is finished
              scroller.vars.lastPageReached(scroller);
          }
        }
      }
    };

    scroller.initializePagination = function() {
      // If there is the same number of visible elements we don't have to change anything
      if (typeof scroller.old_visible_els === 'undefined' || scroller.old_visible_els !== scroller.visible_els) {
        scroller.old_visible_els = scroller.visible_els;
        scroller.total_pages = Math.ceil(per_row / scroller.visible_els);

        if (typeof scroller.current_page === 'undefined') {
          // If current page was not set previously, we set it now
          scroller.current_page = 0;
        } else {
          scroller.current_page = Math.ceil(wrapper.scrollLeft() / (scroller.visible_els * el_width));
        }

        if (scroller.vars.addPagination)
          scroller.drawPagination();
      }
    };

    scroller.drawPagination = function() {
      if (outer_wrapper.find('.radiant-pagination').size() > 0)
        outer_wrapper.find('.radiant-pagination').remove();

      var pagination = $('<div class="radiant-pagination" />').insertAfter(wrapper);
      for (var i = 0; i < scroller.total_pages; i++) {
        pagination.append('<div class="radiant-page" data-page="' + i + '" />');
      }
      scroller.assignActivePage();
    };

    scroller.assignActivePage = function(remove_old_active) {
      if (remove_old_active === true)
        outer_wrapper.find('.current-page').removeClass('current-page');
      $(outer_wrapper.find('.radiant-page').get(scroller.current_page)).addClass('current-page');
    };

    // Captions are added by assigning `title` attribute to imgs like
    // <img src="test.jpg" title="My caption" />
    scroller.addCaptions = function() {
      var child_img, child_img_title;

      elements.each(function() {
        child_img = $(this).find('img');
        child_img_title = $.trim(child_img.attr('title'));

        if (typeof child_img_title !== 'undefined' && child_img_title !== '') {
          child_img.attr('title', '');
          $(this).append('<div class="radiant-caption">' +
              child_img_title + '</div>');
        }
      });

      var slide_animation_opts = {
        duration: scroller.vars.captionsAnimateDuration,
        easing: scroller.vars.captionsAnimateEasingType
      };

      scroller.on('mouseenter', '.scroller-el', function() {
        var caption = $(this).find('.radiant-caption');
        if (caption.size() > 0 && !caption.is(':visible')) {
          caption.slideDown(slide_animation_opts, scroller.vars.afterShowingCaption(caption));
        }
      });

      scroller.on('mouseleave', '.scroller-el', function() {
        var caption = $(this).find('.radiant-caption');
        if (caption.size() > 0 && caption.is(':visible')) {
          caption.slideUp(slide_animation_opts, scroller.vars.afterHidingCaption(caption));
        }
      });
    };

    // Binding events
    $(window).bindWithDelay('resize', function() {
      scroller.calculateVisibleElements();
      scroller.initializePagination();
      var temp_page = scroller.current_page;
      scroller.moveElements(-temp_page, true);
      scroller.moveElements(temp_page, true);
    }, scroller.vars.delayDuration, true);

    nav.on('click', '.radiant-next', function() {
      scroller.moveElements(1);
    });

    nav.on('click', '.radiant-prev', function() {
      scroller.moveElements(-1);
    });

    if (scroller.vars.useMouseWheel) {
      wrapper.on('mousewheel', function(event) {
        event.preventDefault();
        scroller.moveElements(event.deltaY);
      });
    }

    outer_wrapper.on('click', '.radiant-page', function() {
      var this_page = $(this).data('page');
      // If not clicking on the same page
      if (scroller.current_page !== this_page) {
        scroller.moveElements(this_page - scroller.current_page);
      }
    });

    // Init scroller
    scroller.calculateVisibleElements();
    scroller.initializePagination();
    if (scroller.vars.useCaptions) {
      scroller.addCaptions();
    }

    scroller.vars.loaded(scroller); // Fire callback telling the scroller is loaded
  };

  $.radiantScroller.defaults = {
    addPagination: false,
    animateDuration: 700,
    captionsAnimateDuration: 400,
    captionsAnimateEasingType: 'swing',
    cols: 2,
    delayDuration: 500,
    easingType: 'swing',
    elementMargin: 10,
    elementWidth: 200,
    nextButtonText: '',
    prevButtonText: '',
    rows: 2,
    useCaptions: false,
    useMouseWheel: false,
    // Callbacks
    loaded: function() {}, // Called when the scroller is loaded and ready
    beforeMove: function() {}, // Called before each scroller moving animation
    afterMove: function() {}, // Called after each scroller moving animation is finished
    lastPageReached: function() {}, // Called when the last page of the scroller is reached
    afterHidingCaption: function() {}, // Called after the caption was hidden
    afterShowingCaption: function() {} // Called after the caption was showed
  };

  $.fn.radiantScroller = function(options, options2) {
    if (options === undefined) options = {};

    if (typeof options === "object") {
      new $.radiantScroller(this, options);
    } else {
      var $scroller = $(this).data('radiantscroller');
      switch (options) {
        case "next": $scroller.moveElements(1); break;
        case "prev": $scroller.moveElements(-1); break;
        // radiantScroller('by', 2) - scroll by 2 pages, not to the 2nd page
        case "by": if (typeof options2 === "number") $scroller.moveElements(options2); break;
        // Default behaviour: radiantScroller(3) means go to 3 page and page numeration starts from 1
        // (whereas plugin has numeration starting from 0, so have to substract 1!!!)
        default: if (typeof options === "number") $scroller.moveElements(options - 1 - $scroller.current_page);
      }
    }

    return this;
  };
})(jQuery);

/*
 bindWithDelay jQuery plugin
 Author: Brian Grinstead
 MIT license: http://www.opensource.org/licenses/mit-license.php

 http://github.com/bgrins/bindWithDelay
 http://briangrinstead.com/files/bindWithDelay

 Usage:
 See http://api.jquery.com/bind/
 .bindWithDelay( eventType, [ eventData ], handler(eventObject), timeout, throttle )

 Examples:
 $("#foo").bindWithDelay("click", function(e) { }, 100);
 $(window).bindWithDelay("resize", { optional: "eventData" }, callback, 1000);
 $(window).bindWithDelay("resize", callback, 1000, true);
 */

(function($) {

  $.fn.bindWithDelay = function( type, data, fn, timeout, throttle ) {

    if ( $.isFunction( data ) ) {
      throttle = timeout;
      timeout = fn;
      fn = data;
      data = undefined;
    }

    // Allow delayed function to be removed with fn in unbind function
    fn.guid = fn.guid || ($.guid && $.guid++);

    // Bind each separately so that each element has its own delay
    return this.each(function() {

      var wait = null;

      function cb() {
        var e = $.extend(true, { }, arguments[0]);
        var ctx = this;
        var throttler = function() {
          wait = null;
          fn.apply(ctx, [e]);
        };

        if (!throttle) { clearTimeout(wait); wait = null; }
        if (!wait) { wait = setTimeout(throttler, timeout); }
      }

      cb.guid = fn.guid;

      $(this).bind(type, data, cb);
    });
  };

})(jQuery);