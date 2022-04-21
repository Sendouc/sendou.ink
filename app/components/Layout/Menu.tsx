import DrawingSection from "./DrawingSection";

export function Menu() {
  return (
    <div className="menu">
      <DrawingSection type="boy" />
      <nav>menu</nav>
      <DrawingSection type="girl" />
    </div>
  );
}
