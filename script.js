/* flipclock plugin + UI glue (no location modal)
   - This version uses the browser timezone automatically.
   - Only the 12/24 toggle remains (persisted).
*/

(function($) {
  var pluginName = 'flipclock';

  var methods = {
    pad: function(n) { return (n < 10) ? '0' + n : '' + n; },

    time: function(opts) {
      var timezone = null;
      var hour12 = false;
      if (typeof opts === 'string') timezone = opts;
      else if (typeof opts === 'object' && opts) {
        timezone = opts.timezone || null;
        hour12 = !!opts.hour12;
      }

      var year, month, day, hour, minute, second;

      if (timezone) {
        try {
          var fmt = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          var parts = fmt.formatToParts(new Date());
          var map = {};
          parts.forEach(function(p){ map[p.type] = p.value; });
          year = parseInt(map.year,10);
          month = parseInt(map.month,10);
          day = parseInt(map.day,10);
          hour = parseInt(map.hour,10);
          minute = parseInt(map.minute,10);
          second = parseInt(map.second,10);
        } catch (e) {
          var d = new Date();
          year=d.getFullYear(); month=d.getMonth()+1; day=d.getDate();
          hour=d.getHours(); minute=d.getMinutes(); second=d.getSeconds();
          timezone = null;
        }
      } else {
        var d = new Date();
        year=d.getFullYear(); month=d.getMonth()+1; day=d.getDate();
        hour=d.getHours(); minute=d.getMinutes(); second=d.getSeconds();
      }

      var ampm = '';
      if (hour12) {
        ampm = (hour >= 12) ? 'PM' : 'AM';
        hour = hour % 12;
        if (hour === 0) hour = 12;
      }

      var tstr = methods.pad(year - 2000) + methods.pad(month) + methods.pad(day)
                 + methods.pad(hour) + methods.pad(minute) + methods.pad(second);

      return {
        'Y': {'d2': tstr.charAt(2), 'd1': tstr.charAt(3)},
        'M': {'d2': tstr.charAt(4), 'd1': tstr.charAt(5)},
        'D': {'d2': tstr.charAt(6), 'd1': tstr.charAt(7)},
        'h': {'d2': tstr.charAt(8), 'd1': tstr.charAt(9)},
        'm': {'d2': tstr.charAt(10), 'd1': tstr.charAt(11)},
        's': {'d2': tstr.charAt(12), 'd1': tstr.charAt(13)},
        'ampm': ampm
      };
    },

    play: function(c) {
      $('body').removeClass('play');
      var a = $('ul' + c + ' section.active');
      if (a.html() == undefined) {
        a = $('ul' + c + ' section').eq(0);
        a.addClass('ready').removeClass('active').next('section').addClass('active').closest('body').addClass('play');
      } else if (a.is(':last-child')) {
        $('ul' + c + ' section').removeClass('ready');
        a.addClass('ready').removeClass('active');
        a = $('ul' + c + ' section').eq(0);
        a.addClass('active').closest('body').addClass('play');
      } else {
        $('ul' + c + ' section').removeClass('ready');
        a.addClass('ready').removeClass('active').next('section').addClass('active').closest('body').addClass('play');
      }
    },

    ul: function(c, d2, d1) {
      return '<ul class="flip ' + c + '">' + this.li('d2', d2) + this.li('d1', d1) + '</ul>';
    },

    li: function(c, n) {
      return '<li class="' + c + '"><section class="ready"><div class="up">' +
             '<div class="shadow"></div><div class="inn"></div></div>' +
             '<div class="down"><div class="shadow"></div><div class="inn"></div></div>' +
             '</section><section class="active"><div class="up">' +
             '<div class="shadow"></div><div class="inn">' + n + '</div></div>' +
             '<div class="down"><div class="shadow"></div><div class="inn">' + n + '</div></div>' +
             '</section></li>';
    }
  };

  function Plugin(element, options) {
    this.element = element;
    this.options = options || {};
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var t, full = false;
      var hour12 = !!(this.options.hour12);
      var tz = (typeof this.options === 'string') ? this.options : (this.options.timezone || null);
      var wantDate = (this.options && (this.options === 'date' || this.options.showDate));

      if (!this.options || this.options == 'clock') {
        t = methods.time({ timezone: null, hour12: hour12 });
      } else if (this.options == 'date' || wantDate) {
        t = methods.time({ timezone: tz, hour12: hour12 });
        full = true;
      } else {
        t = methods.time({ timezone: tz, hour12: hour12 });
        full = true;
      }

      var html = (full ? methods.ul('year', t.Y.d2, t.Y.d1) + methods.ul('month', t.M.d2, t.M.d1) + methods.ul('day', t.D.d2, t.D.d1) : '')
                 + methods.ul('hour', t.h.d2, t.h.d1)
                 + methods.ul('minute', t.m.d2, t.m.d1)
                 + methods.ul('second', t.s.d2, t.s.d1);

      $(this.element).addClass('flipclock').html(html);

      if (hour12) {
        $('#ampm').show().text(t.ampm || '');
      } else {
        $('#ampm').hide();
      }

      this._tz = tz;
      this._hour12 = hour12;

      var self = this;
      if (this._interval) clearInterval(this._interval);
      this._interval = setInterval(function(){ self.refresh(); }, 1000);
    },

    refresh: function() {
      var el = $(this.element);
      var t;
      if (this._tz || this._hour12) {
        t = methods.time({ timezone: this._tz, hour12: this._hour12 });
      } else {
        t = methods.time();
      }

      setTimeout(function() {
        var audio = document.getElementById('flipclick');
        if (audio && audio.play) {
          try { audio.currentTime = 0; audio.play(); } catch(e) {}
        }
      }, 350);

      el.find(".second .d1 .ready .inn").html(t.s.d1);
      methods.play('.second .d1');

      if ((t.s.d1 === '0')) {
        el.find(".second .d2 .ready .inn").html(t.s.d2);
        methods.play('.second .d2');

        if ((t.s.d2 === '0')) {
          el.find(".minute .d1 .ready .inn").html(t.m.d1);
          methods.play('.minute .d1');

          if ((t.m.d1 === '0')) {
            el.find(".minute .d2 .ready .inn").html(t.m.d2);
            methods.play('.minute .d2');

            if ((t.m.d2 === '0')) {
              el.find(".hour .d1 .ready .inn").html(t.h.d1);
              methods.play('.hour .d1');

              if ((t.h.d1 === '0')) {
                el.find(".hour .d2 .ready .inn").html(t.h.d2);
                methods.play('.hour .d2');

                if ((t.h.d2 === '0')) {
                  el.find(".day .d1 .ready .inn").html(t.D.d1);
                  methods.play('.day .d1');

                  if ((t.D.d1 === '0')) {
                    el.find(".day .d2 .ready .inn").html(t.D.d2);
                    methods.play('.day .d2');

                    if ((t.D.d2 === '0')) {
                      el.find(".month .d1 .ready .inn").html(t.M.d1);
                      methods.play('.month .d1');

                      if ((t.M.d1 === '0')) {
                        el.find(".month .d2 .ready .inn").html(t.M.d2);
                        methods.play('.month .d2');

                        if ((t.M.d2 === '0')) {
                          el.find(".year .d1 .ready .inn").html(t.Y.d1);
                          methods.play('.year .d1');

                          if ((t.Y.d1 === '0')) {
                            el.find(".year .d2 .ready .inn").html(t.Y.d2);
                            methods.play('.year .d2');
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (this._hour12) {
        $('#ampm').text(t.ampm || '');
      }
    },

    updateSettings: function(newOpts) {
      this.options = newOpts || this.options;
      this.init();
    }
  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      var $this = $(this);
      var inst = $this.data('plugin_' + pluginName);
      if (!inst) {
        inst = new Plugin(this, options);
        $this.data('plugin_' + pluginName, inst);
      } else if (typeof options === 'object') {
        inst.updateSettings(options);
      }
    });
  };

})(typeof jQuery !== 'undefined' ? jQuery : Zepto);


/* -----------------------
   UI glue (12/24 toggle only; browser timezone)
   ----------------------- */
(function($){
  var HOUR12_KEY = 'flipclock_hour12_v1';

  // default to 12-hour but restore user's previous preference if present
  var prefs = { timezone: null, hour12: true };
  var storedHour12 = localStorage.getItem(HOUR12_KEY);
  if (storedHour12 !== null) prefs.hour12 = storedHour12 === '1';

  function setToggleUI() {
    if (prefs.hour12) {
      $('#btn-12').addClass('active');
      $('#btn-24').removeClass('active');
      $('#ampm').attr('aria-hidden','false');
    } else {
      $('#btn-24').addClass('active');
      $('#btn-12').removeClass('active');
      $('#ampm').attr('aria-hidden','true');
    }
  }
  setToggleUI();

  $('#btn-12').on('click', function(){ prefs.hour12 = true; localStorage.setItem(HOUR12_KEY,'1'); setToggleUI(); reinitClock(); });
  $('#btn-24').on('click', function(){ prefs.hour12 = false; localStorage.setItem(HOUR12_KEY,'0'); setToggleUI(); reinitClock(); });

  var clockInitialized = false;
  function reinitClock() {
    // timezone is left null: use browser local time
    if (!clockInitialized) {
      $('#container').flipclock({ timezone: null, hour12: prefs.hour12 });
      clockInitialized = true;
    } else {
      $('#container').data('plugin_flipclock').updateSettings({ timezone: null, hour12: prefs.hour12 });
    }
  }

  // initialize immediately (no modal/prompt)
  reinitClock();

})(jQuery);
