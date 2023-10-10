import React, { useState, useEffect } from "react";
import Dahua from "./lib/Dahua.js";
import { WebVideoCtrl } from "./lib/WebVideoCtrl.js";
import Foundation from "./lib/foundation.js";
import styled from "styled-components";

function CCTVPlugin({
  cctvItem,
  deviceItem,
  targetCctv,
  repositionAction,
  connectAction,
  setConnectActionHandler,
  alarmPanel,
  gasAlarmPanel,
  ...rest
}) {
  console.log("cctvItem", cctvItem);
  const [cctvData, setCctvData] = useState();
  const [camera, setCamera] = useState();

  const [plugin, setPlugin] = useState();

  useEffect(() => {
    connectCctv(cctvItem);
  }, [cctvItem]);

  useEffect(() => {
    if (camera) {
      const elId = `plugin-${cctvItem?.cctv_index}`;
      const { top, left, width, height } = getElementPosition(elId);

      if (cctvItem?.cctv_index) {
        camera.setReposition({
          left,
          top,
          width,
          height,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cctvItem]);

  const connectCctv = async (item) => {
    if (item) {
      try {
        const {
          cctv_index,
          cctv_ip,
          cctv_port,
          cctv_user_id,
          cctv_pw,
          net_state,
        } = item;

        // if (camera) camera?.disConnect();

        if (net_state === "closed") return;

        const elId = `plugin-${cctv_index}`;

        let cctv;
        // eslint-disable-next-line no-multi-assign
        window[`cctv${cctv_index}`] = cctv = await new Dahua(elId);

        // if (!getElementPosition) return;
        const { top, left, width, height } = getElementPosition(elId);
        // console.log(" top, left, width, height =>", top, left, width, height);

        const userInfo = {
          ip: cctv_ip,
          port: cctv_port,
          username: cctv_user_id,
          password: cctv_pw,
          rtspPort: 80,
          protocol: 0,
          timeout: 5,
          streamType: 1,
          channel: 1,
          top,
          left,
          width,
          height,
          login: net_state === "open" ? true : false,
          cctvIndex: cctv_index,
        };
        cctv.init(userInfo);

        setCamera(cctv);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getElementPosition = (elId) => {
    const targetEL = document.getElementById(elId);
    if (!targetEL) return;
    const clientRect = targetEL.getBoundingClientRect(); // DomRect 구하기 (각종 좌표값이 들어있는 객체)
    const variableTop =
      window.innerHeight > 1078 ? 0 : window.innerHeight > 938 ? 71 : 103; // 전체화면 - 0, 북마크 X - 71, 북마크 O - 103
    // const variableTop = window.innerHeight > 938 ? 71 : 103
    const relativeTop = clientRect.top + variableTop; // Viewport의 시작지점을 기준으로한 상대좌표 Y 값.
    const relativeLeft = clientRect.left; // Viewport의 시작지점을 기준으로한 상대좌표 X 값.
    const _height = cctvItem.cctv_index ? targetEL.offsetHeight : 0;
    const _width = cctvItem.cctv_index ? targetEL.offsetWidth : 0;
    // const _height =
    //   cctvItem.cctv_index === targetCctv.cctv_index ? targetEL.offsetHeight : 0;
    // const _width =
    //   cctvItem.cctv_index === targetCctv.cctv_index ? targetEL.offsetWidth : 0;

    return {
      top: relativeTop,
      left: relativeLeft,
      width: _width,
      height: _height,
    };
  };

  return (
    <div>
      <div>test</div>

      <div
        id={`plugin-${cctvItem?.cctv_index}`}
        key={cctvItem?.cctv_index}
        className="plugin"
      ></div>
      {targetCctv?.cctv_index === cctvItem?.cctv_index && (
        <div className="message">
          {cctvItem?.net_state === "open" ? (
            <>
              <div>영상이 보이지 않을 경우,</div>
              <div>재접속을 위하여 클릭해 주세요.</div>
            </>
          ) : (
            <>
              <br />
              <div>네트워크 연결이 원활하지 않습니다.</div>
              <div>네트워크 상태를 확인해 주세요.</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CCTVPlugin;

///내가 만든거
// const [isConnected, setIsConnected] = useState(false);
// console.log(userInfo.ip);

// useEffect(() => {
//   // 컴포넌트가 마운트될 때 CCTV에 연결
//   Dahua.connect(userInfo.ip, userInfo.port, userInfo.id, userInfo.password)
//     .then(() => {
//       setIsConnected(true);
//       console.log("CCTV에 연결되었습니다.");
//     })
//     .catch((error) => {
//       console.error("CCTV 연결 실패:", error);
//     });

//   // 컴포넌트가 언마운트될 때 연결 해제
//   return () => {
//     if (isConnected) {
//       Dahua.disconnect()
//         .then(() => {
//           setIsConnected(false);
//           console.log("CCTV 연결이 종료되었습니다.");
//         })
//         .catch((error) => {
//           console.error("CCTV 연결 종료 실패:", error);
//         });
//     }
//   };
// }, [userInfo.ip, userInfo.port, userInfo.id, userInfo.password, isConnected]);

// const playVideo = () => {
//   if (isConnected) {
//     // CCTV 영상을 재생
//     WebVideoCtrl.playVideo();
//   } else {
//     console.log("CCTV에 연결되어 있지 않습니다.");
//   }
// };
