'use strict';

module.exports = /*@ngInject*/
function addController($scope, $modalInstance, $timeout) {
  var qrcode = require('zxing');
  window.qrcode = qrcode;
  var context = undefined;
  var video = undefined;
  var tries = 0;

  function initCanvas(w,h)
  {
    var gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    context = gCanvas.getContext("2d");
    context.clearRect(0, 0, w, h);
  }


  var captureToCanvas = function captureToCanvas() {
    context.drawImage(video,0,0);
    qrcode.decode(function(err, result){
    if (err) {
      tries = tries + 1;
      console.log(tries, err)
      $timeout(captureToCanvas, 500, false);
    }
    else {
      $scope.data.data = result;
      $scope.ok()
    }
  }, null);
  }

    $scope.data = {
      data: ''
    };

    $scope.onStream = function(stream, vid){
      console.log(stream,vid)
      video = vid;
      $timeout(function(){
        initCanvas(video.width*3, video.height*3)
        setTimeout(captureToCanvas, 1000, false);
      }, 1000, false)
    }

    $scope.ok = function(){
      $modalInstance.close($scope.data.data);
    };
    $scope.cancel = function(){
      $modalInstance.dismiss('cancel');
    };
  };
