import "./App.css";
import CCTVPlugin from "./CCTVPlugin";

function App() {
  const cctvItem = {
    cctv_id: 1,
    cctv_index: "CCTV0001",
    created_date: "2023-10-04T01:58:34.000Z",
    modified_date: "2023-10-04T08:35:17.000Z",
    cctv_name: "test1",
    cctv_pos_x: 0,
    cctv_user_id: "admin",
    cctv_pw: "work1801!@",
    cctv_ip: "192.168.0.51",
    cctv_port: 80,
    cctv_group: 1,
    cctv_number: 1,
    cctv_description: null,
    cctv_image: null,
    cctv_type: 0,
    local_index: "LC0001",
    net_scan_action: 1,
    net_scan_time: "2023-10-10T00:11:20.000Z",
    net_start_time: null,
    net_stop_time: "2023-10-06T05:37:50.000Z",
    net_state: "open",
    device_code: 1,
    local_id: 1,
    local_entrance: null,
    local_name: "105 정거장",
    local_used: 1,
    local_number: 1,
    monitor_number: 1,
    local_type: 4,
    local_area: 1,
    ts_index: "SITE0001",
  };

  return (
    <div className="App">
      <h1>cctv 앱</h1>
      <CCTVPlugin cctvItem={cctvItem} />
    </div>
  );
}

export default App;
