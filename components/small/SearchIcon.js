const styles = {
  width: "24px",
  height: "24px",
  fill: "none",
  strokeWidth: "2px",
  stroke: "#343a40",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SearchIcon = () => {
  return (
    <svg viewBox="0 0 24 24" style={styles}>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
};
