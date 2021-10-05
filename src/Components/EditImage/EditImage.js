import { Button } from "@mui/material";
import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo, faUndo, faMagic } from "@fortawesome/fontawesome-free-solid";
// import Cropper from 'react-perspective-cropper'
import Cropper from "./Cropper";

class EditImage extends Component {
  state = {
    src: this.props.cropper,
    crop: {
      unit: "%",
      width: 30,
      aspect: 16 / 9,
      cropState:null
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      rotation: 0,
      filter: "brightness(0%),contrast(0%),saturate(0)",
      imgcolor:props.src,
      cropState:null
    };
    this.rotateRight = this.rotateRight.bind(this);
    this.rotateLeft = this.rotateLeft.bind(this);
    this.done = this.done.bind(this);
    this.reset = this.reset.bind(this);
    this.enhancecolor = this.enhancecolor.bind(this);
    this.cropperRef = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
  }

  onChange(s){
    this.setState({cropState:s});
  }
  onDragStop(s){
    this.setState({cropState:s});
  }
  

  rotateRight() {
    this.cropperRef.current.rotateRight();
  }

  rotateLeft() {
    this.cropperRef.current.rotateLeft();
  }

  reset() {
    this.cropperRef.current.resetImage();
  }

  async done() {
    const res = await this.cropperRef.current.done({ preview: true })
    this.props.getCropData(res);
    this.props.setDone(true);
  }

  enhancecolor() {
    this.cropperRef.current.enhanceImage();
  }

  render() {
    const { rotation } = this.state;
    return (
      <div style={{padding: "8em 0 !important"}}>
      {this.props.edit && this.props.done ? (
      <div id="cropper">
      <Cropper
      style={{
              maxWidth: "500px",
              margin: "auto",
              padding: "7em 0em",
              width: "100%"
      }}
      ref={this.cropperRef}
      image={this.props.src}
      onChange={this.onChange}
      onDragStop={this.onDragStop}
    />
          </div>
          ) : (
            <img style={{
                transform: `rotate(${rotation}deg)`,
                      maxWidth: "400px",
                      margin: "auto",
                      padding: "2em 0em",
                      width: "100%"
              }}
              src={this.props.src}
              alt="rotate"
            />
          )}
        <div className="rotatingbuttons">
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.rotateLeft}
              variant="outlined"
              value="left"
              style={{ marginRight: "20px" }}
            >
              <FontAwesomeIcon icon={faUndo} />
            </Button>
          ) : null}
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.rotateRight}
              variant="outlined"
              value="right"
              style={{ marginRight: "20px" }}
            >
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
              <FontAwesomeIcon icon={faMagic} />{" "}
            </Button>
          ) : null}
          {this.props.edit && this.props.done ? (
            <Button
              onClick={this.reset}
              
              variant="outlined"
            >
              Reset
            </Button>
          ) : null}
            {this.props.edit && this.props.done ? (
            <Button
              onClick={this.done}
              
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
