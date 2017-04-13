/**
 * Created by lenovo on 2017/2/20.
 */
/*��������ʼ���������ļ�--------------------------*/
/*��ʼ�������ļ����*/
var loadPanel=window.namespace||{};
loadPanel.initiaInputWizard=function(){
    console.log("��ʼ���ļ��������");
    $("#selectmenu").val("����");
    $("#selectmenu").selectmenu({
        icons: { button: "ui-icon-circle-triangle-s" },
        change:function(){
            if($(this).val()==="url"){
                $("#path").hide();
                $("#url").show();
                $("label[for='path']").text("����url:");
                $("label[for='path']").attr("for","url");
            }else if($(this).val()==="����"){
                $("#path").show();
                $("#url").hide();
                $("label[for='url']").text("���ļ�:");
                $("label[for='url']").attr("for","path");
            }
        }
    });
    $(".cancel-btn").button();
    $("#button-icon").button({
        icon:"ui-icon-gear",
        showLabel:true
    });
    $(".toolBar button").attr("disabled",true);
    /*�����������*/
    this.abortRead=function(){
        $('#path').val("");
        $('#url').val("");
    };
    this.updateProgress=function(evt){

    };
    /*url��ʽ����*/
    this.loadDocByURL=function(url){
        return false;
    };

};
/*���õ������ݺ���*/
$(document).ready(function(){
    loadDoc();
});
function loadDoc(){
    var file;
    var imageId1;
    var imageId2;
    $('#path').on('change', function(e) {
        // Add the file to the cornerstoneFileImageLoader and get unique
        // number for that file
        file = e.target.files[0];
        imageId1 = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    });
    /*���ط�ʽ-�����ļ�*/
    function handleDragOver(e){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    function handleFileSelect(e){
        e.stopPropagation();
        e.preventDefault();
        e=e||window.event;
        file= e.dataTransfer.files[0];
        imageId2 = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        var curImage=cornerstone.getImage(element);
        if(curImage.imageId!=imageId2){
            loadAndViewImage(imageId2);
        }else{
            var dialogObj=dialogCon("Succeed","dialog_b","�������ѵ���");
            $(".dialog_b").dialog("open");
        }
    }
    $('#dicomImageWrapper').on("dragover",handleDragOver,false);
    $('#dicomImageWrapper')[0].addEventListener("drop",handleFileSelect,false);
    $("#button-icon").on("click",function(){
        /*���ط�ʽ*/
        if ($("#path").css("display")=="block" && $("#url").css("display")=="none") {
            if ($("#path").val() == "" || $("#path").val() == null) {
                var dialogObj=dialogCon("Tip","dialog_b","�뵼���ļ�");
                $(".dialog_b").dialog("open");
                return false;
            }
            var curImage=cornerstone.getImage(element);
            if(curImage.imageId!=imageId1){
                loadAndViewImage(imageId1);
            }else{
                var dialogObj=dialogCon("Succeed","dialog_b","�������ѵ���");
                $(".dialog_b").dialog("open");
            }
        }
        /*URL��ʽ*/
        if ($("#path").css("display")=="none" && $("#url").css("display")=="block") {
            if ($("#url").val() == "" || $("#url").val() == null) {
                var dialogObj=dialogCon("Tip","dialog_b","������URL");
                $(".dialog_b").dialog("open");
                return false;
            }
            var url = $("#url").val();
            // image enable the dicomImage element and activate a few tools
            loadAndViewImageByURL(url);
            return false;
        }

    });
    $(".cancel-btn").on("click",function(){
        loadPanel.abortRead();
        return false;
    });
}
/*��������ʼ���������ļ�------------------end-----*/
var loaded = false;
var element = $('#dicomImage').get(0);
function loadAndViewImage(imageId) {
    //try {
    var start = new Date().getTime();
  /*  cornerstone.loadImage(imageId).then(function(image) {
        var numFrames=image.data.string('x00280008');
        console.log("֡��:"+numFrames);
        if(!numFrames) {
            alert('Missing element NumberOfFrames (0028,0008)'+"����"+"���ļ�Ϊ��֡��");
            //return;
        }
        var imageIds = [];
        //var imageIdRoot = 'wadouri:' + url;

        for(var i=1; i < numFrames; i++) {
            var _imageId;
            _imageId = imageId+ "?frame="+i;
            imageIds.push(_imageId);
        }

        var stack = {
            currentImageIdIndex : 0,
            imageIds: imageIds
        };
        console.log(image);
        var viewport = cornerstone.getDefaultViewportForImage(element, image);
        $('#toggleModalityLUT').attr("checked",viewport.modalityLUT !== undefined);
        $('#toggleVOILUT').attr("checked",viewport.voiLUT !== undefined);
        cornerstone.displayImage(element, image, viewport);
        console.log(stack);
        if(loaded === false) {
            cornerstoneTools.mouseInput.enable(element);
            cornerstoneTools.mouseWheelInput.enable(element);
            cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
            cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
            cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
            cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
            // Set the stack as tool state
            cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
            cornerstoneTools.addToolState(element, 'stack', stack);
            // Start playing the clip
            // TODO: extract the frame rate from the dataset
           /!*  var frameRate = 10;
             cornerstoneTools.playClip(element, frameRate);*!/
            loaded = true;
        }

        function getTransferSyntax() {
            var value = image.data.string('x00020010');
            return value + ' [' + uids[value] + ']';
        }

        function getSopClass() {
            var value = image.data.string('x00080016');
            return value + ' [' + uids[value] + ']';
        }

        function getPixelRepresentation() {
            var value = image.data.uint16('x00280103');
            if(value === undefined) {
                return;
            }
            return value + (value === 0 ? ' (unsigned)' : ' (signed)');
        }

        function getPlanarConfiguration() {
            var value = image.data.uint16('x00280006');
            if(value === undefined) {
                return;
            }
            return value + (value === 0 ? ' (pixel)' : ' (plane)');
        }

    }, function(err) {
        alert(err);
    });*/
    /*}
     catch(err) {
     alert(err);
     }*/
    cornerstone.loadAndCacheImage(imageId).then(function(image){
        var numFrames=image.data.string('x00280008');
        $('#topleft').text("Patient Name:"+image.data.string('x00100010'));
        console.log("֡��:"+numFrames);
        if(!numFrames) {
            var dialogObj=dialogCon("Warning","dialog_b","���ļ�Ϊ��֡");
            $(".dialog_b").dialog("open");
            //return;
        }
        var imageIds = [];
        //var imageIdRoot = 'wadouri:' + url;
        for(var i=0; i < numFrames; i++) {
            var _imageId;
            _imageId = imageId+ "?frame="+i;
            imageIds.push(_imageId);
        }

        var stack = {
            currentImageIdIndex : 0,
            imageIds: imageIds
        };
        console.log("��ǰӰ�����:%o",image);
        var viewport=cornerstone.getDefaultViewportForImage(element,image);
        cornerstone.displayImage(element, image,viewport);
        cornerstoneTools.stackPrefetch.enable(element);
        console.log("��ǰ֡��ջ����:%o",stack);
        if(loaded === false) {
            cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
            // Set the stack as tool state
            cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
            cornerstoneTools.addToolState(element, 'stack', stack);
            // Start playing the clip
            // TODO: extract the frame rate from the dataset
           /* var frameRate = 10;
            cornerstoneTools.playClip(element, frameRate);*/
            loaded = true;
        }
    },function(err){
        alert(err);
    });
}
/*URL��ʽ����*/
function loadAndViewImageByURL(url){
    cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.load(url, cornerstoneWADOImageLoader.internal.xhrRequest).then(function(dataSet) {
        // dataset is now loaded, get the # of frames so we can build the array of imageIds
        var numFrames = dataSet.intString('x00280008');
        if(!numFrames) {
            url = "wadouri:" + url;
            loadAndViewImage(url);
            return ;
        }
        var imageIds = [];
        var imageIdRoot = 'wadouri:' + url;
        for(var i=0; i < numFrames; i++) {
            var imageId = imageIdRoot + "?frame="+i;
            imageIds.push(imageId)
        }
        var stack = {
            currentImageIdIndex : 0,
            imageIds: imageIds
        };
        console.log("��ǰ֡��ջ����:%o",stack);
        // Load and cache the first image frame.  Each imageId cached by cornerstone increments
        // the reference count to make sure memory is cleaned up properly.
        cornerstone.loadAndCacheImage(imageIds[0]).then(function(image) {
            $('#topleft').text("Patient Name:"+image.data.string('x00100010'));
            console.log("��ǰӰ�����:%o",image);
            // now that we have an image frame in the cornerstone cache, we can decrement
            // the reference count added by load() above when we loaded the metadata.  This way
            // cornerstone will free all memory once all imageId's are removed from the cache
            cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.unload(url);
            var viewport=cornerstone.getDefaultViewportForImage(element,image);
            cornerstone.displayImage(element, image,viewport);
            if(loaded === false) {
                cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
                // Set the stack as tool state
                cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
                cornerstoneTools.addToolState(element, 'stack', stack);
                // Start playing the clip
                // TODO: extract the frame rate from the dataset
               /* var frameRate = 10;
                cornerstoneTools.playClip(element, frameRate);*/
                loaded = true;
                return true;
            }
        }, function(err) {
            alert(err);
        });
    });
}
/**/
function getVF(VR, VF)
{
    var VFStr ="";
    switch (VR)
    {
        case "SS":
            VFStr = BitConverter.ToInt16(VF, 0).ToString();
            break;
        case "US":
            VFStr = BitConverter.ToUInt16(VF, 0).ToString();

            break;
        case "SL":
            VFStr = BitConverter.ToInt32(VF, 0).ToString();

            break;
        case "UL":
            VFStr = BitConverter.ToUInt32(VF, 0).ToString();

            break;
        case "AT":
            VFStr = BitConverter.ToUInt16(VF, 0).ToString();

            break;
        case "FL":
            VFStr = BitConverter.ToSingle(VF, 0).ToString();

            break;
        case "FD":
            VFStr = BitConverter.ToDouble(VF, 0).ToString();

            break;
        case "OB":
            VFStr = BitConverter.ToString(VF, 0);
            break;
        case "OW":
            VFStr = BitConverter.ToString(VF, 0);
            break;
        case "SQ":
            VFStr = BitConverter.ToString(VF, 0);
            break;
        case "OF":
            VFStr = BitConverter.ToString(VF, 0);
            break;
        case "UT":
            VFStr = BitConverter.ToString(VF, 0);
            break;
        case "UN":
            VFStr = Encoding.Default.GetString(VF);
            break;
        default:
            VFStr = Encoding.Default.GetString(VF);
            break;
    }
    return VFStr;
}