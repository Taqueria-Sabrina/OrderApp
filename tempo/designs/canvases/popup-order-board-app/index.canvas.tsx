// @tempo-home — Tempo home canvas (the workspace Run button opens this). Managed marker; do not remove.
import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";

export default function PopupOrderBoardAppCanvas() {
  return (
    <Canvas name="Popup Order Board App">
      <RouteStoryboard
        id="Board"
        name="Public Menu Board"
        route="/"
        layout={{ x: 0, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="Login"
        name="Staff Login"
        route="/login"
        layout={{ x: 470, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="Home"
        name="Home Hub"
        route="/app"
        layout={{ x: 940, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="Order"
        name="Order Entry"
        route="/app/order"
        layout={{ x: 1410, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="Queue"
        name="Live Kitchen Queue"
        route="/app/queue"
        layout={{ x: 1880, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="Dashboard"
        name="Sales Dashboard"
        route="/app/dashboard"
        layout={{ x: 2350, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="History"
        name="Past Orders"
        route="/app/history"
        layout={{ x: 2820, y: 0, width: 420, height: 880 }}
      />
      <RouteStoryboard
        id="Menu"
        name="Weekly Menu Editor"
        route="/app/menu"
        layout={{ x: 3290, y: 0, width: 420, height: 880 }}
      />
    </Canvas>
  );
}
