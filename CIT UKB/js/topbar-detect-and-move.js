 // počká až je dokument ready
      $(document).ready(function(){  
        // Převedení výšky patičky na padding-bottom u pomocného containeru #main - aby obsah nebyl překrytý patičkou
        function onResize() {
          $("#main").css( "padding-bottom", $("#footer").outerHeight(true) );
            
          if( $('#sec-top-bar-cont').hasClass( 'fixed' ) ) {
            $('#prim-top-bar-cont').css( "top", -$("#prim-top-bar-cont").outerHeight(true)-5 );
          } else {
            $('#prim-top-bar-cont').css("top", 0);
          }
        }
          
        onResize(); // při načtení stránky
        $( window ).resize(onResize); // při změné velikosti okna
            
        var senseSpeed = 5;
        var previousScroll = 0;
        $(window).scroll(function(){
            
          if( $("#prim-top-bar-cont").hasClass("fixed") && $("#sec-top-bar-cont").hasClass("fixed") ) {
            $("#prim-top-bar").addClass("hide-dropdown");
          } else {
            $("#prim-top-bar").removeClass("hide-dropdown");
          }
                
          var scroller = $(this).scrollTop();
                
          if( $('#prim-top-bar-cont').hasClass("fixed") && $('#sec-top-bar-cont').hasClass("fixed") ){
            if (scroller-senseSpeed > previousScroll) {
              $('#prim-top-bar-cont').css( "top", -$("#prim-top-bar-cont").outerHeight(true)-4 );
              $('#sec-top-bar-cont').css( "top", 0 );
            } else if (scroller+senseSpeed < previousScroll) {
              $('#prim-top-bar-cont').css( "top", 0 );
              $('#sec-top-bar-cont').css( "top", $("#prim-top-bar-cont").outerHeight(true) );
            }
          }
            
          previousScroll = scroller;
        });
            
        // Start Foundation a nastavení JS settings komponent
        $(document).foundation();
            
        $('.tab-content-switcher').click( function() {
          $(this).toggleClass('active');
          var target_element = $('#'+$(this).attr('data-hide-and-seek'));
          if(target_element.is(':hidden')) {
            target_element.show();
          }
          else {
            target_element.hide();
          }
        });
      });