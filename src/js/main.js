/**
 * Created by dxf on 2017/4/13.
 */
$(window).ready(function(){
    $('#progressBar').animate(
        {width:100+'%',opacity:1},
        {
        duration:1000,
        complete:function(){
            $(this).addClass('final');
            $('.header').css("top",0);
        }
        });
});