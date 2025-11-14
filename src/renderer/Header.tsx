import { useMediaQuery } from "react-responsive";

export default function Header() {
  {
    /* Responsive "Summer Camp Scheduler" header title */
  }
  const headerAlign700 = useMediaQuery({ query: "(max-width: 700px)" });
  const headerAlign900 = useMediaQuery({ query: "(max-width: 900px)" });
  const headerLeft = {
    textAlign: "right" as const,
    marginRight: headerAlign700 ? 109 : headerAlign900 ? 120 : 150,
  };
  const headerRight = {
    textAlign: "left" as const,
    marginLeft: headerAlign900 ? 120 : 150,
  };

  return (
    <header>
      <div id="navbar">
        <div className="navbar-content">
          <h1 id="navbar-left" style={headerLeft}>
            Summer Camp
          </h1>
        </div>
        <div className="navbar-content">
          <h1 id="navbar-right" style={headerRight}>
            Scheduler
          </h1>
        </div>
      </div>
    </header>
  );
}
