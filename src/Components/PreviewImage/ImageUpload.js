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
  const childCompRef = React.useRef(null);
  const getCropData = (blob) => {
    var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
  var base64data = reader.result;                
  setCropData(base64data);
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
        />
      </div>
      <Stack spacing={2} direction="row">
        <div className="bottomborder">
          {!isEdit ? (
            <Button onClick={() => setEdit(true)} variant="outlined"   style={{  marginRight: "40px" }} >
              Edit
            </Button>
          ) : null}
          {!isEdit ? (
            <Button onClick={clickHandler} variant="outlined">
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
      {!isDone  ? <div id="imageset" style={{marginLeft:"20px" , marginRight:"20px"}}>{images} </div> : null}
     
      {isEdit ? (
        <div className="croppercode">
            <div className="box" >
            {isDone ? ( <img
               style={{
                
                 maxWidth:"500px",maxHeight:"500px", padding: "2em 0",width: "100%" 
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
