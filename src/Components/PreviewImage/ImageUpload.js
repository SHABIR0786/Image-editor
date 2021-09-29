import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/fontawesome-free-solid";
import { useDropzone } from "react-dropzone";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import EditImage from "../EditImage/EditImage";

export default function PreviewImage() {
  function clickHandler() {
  }
  const [files, setFiles] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [isDropZone, setDropZone] = useState(true);
  const [isDone, setDone] = useState(false);
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState(null);
  const childCompRef = React.useRef(null);
  const imageRef = useRef(null);
  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setDropZone(false);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
    
  });

  const images = files.map((file) => (

    <div key={file.name}>
      <div>
        <EditImage
          src={file.preview}
          ref={childCompRef}
          edit={isEdit}
          done={!isDone}
          setDone={setDone}
          getCropData={getCropData}
          cropper={cropper}
          setCropper={setCropper}
          imageRef={imageRef}
        />
      </div>
      <Stack spacing={2} direction="row">
        <div className="bottomborder">
          {!isEdit ? (
            <Button onClick={() => setEdit(true)} Center variant="outlined"   style={{  marginRight: "40px" }} >
              Edit
            </Button>
          ) : null}
          {!isEdit ? (
            <Button onClick={clickHandler} Center variant="outlined">
              Submit
            </Button>
          ) : null}
         
        </div>
      </Stack>
    </div>
  ));

  return ( 
    <div className="App">
     {!isEdit && isDropZone? <div className="outerdiv" {...getRootProps()}>
        <input {...getInputProps()} />
         <div className="bodr">
        <FontAwesomeIcon icon={faImage} />
          <p>Click or Drop Image</p></div> 
      </div>: null}
      {!isDone  ? <div id="imageset" style={{marginLeft:"20px" , marginRight:"20px",padding: "6em 0"}}>{images} </div> : null}
     
      {isEdit ? (
        <div className="croppercode">
            <div className="box" >
            {isDone ? ( <img
               style={{
                filter:childCompRef.current.state.filter,
                transform: `rotate(${childCompRef.current?childCompRef.current.state.rotation:0}deg)` , maxWidth:"500px",maxHeight:"500px", padding: "10em 0",width: "100%" 
               }}
                src={cropData}
                alt="cropped"
              />       ) : null}
            </div>
          <br style={{ clear: "both" }} />
        </div>
      ) : null}
    </div>
  );
}
