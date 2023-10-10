/* eslint-disable */
import $ from "jquery";
import { Foundation, Map } from "./foundation";

export const WebVideoCtrl = (objectId) =>
  (function (e) {
    let WebVideoObject = {};

    // WebVideoObject 등록
    function addWebVideoObject() {
      const moduleObj = {
        pluginObject: undefined, //플러그인 객체
        eventHandler: {
          // 이벤트 응답 기능 목목
          selectDir(path) {},
        },
        initSuccess: undefined, // 초기화 성공 기능
        SignalMap: new Map(), // 이벤트 신호 목록 / 마운트 창 선택한 신호
        deviceInfoMap: new Map(), // 장비 정보 표시
        playerInfoMap: new Map(), // 정보 테이블을 재생하십시오
        sProtocol: undefined, //네트워크 프로토콜, 2세대,3세대
        remoteFileInfor: [], //비디오 정보
        socket: undefined, // websocket
        g_id: 0, //비동기 메서드 이벤트 목록
        g_container: undefined, //플러그인 컨테이너
        defMap: {}, //반환 값 지연 객체 테이블
        showOpInfo: undefined, // 조작 정보 로그 함수
      };
      WebVideoObject = {
        ...WebVideoObject,
        [objectId]: moduleObj,
      };
    }

    //이벤트 처리 기능
    function handleEvent(message) {
      let messageObject = $.parseJSON(message);
      if ("event" in messageObject) {
        let eventType = messageObject["event"];
        //다른 이벤트 유형에 따라 프로세스
        if ("SelectedDirectory" === eventType) {
          //분석 유형 및 경로
          let pathType = messageObject["params"]["Type"];
          let pathName = messageObject["params"]["PathName"];
          //경로를 설정하십시오
          WebVideoObject[objectId].pluginObject.SetStoragePath(
            pathType,
            pathName
          );
          WebVideoObject[objectId].eventHandler.selectDir(pathName);
        } else if ("SelectedView" === eventType) {
          let callBackList =
            WebVideoObject[objectId].SignalMap.get("SelectedView");
          //콜백 함수를 호출하십시오
          for (let i = 0; i < callBackList.length; i++) {
            callBackList[i](
              messageObject["params"]["nodeIndex"],
              messageObject["params"]["viewIndex"],
              messageObject["params"]["winID"]
            );
          }
        } else if ("DetectedDeviceInfo" === eventType) {
          let callBackList =
            WebVideoObject[objectId].SignalMap.get("DetectedDeviceInfo");
          //콜백 함수를 호출하십시오
          for (let i = 0; i < callBackList.length; i++) {
            callBackList[i](
              messageObject["params"]["deviceIP"],
              messageObject["params"]["svrPort"],
              messageObject["params"]["state"]
            );
          }
        } else if ("SnapManagerEvent" === eventType) {
          let szTip =
            "<div>" +
            Foundation.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") +
            " " +
            JSON.stringify(messageObject["params"]);
          szTip += "</div>";
          $("#eventMessage").html(szTip);
        } else if ("PointTemper" === eventType) {
          let szTemper = messageObject["params"]["Temper"];
          let callBackList =
            WebVideoObject[objectId].SignalMap.get("PointTemper");
          //콜백 함수를 호출하십시오
          for (let i = 0; i < callBackList.length; i++) {
            callBackList[i](szTemper);
          }
        } else if ("downloadLink" === eventType) {
        } else if ("RealTimeVideoException" === eventType) {
          let deviceID = messageObject["params"]["deviceID"];
          let errorCode = messageObject["params"]["error"];
          if (1 === errorCode) {
            //인증 실패
            // showOpInfo(
            //     getDeviceIP(deviceID),
            //     'connect disconnected',
            //     'username or password is not valid',
            // );
          } else if (2 === errorCode) {
            //연결에 실패
            // showOpInfo(
            //     getDeviceIP(deviceID),
            //     'connect disconnected',
            //     'device connect failed',
            // );
          }
        } else {
        }
      } else {
        let id = messageObject["id"];
        WebVideoObject[objectId].defMap[id].resolve(messageObject["result"]);
        WebVideoObject[objectId].defMap[id] = null;
      }
    }
    /**
     *@description 플러그인이 설치되어 있는지 판단합니다
     *@return Boolean
     */
    let checkPluginInstall = function () {
      addWebVideoObject();
      return $.Deferred(function (def) {
        if (browser().msie) {
          try {
            // eslint-disable-next-line no-undef
            new ActiveXObject("WebActiveX.Plugin.4.0.0.0");
            def.resolve();
          } catch (n) {
            def.reject();
          }
        } else if (browser().npapi) {
          for (let r = 0, s = navigator.mimeTypes.length; s > r; r++) {
            if (
              "application/media-plugin-version-4.0.0.0" ===
              navigator.mimeTypes[r].type.toLowerCase()
            ) {
              def.resolve();
            }
          }
          def.reject();
        } else {
          // eslint-disable-next-line no-array-constructor
          WebVideoObject[objectId].SignalMap.put("SelectedView", new Array());
          // eslint-disable-next-line no-array-constructor
          WebVideoObject[objectId].SignalMap.put(
            "DetectedDeviceInfo",
            new Array()
          );
          // eslint-disable-next-line no-array-constructor
          WebVideoObject[objectId].SignalMap.put("PointTemper", new Array());
          let port = 23480;

          connect(port)
            .done(function () {
              def.resolve();
            })
            .fail(function () {
              if (document.querySelector("iframe")) return false;
              let ele = document.createElement("iframe");
              ele.src = "CustomerWebSocketServer://" + port;
              ele.style.display = "none";
              document.body.appendChild(ele);
              // port++;
              // setTimeout(function () {
              //     reconnect(port, def);
              // }, 2000);
            });
        }
      });
    };

    let reconnect = function (port, def) {
      if (port > 23483) {
        return def.reject();
      }

      connect(port)
        .done(function () {
          return def.resolve();
        })
        .fail(function () {
          port++;
          return reconnect(port, def);
        });
    };

    let connect = function (port) {
      return $.Deferred(function (def) {
        try {
          let url = "ws://127.0.0.1:" + port;
          WebVideoObject[objectId].socket = new WebSocket(url);
          WebVideoObject[objectId].socket.onopen = function () {
            console.log("open");
          };
          WebVideoObject[objectId].socket.onerror = function (e) {
            console.log("error:" + e.code);
            if (port === 23481) {
              const result = window.confirm(
                "카메라 연결에 실패 했습니다. 새로고침 하시겠습니까?"
              );
              if (result) {
                location.reload();
              } else {
                return;
              }
            }
          };
          WebVideoObject[objectId].socket.onmessage = function (msg) {
            if (msg.data === "websocketserver connect ok") {
              //올바른 웹 소프트 서비스를 나타냅니다
              def.resolve();
            } else {
              handleEvent(msg.data);
            }
          };
          WebVideoObject[objectId].socket.onclose = function () {
            console.log("close");

            WebVideoObject[objectId].socket = undefined;
            def.reject();
          };
        } catch (e) {
          def.reject();
        }
      }).promise();
    };

    let getWebsocket = function () {
      return WebVideoObject[objectId].socket;
    };

    //브라우저 유형 가져 오기
    let browser = function () {
      let e = /(chrome)[ \/]([\w.]+)/,
        t = /(safari)[ \/]([\w.]+)/,
        n = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        r = /(msie) ([\w.]+)/,
        s = /(trident.*rv:)([\w.]+)/,
        o = /(mozilla)(?:.*? rv:([\w.]+))?/,
        i = navigator.userAgent.toLowerCase(),
        a = e.exec(i) ||
          t.exec(i) ||
          n.exec(i) ||
          r.exec(i) ||
          s.exec(i) ||
          (i.indexOf("compatible") < 0 && o.exec(i)) || ["unknow", "0"];
      a.length > 0 && a[1].indexOf("trident") > -1 && (a[1] = "msie");
      let c = {};
      let verArr = a[2].split(".");
      if (a[1] === "chrome") {
        // eslint-disable-next-line no-unused-expressions
        verArr[0] - 0 < 42 ? (c.npapi = true) : (c.websocket = true),
          (c.type = "chrome");
      }
      if (a[1] === "mozilla") {
        // eslint-disable-next-line no-unused-expressions
        verArr[0] - 0 < 52 ? (c.npapi = true) : (c.websocket = true),
          (c.type = "firefox");
      }
      return (c[a[1]] = !0), (c.version = a[2]), c;
    };

    /**
     *@description 삽입 삽입물
     *@param{String} sContainerID 플러그인 컨테이너 ID.
     *@param{Num}    iWidth       넓은 삽입물
     *@param{Num}    iHeight      높은 플러그인
     *@return void
     */
    function insertPluginObject(sContainerID, iWidth, iHeight) {
      WebVideoObject[sContainerID].g_container = sContainerID;
      //IE 브라우저라면
      if (browser().msie) {
        let sSize =
          " width=" +
          '"' +
          iWidth.toString() +
          '"' +
          " height=" +
          '"' +
          iHeight.toString() +
          '"';
        let sHtmlValue =
          '<object classid="CLSID:95AF23C8-F168-4602-91F9-DB8D733BF200"' +
          sSize +
          'id="dhVideo">' +
          "</object>";
        $("#" + sContainerID).html(sHtmlValue);
      } else if (browser().npapi) {
        let sSize =
          " width=" +
          '"' +
          iWidth.toString() +
          '"' +
          " height=" +
          '"' +
          iHeight.toString() +
          '"';
        let sHtmlValue =
          '<object type="application/media-plugin-version-4.0.0.0"' +
          sSize +
          'id="dhVideo">' +
          "</object>";
        $("#" + sContainerID).html(sHtmlValue);
      } else if (browser().websocket) {
      } else {
        $("#" + sContainerID).html("Do not support this browser");
      }
      return true;
    }

    /**
     *@description 열린 장치 탐지
     *@param{String} ip    장치 IP.
     *@param{Num}    port  서비스 포트
     */
    function startDevciceDetection(ip, port) {
      return WebVideoObject["loc001"].pluginObject.StartDevciceDetection(
        ip,
        port
      );
    }

    /**
     *@description 초기화 플러그인
     *@param{String} sp    계약 유형
     *@param{Function} fnCallback 초기화 성공적인 콜백 기능
     */
    let initPlugin = function (sp, fnCallback) {
      WebVideoObject[objectId].initSuccess = fnCallback;
      WebVideoObject[objectId].sProtocol = sp;
      checkReady();
      return true;
    };

    let MethodTable = {
      StartDevciceDetection: ["ip", "port"], //개방형 장치 사전 등록 정보
      CreatePluginWindow: ["browser"], //창을 만듭니다,WebSocket.
      ResizeVideo: ["left", "top", "width", "height"], //창 위치 크기, WebSocket.
      ShowWindow: ["show"], //창이 표시되는지 여부에 관계없이 WebSocket 솔루션이 사용됩니다.
      SetProductType: ["type"], //제품 유형 설정
      SetSplitNum: ["num"], //부서 수를 설정하십시오
      GetLastError: ["svrName"], //오류 코드 가져 오기
      GetChannelTotal: ["deviceID"], //장비 채널 수를 얻으십시오
      GetSelectedNodeIndex: [], //현재 선택된 노드 색인을 가져옵니다
      GetSelectedViewIndex: null, //현재 선택보기 인덱스를 가져옵니다
      GetSelectedWinID: [], //현재 선택한 창 색인을 가져옵니다
      ConnectRealVideo: [
        "deviceID",
        "nodeIndex",
        "viewIndex",
        "channel",
        "stream",
        "protocol",
      ], //열린 비디오
      GetUserDirectory: null, //로컬 시스템에 대한 사용자 경로를 가져옵니다
      SetStoragePath: ["pathKey", "path"], //저장소 경로를 설정합니다 pathKey: LiveRecord|LiveSnapshot|PlaybackSnapshot|PlaybackRecord|VideoClips|HeatMap
      GetStoragePath: ["pathKey"], //저장된 경로를 얻으십시오
      NoticeInitializedSignal: null, //플러그인 응용 프로그램 정보 초기화를 알립니다
      CreateMultiNodeDisplay: ["num", "viewConfig"], //지정된 수의보기 만들기 여러 채널보기 ViewConfig 기본 에어 문자열보기
      SetFullscreen: null, //전체 화면 디스플레이
      ExitFullscreen: null, //전체 화면을 종료하십시오
      ClosePlayer: ["playerID"], //지정된 플레이어를 끕니다 playerID ConnectRealTimeVideo의 반환 값
      LoginDevice: [
        "ip",
        "svrPort",
        "userName",
        "password",
        "rtspPort",
        "specCap",
        "timeout",
      ], // 로그인 프로토콜 프런트 엔드는 Dahua3 SVRPort 로그인 포트 SpecCap 0 : TCP 로그인 모드 2 : 능동적 인 등록 로그인 모드 3 : 멀티 캐스트 로그인 모드 4 : UDP 로그인 모드
      LogoutDevice: ["deviceID"], //로그 아웃하십시오
      SetNetProtocolType: ["protocol"], //로그인 프로토콜 설정
      PlaybackRemoteRecord: ["fileInfo", "locateTime"], //재생 비디오(locateTime이 재생 시간을 시작합니다)
      StopPlayBack: null, //재생 중지
      PausePlayBack: null, //일시 중지 재생
      ResumePlayBack: null, //회복
      FastPlayBack: null, //표현하다
      SlowPlayBack: null, //느린
      PlayOneFrame: null, //단일 프레임
      SelectDirectory: ["type"], //로컬 경로 선택 상자 호출 로컬 경로를 선택하여 선택한 경로 이름을 가져옵니다.
      StartIntercom: ["deviceID"], //오픈 인터컴
      StopIntercom: ["deviceID"], //확대
      CrabOnePicture: ["format", "path", "open"], //그래픽
      ControlRecordingVideo: ["path", "format", "enable"], //비디오
      SetVolume: ["volume"], //볼륨 설정
      ControlAudio: ["playerID", "enable"], //오디오 스위치
      MoveUpperLeft: ["verticalSpeed", "levelSpeed", "flag"], //구름 왼쪽에
      MoveUpperRight: ["verticalSpeed", "levelSpeed", "flag"], //Yuntai는 오른쪽으로 움직입니다
      MoveLowerLeft: ["verticalSpeed", "levelSpeed", "flag"], //Yuntai가 왼쪽으로 옮겼습니다
      MoveLowerRight: ["verticalSpeed", "levelSpeed", "flag"], //Yuntai의 올바른 운동
      MoveUpwards: ["verticalSpeed", "flag"], //삿교리 시프트
      MoveLeft: ["levelSpeed", "flag"], //Yuntai 왼쪽 시프트
      MoveRight: ["levelSpeed", "flag"], //Yuntai 오른쪽 시프트
      MoveLower: ["verticalSpeed", "flag"], //하위
      ActivePTZLocate: ["enable"], //3D 위치 결정
      ControlZoom: ["nMultiple", "flag", "flag1"], //제어
      ControlFocus: ["nMultiple", "flag", "flag1"], //컨트롤 줌
      ControlAperture: ["nMultiple", "flag", "flag1"], //제어 조리개
      GetPresetInfo: null, //사전 설정 정보를 얻으십시오
      GotoPreset: ["index", "nSpeed"], //포인트를 미리 설정 한 위치
      RemovePreset: ["index"], //미리 설정된 포인트 삭제
      SetPreset: ["index", "name"], //선호도를 설정하십시오
      StartTrafficDataQuery: [
        "deviceID",
        "channel",
        "startTime",
        "endTime",
        "ruleType",
        "granularity",
        "MinStayTime",
      ], //열린 사람들 트래픽 통계 쿼리
      GetTrafficDataTotalCount: ["token"], //정보 수
      QueryTrafficData: ["token", "beginIndex", "count"], //검색 정보
      StopTrafficDataQuery: ["token"], //문의를 중지하십시오
      CreateVideoAnalyseContainer: [], //지능형지도 컨테이너를 만듭니다
      EnableVideoAnalyseContainer: ["containerID", "enable"], //지능형지도 컨테이너를 활성화합니다
      CreateMainVideoAnalyseShape: [
        "containerID",
        "eventName",
        "shapeType",
        "shapeName",
        "data",
        "param",
      ], //주 그래프를 추가하십시오
      AddSubVideoAnalyseShape: [
        "containerID",
        "mainShapeID",
        "markedName",
        "data",
        "param",
      ], //하위 그래픽을 추가하십시오
      GetVideoAnalyseShapeConfigData: ["containerID", "shapeID"], //그래픽 데이터 가져 오기
      EnableCrowdDistriMap: ["nodeIndex", "enable"], //해당 노드를 활성화하는 군중 프로필
      SetShowMultiScreenMode: ["mode"], //개체 추적 분할 화면 디스플레이 모드를 설정합니다
      SetIVSEnable: ["enable"], //IVS 미리보기 Enable을 설정하십시오
      StartVideoJoin: ["channel"], //많은 바느질을 열어 라
      SetLensInfo: ["leninfo"], //렌즈 매개 변수 설정 (더 많은 접합 필수)
      SubscribeEvent: ["channel", "event"], //구독 행사
      UnSubscribeEvent: ["channel", "event"], //구독 이벤트를 취소하십시오
      // recordtype은 녹화 유형 0입니다. 0 : 모든 녹음, 1 : 외부 알람, 2 : 연간 검사 테스트 알람, 3 : 모든 알람,
      StartRecordInfoQuerying: [
        "deviceID",
        "channel",
        "streamType",
        "recordType",
        "startTime",
        "endTime",
        "cardInfo",
      ], //쿼리 녹음 시작 (인덱스 만 설정)
      StopRecordInfoQuerying: ["handle"], //쿼리 비디오를 중지하십시오
      FindNextRecordInfo: ["handle", "count"], //쿼리 비디오
      QueryRecordFileBitmap: [
        "deviceID",
        "channel",
        "recordType",
        "year",
        "month",
        "cardInfo",
      ], //월간 비디오 마스크 쿼리
      GetWinID: ["nodeIndex", "viewIndex"],
      OpenVoiceTalk: ["deviceID", "sampleRate", "depth", "encode"], //지정된 매개 변수 오픈 인터콤
      CloseVoiceTalk: ["deviceID"], //확대
      GetDeviceConfig: ["deviceID", "name"], //장비 구성 가져 오기
      StartTour: ["index"], //열린 크루즈
      StopTour: ["index"], //크루즈를 중지하십시오
      EnableCheck: ["bFlag"], //생산 능력
      SetSplitRowAndCol: ["row", "col"], //분할 화면 수를 설정하십시오
      DownloadByLink: ["link", "fileName"], //Weci 다운로드 파일
      StopDownloadByLink: ["requestID"], //다운로드를 중지하십시오
      GetDownoadProgress: ["requestID"], //다운로드 진행을하십시오
      SetOEM: ["oem"], //사용자 정의 정보를 설정하십시오
      SelectWindow: ["nodeIndex", "viewIndex"], //창을 선택하십시오
      OpenPath: ["path"], //경로를 엽니 다
      StartTourByChannel: ["channel", "index"], //채널로 크루즈를 켜십시오
    };

    let RegisterMethod = function () {
      $.each(MethodTable, function (method, params) {
        WebVideoObject[objectId].pluginObject[method] = function () {
          let args = arguments;
          let methodParams = {};
          methodParams["method"] = method;
          methodParams["params"] = {};
          if (WebVideoObject[objectId].g_id === Number.MAX_VALUE) {
            WebVideoObject[objectId].g_id = Number.MIN_VALUE;
          }
          methodParams["id"] = WebVideoObject[objectId].g_id;
          for (let i = 0; i < args.length; i++) {
            methodParams["params"][params[i]] = args[i];
          }
          //console.log(JSON.stringify(methodParams));
          let defer = $.Deferred();
          WebVideoObject[objectId].defMap[WebVideoObject[objectId].g_id] =
            defer;
          WebVideoObject[objectId].g_id++;
          if (browser().websocket) {
            if (!WebVideoObject[objectId].socket) {
              return;
            }
            WebVideoObject[objectId].socket.send(JSON.stringify(methodParams));
          } else {
            document
              .getElementById("dhVideo")
              .PostMessage(JSON.stringify(methodParams));
          }
          return defer;
        };
      });
    };

    function checkReady() {
      try {
        WebVideoObject[objectId].pluginObject = {};
        RegisterMethod(objectId);
        if (browser().msie || browser().npapi) {
          //모니터 이벤트
          document
            .getElementById("dhVideo")
            .AddEventListener("message", handleEvent);
        } else if (browser().websocket) {
          if (!WebVideoObject[objectId].pluginObject) return;
          WebVideoObject[objectId].pluginObject.CreatePluginWindow(
            browser().type
          );
          WebVideoObject[objectId].pluginObject.ShowWindow(true);
        }
        //제품 정보를 설정하십시오
        WebVideoObject[objectId].pluginObject.SetProductType("Customer");
        //사용자 정의 유형 설정
        //pluginObject.SetOEM("SenseTime");
        //통신 프로토콜을 설정하십시오
        WebVideoObject[objectId].pluginObject.SetNetProtocolType(
          WebVideoObject[objectId].sProtocol
        );
        //종료 플러그인 초기화
        WebVideoObject[objectId].pluginObject
          .NoticeInitializedSignal()
          .done(function () {
            //콜백
            WebVideoObject[objectId].initSuccess();
          });
      } catch (e) {
        setTimeout(checkReady, 500);
      }
    }

    /**
     *@description 비디오 창을 만듭니다
     *@param{Num}  iNum 만들기 Windows 수입니다
     *@return Boolean
     */
    let createMultiNodeDisplay = function (iNum) {
      iNum = 37;
      WebVideoObject[objectId].pluginObject.CreateMultiNodeDisplay(iNum);
    };

    let setOpInfoCallback = function (cb) {
      WebVideoObject[objectId].showOpInfo = cb;
    };

    let resizeVideo = function (left, top, width, height) {
      if (WebVideoObject[objectId].pluginObject) {
        WebVideoObject[objectId].pluginObject.ResizeVideo(
          left,
          top,
          width,
          height
        );
      }
    };

    /**
     *@description 창 표시 수를 설정하십시오
     *@param{Num}  iNum 디스플레이 수
     *@return Boolean
     */
    let setSplitNum = function (iNum) {
      WebVideoObject[objectId].pluginObject.SetSplitNum(iNum * iNum);
    };

    /**
     *@description 이벤트 신호를 듣습니다
     *@param{String} event  이벤트 이름
     *@param{Function} cb 이벤트 콜백 기능
     */
    function registerEvent(event, cb) {
      let callBackList = WebVideoObject[objectId].SignalMap.get(event);
      if (typeof callBackList !== "undefined") {
        callBackList.push(cb);
      }
      return true;
    }

    //사용자 경로를 가져옵니다
    let getUserDirectory = function () {
      return WebVideoObject[objectId].pluginObject.GetUserDirectory();
    };

    /**
     *@description 장비 정보를 얻으십시오
     */
    function getDeviceInfo(ip) {
      let info = WebVideoObject[objectId].deviceInfoMap.get(objectId);
      if (typeof info !== "undefined") {
        return info;
      } else {
        return;
      }
    }

    /**
     *@description Lognout 장치
     *@param{String} ip
     *@return Boolean
     */
    let logout = function (ip) {
      let info = getDeviceInfo(ip);
      if (typeof info !== "undefined") {
        WebVideoObject[objectId].pluginObject
          .LogoutDevice(info.deviceID)
          .done(function (ret) {
            //제거 장치
            WebVideoObject[objectId].deviceInfoMap.remove(objectId);
            return true;
          });
      }
    };

    /**
     *@description 지정된 장치의 총 채널 수를 얻으십시오.
     *@param{Num} deviceID  장치 아이디
     */
    let getChannelNumber = function (deviceID) {
      return WebVideoObject[objectId].pluginObject.GetChannelTotal(deviceID);
    };

    /**
     *@description 지정된 창 일련 번호에서 비디오를 재생합니다
     *@param{Num} iIndex
     *@param{String} sIP
     *@param{Num} iChannel
     *@param{Num} iStream
     *@param{Function} fnSuccess
     *@param{Function} fnFail
     *@return Num
     */
    let connectRealVideoEx = function (
      iIndex,
      sIP,
      iChannel,
      iStream,
      fnSuccess,
      fnFail
    ) {
      WebVideoObject[objectId].pluginObject
        .GetWinID(iIndex, 0)
        .done(function (iWinID) {
          //장비 정보를 얻으십시오
          let ODeviceInfo = getDeviceInfo(sIP);
          WebVideoObject[objectId].pluginObject
            .ConnectRealVideo(
              ODeviceInfo.deviceID,
              iIndex,
              0,
              iChannel - 1,
              iStream,
              ODeviceInfo.protocol
            )
            .done(function (iRet) {
              if (iRet > 0) {
                //성공을하십시오
                if (typeof fnSuccess !== "undefined") {
                  fnSuccess(iRet);
                  insertPlayer(
                    iWinID,
                    ODeviceInfo.deviceID,
                    iRet,
                    ODeviceInfo.ip,
                    ODeviceInfo.protocol,
                    iChannel,
                    iStream,
                    0
                  );
                }
              } else if (iRet <= 0) {
                if (typeof fnSuccess !== "undefined") {
                  //오류 메시지가 나타납니다
                  let errorInfo =
                    WebVideoObject[objectId].pluginObject.GetLastError(
                      "ConnectRealVideo"
                    );
                  //분석 오류 설명
                  fnFail(iRet, parseError(errorInfo));
                }
              }
            });
        });
    };

    /**
     *@description 플레이어를 넣으십시오
     *@param{Num} iWinID       창 ID.
     *@param{Num} iDeviceID    장치 아이디
     *@param{Num} iPlayerID    플레이어 ID.
     *@param{string} sIP       장치 IP.
     *@param{Num} iProtocol    계약 유형
     *@param{Num} iChannle     채널 번호
     *@param{Num} iStreamType  코드 현재 유형
     *@param{Num} iPlayerType  플레이어 유형 0 : 실시간 모니터 1 : 네트워크 재생
     */
    function insertPlayer(
      iWinID,
      iDeviceID,
      iPlayerID,
      sIP,
      iProtocol,
      iChannle,
      iStreamType,
      iPlayerType
    ) {
      let info = {
        winID: iWinID,
        deviceID: iDeviceID,
        ip: sIP,
        channle: iChannle,
        streamType: iStreamType,
        protocol: iProtocol,
        playerID: iPlayerID,
        type: iPlayerType,
      };
      WebVideoObject[objectId].playerInfoMap.put(iWinID, info);
    }

    /**
     *@description 해결 방법 오류 메시지
     *@param{String} 에러 메시지
     *@return String 오류 설명 정보
     */
    let parseError = function (errorInfo) {
      let errorObject = $.parseJSON(errorInfo);
      if ("error" in errorObject) {
        return errorObject["error"];
      }
    };

    /**로그인 장치
     *@description 초기화 플러그인
     *@param{String} sIp         장치 IP.
     *@param{Num} iPort          서비스 포트
     *@param{String} sUserName   사용자 이름
     *@param{String} sPassword   암호
     *@param{Num} iRtspPort      RTSP 포트
     *@param{Num} iProtocol      계약서
     *@param{Num} iTimeout       시간 초과
     *@param{Function} fnSuccess 성공적인 콜백 기능에 로그인 한 후에
     *@param{Function} fnFail    실패한 실패 후 콜백 함수
     */
    let login = function (
      sIp,
      iPort,
      sUserName,
      sPassword,
      iRtspPort,
      iProtocol,
      iTimeout,
      fnSuccess,
      fnFail
    ) {
      if (WebVideoObject[objectId].pluginObject) {
        WebVideoObject[objectId].pluginObject
          .LoginDevice(
            sIp,
            iPort,
            sUserName,
            sPassword,
            iRtspPort,
            iProtocol,
            iTimeout
          )
          .done(function (ret) {
            if (ret > 0) {
              //장치 정보를 삽입하십시오
              WebVideoObject[objectId].pluginObject
                .GetChannelTotal(ret)
                .done(function (channelNum) {
                  insertDeviceInfo(
                    sIp,
                    iPort,
                    sUserName,
                    sPassword,
                    iRtspPort,
                    iProtocol,
                    channelNum,
                    ret,
                    objectId
                  );
                  fnSuccess(sIp, ret);
                });
            } else if (ret <= 0) {
              //오류 메시지가 나타납니다
              WebVideoObject[objectId].pluginObject
                .GetLastError("LoginDevice")
                .done(function (err) {
                  //분석 오류 설명
                  fnFail(ret, parseError(err));
                });
            }
          });
      }
    };

    /**
     *@description 장치 정보를 삽입하십시오
     *@param{Num} deviceID     장치 아이디
     *@param{String} ip        장치 IP.
     *@param{Num} port         서비스 포트
     *@param{String} userName  사용자 이름
     *@param{String} password  암호
     *@param{Num} rtspPort     RTSP 포트
     *@param{Num} channelNum   총 채널 수
     *@param{Num} deviceID     장치 아이디
     */
    function insertDeviceInfo(
      ip,
      port,
      userName,
      password,
      rtspPort,
      protocol,
      channelNum,
      deviceID,
      objectId
    ) {
      let info = {
        ip: ip,
        port: port,
        userName: userName,
        password: password,
        rtspPort: rtspPort,
        channelNum: channelNum,
        deviceID: deviceID,
        protocol: protocol,
      };
      WebVideoObject[objectId].deviceInfoMap.put(objectId, info);
    }

    /**
     *@description 선택한 비디오 창 재생
     *@param{String} sIP
     *@param{Num} iChannel
     *@param{Num} iStream
     *@param{Function} fnSuccess
     *@param{Function} fnFail
     *@return Num
     */
    let connectRealVideo = function (
      sIP,
      iChannel,
      iStream,
      fnSuccess,
      fnFail
    ) {
      if (!WebVideoObject?.[objectId]?.pluginObject) return;
      WebVideoObject[objectId]?.pluginObject
        ?.GetSelectedNodeIndex()
        ?.done(function (iNodeIndex) {
          WebVideoObject[objectId].pluginObject
            .GetSelectedViewIndex()
            .done(function (iViewIndex) {
              let ODeviceInfo = getDeviceInfo(sIP);
              if (ODeviceInfo) {
                WebVideoObject[objectId].pluginObject
                  .ConnectRealVideo(
                    ODeviceInfo.deviceID,
                    iNodeIndex,
                    iViewIndex,
                    iChannel - 1,
                    iStream,
                    ODeviceInfo.protocol
                  )
                  .done(function (iRet) {
                    if (iRet > 0) {
                      //성공을하십시오
                      if (typeof fnSuccess !== "undefined") {
                        fnSuccess(iRet);
                        WebVideoObject[objectId].pluginObject
                          .GetSelectedWinID()
                          .done(function (iWinID) {
                            insertPlayer(
                              iWinID,
                              ODeviceInfo.deviceID,
                              iRet,
                              ODeviceInfo.ip,
                              ODeviceInfo.protocol,
                              iChannel,
                              iStream,
                              0
                            );
                          });
                      }
                    } else if (iRet <= 0) {
                      if (typeof fnSuccess !== "undefined") {
                        //오류 메시지가 나타납니다
                        WebVideoObject[objectId].pluginObject
                          .GetLastError("ConnectRealVideo")
                          .done(function (errorInfo) {
                            //분석 오류 설명
                            fnFail(iRet, parseError(errorInfo));
                          });
                      }
                    }
                  });
              } else {
                return;
              }
            });
        });
    };

    /**
     *@description 현재 선택된 창의 플레이어를 닫습니다
     */
    var closePlayer = function () {
      //현재 선택된 창 ID를 가져옵니다
      getSelectedWinID()
        ?.done(function (iWinID) {
          //플레이어 ID를 얻으십시오
          var oInfo = WebVideoObject[objectId].playerInfoMap.get(iWinID);
          if (typeof oInfo != "undefined") {
            WebVideoObject[objectId].pluginObject.ClosePlayer(oInfo.playerID);
            return true;
          } else {
            return true;
          }
        })
        .fail(function () {
          console.log("Close Player Error!!!!");
          // port++;
          // setTimeout(function () {
          //     reconnect(port, def);
          // }, 2000);
        });
    };
    //선택한 창 ID를 가져옵니다
    var getSelectedWinID = function () {
      if (!WebVideoObject?.[objectId]?.pluginObject) return;
      return WebVideoObject[objectId].pluginObject.GetSelectedWinID();
    };

    /**
     *@description 좌측 상단 이동
     *@param{Num} iVerticalSpeed    수직 속도
     *@param{Num} iLevelSpeed       레벨 속도
     *@param{Boolean} flag  정지 신호를 켜십시오
     */
    var moveUpperLeft = function (iVerticalSpeed, iLevelSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveUpperLeft(
        iVerticalSpeed,
        iLevelSpeed,
        flag
      );
    };

    /**
     *@description 우측 상단 이동
     *@param{Num} iVerticalSpeed    수직 속도
     *@param{Num} iLevelSpeed       레벨 속도
     *@param{Boolean} flag  정지 신호를 켜십시오
     */
    var moveUpperRight = function (iVerticalSpeed, iLevelSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveUpperRight(
        iVerticalSpeed,
        iLevelSpeed,
        flag
      );
    };

    /**
     *@description 좌측 하단 이동
     *@param{Num} iVerticalSpeed    수직 속도
     *@param{Num} iLevelSpeed       레벨 속도
     *@param{Boolean} flag  정지 신호를 켜십시오
     */
    var moveLowerLeft = function (iVerticalSpeed, iLevelSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveLowerLeft(
        iVerticalSpeed,
        iLevelSpeed,
        flag
      );
    };

    /**
     *@description 우측 하단 이동
     *@param{Num} iVerticalSpeed    수직 속도
     *@param{Num} iLevelSpeed       레벨 속도
     *@param{Boolean} flag  정지 신호를 켜십시오
     */
    var moveLowerRight = function (iVerticalSpeed, iLevelSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveLowerRight(
        iVerticalSpeed,
        iLevelSpeed,
        flag
      );
    };

    /**
     *@description 위로 이동
     *@param{Num} iVerticalSpeed   수직 속도
     *@param{Boolean} flag         정지 신호를 켜십시오
     */
    var moveUpwards = function (iVerticalSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveUpwards(
        iVerticalSpeed,
        flag
      );
    };

    /**
     *@description 아래로 이동
     *@param{Num} iVerticalSpeed   수직 속도
     *@param{Boolean} flag         정지 신호를 켜십시오
     */
    var moveLower = function (iVerticalSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveLower(
        iVerticalSpeed,
        flag
      );
    };

    /**
     *@description 왼쪽 이동
     *@param{Num} iLevelSpeed   레벨 속도
     *@param{Boolean} flag      정지 신호를 켜십시오
     */
    var moveLeft = function (iLevelSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveLeft(iLevelSpeed, flag);
    };

    /**
     *@description 오른쪽 운동
     *@param{Num} iLevelSpeed   레벨 속도
     *@param{Boolean} flag      정지 신호를 켜십시오
     */
    var moveRight = function (iLevelSpeed, flag) {
      return WebVideoObject[objectId].pluginObject.MoveRight(iLevelSpeed, flag);
    };

    /**
     *@description PTZ 위치 지정을 활성화합니다
     */
    var enablePTZLocate = function () {
      return WebVideoObject[objectId].pluginObject.ActivePTZLocate(true);
    };

    /**
     *@description 비 가능성 PTZ 위치 결정
     */
    var disablePTZLocate = function () {
      return WebVideoObject[objectId].pluginObject.ActivePTZLocate(false);
    };

    /**
     *@description 제어
     *@param{Num} iSpeed     배수
     *@param{Num} flag      증가 또는 감소
     *       - 0:증가하다
     *       - 1:다시 자르십시오
     *@param{Boolean} flag1      정지 신호를 켜십시오
     */
    var controlZoom = function (iSpeed, flag, flag1) {
      return WebVideoObject[objectId].pluginObject.ControlZoom(
        iSpeed,
        flag,
        flag1
      );
    };

    /**
     *@description 컨트롤 줌
     *@param{Num} speed     배수
     *@param{Num} flag      증가 또는 감소
     *       - 0:증가하다
     *       - 1:다시 자르십시오
     *@param{Boolean} flag1      정지 신호를 켜십시오
     */
    var controlFocus = function (speed, flag, flag1) {
      return WebVideoObject[objectId].pluginObject.ControlFocus(
        speed,
        flag,
        flag1
      );
    };

    /**
     *@description 제어 조리개
     *@param{Num} speed     배수
     *@param{Num} flag      증가 또는 감소
     *       - 0:증가하다
     *       - 1:다시 자르십시오
     *@param{Boolean} flag1      정지 신호를 켜십시오
     */

    var controlAperture = function (speed, flag, flag1) {
      return WebVideoObject[objectId].pluginObject.ControlAperture(
        speed,
        flag,
        flag1
      );
    };

    // return method 객체
    const returnMethodObj = {};

    var showVideoLoad = function () {
      if (!WebVideoObject[objectId]?.pluginObject) return;
      WebVideoObject[objectId].pluginObject.ShowWindow(true);
    };

    /**
     *@description 전체 화면으로 전환하십시오
     */
    var setFullscreen = function () {
      if (!WebVideoObject[objectId]?.pluginObject) return;
      WebVideoObject[objectId].pluginObject.SetFullscreen();
      return true;
    };

    /**
     *@description 전체 화면을 종료하십시오
     */
    var exitFullscreen = function () {
      if (!WebVideoObject[objectId]?.pluginObject) return;
      WebVideoObject[objectId].pluginObject.ExitFullscreen();
      return true;
    };

    window.focus = function (e) {
      pluginObject.ShowWindow(true);
    };

    function methodReturn() {
      const methodTable = {
        checkPluginInstall: checkPluginInstall,
        browser: browser,
        connect: connect,
        getWebsocket: getWebsocket,
        insertPluginObject: insertPluginObject,
        initPlugin: initPlugin,
        setOpInfoCallback: setOpInfoCallback,
        resizeVideo: resizeVideo,
        createMultiNodeDisplay: createMultiNodeDisplay,
        setSplitNum: setSplitNum,
        getUserDirectory: getUserDirectory,
        registerEvent: registerEvent,
        getDeviceInfo: getDeviceInfo,
        logout: logout,
        getChannelNumber: getChannelNumber,
        connectRealVideoEx: connectRealVideoEx,
        connectRealVideo: connectRealVideo,
        closePlayer: closePlayer,
        login: login,
        moveUpperLeft: moveUpperLeft,
        moveUpperRight: moveUpperRight,
        moveLowerLeft: moveLowerLeft,
        moveLowerRight: moveLowerRight,
        moveLeft: moveLeft,
        moveRight: moveRight,
        moveUpwards: moveUpwards,
        moveLower: moveLower,
        enablePTZLocate: enablePTZLocate,
        controlZoom: controlZoom,
        controlFocus: controlFocus,
        controlAperture: controlAperture,
        disablePTZLocate: disablePTZLocate,
        showVideoLoad: showVideoLoad,
        setFullscreen: setFullscreen,
        exitFullscreen: exitFullscreen,
      };

      return {
        ...returnMethodObj,
        [objectId]: methodTable,
      };
    }

    return methodReturn();
  })(objectId);
