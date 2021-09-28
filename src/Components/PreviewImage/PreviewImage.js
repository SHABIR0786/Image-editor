// import React, { useState, useRef } from "react";
// import Cropper from "react-cropper";
// import "cropperjs/dist/cropper.css";

// const PreviewImage = () =>{
//     const [image, setImage] = useState( "https://raw.githubusercontent.com/roadmanfong/react-cropper/master/example/img/child.jpg");
//     const [cropData, setCropData] = useState("#");
//     const [cropper, setCropper] = useState(null);
//     const imageRef = useRef(null);

//     const onChange = (e) => {
//         e.preventDefault();
//         let files;
//         if (e.dataTransfer) {
//           files = e.dataTransfer.files;
//         } else if (e.target) {
//           files = e.target.files;
//         }
//         const reader = new FileReader();
//         reader.onload = () => {
//           setImage(reader.result);
//         };
//         reader.readAsDataURL(files[0]);
//       };
    
//       const getCropData = () => {
//         if (typeof cropper !== "undefined") {
//           setCropData(cropper.getCroppedCanvas().toDataURL());
//         }
//       };

//     return (
//         <div>
//         <div style={{ width: "100%" }}>
//           <input type="file" onChange={onChange} />
//           <button>Use default img</button>
//           <br />
//           <br />
//           <Cropper
//             style={{ height: 400, width: "100%" }}
//             initialAspectRatio={1}
//             preview=".img-preview"
//             src={image}
//             ref={imageRef}
//             viewMode={1}
//             guides={true}
//             zoomable={false}
//             minCropBoxHeight={10}
//             minCropBoxWidth={10}
//             background={false}
//             responsive={true}
//             checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
//             onInitialized={(instance) => {
//               setCropper(instance);
//             }}
//           />
//         </div>
//         <div>

//           <div
//             className="box"
//             style={{ width: "50%", float: "right", height: "300px" }}
//           >
//             <h1>
//               <span>Crop</span>
//               <button style={{ float: "right" }} onClick={getCropData}>
//                 Crop Image
//               </button>
//             </h1>
//             <img style={{ width: "100%" }} src={cropData} alt="cropped" />
//           </div>
//         </div>
//         <br style={{ clear: "both" }} />
//       </div>
//     )
// }

// export default PreviewImage