/* eslint-disable */
import { Foundation } from "./foundation";
import { WebVideoCtrl } from "./WebVideoCtrl";
export default function Dahua(objectId) {
  /**
   * @param objectId string-영상 출력 Div 엘리먼트 id
   * @description 최초 연결  로그인 상태 x
   */
  if (objectId !== undefined) {
    if (objectId !== undefined) {
      this.objectId = objectId;
      this.camOCX = document.getElementById(objectId);
    }
  } else {
    return;
  }
}

Dahua.prototype = {
  objectId: undefined,
  camOCX: undefined,
  WebVideoCtrl: undefined,
  splitNum: 1,
  count: 0,
  isLogin: false,
  isRealView: false,
  isWebsocket: false,
  cctvIndex: undefined,
  filePath: {
    liveRecord: undefined,
    download: undefined,
    liveSnapshot: undefined,
    playBackPicPath: undefined,
    playBackFilePath: undefined,
  },
  connectInfo: {
    szIP: undefined,
    szPort: undefined,
    szUsername: undefined,
    szPassword: undefined,
    szRtspPort: undefined,
    szProtocol: undefined,
    szTitmeout: undefined,
  },
  position: {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  },
  ptzSpeed: 4,
  channel: 1, //채널 번호
  streamType: 1, // 현재 코드 유형
  winMode: 0, //재생 창 모드 0:현재창에서재생 / 1:재생창지정모드
  winIndex: 0, // 재생창 인덱스 2x2:0~3 3X3:0~8 4x4:0~15,
  init(obj) {
    /**
     * @description 최초 로그인
     */
    let _this = this;
    const _WebVideoCtrl = (_this.WebVideoCtrl = WebVideoCtrl(_this.objectId));
    _this.count += 1;
    _WebVideoCtrl[_this.objectId]
      .checkPluginInstall(_this.objectId)
      .done(function () {
        _WebVideoCtrl[_this.objectId].insertPluginObject(
          _this.objectId,
          300,
          300
        );

        //초기화 플러그인
        _WebVideoCtrl[_this.objectId].initPlugin("Protocol2", function () {
          _WebVideoCtrl[_this.objectId].setOpInfoCallback(_this.showOPInfo);
          // let left = (_this.position.left =
          //     _this.camOCX.offsetLeft);
          // let top = (_this.position.top = _this.camOCX.offsetTop);
          // let width = (_this.position.width =
          //     _this.camOCX.offsetWidth);
          // let height = (_this.position.height =
          //     _this.camOCX.offsetHeight);

          // _WebVideoCtrl[_this.objectId].resizeVideo(
          //     left,
          //     top,
          //     0,
          //     0,
          // );

          const {
            ip,
            port,
            username,
            password,
            rtspPort = 80,
            protocol = 0,
            timeout = 5,
            streamType = 1,
            channel = 1,
            left = 0,
            top = 0,
            width = 0,
            height = 0,
            login,
            cctvIndex,
          } = obj;
          _this.connectInfo = {
            szIP: ip,
            szPort: parseInt(port - 0),
            szUsername: username,
            szPassword: password,
            szRtspPort: rtspPort - 0,
            szProtocol: protocol - 0,
            szTimeout: timeout - 0,
            szStreamType: streamType,
            szChannel: channel,
          };

          // if (left && top && width && height) {
          // }
          _this.position = {
            left: left ?? 0,
            top: top ?? 0,
            width: width ?? 0,
            height: height ?? 0,
          };
          const targetEL = document.getElementById(_this.objectId);
          if (!targetEL) return;
          _WebVideoCtrl[_this.objectId].resizeVideo(left, top, width, height);
          //비디오 창을 만듭니다
          _WebVideoCtrl[_this.objectId].createMultiNodeDisplay(1);
          //비디오 창의 표시를 설정하십시오
          // var num = parseInt($("#wndNum").find("option:selected").val());
          //Windows 세분화 수를 설정합니다
          _WebVideoCtrl[_this.objectId].setSplitNum(_this.splitNum);
          //등록 문제
          _WebVideoCtrl[_this.objectId].registerEvent(
            "SelectedView",
            _this.responseSelectedViewSignal
          );
          _this.isLogin = login;
          _this.cctvIndex = cctvIndex;
          if (login) {
            _this.clickLogin();
          } else {
            _this.hiddenScreen();
          }

          // //초기화 경로
          // _WebVideoCtrl[_this.objectId]
          //     .getUserDirectory()
          //     .done(function (szDir) {
          //         let szPath = `${szDir}\\LiveRecord"`;
          //         _this.filePath.liveRecord = szPath;
          //         szPath = `${szDir}\\Download"`;
          //         _this.filePath.download = szPath;

          //         szPath = `${szDir}\\LiveSnapshot"`;
          //         _this.filePath.liveSnapshot = szPath;

          //         szPath = `${szDir}\\PlaybackPicPath"`;
          //         _this.filePath.playBackPicPath = szPath;

          //         szPath = `${szDir}\\PlaybackFilePath"`;
          //         _this.filePath.playBackFilePath = szPath;

          //         // $("#tabs").tabs();
          //         //숨겨진 창 일련 번호 선택 상자
          //         // $("#winIndex").hide();
          //     });
        });
        // $("#tabs_ptz").tabs();
        // $("#tabs_playback").tabs();
        // $("#tabs_control").tabs();
        // $("#closePtzLocate").hide();
        // $("#openPtzLocate").show();

        // _this.clickLogin();
      })
      .fail(function () {
        // alert(
        //     '플러그인을 설치하지 않았고 개발 패키지 디렉토리를 두 ​​번 클릭합니다.WebPlugin.exe 패키지 설치！',
        // );
        // location.reload();
        // const result = window.confirm(
        //   '플러그인이 설치되지 않았거나 실행되지 않았습니다. 확인를 누르면 WebPlugin.exe 패키지가 다운로드 됩니다.！',
        // );
        // if (result) {
        //   window.location.assign(`/plugin/webplugin.exe`);
        //   alert('WebPlugin.exe 설치 후 브라우저가 새로고침 됩니다.');
        //   location.reload();
        // } else {
        //   // window.location.reload()
        //   return;
        // }
      });
  },
  checkPlugin() {
    let _this = this;
    const _WebVideoCtrl = (_this.WebVideoCtrl = WebVideoCtrl(_this.objectId));
    _WebVideoCtrl[_this.objectId]
      .checkPluginInstall(_this.objectId)
      .done(function (ret) {
        return true;
      })
      .fail(function () {
        return false;
      });
  },
  showOPInfo(szInfo, status, error) {
    var szTip =
      "<div>" +
      Foundation.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") +
      " " +
      szInfo;
    if (typeof status != "undefined") {
      szTip += "(" + status.toString() + ", " + error.toString() + ")";
    }
    szTip += "</div>";
    // $("#opinfo").html(szTip + $("#opinfo").html());
  },
  clickLogin() {
    let _this = this;

    const {
      szIP,
      szPort,
      szUsername,
      szPassword,
      szRtspPort,
      szProtocol,
      szTimeout,
      szStreamType,
      szChannel,
    } = _this.connectInfo;
    if ("" === szIP || "" === szPort) {
      return;
    }

    // var port = parseInt(port);
    //현재 장치가 이미 로그인한지 확인하십시오
    var deviceInfo = _this.WebVideoCtrl[_this.objectId].getDeviceInfo(
      szIP,
      _this.objectId
    );
    // if (typeof deviceInfo !== 'undefined') {
    //     console.log('Login Success!!!');
    //     if (
    //         _this.WebVideoCtrl[_this.objectId].logout(szIP, _this.objectId)
    //     ) {
    //         //프롬프트를 추가하십시오
    //         _this.showOPInfo(szIP + ' Logout Device ');
    //         //장치 정보를 삭제하십시오
    //         // DemoUI.removeDeviceInfo(szIP);
    //     }
    // }

    _this.streamType = szStreamType;
    _this.channel = szChannel;
    _this.WebVideoCtrl[_this.objectId].login(
      szIP,
      szPort,
      szUsername,
      szPassword,
      szRtspPort,
      szProtocol,
      szTimeout,
      function (sIp, iDeviceID) {
        _this.showOPInfo(sIp + ':"' + szPort + " Login Succeed ");
        console.log(sIp + ':"' + szPort + " Login Succeed ");
        //삽입 장치
        // DemoUI.addDeviceIP(sIp);
        //채널 번호를 가져옵니다
        _this.WebVideoCtrl[_this.objectId]
          .getChannelNumber(iDeviceID)
          .done(function (ret) {
            //채널 데이터를 업데이트합니다
            // DemoUI.modifyChannelList(ret);
            _this.isLogin = true;
            const targetEL = document.getElementById(_this.objectId);

            if (!_this.isLogin && targetEL) {
              _this.showScreen();
            }
            setTimeout(() => {
              _this.clickStartRealPlay();
            }, 1000);
          });
      },
      function (iErrorCode, sError) {
        _this.showOPInfo(szIP + " Login Fail ", iErrorCode, sError);
      }
    );
  },
  clickLogout() {
    const _this = this;
    //현재 선택된 것을 얻으십시오
    // var ip = DemoUI.getCurDeviceIP();
    var sIP = _this.connectInfo.szIP;
    if (!_this.WebVideoCtrl[_this.objectId] && !_this.login) return;
    if (_this.WebVideoCtrl[_this.objectId].logout(sIP)) {
      //프롬프트를 추가하십시오
      _this.showOPInfo(sIP + " Logout Device ");
      //장치 정보를 삭제하십시오
      //   DemoUI.removeDeviceInfo(ip);
    }
    if (_this.login) _this.isLogin = false;
  },
  clickStartRealPlay() {
    /**
     * @description 실시간 영상 재생
     */
    let _this = this;
    //현재 선택된 장치 IP를 가져옵니다
    // var sIP = DemoUI.getCurDeviceIP();
    var sIP = _this.connectInfo.szIP;
    var szPort = _this.connectInfo.szPort;
    if (sIP) {
      //채널 번호를 가져옵니다
      // var iChannel = $("#channels").val() - 0;
      var iChannel = _this.channel;
      //코드 현재 유형을 가져옵니다
      // var iStreamType = parseInt($("#streamtype").val(), 10);
      var iStreamType = parseInt(_this.streamType, 10);
      // console.log('1.iStreamType->',$("#streamtype").val())
      //창 선택 모드
      // var iMode = parseInt($("#winMode").val(), 10);
      var iMode = parseInt(_this.winMode, 10);
      if (0 === iMode) {
        const result = _this.WebVideoCtrl[_this.objectId].connectRealVideo(
          sIP,
          iChannel,
          iStreamType,
          function (iPlayerID) {
            _this.isRealView = true;
            // _this.showScreen();
            const targetEL = document.getElementById(_this.objectId);
            if (!targetEL) {
              _this.hiddenScreen();
              return;
            }
            _this.showOPInfo(
              sIP +
                ":" +
                szPort +
                " Channel:" +
                iChannel.toString() +
                " Live succeed"
            );
            console.log(
              sIP +
                ":" +
                szPort +
                " Channel:" +
                iChannel.toString() +
                " Live succeed"
            );
            if (_this.isLogin) {
              _this.showScreen();
            }
          },
          function (status, error) {
            _this.isRealView = false;

            _this.showOPInfo(
              sIP + " Channel:" + iChannel.toString() + " Live Fail",
              status,
              error
            );
          }
        );
      } else {
        //창 일련 번호
        // var iWinIndex = parseInt($("#winIndex").val(), 10);
        var iWinIndex = _this.winIndex;

        _this.WebVideoCtrl[_this.objectId].connectRealVideoEx(
          iWinIndex,
          sIP,
          iChannel,
          iStreamType,
          _this.objectId,
          function (iPlayerID) {
            _this.showOPInfo(
              sIP + " Channel:" + iChannel.toString() + " Live succeed"
            );
            // _this.showScreen();
          },
          function (status, error) {
            _this.showOPInfo(
              sIP + " Channel:" + iChannel.toString() + " Live Fail",
              status,
              error
            );
          }
        );
      }
    } else {
      return;
    }
  },
  clickStopRealPlay() {
    const _this = this;
    //선택한 Windows의 실시간 모니터링을 닫습니다
    if (!_this?.WebVideoCtrl?.[_this.objectId]) return;
    _this.WebVideoCtrl[_this.objectId].closePlayer();
    _this.isRealView = false;
    _this.hiddenScreen();
  },
  mouseUPLeftPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 좌상 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;

    _this.WebVideoCtrl[_this.objectId].moveUpperLeft(speed, speed, flag);
  },
  mouseUpPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 위로 이동
     */
    const _this = this;

    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveUpwards(speed, flag);
  },
  mouseUPRightPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 우상 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveUpperRight(speed, speed, flag);
  },
  mouseLefPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 왼쪽 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveLeft(speed, flag);
  },
  mouseRightPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 오른쪽 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveRight(speed, flag);
  },
  mouseDownLeftPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 좌하 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveLowerLeft(speed, speed, flag);
  },
  mouseDownRightPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 우하 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveLowerRight(speed, speed, flag);
  },
  mouseDownPTZControl(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description 아래로 이동
     */
    const _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].moveLower(speed, flag);
  },
  openPtzLocate() {
    /**
     * @description PTZ 사용 시작
     */
    let _this = this;
    if (_this.connectInfo.szIP) {
      _this.WebVideoCtrl[_this.objectId].enablePTZLocate();
    } else {
      return;
    }
  },
  closePtzLocate() {
    /**
     * @description PTZ 사용 중지
     */
    let _this = this;
    if (_this.connectInfo.szIP) {
      _this.WebVideoCtrl[_this.objectId].disablePTZLocate(false);
    } else {
      return;
    }
  },
  PTZZoomIn(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description ZOOM IN
     */
    let _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].controlZoom(speed, 0, flag);
  },
  PTZZoomout(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description ZOOM OUT
     */
    let _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].controlZoom(speed, 1, flag);
  },
  PTZFocusIn(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description FOCUS IN
     */
    let _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].controlFocus(speed, 0, flag);
  },
  PTZFoucusOut(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description FOCUS OUT
     */
    let _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].controlFocus(speed, 1, flag);
  },
  PTZIrisIn(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description IRIS IN (피사 조리게 조절)
     */
    let _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].controlAperture(speed, 0, flag);
  },
  PTZIrisOut(flag) {
    /**
     * @param{boolean} true-사용 false-중지
     * @description IRIS OUT (피사 조리게 조절)
     */
    let _this = this;
    let speed = this.ptzSpeed;
    _this.WebVideoCtrl[_this.objectId].controlAperture(speed, 1, flag);
  },
  hiddenScreen() {
    let _this = this;

    if (!_this.WebVideoCtrl?.[_this.objectId]) return;
    _this.WebVideoCtrl[_this.objectId].resizeVideo(0, 0, 0, 0);
  },
  showScreen() {
    const _this = this;
    let left = _this.position.left;
    let top = _this.position.top;
    let width = _this.position.width;
    let height = _this.position.height;
    if (!_this.WebVideoCtrl[_this.objectId]) return;
    _this.WebVideoCtrl[_this.objectId].resizeVideo(left, top, width, height);
  },
  setReposition({ left, top, width, height }) {
    const _this = this;
    if (!_this.isLogin) return;
    _this.position = {
      left: left ?? _this.position.left,
      top: top ?? _this.position.left,
      width: width ?? _this.position.width,
      height: height ?? _this.position.height,
    };
    _this.WebVideoCtrl[_this.objectId].resizeVideo(left, top, width, height);
  },
  getPosition() {
    const _this = this;
    const _position = {
      left: _this.position.left,
      top: _this.position.top,
      width: _this.position.width,
      height: _this.position.height,
    };
    return _position;
  },
  onScrollHandler(elementId) {
    const _this = this;
    if (document.getElementById(elementId)) {
      let coverInfo =
        document.getElementById(elementId).getBoundingClientRect() || null;

      if (coverInfo) {
        const pos = {
          width: coverInfo.width,
          height: coverInfo.height,
          top: coverInfo.top + window.pageYOffset,
          left: coverInfo.left + window.pageXOffset,
          topToWindow: coverInfo.top,
          leftToWindow: coverInfo.left,
        };
        const headerHeight = 0;
        const dE = document.documentElement;
        const windowBorder = Math.ceil(
          (window.outerWidth - window.innerWidth) / 2
        );
        const windowHeader =
          window.outerHeight - window.innerHeight - windowBorder;
        const left =
          Math.max(pos.leftToWindow, 0) +
          (_this.WebVideoCtrl[_this.objectId].browser().firefox
            ? 0
            : windowBorder);
        const top = Math.max(pos.topToWindow, headerHeight) + windowHeader;
        const width = Math.min(
          pos.width,
          dE.clientWidth - Math.max(pos.leftToWindow, 0),
          Math.max(pos.width - (dE.scrollLeft - pos.left), 0)
        );
        const height = Math.min(
          pos.height,
          dE.clientHeight - Math.max(headerHeight, pos.topToWindow),
          Math.max(pos.height - (dE.scrollTop - pos.top) - headerHeight, 0)
        );
        _this.WebVideoCtrl[_this.objectId].resizeVideo(
          left,
          top,
          width,
          height
        );
      }
    }
  },
  onScreenLoad() {
    const _this = this;
    if (!_this.WebVideoCtrl?.[_this.objectId]) return;
    _this.WebVideoCtrl[_this.objectId].showVideoLoad();
  },
  clickFullScreen() {
    const _this = this;
    if (!_this.WebVideoCtrl[_this.objectId]) return;
    _this.WebVideoCtrl[_this.objectId].setFullscreen();
  },
  clickExitFullScreen() {
    const _this = this;
    if (!_this.WebVideoCtrl[_this.objectId]) return;
    _this.WebVideoCtrl[_this.objectId].exitFullscreen();
  },
  websocketConnect() {
    const _this = this;
    const port = 23480;
    _this.WebVideoCtrl[_this.objectId].connect(port);
  },
  disConnect() {
    const _this = this;
    if (!_this?.WebVideoCtrl?.[_this.objectId]) return;
    const _websocket = _this.WebVideoCtrl[_this.objectId].getWebsocket();
    if (_websocket) {
      _websocket.close();
      _this.isLogin = false;
      _this.isRealView = false;
    }
  },
};
