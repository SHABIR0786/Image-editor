import { Button } from "@mui/material";
import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo, faUndo, faMagic } from "@fortawesome/fontawesome-free-solid";
import "cropperjs/dist/cropper.min.css";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

class EditImage extends Component {
  state = {
    src: this.props.cropper,
    crop: {
      unit: "%",
      width: 30,
      aspect: 16 / 9,
    },
  };

  constructor(props) {
    
    super(props);
    this.state = {
      rotation: 0,
      filter: "brightness(0%),contrast(0%),saturate(0)",
      imgcolor:props.src,
    };
    this.rotate = this.rotate.bind(this);
    this.done = this.done.bind(this);
    this.rotateleft = this.rotateleft.bind(this);
    this.reset = this.reset.bind(this);
    this.enhancecolor = this.enhancecolor.bind(this);
  }



  rotate() {
    let newRotation = this.state.rotation + 90;
    if (newRotation >= 360) {
      newRotation = -360;
    }
    this.setState({
      rotation: newRotation,
    });
  }

  rotateleft() {
    let newRotation = this.state.rotation - 90;
    if (newRotation >= 360) {
      newRotation = -360;
    }
    this.setState({
      rotation: newRotation,
    });
  }

  reset() {
    this.setState({
      rotation: 0,
      filter: ""
    });
  }
  done(){
    this.props.getCropData();
    this.props.setDone(true);
  }
  enhancecolor() {
    this.setState({
    filter: "brightness(100%) contrast(100%) saturate(2)",
    
    });
  }

  render() {
    const { rotation } = this.state;
    return (
        <div style={{padding: "8em 0 !important"}}>
          {this.props.edit && this.props.done ? (
            <Cropper
              style={{
                margin: "0 auto",
                filter:this.state.filter,
                marginTop: "0px",
                transform: `rotate(${rotation}deg)`,
                maxWidth:"500px",
                maxHheight:"500px"
              }}
              strict={true}
              highlight={false}
              initialAspectRatio={16 / 9}
              rotatable={true}
              autoCropArea={10}
              preview="img-preview"
              src={this.props.src}
              ref={this.props.imageRef}
              viewMode={1}
              guides={true}
              zoomable={false}
              background={false}
              responsive={true}
              checkOrientation={false}
              minCropBoxWidth={105}
              minCropBoxHeight={105}
              onInitialized={(instance) => {
              this.props.setCropper(instance);
              }}
            />
          ) : (
            <img
              style={{
                transform: `rotate(${rotation}deg)`,

                      maxWidth: "500px",
                      margin: "auto",
                      padding: "7em 0em",
                      width: "100%"
              }}
              src={this.props.src}
              alt="rotate"
            />
          )}
        <div className="rotatingbuttons">
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.rotateleft}
              variant="outlined"
              value="left"
              style={{ marginRight: "20px" }}
            >
              {" "}
              <FontAwesomeIcon icon={faUndo} />
            </Button>
          ) : null}
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.rotate}
              variant="outlined"
              value="right"
              style={{ marginRight: "20px" }}
            >
              {" "}
              <FontAwesomeIcon icon={faRedo} />{" "}
            </Button>
          ) : null}
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.enhancecolor}
              variant="outlined"
              value="enhance"
              style={{
                marginRight: "60px"
              
              }}
            >
              {" "}
              <FontAwesomeIcon icon={faMagic} />{" "}
            </Button>
          ) : null}
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.reset}
              Center
              variant="outlined"
            >
              Reset
            </Button>
          ) : null}
            {this.props.edit && this.props.done ? (
            <Button
              onClick={this.done}
              Center
              variant="outlined"
              style={{marginLeft:"20px"}}
            >
              Done
            </Button>
          ) : null}
        </div>
        </div>
    );
  }
}

export default EditImage;
