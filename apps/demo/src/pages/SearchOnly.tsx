import { SearchPanel } from "@sharelyai/widget-ui-search";
import { SharelyProvider } from "@sharelyai/widget-services";
import { ThemeProvider, GlobalStyle } from "@sharelyai/widget-ui-shared";

function SearchOnly() {
  return (
    <SharelyProvider>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ padding: "20px" }}>
          <h2>Search Only Demo</h2>
          <p>This demo shows only the SearchPanel component.</p>
          <div
            style={{
              height: "500px",
              width: "800px",
              border: "1px solid #ccc",
              margin: "20px auto",
            }}
          >
            <SearchPanel />
          </div>
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}

export default SearchOnly;
