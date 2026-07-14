import { Canvas, Storyboard } from "tempo-sdk/canvas";
import Orderentrygrid from "./OrderEntryGrid";
import Orderentrylist from "./OrderEntryList";
import Livequeuecards from "./LiveQueueCards";
import Livequeuekanban from "./LiveQueueKanban";
import Dashboardstats from "./DashboardStats";
import Dashboardleaderboard from "./DashboardLeaderboard";
import Menueditor from "./MenuEditor";

export default function PopupOrderBoardCanvas() {
  return (
    <Canvas name="Popup Order Board">
      <Storyboard
        id="OrderEntryGrid"
        name="Order Entry — Tile Grid"
        component={Orderentrygrid}
        layout={{ x: 0, y: 0, width: 420, height: 880 }}
      />
      <Storyboard
        id="OrderEntryList"
        name="Order Entry — Fast List"
        component={Orderentrylist}
        layout={{ x: 470, y: 0, width: 420, height: 880 }}
      />
      <Storyboard
        id="LiveQueueCards"
        name="Live Queue — Card Column"
        component={Livequeuecards}
        layout={{ x: 940, y: 0, width: 420, height: 880 }}
      />
      <Storyboard
        id="LiveQueueKanban"
        name="Live Queue — Kanban Lanes"
        component={Livequeuekanban}
        layout={{ x: 1410, y: 0, width: 1100, height: 780 }}
      />
      <Storyboard
        id="DashboardStats"
        name="Dashboard — Stat Cards"
        component={Dashboardstats}
        layout={{ x: 0, y: 930, width: 1100, height: 780 }}
      />
      <Storyboard
        id="DashboardLeaderboard"
        name="Dashboard — Leaderboard"
        component={Dashboardleaderboard}
        layout={{ x: 2560, y: 0, width: 420, height: 880 }}
      />
      <Storyboard
        id="MenuEditor"
        name="Weekly Menu Editor"
        component={Menueditor}
        layout={{ x: 0, y: 1760, width: 420, height: 880 }}
      />
    </Canvas>
  );
}
