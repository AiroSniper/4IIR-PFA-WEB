import "./App.css";
import Canvas from "containers/Canvas";
import React from "react";
function App() {
  return (
    <React.Fragment>
        <div class="_front">
        <div class="notice">
            <div class="instr">
                <h6 class="inst_title">Try to select all edges</h6>
                <h6 class="inst">Good luck</h6>
            </div>

            <div class="img">
                <img src="./robot.png" alt=""/>
            </div>
        </div>
        <div class="_container">
          <Canvas/>
           
        </div>
    </div>
    <div class="_background">

        <div class="_top">

        </div>

        <div class="_bottom">
            
        </div>
    </div>

  
     </React.Fragment>
  );
}

export default App;
