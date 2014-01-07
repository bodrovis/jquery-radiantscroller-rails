/*!
 * jQuery RadiantScroller
 * Version: 0.0.1 (07/01/2014)
 * Copyright (c) 2013 Ilya Bodrov (http://radiant-wind.com)
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
            per_row = Math.ceil(el_count / scroller.vars.rows),
            visible_els = 0;

        // Calculating scroller's width with regard to items per row
        scroller.width( (el_width * per_row) - scroller.vars.elementMargin );

        // Grouping elements by rows
        do $(elements.slice(0, per_row)).wrapAll('<div class="radiant_scroller_row" />');
        while((elements = elements.slice(per_row)).length > 0);

        // Wrapper with hidden scrollbars
        scroller.wrap('<div class="radiant_scroller"></div>').wrap('<div class="radiant_scroller_wrapper" />');
        var wrapper = scroller.parent('.radiant_scroller_wrapper');
        var outer_wrapper = wrapper.parent('.radiant_scroller');

        var max_wrapper_width = (scroller.vars.cols * el_width - scroller.vars.elementMargin) + 'px';
        wrapper.css('max-width', max_wrapper_width);
        outer_wrapper.css('max-width', max_wrapper_width);

        // Next/previous buttons
        var nav = $('<div class="radiant-navigation" />').insertAfter(wrapper);
        var prev = nav.append($('<div class="radiant-prev">' + scroller.vars.prevButtonText + '</div>'));
        var next = nav.append($('<div class="radiant-next">' + scroller.vars.nextButtonText + '</div>'));

        // Scroller methods
        scroller.calculateVisibleElements = function() {
            visible_els = Math.floor((wrapper.width() + scroller.vars.elementMargin) / el_width);
        };

        scroller.moveElements = function(direction, scrollBy, page_el) {
            if(!scroller.animating) {
                scroller.animating = true;
                var distance = 0;
                if (typeof scrollBy === 'undefined') {
                    distance = visible_els * el_width;
                } else { distance = visible_els * el_width * scrollBy; }

                var fraction = 0;
                if (direction === 'left') { fraction = -distance ;
                } else { fraction = distance; }

                wrapper.animate(
                    { scrollLeft: wrapper.scrollLeft() + fraction },
                    scroller.vars.animateDuration, scroller.vars.easingType,
                    function() { scroller.animating = false; }
                );

                if (scroller.vars.addPagination) {
                    wrapper.current_page.removeClass('current-page');
                    if (typeof page_el === 'undefined') {
                        if (direction === 'right') {
                            if (wrapper.current_page.next().size() > 0)
                                wrapper.current_page = wrapper.current_page.next();
                        }
                        else {
                            if (wrapper.current_page.prev().size() > 0)
                                wrapper.current_page = wrapper.current_page.prev();
                        }
                    } else {
                        wrapper.current_page = page_el;
                    }
                    wrapper.current_page.addClass('current-page');
                }
            }
        };

        scroller.createPagination = function() {
            // If there is the same number of visible elements we don't have to change anything
            if (typeof this.visible_els === 'undefined' || this.visible_els !== visible_els) {
                this.visible_els = visible_els;
                var pages = Math.ceil(per_row / visible_els);
                if (outer_wrapper.find('.radiant-pagination').size() > 0)
                    outer_wrapper.find('.radiant-pagination').remove();

                var pagination = $('<div class="radiant-pagination" />').insertAfter(wrapper);
                for (var i = 0; i < pages; i++) {
                    pagination.append('<div class="radiant-page" data-page="' + (i + 1) + '"></div>');
                }

                if (typeof wrapper.current_page === 'undefined') {
                    // If current page was not set previously, we set it now
                    wrapper.current_page = pagination.find('.radiant-page').first();
                } else {
                    var new_current_page = Math.ceil(wrapper.scrollLeft() / (visible_els * el_width));
                    wrapper.current_page = $(pagination.find('.radiant-page').get(new_current_page));
                }
                wrapper.current_page.addClass('current-page');
            }
        };

        // Binding events
        $(window).bindWithDelay('resize', function() {
            scroller.calculateVisibleElements();
            if (scroller.vars.addPagination) {
                scroller.createPagination();
            }
        }, 500, true);

        nav.on('click', '.radiant-next', function() {
            scroller.moveElements('right', 1);
        });

        nav.on('click', '.radiant-prev', function() {
            scroller.moveElements('left', 1);
        });

        if (scroller.vars.useMouseWheel) {
            wrapper.on('mousewheel', function(event) {
                event.preventDefault();
                if (event.deltaY > 0) { scroller.moveElements('right'); } else {
                    scroller.moveElements('left'); }
            });
        }

        outer_wrapper.on('click', '.radiant-page', function() {
            var $this = $(this);
            if (wrapper.current_page.get(0) !== $this.get(0)) {
                var current_page_number = wrapper.current_page.data('page');
                var this_page_number = $this.data('page');
                if (current_page_number > this_page_number) {
                    scroller.moveElements('left', current_page_number - this_page_number, $this);
                } else { scroller.moveElements('right', this_page_number - current_page_number, $this); }
            }
        });

        // Init scroller
        scroller.calculateVisibleElements();
        if (scroller.vars.addPagination) {
            scroller.createPagination();
        }
    };

    $.radiantScroller.defaults = {
        cols: 2,
        elementWidth: 200,
        elementMargin: 10,
        easingType: 'swing',
        animateDuration: 700,
        rows: 2,
        useMouseWheel: false,
        addPagination: false,
        nextButtonText: '',
        prevButtonText: ''
    };

    $.fn.radiantScroller = function(options) {
        if (options === undefined) options = {};

        if (typeof options === "object") {
            new $.radiantScroller(this, options);
        } else {
            var $scroller = $(this).data('radiantscroller');
            switch (options) {
                case "next": $scroller.moveElements('right'); break;
                case "prev": $scroller.moveElements('left'); break;
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