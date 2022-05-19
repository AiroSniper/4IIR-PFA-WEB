import React, { useMemo, useRef, useState, useEffect } from "react";
import PolygonAnnotation from "components/PolygonAnnotation";
import { Stage, Layer, Image } from "react-konva";
import Axios from "axios";
import Button from "components/Button";
const videoSource = "./img.jpg";
const wrapperStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: 20,
  backgroundColor: "aliceblue",
};
const columnStyle = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  marginTop: 20,
  backgroundColor: "aliceblue",
};
const Canvas = () => {
  const [image, setImage] = useState();
  const imageRef = useRef(null);
  const dataRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [size, setSize] = useState({});
  const [flattenedPoints, setFlattenedPoints] = useState();
  const [position, setPosition] = useState([0, 0]);
  const [isMouseOverPoint, setMouseOverPoint] = useState(false);
  const [isPolyComplete, setPolyComplete] = useState(false);
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [status, setStatus] = useState();
  const [filename, setFilename] = useState();
  

  //// recuperation du location
 
  const videoElement = useMemo(() => {
    const element = new window.Image();
    element.width = 650;
    element.height = 302;
    element.src = videoSource;
    return element;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSource]); //it may come from redux so it may be dependency that's why I left it as dependecny...
  useEffect(() => {
    const onload = function () {
      setSize({
        width: videoElement.width,
        height: videoElement.height,
      });
      setImage(videoElement);
      imageRef.current = videoElement;
    };
    videoElement.addEventListener("load", onload);
    return () => {
      videoElement.removeEventListener("load", onload);
    };
  }, [videoElement]);
  const getMousePos = (stage) => {
    return [stage.getPointerPosition().x, stage.getPointerPosition().y];
  };
  //drawing begins when mousedown event fires.
  const handleMouseDown = (e) => {
    if (isPolyComplete) return;
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    if (isMouseOverPoint && points.length >= 3) {
      setPolyComplete(true);
    } else {
      setPoints([...points, mousePos]);
    }
  };
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setPosition(mousePos);
  };
  const handleMouseOverStartPoint = (e) => {
    if (isPolyComplete || points.length < 3) return;
    e.target.scale({ x: 3, y: 3 });
    setMouseOverPoint(true);
  };
  const handleMouseOutStartPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
    setMouseOverPoint(false);
  };
  const handlePointDragMove = (e) => {
    const stage = e.target.getStage();
    const index = e.target.index - 1;
    const pos = [e.target._lastPos.x, e.target._lastPos.y];
    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();
    setPoints([...points.slice(0, index), pos, ...points.slice(index + 1)]);
  };

  useEffect(() => {
    setFlattenedPoints(
      points
        .concat(isPolyComplete ? [] : position)
        .reduce((a, b) => a.concat(b), [])
    );
  }, [points, isPolyComplete, position]);
  const undo = () => {
    setPoints(points.slice(0, -1));
    setPolyComplete(false);
    setPosition(points[points.length - 1]);
  };
  const reset = () => {
    setPoints([]);
    setPolyComplete(false);
    clearImage();
  };

  //handle image capture
  const handleImageChange = (event) => {
    this.setState({
      image: URL.createObjectURL(event.target.files[0])
    })
  }
  const handleGroupDragEnd = (e) => {
    //drag end listens other children circles' drag end event
    //...that's, why 'name' attr is added, see in polygon annotation part
    if (e.target.name() === "polygon") {
      let result = [];
      let copyPoints = [...points];
      copyPoints.map((point) =>
        result.push([point[0] + e.target.x(), point[1] + e.target.y()])
      );
      e.target.position({ x: 0, y: 0 }); //needs for mouse position otherwise when click undo you will see that mouse click position is not normal:)
      setPoints(result);
    }
  };


  
  //acces ou camera

  const getFileName = (e)=>{
    setFilename(new Date().getUTCMilliseconds())
  }
  
 //envois les donnes 
  
//upload image

 
  return (
    <div class="konva-elements">
    <video ref={videoRef} className="video" ></video>
    <canvas id="picture" ></canvas>
         <Stage
         className={"stage"}
    ref={photoRef}
    width={350}
    height={400}
    onMouseMove={handleMouseMove}
    onMouseDown={handleMouseDown}
    onTouchMove={handleMouseMove}
    onTouchStart={handleMouseDown}
  >
    <Layer>
  
      <PolygonAnnotation
        points={points}
        flattenedPoints={flattenedPoints}
        handlePointDragMove={handlePointDragMove}
        handleGroupDragEnd={handleGroupDragEnd}
        handleMouseOverStartPoint={handleMouseOverStartPoint}
        handleMouseOutStartPoint={handleMouseOutStartPoint}
        isFinished={isPolyComplete}
      />
    </Layer>
  </Stage>

  //btns

    
    </div>
   
  );
};

export default Canvas;