/**
 * Created by lenovo on 2016/11/10.
 */
$(window).ready(function(){
    var d=setTimeout(function(){
        if(document.readyState =="complete"){
            $("#loadingDiv").remove();
            initializeFct.initialize();/*��ʼ������*/
            clearTimeout(d);
        }
    },2000);
});
var initializeFct=window.namespace||{};
initializeFct.initialize=function(){
    resetToolBar();
    operation_Panel();
};
function resetToolBar(){
    $(".toolBar.bottom").css({
        'position':'absolute',
        'top':$(window).outerHeight()-100,
        'text-align':'center',
        'left':0
    });
    $(".contentPanel").css({
        'height':$(window).outerHeight()-200,
        'min-width':1200+'px'
    });
    $(".notice-txt").css({
        width:$(".notice-txt").parent().width()
    });
    $(window).resize(function(){
        $(".toolBar.bottom").css({
            'top':$(window).outerHeight()-100
        });
        $(".contentPanel").css({
            'height':$(window).outerHeight()-200
        });
        $(".notice-txt").css({
            width:$(".notice-txt").parent().width()
        });
    });
}
function operation_Panel(){
    $(".doc-closebox").on("click",function(e){
        var target= e.target;
        var ancestor=$(target).parent().parent();
        if(ancestor.hasClass("input-dialog")){
            ancestor.slideUp(250);
        }
        $(".doc-picker input").val("");
        $(".toolBar button").attr("disabled",false);
        e.stopPropagation();
    });
  /*  $(".doc-closebox").hover(
        function(){
            $(this).css({
            'transform':"rotate(180deg)",
            'transition':"200ms"
            })
        },
        function(){
            $(this).css({
            'transform':"rotate(0deg)",
            'transition':"200ms"
            })
        }
    );*/
    /*����ѡ����*/
    $(".toolBar button").on("click",function(e){
        var target= e.target;
        var operation=new op_ftn();
        /*�����ļ������ʾ*/
        if($(target).parent().hasClass("input-doc") || $(target).hasClass("input-doc")){
            loadPanel.initiaInputWizard();
            $(".input-dialog").slideDown(250);
            operation.inputDoc();
        }
        /*�Ŵ�*/
        if($(target).parent().hasClass("zoom-in") || $(target).hasClass("zoom-in")){
            operation.zoomIn();
        }
        /*��С*/
        if($(target).parent().hasClass("zoom-out") || $(target).hasClass("zoom-out")){
            operation.zoomOut();
        }
        /*�Ŵ�*/
        if($(target).parent().hasClass("mag-glass") || $(target).hasClass("mag-glass")){
            operation.mag_glass();
        }
        /*��ʱ����ת*/
        if($(target).parent().hasClass("rotate-counterClockwise") || $(target).hasClass("rotate-counterClockwise")){
            operation.rotateCounterClockWise();
        }
        /*˳ʱ����ת*/
        if($(target).parent().hasClass("rotate-clockwise") || $(target).hasClass("rotate-clockwise")){
            operation.rotateClockWise();
        }
        /*��������*/
        if($(target).parent().hasClass("cal-length") || $(target).hasClass("cal-length")){
            operation.calLength();
        }
        /*���ע��*/
        if($(target).parent().hasClass("annotation") || $(target).hasClass("annotation")){
            operation.annotation();
        }
        /*����/��ͣ��Ƭ*/
        if($(target).parent().hasClass("play-clip") || $(target).hasClass("play-clip") || $(target).parent().hasClass("pause-clip") || $(target).hasClass("pause-clip")){
            operation.playOrPause();
        }
        /*�����ļ�*/
        if($(target).parent().hasClass("save-doc") || $(target).hasClass("save-doc")){
           operation.saveDoc();
        }
        /*�л���ֵ*/
        if($(target).parent().hasClass("interpolation-doc") || $(target).hasClass("interpolation-doc")){
            operation.interpolationDoc();
        }
        /*ת���ļ�*/
        if($(target).parent().hasClass("invert-doc") || $(target).hasClass("invert-doc")){
           operation.invertDoc();
        }
        /*ʵ�ʴ�С*/
        if($(target).parent().hasClass("actual-doc") || $(target).hasClass("actual-doc")){
           operation.actualDoc();
        }
        /*���·�ת*/
        if($(target).parent().hasClass("flip-doc") || $(target).hasClass("flip-doc")){
            operation.flipDoc();
        }
        /*���ҷ�ת*/
        if($(target).parent().hasClass("reverse-doc") || $(target).hasClass("reverse-doc")){
           operation.reverseDoc();
        }
        /*ȫ��*/
        if($(target).parent().hasClass("full-screen") || $(target).hasClass("full-screen")){
            operation.fullScreen();
        }
        /*3d*/
        if($(target).parent().hasClass("threedMode") || $(target).hasClass("threedMode")){
            operation.threeDMode();
        }
        /*����*/
        if($(target).parent().hasClass("help") || $(target).hasClass("help")){
            operation.help();
            e.preventDefault();
        }
        e.stopPropagation();

    });
}
function dialogCon(_title,_class,_content){
    var _class=_class||"dialog";
    var dialogObj=new Object;
    //dialogObj.title=_title;
    dialogObj.content="<div class='"+_class+"' title='"+_title+"'>"+_content+"</div>";
    $(dialogObj.content).dialog({
        autoOpen:false,
        width:200,
        height:130,
        show:{
            effect:"blind",
            duration:100
        },
        hide:{
            effect:"explode",
            duration:100
        },
        draggable:false,
        buttons:[
            {
                text:"ok",
                click:function(){
                    $("."+_class+"").dialog("close");
                }
            }
        ]
    });
    return dialogObj;
}
