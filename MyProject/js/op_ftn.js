/**
 * Created by lenovo on 2017/2/16.
 */
$(document).ready(function() {

    var imageIds = [
        'example://1',
        'example://2',
        'example://3'
    ];
    var stack = {
        currentImageIdIndex : 0,
        imageIds: imageIds
    };
    // updates the image display
    function updateTheImage(imageIndex) {
        return cornerstone.loadAndCacheImage(stack.imageIds[imageIndex]).then(function(image) {
            stack.currentImageIndex = imageIndex;
            var viewport = cornerstone.getViewport(element);
            cornerstone.displayImage(element, image, viewport);
            cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
            cornerstoneTools.addToolState(element, 'stack', stack);
            $(element).click(function(){
                $(this).attr("tabindex", 0).focus();
            });
            cornerstoneTools.stackScrollKeyboard.activate(element);
        });
    }
    // image enable the element
    var element = $('#dicomImage').get(0);
    cornerstone.enable(element);
    cornerstoneTools.mouseInput.enable(element);
    //cornerstoneTools.mouseWheelInput.enable(element);
    cornerstoneTools.keyboardInput.enable(element);
    //capture keypress
    function onKeyPress(e, data) {
        var keyCode = data.keyCode;
        var keyName;
        var keys = {
            UP: 38,
            DOWN: 40
        };
        if (keyCode === keys.UP) {
            keyName = 'Up arrow';
        } else if (keyCode === keys.DOWN) {
            keyName = 'Down arrow';
        } else {
            keyName = String.fromCharCode(keyCode);
        }
    }
    $(element).on("CornerstoneToolsKeyDown", onKeyPress);
    //update the FPS
    function updateFPS(e, data){
        var playClipToolData=cornerstoneTools.getToolState(element,'playClip');
        if(playClipToolData!==undefined && !$.isEmptyObject(playClipToolData.data)){
            $("#frameRate").text("FPS: " + Math.round(data.frameRate)).show();
        }else{
            if ($("#frameRate").text().length > 0) {
                $("#frameRate").text("").hide();
            }
        }
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }
        var stack = toolData.data[0];
        // Update Image number overlay
        $("#imageNum").text("Image #:" + (stack.currentImageIdIndex + 1) + "/" + stack.imageIds.length).show();
    }
    $(element).on("CornerstoneNewImage", updateFPS);
    // set event handlers
    function onImageRendered(e, eventData) {
        $('#topright').text("Render Time:" + eventData.renderTimeInMs + " ms");
    }
    $(element).on("CornerstoneImageRendered", onImageRendered);
    // setup handlers before we display the image
    function _onImageRendered(e, eventData) {
        // set the canvas context to the image coordinate system
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);

        // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
        // to location 0,0 will be the top left of the image and rows,columns is the bottom
        // right.
        for(var i=0;i<imageIds.length;i++) {
            if(eventData.image.imageId==imageIds[i]){
                var context = eventData.canvasContext;
                context.beginPath();
                context.strokeStyle = 'white';
                context.lineWidth = .5;
                context.rect(128, 90, 50, 60);
                context.stroke();
                context.fillStyle = "white";
                context.font = "6px Arial";
                context.fillText("Tumor Here", 128, 85);
            }
        }
        $('#bottomleft').text("WW/WC:" + Math.round(eventData.viewport.voi.windowWidth) + "/" + Math.round(eventData.viewport.voi.windowCenter));
        $('#bottomright').text("Zoom:" + eventData.viewport.scale.toFixed(2));
    }
    $(element).on("CornerstoneImageRendered", _onImageRendered);

    // load and display the image
    var imagePromise = updateTheImage(0);

    // add handlers for mouse events once the image is loaded.
    imagePromise.then(function() {
        viewport = cornerstone.getViewport(element);
        $('#bottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
        $('#bottomleft').text("WW/WC:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
        //after loaded active apply button
        $(".apply-btn").button();
        // add event handlers to pan image on mouse move
        $('#dicomImage').mousedown(function (e) {
            var lastX = e.pageX;
            var lastY = e.pageY;

            var mouseButton = e.which;

            $(document).mousemove(function (e) {
                var deltaX = e.pageX - lastX,
                    deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;
                /*�������������ƶ�-�л�����ʹ�λ*/
                if (mouseButton == 1) {
                    $(element).css("cursor","Crosshair");
                    var viewport = cornerstone.getViewport(element);
                    /*viewport.voi.windowWidth += (deltaX / viewport.scale);
                    viewport.voi.windowCenter += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);*/
                    $('#bottomleft').text("WW/WC:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
                    $("#ww").val(Math.round(viewport.voi.windowWidth));
                    $("#wc").val(Math.round(viewport.voi.windowCenter));
                }
                /*��������м����ƶ�-�ƶ�λ��*/
                else if (mouseButton == 2) {
                    $(element).css("cursor","move");
                    var viewport = cornerstone.getViewport(element);
                    viewport.translation.x += (deltaX / viewport.scale);
                    viewport.translation.y += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);
                }
                /*��������Ҽ����ƶ�-�Ŵ����С*/
                else if (mouseButton == 3) {
                    $(element).css("cursor","nw-resize");
                    var viewport = cornerstone.getViewport(element);
                    viewport.scale += (deltaY / 100);
                    cornerstone.setViewport(element, viewport);
                    $('#bottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
                }
            });

            $(document).mouseup(function (e) {
                $(element).css("cursor","default");
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        });

        /*$('#dicomImage').on('mousewheel DOMMouseScroll', function (e) {
            // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
            // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
            if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                if (stack.currentImageIndex == 0) {
                    updateTheImage(1);
                }

            } else {
                if (stack.currentImageIndex == 1) {
                    updateTheImage(0);
                }
            }
            //prevent page fom scrolling
            return false;
        });*/
        // Add event handler to the ww/wc apply button
/*        $('#invert').click(function (e) {
            var viewport = cornerstone.getViewport(element);
            if (viewport.invert === true) {
                viewport.invert = false;
            } else {
                viewport.invert = true;
            }
            cornerstone.setViewport(element, viewport);
        });
        $('#interpolation').click(function (e) {
            var viewport = cornerstone.getViewport(element);
            if (viewport.pixelReplication === true) {
                viewport.pixelReplication = false;
            } else {
                viewport.pixelReplication = true;
            }
            cornerstone.setViewport(element, viewport);
        });*/
        $(".apply-btn").click(function(e){
            var viewport=cornerstone.getViewport(element);
            viewport.voi.windowWidth=parseFloat($("#ww").val());
            viewport.voi.windowCenter=parseFloat($("#wc").val());
            cornerstone.setViewport(element,viewport);
        });
        // Enable all tools we want to use with this element
        cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
        cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
        cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
        cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
        cornerstoneTools.length.enable(element);
        cornerstoneTools.magnify.enable(element);

        $(element).mousemove(function(event) {
            var pixelCoords = cornerstone.pageToPixel(element, event.pageX, event.pageY);
            var x = event.pageX;
            var y = event.pageY;
            $('#coords').text("pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y);
        });


    });
});
var op_ftn=function(){
    var element = $('#dicomImage').get(0);
    /*activate tool */
    function activate(className) {
        $(".op-menu li").removeClass('active');
        $(className).addClass('active');
    }
    /*disable all tools*/
    function disableAllTools()
    {
        cornerstoneTools.wwwc.disable(element);
        cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
        cornerstoneTools.length.deactivate(element, 1);
        cornerstoneTools.magnify.disable(element);
        cornerstoneTools.arrowAnnotate.deactivate(element,1);
    }
    /*
     * �����ļ����
     * */
    this.inputDoc=function(){
        $(".op-menu").hide();
        $("#clipState").removeClass("pause-clip").addClass("play-clip");
        cornerstoneTools.stopClip(element);
    };
    /*
    * �Ŵ����
    * */
    this.zoomIn=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.scale += (10 / 100);
        cornerstone.setViewport(element, viewport);
    };
    /*
    * ��С����
    * */
    this.zoomOut=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.scale -= (10 / 100);
        cornerstone.setViewport(element, viewport);
    };
    /*
     * �Ŵ󾵲���
     * */
    this.mag_glass=function(){
        /*���ƷŴ󾵲˵�����*/
        $(".op-mag").stop(true,true).slideToggle(250);
        $(".op-menu").not(".op-mag").hide();
        $(".op-mag").css("left",$(".mag-glass").offset().left-50+"px");

        /*�Ŵ�-�Ŵ󼶱����*/
        var magLevelRange = $("#magLevelRange");
        magLevelRange.on("change", function() {
            var config = cornerstoneTools.magnify.getConfiguration();
            config.magnificationLevel = parseInt(magLevelRange.val(), 10);
        });
        /*�Ŵ�-�Ŵ�Χ����*/
        var magSizeRange = $("#magSizeRange");
        magSizeRange.on("change", function() {
            var config = cornerstoneTools.magnify.getConfiguration();
            config.magnifySize = parseInt(magSizeRange.val(), 10);
            var magnify = $(".magnifyTool").get(0);
            magnify.width = config.magnifySize;
            magnify.height = config.magnifySize;
        });
        var config = {
            magnifySize: parseInt(magSizeRange.val(), 10),
            magnificationLevel: parseInt(magLevelRange.val(), 10)
        };
        cornerstoneTools.magnify.setConfiguration(config);
        /*�Ŵ�-�����ʧЧ�Ŵ�*/
        $(".op-mag li").click(function(e){
            if($(e.target).hasClass("op-mag-Active")){
                disableAllTools();
                activate(".op-mag-Active");
                cornerstoneTools.magnify.activate(element, 1);
                return false;
            }else if($(e.target).hasClass("op-mag-Disable")){
                //disableAllTools();
                cornerstoneTools.wwwc.activate(element, 1);
                activate(".op-mag-Disable");
                cornerstoneTools.magnify.disable(element);
                cornerstoneTools.magnifyTouchDrag.disable(element);
                return false;
            }
        });
    };
    /*
    * ��ʱ����ת
    * */
    this.rotateCounterClockWise=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.rotation-=90;
        cornerstone.setViewport(element, viewport);
    };
    /*
     * ˳ʱ����ת
     * */
    this.rotateClockWise=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.rotation+=90;
        cornerstone.setViewport(element, viewport);
    };
    /*
     * ��������
     * */
    this.calLength=function(){
        /*���Ʋ������Ȳ˵�����*/
        $(".op-length").stop(true,true).slideToggle(250);
        $(".op-menu").not(".op-length").hide();
        $(".op-length").css("left",$(".cal-length").offset().left+"px");
        $(".op-length li").click(function(e){
            if($(e.target).hasClass("op-length-Active")){
                disableAllTools();
                activate(".op-length-Active");
                cornerstoneTools.length.activate(element, 1);
                return false;
            }else if($(e.target).hasClass("op-length-Disable")){
                disableAllTools();
                cornerstoneTools.wwwc.activate(element, 1);
                activate(".op-length-Disable");
                cornerstoneTools.length.disable(element);
                return false;
            }else if($(e.target).hasClass("op-length-Clear")){
                cornerstoneTools.clearToolState(element,"length");
                cornerstone.updateImage(element);
            }
        });
    };
    /*
     * ���ע��
     * */
    this.annotation=function(){
        /*�������ע�Ͳ˵�����*/
        $(".op-annotation").stop(true,true).slideToggle(250);
        $(".op-menu").not(".op-annotation").hide();
        $(".op-annotation").css("left",$(".annotation").offset().left+"px");
        /*��ȡ���ע�͵����*/
        var config = {
            getTextCallback : getTextCallback,
            changeTextCallback : changeTextCallback,
            drawHandles : false,
            drawHandlesOnHover : true,
            arrowFirst : true
        };
        cornerstoneTools.arrowAnnotate.setConfiguration(config);
        $(".op-annotation li").click(function(e){
            if($(e.target).hasClass("op-annotation-Active")){
                disableAllTools();
                activate(".op-annotation-Active");
                cornerstoneTools.arrowAnnotate.activate(element, 1);
                return false;
            }else if($(e.target).hasClass("op-annotation-Disable")){
                disableAllTools();
                cornerstoneTools.wwwc.activate(element, 1);
                activate(".op-annotation-Disable");
                cornerstoneTools.arrowAnnotate.disable(element);
                return false;
            }else if($(e.target).hasClass("op-annotation-Clear")){
                cornerstoneTools.clearToolState(element,"arrowAnnotate");
                cornerstone.updateImage(element);
            }
        });
        function getTextCallback(doneChangingTextCallback) {
            $(".annotation-dialog").dialog({
                autoOpen:false,
                width:300,
                height:130,
                buttons:[
                    {
                        text:"ok",
                        click:function(){
                            doneChangingTextCallback($(".annoText").val());
                            $(".annoText").val("");
                            $(this).dialog("close");
                        }
                    }
                ]
            });
            $(".annotation-dialog").dialog("open");
        }
        function changeTextCallback(data,eventData,doneChangingTextCallback){
            $(".reAnnotation-dialog").dialog({
                autoOpen:false,
                width:300,
                height:130,
                buttons:[
                    {
                        text:"ok",
                        click:function(){
                            doneChangingTextCallback(data,$(".reAnnoText").val());
                            $(".reAnnoText").val("");
                            $(this).dialog("close");
                        }
                    },
                    {
                        text:"�Ƴ�ע��",
                        click:function(){
                            doneChangingTextCallback(data, undefined, true);
                            $(this).dialog("close");
                        }
                    }
                ]
            });
            $(".reAnnotation-dialog").dialog("open");
        }

    };
    /*
     * ����/��ͣ��Ƭ
     * */
    this.playOrPause=function(){
        var enabledImage = cornerstone.getEnabledElement(element);
        if($("#clipState").hasClass("play-clip")){
            $("#clipState").removeClass("play-clip").addClass("pause-clip");
            cornerstoneTools.playClip(element,10);
            return false;
        }
        if($("#clipState").hasClass("pause-clip")){
            if(enabledImage.image){
                $("#clipState").removeClass("pause-clip").addClass("play-clip");
                cornerstoneTools.stopClip(element);
                cornerstoneTools.stackScroll.disable(element);
                $("#frameRate").text("").hide();
                $("#imageNum").text("").hide();
            }
            return false;
        }
    };
    /*
     * �����ļ�
     * */
    this.saveDoc=function(){
        $(".saveDoc-dialog").dialog({
            autoOpen:false,
            width:300,
            height:130,
            buttons:[
                {
                    text:"ok",
                    click:function(){
                        var filename=$("#filename").val();
                        cornerstoneTools.saveAs(element,filename);
                        $(this).dialog("close");
                        return false;
                    }
                }
            ]
        });
        $(".saveDoc-dialog").dialog("open");
    };
    /*
     * �л���ֵ
     * */
    this.interpolationDoc=function(){
        var viewport=cornerstone.getViewport(element);
        if(viewport.pixelReplication===true){
            viewport.pixelReplication=false;
        }else{
            viewport.pixelReplication=true;
        }
        cornerstone.setViewport(element,viewport);
    };
    /*
     * ת���ļ�
     * */
    this.invertDoc=function(){
        var viewport = cornerstone.getViewport(element);
        if (viewport.invert === true) {
            viewport.invert = false;
        } else {
            viewport.invert = true;
        }
        cornerstone.setViewport(element, viewport);
    };
    /*
     * ʵ�ʴ�С
     * */
    this.actualDoc=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.voi.windowWidth = 256;
        viewport.voi.windowCenter =127;
        viewport.scale=2.00;
        viewport.translation.x=0;
        viewport.translation.y=0;
        viewport.hflip=false;
        viewport.vflip=false;
        viewport.rotation=0;
        viewport.invert=false;
        cornerstone.setViewport(element, viewport);
        $("#ww").val(Math.round(viewport.voi.windowWidth));
        $("#wc").val(Math.round(viewport.voi.windowCenter));
    };
    /*
     * ���·�ת
     * */
    this.flipDoc=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.vflip = !viewport.vflip;
        cornerstone.setViewport(element, viewport);
    };
    /*
     * ���ҷ�ת
     * */
    this.reverseDoc=function(){
        var viewport = cornerstone.getViewport(element);
        viewport.hflip = !viewport.hflip;
        cornerstone.setViewport(element, viewport);
    };
    /*
     * ȫ��
     * */
    this.fullScreen=function(){
        var container=$(element).parent().get(0);
        if(!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement){
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            }
        }
        $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function() {
            if (!document.fullscreenElement && !document.mozFullScreenElement &&
                !document.webkitFullscreenElement && !document.msFullscreenElement) {
                $(container).width(1024);
                $(container).height(512);
                $(element).width(1024);
                $(element).height(512);
            } else {
                $(container).width($(window).width());
                $(container).height($(window).height());
                $(element).width($(container).width());
                $(element).height($(container).height());
            }
            cornerstone.resize(element, true);
        });
        $(window).on("resize orientationchange", function () {
            if (document.fullscreenElement || document.mozFullScreenElement ||
                document.webkitFullscreenElement || document.msFullscreenElement) {
                $(container).width($(window).width());
                $(container).height($(window).height());
                $(element).width($(container).width());
                $(element).height($(container).height());
                cornerstone.resize(element, true);
            }
        });

    };
    /*
     * 3DMode
     * */
    this.threeDMode=function(){
        $("#dicomImageWrapper").toggleClass("threeDModeOn");
        $("#threeDWrapper").toggle();
    };
    /*
    * ����
    * */
    this.help=function(){
        $(".help-dialog").dialog({
            autoOpen:false,
            width:400,
            buttons:[
                {
                    text:"ok",
                    click:function(){
                        $(this).dialog("close");
                    }
                }
            ]
        });
        $(".help-dialog").dialog( "open" );
    };
};
