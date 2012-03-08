if (typeof(jQuery) == 'undefined') alert('jQuery library was not found.');

(function ($) {
    
    $.fn.extend({
        imagePlayer: function(options) {
            if (options && typeof(options) == 'object') {
                options = $.extend({}, $.imagePlayer.settings, options);
            }
            return this.each(function() {
                new $.imagePlayer(this, options);
            });
        } 
    });
    
    $.imagePlayer = function (self, options) {
        var playlist = $(self);
        var player_id = self.id;
        var images = []/*, widths = [], heights = []*/;
        var player, stage, controls, play_pause, scrubber, scrubber_handle, frame_count, image = null;
        var last_frame_scrubber_pos = 0;
        var inc; // delta inc for scrubber
        var i = 0; // current image
        var rotator = null;
        var settings = options;
        playlist.find('img').each(function() {
            images.push(this.src);
            //widths.push($(this).width());
            //heights.push($(this).height());
        });
        
        create_player();
        if(settings.autoStart === true) {
            image_cycle();
        }

        function create_player() {
            // Player elements.
            player          = $('<div>').addClass('img_player');
            stage           = $('<div>').addClass('stage');
            controls        = $('<div>').addClass('controls');
            play_pause      = $('<a>').attr('href', '#');
            scrubber        = $('<div>').addClass('scrubber');
            scrubber_handle = $('<a>').attr('href', '#');
            frame_count     = $('<span>').addClass('frame_count');
            // Set dimensions
            player.css({
                width:settings.stageWidth + 'px',
                height:settings.stageHeight + 50 + 'px'
            });
            stage.css({
                width:settings.stageWidth + 'px',
                height:settings.stageHeight + 'px'
            });
            controls.css({
                width:settings.stageWidth + 'px'
            });
            scrubber.css({
                width:settings.stageWidth - 100 + 'px'
            });
            // Set the right control for play/pause.
            (settings.autoStart===true) ? play_pause.addClass('pause') : play_pause.addClass('play');
            // Bind mouse interactions
            stage.bind('mouseenter', function(e) {
                handle_image_hover(e, this);
            }).bind('mouseleave', function(e) {
                handle_image_out(e, this);
            }); // .hover seems not tow work?
            play_pause.bind('click', function(e) {
                handle_control_click(e, this);
            });
            scrubber.bind('click', function(e) {
                handle_scrubber_click(e, this);
            });
            // Build the player.
            player.append(stage).append(controls.append(play_pause).append(scrubber.append(scrubber_handle)).append(frame_count));         
            playlist.hide().after(player);
            inc = Math.floor(scrubber.width() / images.length);
        }
        
        function set_image(img) {
            var image_object = {
                src: img, 
                alt: 'Slide ' + i + 1, 
                width: settings.stageWidth, 
                height: settings.stageHeight
            };
            if (image === null) {
                image = $('<img>').attr(image_object);
                stage.html(image);
            } else {
                image.attr(image_object);      
            }
            frame_count.html(i+1 + '/' + images.length);
        }
        
        function image_cycle() {
            console.log(i);
            clearTimeout(rotator);
            if(settings.loop === true) {
                if (i > images.length - 1) {
                    i = 0;
                    // stop animation
                    console.log("I'm here");
                    scrubber_handle.stop(true, true);
                    scrubber_handle.css('left', '0');
                }
            }
            if (i < images.length) {
                image_transition(images[i]);
            }
            i++;
        }
        
        function image_transition(img) {
            set_image(img);
            // animate scrubber
            last_frame_scrubber_pos = parseFloat(scrubber_handle.css('left'));
            var remaining = inc*(i+1) - last_frame_scrubber_pos;
            var percent = Math.floor(remaining / inc);
            scrubber_handle.stop(true, true);
            scrubber_handle.animate({
                left: '+='+remaining+'px'
            }, settings.delay*1000, 'linear');
            rotator = setTimeout(image_cycle, settings.delay * 1000);
        }
        
        function handle_image_hover(e, elem) {
            if(settings.pauseOnHover === true && play_pause.attr('class') === 'pause') { // is playing
                clearTimeout(rotator);
                scrubber_handle.stop(true, true);  
            }
        }
        
        function handle_image_out(e, elem) {
            if(settings.pauseOnHover === true && play_pause.attr('class') === 'pause') {   
                image_cycle();
            }
        }
        
        function handle_control_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            // try if we can use "hasClass"
            if(elem.attr('class') == 'pause') { // it's playing (then pause)
                elem.attr('class', 'play');
                clearTimeout(rotator);
                scrubber_handle.stop(true, false);
                scrubber_handle.css('left', last_frame_scrubber_pos + 'px');
                i--;
            } else { // paused (we have to resume playback)
                image_cycle();
                elem.attr('class', 'pause');
            }
        }
        
        function handle_scrubber_click(e, elem) {
            var pos, x_coord;
            e.preventDefault();
            elem = $(elem, player);
            clearTimeout(rotator);
            scrubber_handle.stop(true, false);
            pos = elem.offset();
            x_coord = Math.ceil(e.pageX - pos.left);
            i = Math.floor(x_coord / inc);
            if(Math.abs(inc*i - x_coord) <= Math.abs(inc*(i+1) - x_coord)) {
                scrubber_handle.css('left', (x_coord - Math.abs(inc*i - x_coord)) + 'px');
            } else {
                scrubber_handle.css('left', (x_coord + Math.abs(inc*(i+1) - x_coord)) + 'px');
                if(i < images.length - 1) i++;
            }
            if(play_pause.attr('class') === 'pause') { // was playing
                image_cycle();
            } else {
                set_image(images[i]);
            }
            
        }
        
    };
    
    $.imagePlayer.settings = {
        stageWidth:400,
        stageHeight:300,
        autoStart:false,
        pauseOnHover:true,
        delay:1,
        loop:true
    };
    
})(jQuery);