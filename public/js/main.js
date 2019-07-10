
(function ($) {
    "use strict";



  
  
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');


    $('.input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });



    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    

})(jQuery);