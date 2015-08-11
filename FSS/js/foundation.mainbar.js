;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.mainbar = {
    name : 'mainbar',

    version : '5.5.2',

    settings : {
      index : 0,
      start_offset : -51,
      sticky_class : 'sticky-sec',
      custom_back_text : true,
      back_text : 'Back',
      mobile_show_parent_link : true,
      is_hover : true,
      scrolltop : true, // jump to top when sticky nav menu toggle is clicked
      sticky_on : 'all',
      dropdown_autoclose: true
    },

    init : function (section, method, options) {
      Foundation.inherit(this, 'add_custom_rule register_media throttle');
      var self = this;

      self.register_media('mainbar', 'foundation-mq-mainbar');

      this.bindings(method, options);

      self.S('[' + this.attr_name() + ']', this.scope).each(function () {
        var mainbar = $(this),
            settings = mainbar.data(self.attr_name(true) + '-init'),
            section = self.S('section, .main-bar-section', this);
        mainbar.data('index', 0);
        var mainbarContainer = mainbar.parent();
        if (mainbarContainer.hasClass('fixed') || self.is_sticky(mainbar, mainbarContainer, settings) ) {
          self.settings.sticky_class = settings.sticky_class;
          self.settings.sticky_mainbar = mainbar;
          mainbar.data('height', mainbarContainer.outerHeight());
          mainbar.data('stickyoffset', mainbarContainer.offset().top);
        } else {
          mainbar.data('height', mainbar.outerHeight());
        }

        if (!settings.assembled) {
          self.assemble(mainbar);
        }

        if (settings.is_hover) {
          self.S('.has-dropdown', mainbar).addClass('not-click');
        } else {
          self.S('.has-dropdown', mainbar).removeClass('not-click');
        }

        // Pad body when sticky (scrolled) or fixed.
        self.add_custom_rule('.f-mainbar-fixed { padding-top: ' + mainbar.data('height') + 'px }');

        if (mainbarContainer.hasClass('fixed')) {
          self.S('body').addClass('f-mainbar-fixed');
        }
      });

    },

    is_sticky : function (mainbar, mainbarContainer, settings) {
      var sticky     = mainbarContainer.hasClass(settings.sticky_class);
      var smallMatch = matchMedia(Foundation.media_queries.small).matches;
      var medMatch   = matchMedia(Foundation.media_queries.medium).matches;
      var lrgMatch   = matchMedia(Foundation.media_queries.large).matches;

      if (sticky && settings.sticky_on === 'all') {
        return true;
      }
      if (sticky && this.small() && settings.sticky_on.indexOf('small') !== -1) {
        if (smallMatch && !medMatch && !lrgMatch) { return true; }
      }
      if (sticky && this.medium() && settings.sticky_on.indexOf('medium') !== -1) {
        if (smallMatch && medMatch && !lrgMatch) { return true; }
      }
      if (sticky && this.large() && settings.sticky_on.indexOf('large') !== -1) {
        if (smallMatch && medMatch && lrgMatch) { return true; }
      }

       return false;
    },

    toggle : function (toggleEl) {
      var self = this,
          mainbar;

      if (toggleEl) {
        mainbar = self.S(toggleEl).closest('[' + this.attr_name() + ']');
      } else {
        mainbar = self.S('[' + this.attr_name() + ']');
      }

      var settings = mainbar.data(this.attr_name(true) + '-init');

      var section = self.S('section, .main-bar-section', mainbar);

      if (self.breakpoint()) {
        if (!self.rtl) {
          section.css({left : '0%'});
          $('>.name', section).css({left : '100%'});
        } else {
          section.css({right : '0%'});
          $('>.name', section).css({right : '100%'});
        }

        self.S('li.moved', section).removeClass('moved');
        mainbar.data('index', 0);

        mainbar
          .toggleClass('expanded')
          .css('height', '');
      }

      if (settings.scrolltop) {
        if (!mainbar.hasClass('expanded')) {
          if (mainbar.hasClass('fixed')) {
            mainbar.parent().addClass('fixed');
            mainbar.removeClass('fixed');
            self.S('body').addClass('f-mainbar-fixed');
          }
        } else if (mainbar.parent().hasClass('fixed')) {
          if (settings.scrolltop) {
            mainbar.parent().removeClass('fixed');
            mainbar.addClass('fixed');
            self.S('body').removeClass('f-mainbar-fixed');

            window.scrollTo(0, 0);
          } else {
            mainbar.parent().removeClass('expanded');
          }
        }
      } else {
        if (self.is_sticky(mainbar, mainbar.parent(), settings)) {
          mainbar.parent().addClass('fixed');
        }

        if (mainbar.parent().hasClass('fixed')) {
          if (!mainbar.hasClass('expanded')) {
            mainbar.removeClass('fixed');
            mainbar.parent().removeClass('expanded');
            self.update_sticky_positioning();
          } else {
            mainbar.addClass('fixed');
            mainbar.parent().addClass('expanded');
            self.S('body').addClass('f-mainbar-fixed');
          }
        }
      }
    },

    timer : null,

    events : function (bar) {
      var self = this,
          S = this.S;

      S(this.scope)
        .off('.mainbar')
        .on('click.fndtn.mainbar', '[' + this.attr_name() + '] .toggle-mainbar', function (e) {
          e.preventDefault();
          self.toggle(this);
        })
        .on('click.fndtn.mainbar contextmenu.fndtn.mainbar', '.main-bar .main-bar-section li a[href^="#"],[' + this.attr_name() + '] .main-bar-section li a[href^="#"]', function (e) {
            var li = $(this).closest('li'),
                mainbar = li.closest('[' + self.attr_name() + ']'),
                settings = mainbar.data(self.attr_name(true) + '-init');

            if (settings.dropdown_autoclose && settings.is_hover) {
              var hoverLi = $(this).closest('.hover');
              hoverLi.removeClass('hover');
            }
            if (self.breakpoint() && !li.hasClass('back') && !li.hasClass('has-dropdown')) {
              self.toggle();
            }

        })
        .on('click.fndtn.mainbar', '[' + this.attr_name() + '] li.has-dropdown', function (e) {
          var li = S(this),
              target = S(e.target),
              mainbar = li.closest('[' + self.attr_name() + ']'),
              settings = mainbar.data(self.attr_name(true) + '-init');

          if (target.data('revealId')) {
            self.toggle();
            return;
          }

          if (self.breakpoint()) {
            return;
          }

          if (settings.is_hover && !Modernizr.touch) {
            return;
          }

          e.stopImmediatePropagation();

          if (li.hasClass('hover')) {
            li
              .removeClass('hover')
              .find('li')
              .removeClass('hover');

            li.parents('li.hover')
              .removeClass('hover');
          } else {
            li.addClass('hover');

            $(li).siblings().removeClass('hover');

            if (target[0].nodeName === 'A' && target.parent().hasClass('has-dropdown')) {
              e.preventDefault();
            }
          }
        })
        .on('click.fndtn.mainbar', '[' + this.attr_name() + '] .has-dropdown>a', function (e) {
          if (self.breakpoint()) {

            e.preventDefault();

            var $this = S(this),
                mainbar = $this.closest('[' + self.attr_name() + ']'),
                section = mainbar.find('section, .main-bar-section'),
                dropdownHeight = $this.next('.dropdown').outerHeight(),
                $selectedLi = $this.closest('li');

            mainbar.data('index', mainbar.data('index') + 1);
            $selectedLi.addClass('moved');

            if (!self.rtl) {
              section.css({left : -(100 * mainbar.data('index')) + '%'});
              section.find('>.name').css({left : 100 * mainbar.data('index') + '%'});
            } else {
              section.css({right : -(100 * mainbar.data('index')) + '%'});
              section.find('>.name').css({right : 100 * mainbar.data('index') + '%'});
            }

            mainbar.css('height', $this.siblings('ul').outerHeight(true) + mainbar.data('height'));
          }
        });

      S(window).off('.mainbar').on('resize.fndtn.mainbar', self.throttle(function () {
          self.resize.call(self);
      }, 50)).trigger('resize.fndtn.mainbar').load(function () {
          // Ensure that the offset is calculated after all of the pages resources have loaded
          S(this).trigger('resize.fndtn.mainbar');
      });

      S('body').off('.mainbar').on('click.fndtn.mainbar', function (e) {
        var parent = S(e.target).closest('li').closest('li.hover');

        if (parent.length > 0) {
          return;
        }

        S('[' + self.attr_name() + '] li.hover').removeClass('hover');
      });

      // Go up a level on Click
      S(this.scope).on('click.fndtn.mainbar', '[' + this.attr_name() + '] .has-dropdown .back', function (e) {
        e.preventDefault();

        var $this = S(this),
            mainbar = $this.closest('[' + self.attr_name() + ']'),
            section = mainbar.find('section, .main-bar-section'),
            settings = mainbar.data(self.attr_name(true) + '-init'),
            $movedLi = $this.closest('li.moved'),
            $previousLevelUl = $movedLi.parent();

        mainbar.data('index', mainbar.data('index') - 1);

        if (!self.rtl) {
          section.css({left : -(100 * mainbar.data('index')) + '%'});
          section.find('>.name').css({left : 100 * mainbar.data('index') + '%'});
        } else {
          section.css({right : -(100 * mainbar.data('index')) + '%'});
          section.find('>.name').css({right : 100 * mainbar.data('index') + '%'});
        }

        if (mainbar.data('index') === 0) {
          mainbar.css('height', '');
        } else {
          mainbar.css('height', $previousLevelUl.outerHeight(true) + mainbar.data('height'));
        }

        setTimeout(function () {
          $movedLi.removeClass('moved');
        }, 300);
      });

      // Show dropdown menus when their items are focused
      S(this.scope).find('.dropdown a')
        .focus(function () {
          $(this).parents('.has-dropdown').addClass('hover');
        })
        .blur(function () {
          $(this).parents('.has-dropdown').removeClass('hover');
        });
    },

    resize : function () {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function () {
        var mainbar = self.S(this),
            settings = mainbar.data(self.attr_name(true) + '-init');

        var stickyContainer = mainbar.parent('.' + self.settings.sticky_class);
        var stickyOffset;

        if (!self.breakpoint()) {
          var doToggle = mainbar.hasClass('expanded');
          mainbar
            .css('height', '')
            .removeClass('expanded')
            .find('li')
            .removeClass('hover');

            if (doToggle) {
              self.toggle(mainbar);
            }
        }

        if (self.is_sticky(mainbar, stickyContainer, settings)) {
          if (stickyContainer.hasClass('fixed')) {
            // Remove the fixed to allow for correct calculation of the offset.
            stickyContainer.removeClass('fixed');

            stickyOffset = stickyContainer.offset().top;
            if (self.S(document.body).hasClass('f-mainbar-fixed')) {
              stickyOffset -= mainbar.data('height');
            }

            mainbar.data('stickyoffset', stickyOffset);
            stickyContainer.addClass('fixed');
          } else {
            stickyOffset = stickyContainer.offset().top;
            mainbar.data('stickyoffset', stickyOffset);
          }
        }

      });
    },

    breakpoint : function () {
      return !matchMedia(Foundation.media_queries['mainbar']).matches;
    },

    small : function () {
      return matchMedia(Foundation.media_queries['small']).matches;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    assemble : function (mainbar) {
      var self = this,
          settings = mainbar.data(this.attr_name(true) + '-init'),
          section = self.S('section, .main-bar-section', mainbar);

      // Pull element out of the DOM for manipulation
      section.detach();

      self.S('.has-dropdown>a', section).each(function () {
        var $link = self.S(this),
            $dropdown = $link.siblings('.dropdown'),
            url = $link.attr('href'),
            $titleLi;

        if (!$dropdown.find('.title.back').length) {

          if (settings.mobile_show_parent_link == true && url) {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5></li><li class="parent-link hide-for-medium-up"><a class="parent-link js-generated" href="' + url + '">' + $link.html() +'</a></li>');
          } else {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5>');
          }

          // Copy link to subnav
          if (settings.custom_back_text == true) {
            $('h5>a', $titleLi).html("<i class='fa fa-reply'></i>"); //$('h5>a', $titleLi).html(settings.back_text);
          } else {
            $('h5>a', $titleLi).html('&laquo; ' + $link.html());
          }
          $dropdown.prepend($titleLi);
        }
      });

      // Put element back in the DOM
      section.appendTo(mainbar);

      // check for sticky
      this.sticky();

      this.assembled(mainbar);
    },

    assembled : function (mainbar) {
      mainbar.data(this.attr_name(true), $.extend({}, mainbar.data(this.attr_name(true)), {assembled : true}));
    },

    height : function (ul) {
      var total = 0,
          self = this;

      $('> li', ul).each(function () {
        total += self.S(this).outerHeight(true);
      });

      return total;
    },

    sticky : function () {
      var self = this;

      this.S(window).on('scroll', function () {
        self.update_sticky_positioning();
      });
    },

    update_sticky_positioning : function () {
      var klass = '.' + this.settings.sticky_class,
          $window = this.S(window),
          self = this;

      if (self.settings.sticky_mainbar && self.is_sticky(this.settings.sticky_mainbar,this.settings.sticky_mainbar.parent(), this.settings)) {
        var distance = this.settings.sticky_mainbar.data('stickyoffset') + this.settings.start_offset;
        if (!self.S(klass).hasClass('expanded')) {
          if ($window.scrollTop() > (distance)) {
            if (!self.S(klass).hasClass('fixed')) {
              self.S(klass).addClass('fixed');
              self.S('body').addClass('f-mainbar-fixed');
            }
          } else if ($window.scrollTop() <= distance) {
            if (self.S(klass).hasClass('fixed')) {
              self.S(klass).removeClass('fixed');
              self.S('body').removeClass('f-mainbar-fixed');
            }
          }
        }
      }
    },

    off : function () {
      this.S(this.scope).off('.fndtn.mainbar');
      this.S(window).off('.fndtn.mainbar');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
