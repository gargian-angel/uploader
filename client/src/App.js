import React from "react";
import Renderer from "./components/PitchDeckContainer/Renderer";

const App = () => {
  return (
    <div className="App">
      <Renderer multiple={false} showPreview showFileSize />
    </div>
  );
};

export default App;
