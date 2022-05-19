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
  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
    } else {
      setStatus('Locating...');
      navigator.geolocation.getCurrentPosition((position) => {
        setStatus(null);
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
      }, () => {
        setStatus('Unable to retrieve your location');
      });
    }

    console.log(lat,lng)
  }

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

  let video = null

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const takePicture = () => {
    const width = 400
    const height = width / (16 / 9)
    
    video = videoRef.current

    let photo = photoRef.current

    photo.width = width

    photo.height = height

    let ctx = document.getElementById("picture").getContext('2d')

   ctx.drawImage(video, 0, 0, width, height)
    
    
  }

  const clearImage = () => {
    let photo = photoRef.current

    let ctx = document.getElementById("picture").getContext('2d')

    ctx.clearRect(0,0,photo.width,photo.height)
  }

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getFileName = (e)=>{
    setFilename(new Date().getUTCMilliseconds())
  }
  
 //envois les donnes 
 const sendData = (e) =>{
   
  const url = 'http://localhost:3000/files';
  let annotation = document.getElementById("annotation").value;
  getLocation();
  if(lat && lng){
    let pointsObjArray = [];
 
    points.forEach(function(item){
      pointsObjArray.push({x:item[0],y:item[1]});
    });

    console.log(JSON.stringify(pointsObjArray))
      e.preventDefault();
    
    
      Axios.post(url,{
      
          file_url:"url",
          width: size.width,
          height: size.height,
          date_captured: new Date(),
          gps_location:{	
            latitude: lat,
            longitude: lng
        },
          objects:
            {
                  class: annotation,	
                  polygon: pointsObjArray
            }
      
         
      })
      .then(res=>{
       // upload();
        console.log(res.data);
        reset();
        document.getElementById("annotation").value="";
        alert("data sent successfully");
      })
  }
  else
  alert("You did not get the location , please try again")

}
//upload image

const upload= (e) =>{
  const url = 'http://localhost:3000/files/webupload';
  var dataURL =  document.getElementById("picture").toDataURL();

  console.log("data url",dataURL)
  Axios.post(url,{
    image:dataURL
  }) .then(res=>{
    console.log(res.data);
  })
}

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
  <div class="btns mt-4">
    <div class="row mb-2">
          <div class="col-12">
            <input type="text" class="form-control" placeholder="Annotation" id="annotation"/>
          </div>
      </div>
      <div class="row mb-2">
          <div class="col-4">
             <button class="btn btn-primary w-100" onClick={takePicture}><i class="fas fa-camera"></i></button>
          </div>
          <div class="col-4">
              <button class="btn btn-primary w-100" onClick={undo}><i class="fas fa-undo"></i></button>
          </div>
          <div class="col-4">
              <button class="btn btn-primary w-100" onClick={reset}><i class="fas fa-trash"></i></button>
          </div>
      </div>
      <div class="row">
          <div class="col-6">
              <button class="btn btn-primary w-100"><i class="fas fa-save"></i></button>
          </div>
          <div class="col-6">
              <button class="btn btn-primary w-100" onClick={sendData}><i class="fas fa-paper-plane"></i></button>
          </div>
      </div>
  </div>


    
    </div>
   
  );
};

export default Canvas;